import numpy as np
import svgwrite
import logging
import io
import asyncio
import cairosvg
import functools
import traceback
from dataclasses import dataclass
from typing import List, Dict, Optional, Any, Generator, Tuple, Union
from collections import OrderedDict
import time

from handwriting.config import (
    MODEL_CONFIG, 
    OUTPUT_CONFIG, 
    CHECKPOINT_DIR, 
    LOG_DIR, 
    PREDICTIONS_DIR, 
    setup_logging
)
import handwriting.utils.drawing_utils as drawing
from handwriting.data.styles_loader import StylesLoader
from handwriting.models.rnn import rnn

setup_logging(log_file=f"{LOG_DIR}/handwriting_generator.log")

STROKE_SCALE = 1.5
MAX_LINE_LENGTH = 75
MAX_TSTEPS_MULTIPLIER = 40
STROKE_EOS_THRESHOLD = 0.95
DEFAULT_STROKE_COLOR = 'black'
MAX_CACHE_SIZE = 32
CACHE_CLEANUP_INTERVAL = 300

@dataclass
class StrokeConfig:
    padding = 20
    line_height = OUTPUT_CONFIG["line_height"]
    view_width = OUTPUT_CONFIG["view_width"]
    default_stroke_width = OUTPUT_CONFIG["default_stroke_width"]

class Hand:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.nn = rnn(
            log_dir=LOG_DIR,
            checkpoint_dir=CHECKPOINT_DIR,
            prediction_dir=PREDICTIONS_DIR,
            **MODEL_CONFIG
        )
        self.nn.restore()
        self.styles_loader = StylesLoader()
        self.stroke_config = StrokeConfig()
        self._stroke_transforms = OrderedDict()
        self._last_cleanup = time.time()

    def _cleanup_cache(self, force: bool = False) -> None:
        """Cleanup old cache entries"""
        current_time = time.time()
        if not force and current_time - self._last_cleanup < CACHE_CLEANUP_INTERVAL:
            return

        while len(self._stroke_transforms) > MAX_CACHE_SIZE:
            self._stroke_transforms.popitem(last=False)
            
        cutoff_time = current_time - CACHE_CLEANUP_INTERVAL
        old_keys = [k for k, (t, _) in self._stroke_transforms.items() if t < cutoff_time]
        for k in old_keys:
            del self._stroke_transforms[k]
            
        self._last_cleanup = current_time

    def _transform_strokes(self, strokes_key: str) -> np.ndarray:
        """Transform strokes with time-based caching"""
        current_time = time.time()
        
        if strokes_key in self._stroke_transforms:
            _, result = self._stroke_transforms[strokes_key]
            self._stroke_transforms.move_to_end(strokes_key)
            return result

        strokes = np.frombuffer(strokes_key, dtype=np.float32).reshape(-1, 3)
        result = drawing.denoise(strokes)
        result = drawing.align(result[:, :2])
        
        self._stroke_transforms[strokes_key] = (current_time, result)
        self._cleanup_cache()
        
        return result

    async def write(self, 
                   lines: List[str], 
                   biases: Optional[List[float]] = None, 
                   styles: Optional[List[str]] = None, 
                   stroke_colors: Optional[List[str]] = None, 
                   stroke_widths: Optional[List[float]] = None, 
                   as_base64: bool = False, 
                   as_pdf: bool = False) -> Union[str, bytes]:
        """Async wrapper for write using run_in_executor"""
        loop = asyncio._get_running_loop()
        result = await loop.run_in_executor(
            None, functools.partial(
                self._write_sync, lines, biases, styles, stroke_colors, stroke_widths, as_base64, as_pdf
            )
        )
        await asyncio.sleep(0)
        return result
                
    def _write_sync(self, lines, biases=None, styles=None, stroke_colors=None, stroke_widths=None, as_base64=False, as_pdf=False):
        self.logger.debug(f"Received lines: {lines}, biases: {biases}, styles: {styles}")
        valid_char_set = set(drawing.alphabet)
        self._validate_input(lines, valid_char_set)

        strokes = self._sample(lines, biases=biases, styles=styles)
        svg_output = self._draw(strokes, lines, stroke_colors=stroke_colors, stroke_widths=stroke_widths)

        if as_pdf:
            pdf_output = self._generate_pdf_sync(svg_output)
            return pdf_output

        if as_base64:
            svg_base64 = self._encode_svg_to_base64(svg_output)
            return svg_base64

        return svg_output

    def _validate_input(self, lines: List[str], valid_char_set: set) -> None:
        if not lines:
            raise ValueError("Lines cannot be None or empty")
        
        for line_num, line in enumerate(lines):
            if len(line) > MAX_LINE_LENGTH:
                raise ValueError(f"Line {line_num} exceeds {MAX_LINE_LENGTH} characters")
            invalid_chars = set(line) - valid_char_set
            if invalid_chars:
                raise ValueError(f"Invalid characters in line {line_num}: {invalid_chars}")

    def _sample(self, lines, biases=None, styles=None):
        self.logger.info("Sampling strokes for handwriting generation...")
        
        num_samples = len(lines)
        max_tsteps = MAX_TSTEPS_MULTIPLIER * max(len(line) for line in lines)
        biases = biases if biases is not None else [0.5] * num_samples

        x_prime = np.zeros([num_samples, 1200, 3])
        x_prime_len = np.zeros([num_samples])
        chars = np.zeros([num_samples, 120])
        chars_len = np.zeros([num_samples])

        if styles is not None:
            for i, (line, style) in enumerate(zip(lines, styles)):
                x_p, c_p = self.styles_loader.load_style(line, style)
                x_prime[i, :len(x_p), :] = x_p
                x_prime_len[i] = len(x_p)
                chars[i, :len(c_p)] = np.array(c_p)
                chars_len[i] = len(c_p)
        else:
            for i in range(num_samples):
                encoded = drawing.encode_ascii(lines[i])
                chars[i, :len(encoded)] = encoded
                chars_len[i] = len(encoded)

        try:
            samples = self.nn.session.run(
                [self.nn.sampled_sequence],
                feed_dict={
                    self.nn.prime: styles is not None,
                    self.nn.x_prime: x_prime,
                    self.nn.x_prime_len: x_prime_len,
                    self.nn.num_samples: num_samples,
                    self.nn.sample_tsteps: max_tsteps,
                    self.nn.c: chars,
                    self.nn.c_len: chars_len,
                    self.nn.bias: biases
                }
            )[0]
        except Exception as e:
            self.logger.error(f"Error during sampling: {e}")
            raise

        return [sample[~np.all(sample == 0.0, axis=1)] for sample in samples]

    def _draw(self, strokes, lines, stroke_colors=None, stroke_widths=None):
        self.logger.info("Drawing SVG output...")
        
        stroke_colors = stroke_colors or [DEFAULT_STROKE_COLOR] * len(lines)
        stroke_widths = stroke_widths or [self.stroke_config.default_stroke_width] * len(lines)

        line_height = self.stroke_config.line_height
        view_width = self.stroke_config.view_width
        view_height = line_height * (len(strokes) + 1)
        
        padding = self.stroke_config.padding
        
        dwg = svgwrite.Drawing()
        dwg.viewbox(width=view_width, height=view_height)
        
        clip_path = dwg.defs.add(dwg.clipPath(id='clip-path'))
        clip_path.add(dwg.rect((0, 0), (view_width, view_height)))
        
        group = dwg.g(clip_path='url(#clip-path)')
        group.add(dwg.rect(insert=(0, 0), size=(view_width, view_height), fill='white'))
        dwg.add(group)

        initial_coord = np.array([padding, -(3 * line_height / 4)])
        for offsets, line, color, width in zip(strokes, lines, stroke_colors, stroke_widths):
            if not line:
                initial_coord[1] -= line_height
                continue

            offsets[:, :2] *= STROKE_SCALE
            strokes = drawing.offsets_to_coords(offsets)
            strokes = drawing.denoise(strokes)
            strokes[:, :2] = drawing.align(strokes[:, :2])

            strokes[:, 1] *= -1
            
            x_min, x_max = strokes[:, 0].min(), strokes[:, 0].max()
            y_min, y_max = strokes[:, 1].min(), strokes[:, 1].max()
            
            available_width = view_width - 2 * padding
            available_height = line_height - padding
            
            scale_x = available_width / (x_max - x_min) if x_max != x_min else 1
            scale_y = available_height / (y_max - y_min) if y_max != y_min else 1
            scale = min(scale_x, scale_y, 1.0)
            
            strokes[:, :2] *= scale
            strokes[:, :2] -= np.array([x_min * scale, y_min * scale]) + initial_coord
            
            x_offset = (view_width - (strokes[:, 0].max() - strokes[:, 0].min())) / 2
            strokes[:, 0] += x_offset - strokes[:, 0].min()

            path_data = "M{},{} ".format(0, 0)
            prev_eos = 1.0
            for x, y, eos in zip(*strokes.T):
                x = max(padding, min(x, view_width - padding))
                y = max(padding, min(y, view_height - padding))
                path_data += '{}{},{} '.format('M' if prev_eos == 1.0 else 'L', x, y)
                prev_eos = eos

            path = svgwrite.path.Path(path_data).stroke(color=color, width=width, linecap='round').fill("none")
            group.add(path)

            initial_coord[1] -= line_height

        return dwg.tostring()
    
    async def stream_write(
        self, 
        lines: List[str], 
        biases: Optional[List[float]] = None, 
        styles: Optional[List[str]] = None, 
        stroke_colors: Optional[List[str]] = None, 
        stroke_widths: Optional[List[float]] = None
    ) -> Generator[Dict[str, Any], None, None]:
        self.logger.info("Starting handwriting stream...")
        
        num_samples = len(lines)
        biases = biases if biases is not None else [0.5] * num_samples
        stroke_colors = stroke_colors or [DEFAULT_STROKE_COLOR] * num_samples
        stroke_widths = stroke_widths or [self.stroke_config.default_stroke_width] * num_samples

        line_height = self.stroke_config.line_height
        view_width = self.stroke_config.view_width
        view_height = line_height * (len(lines) + 1)
        padding = self.stroke_config.padding
        initial_coord = np.array([padding, -(3 * line_height / 4)])

        setup_data = {
            'type': 'setup',
            'viewBox': f"0 0 {view_width} {view_height}",
            'width': view_width,
            'height': view_height
        }
        yield setup_data

        try:
            for line_idx, (line, bias, color, width) in enumerate(zip(lines, biases, stroke_colors, stroke_widths)):
                if not line:
                    initial_coord[1] -= line_height
                    continue

                x_prime = np.zeros([1, 1200, 3])
                x_prime_len = np.zeros([1])
                chars = np.zeros([1, 120])
                chars_len = np.zeros([1])

                if styles is not None:
                    x_p, c_p = self.styles_loader.load_style(line, styles[line_idx])
                    x_prime[0, :len(x_p), :] = x_p
                    x_prime_len[0] = len(x_p)
                    chars[0, :len(c_p)] = np.array(c_p)
                    chars_len[0] = len(c_p)
                else:
                    encoded = drawing.encode_ascii(line)
                    chars[0, :len(encoded)] = encoded
                    chars_len[0] = len(encoded)

                max_tsteps = MAX_TSTEPS_MULTIPLIER * len(line)

                samples = await asyncio._get_running_loop().run_in_executor(
                    None,
                    functools.partial(
                        self.nn.session.run,
                        [self.nn.sampled_sequence],
                        feed_dict={
                            self.nn.prime: styles is not None,
                            self.nn.x_prime: x_prime,
                            self.nn.x_prime_len: x_prime_len,
                            self.nn.num_samples: 1,
                            self.nn.sample_tsteps: max_tsteps,
                            self.nn.c: chars,
                            self.nn.c_len: chars_len,
                            self.nn.bias: [bias]
                        }
                    )
                )
                samples = samples[0]

                all_strokes = samples[0][~np.all(samples[0] == 0.0, axis=1)]
                
                if len(all_strokes) == 0:
                    continue

                offsets = all_strokes.copy()
                offsets[:, :2] *= STROKE_SCALE
                strokes = drawing.offsets_to_coords(offsets)
                strokes = drawing.denoise(strokes)
                strokes[:, :2] = drawing.align(strokes[:, :2])
                strokes[:, 1] *= -1

                x_min, x_max = strokes[:, 0].min(), strokes[:, 0].max()
                y_min, y_max = strokes[:, 1].min(), strokes[:, 1].max()
                
                available_width = view_width - 2 * padding
                available_height = line_height - padding
                
                scale_x = available_width / (x_max - x_min) if x_max != x_min else 1
                scale_y = available_height / (y_max - y_min) if y_max != y_min else 1
                scale = min(scale_x, scale_y, 1.0)
                
                strokes[:, :2] *= scale
                strokes[:, :2] -= np.array([x_min * scale, y_min * scale]) + initial_coord
                
                x_offset = (view_width - (strokes[:, 0].max() - strokes[:, 0].min())) / 2
                strokes[:, 0] += x_offset - strokes[:, 0].min()

                eos_indices = np.where(all_strokes[:, 2] >= STROKE_EOS_THRESHOLD)[0]
                current_path = "M{},{} ".format(0, 0)
                prev_eos = 1.0

                for stroke_idx, (x, y, eos) in enumerate(zip(*strokes.T)):
                    x = max(padding, min(x, view_width - padding))
                    y = max(padding, min(y, view_height - padding))
                    
                    current_path += '{}{},{} '.format('M' if prev_eos == 1.0 else 'L', x, y)
                    prev_eos = eos
                    
                    should_yield = (eos >= STROKE_EOS_THRESHOLD or stroke_idx in eos_indices or stroke_idx == len(strokes) - 1)
                    
                    if should_yield and current_path.strip() != "M0,0":
                        path_data = {
                            'type': 'path',
                            'data': current_path,
                            'color': color,
                            'width': width,
                            'lineNumber': line_idx
                        }
                        yield path_data
                        await asyncio.sleep(0)
                        current_path = "M{},{} ".format(0, 0)
                        prev_eos = 1.0

                initial_coord[1] -= line_height

        except Exception as e:
            self.logger.error(f"Error during real-time generation: {e}")
            self.logger.error(traceback.format_exc())
            yield {
                'type': 'error',
                'message': str(e)
            }

    def _optimize_strokes(self, strokes: np.ndarray, tolerance: float = 0.01) -> np.ndarray:
        """Optimize stroke data by removing redundant points"""
        if len(strokes) < 3:
            return strokes
            
        optimized = [strokes[0]]
        for i in range(1, len(strokes) - 1):
            curr_point = strokes[i]
            prev_point = strokes[i - 1]
            next_point = strokes[i + 1]
            
            v1 = curr_point[:2] - prev_point[:2]
            v2 = next_point[:2] - curr_point[:2]
            if np.abs(np.cross(v1, v2)) > tolerance or curr_point[2] >= STROKE_EOS_THRESHOLD:
                optimized.append(curr_point)
                
        optimized.append(strokes[-1])
        return np.array(optimized)

    async def _generate_pdf(self, svg_output):
        """Async wrapper for PDF generation using run_in_executor"""
        loop = asyncio._get_running_loop()
        result = await loop.run_in_executor(None, functools.partial(self._generate_pdf_sync, svg_output))
        await asyncio.sleep(0)
        return result

    def _generate_pdf_sync(self, svg_output):
        pdf_output = io.BytesIO()
        try:
            self.logger.info("Generating PDF output...")
            cairosvg.svg2pdf(bytestring=svg_output.encode('utf-8'), write_to=pdf_output)
            pdf_output.seek(0)
            return pdf_output
        except Exception as e:
            self.logger.error(f"Error generating PDF: {e}")
            raise

    @functools.lru_cache(maxsize=32)
    def _transform_strokes(self, strokes_key: str) -> np.ndarray:
        """Cache transformed strokes to avoid repeated calculations"""
        strokes = np.frombuffer(strokes_key, dtype=np.float32).reshape(-1, 3)
        strokes = drawing.denoise(strokes)
        strokes = drawing.align(strokes[:, :2])
        return strokes

    def _prepare_feed_dict(self, line: str, style: Optional[str], bias: float) -> Dict[Any, Any]:
        """Prepare neural network feed dictionary"""
        x_prime = np.zeros([1, 1200, 3])
        x_prime_len = np.zeros([1])
        chars = np.zeros([1, 120])
        chars_len = np.zeros([1])

        if style is not None:
            x_p, c_p = self.styles_loader.load_style(line, style)
            x_prime[0, :len(x_p)] = x_p
            x_prime_len[0] = len(x_p)
            chars[0, :len(c_p)] = np.array(c_p)
            chars_len[0] = len(c_p)
        else:
            encoded = drawing.encode_ascii(line)
            chars[0, :len(encoded)] = encoded
            chars_len[0] = len(encoded)

        return {
            self.nn.prime: style is not None,
            self.nn.x_prime: x_prime,
            self.nn.x_prime_len: x_prime_len,
            self.nn.num_samples: 1,
            self.nn.sample_tsteps: MAX_TSTEPS_MULTIPLIER * len(line),
            self.nn.c: chars,
            self.nn.c_len: chars_len,
            self.nn.bias: [bias]
        }

    async def _run_model(self, feed_dict: Dict[Any, Any]) -> np.ndarray:
        """Run model asynchronously"""
        return await asyncio.get_running_loop().run_in_executor(
            None,
            functools.partial(self.nn.session.run, [self.nn.sampled_sequence], feed_dict=feed_dict)
        )

    def __del__(self):
        """Cleanup all cached data"""
        self._cleanup_cache(force=True)
        self._stroke_transforms.clear()
        self._transform_strokes.cache_clear()

