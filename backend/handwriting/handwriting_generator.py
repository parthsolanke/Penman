import numpy as np
import base64
import svgwrite
import logging
import io
import asyncio
import cairosvg
import functools
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

class Hand(object):
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info("Initializing Handwriting Model...")
        self.nn = rnn(
            log_dir=LOG_DIR,
            checkpoint_dir=CHECKPOINT_DIR,
            prediction_dir=PREDICTIONS_DIR,
            **MODEL_CONFIG
        )
        self.nn.restore()
        self.styles_loader = StylesLoader()

    async def write(self, lines, biases=None, styles=None, stroke_colors=None, stroke_widths=None, as_base64=False, as_pdf=False):
        """Async wrapper for write using run_in_executor"""
        loop = asyncio._get_running_loop()
        return await loop.run_in_executor(
            None, functools.partial(
                self._write_sync, lines, biases, styles, stroke_colors, stroke_widths, as_base64, as_pdf
            )
        )

    def _write_sync(self, lines, biases=None, styles=None, stroke_colors=None, stroke_widths=None, as_base64=False, as_pdf=False):
        self.logger.debug(f"Received lines: {lines}, biases: {biases}, styles: {styles}")
        valid_char_set = set(drawing.alphabet)
        self._validate_input(lines, valid_char_set)

        strokes = self._sample(lines, biases=biases, styles=styles)
        svg_output = self._draw(strokes, lines, stroke_colors=stroke_colors, stroke_widths=stroke_widths, as_base64=False)

        if as_pdf:
            pdf_output = self._generate_pdf_sync(svg_output)
            return pdf_output

        if as_base64:
            svg_base64 = self._encode_svg_to_base64(svg_output)
            return svg_base64

        return svg_output

    def _validate_input(self, lines, valid_char_set):
        if lines is None or len(lines) == 0:
            raise ValueError("Lines cannot be None or empty")

        for line_num, line in enumerate(lines):
            if len(line) > 75:
                raise ValueError(f"Each line must be at most 75 characters. Line {line_num} contains {len(line)}")
            for char in line:
                if char not in valid_char_set:
                    self.logger.error(f"Invalid character '{char}' detected in line {line_num}. Valid character set is {valid_char_set}")
                    raise ValueError(f"Invalid character '{char}' detected in line {line_num}. Valid character set is {valid_char_set}")

    def _sample(self, lines, biases=None, styles=None):
        self.logger.info("Sampling strokes for handwriting generation...")
        
        num_samples = len(lines)
        max_tsteps = 40 * max(len(line) for line in lines)
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

    def _draw(self, strokes, lines, stroke_colors=None, stroke_widths=None, as_base64=False):
        self.logger.info("Drawing SVG output...")
        
        stroke_colors = stroke_colors or ['black'] * len(lines)
        stroke_widths = stroke_widths or [OUTPUT_CONFIG["default_stroke_width"]] * len(lines)

        line_height = OUTPUT_CONFIG["line_height"]
        view_width = OUTPUT_CONFIG["view_width"]
        view_height = line_height * (len(strokes) + 1)

        dwg = svgwrite.Drawing()
        dwg.viewbox(width=view_width, height=view_height)
        dwg.add(dwg.rect(insert=(0, 0), size=(view_width, view_height), fill='white'))

        initial_coord = np.array([0, -(3 * line_height / 4)])
        for offsets, line, color, width in zip(strokes, lines, stroke_colors, stroke_widths):
            if not line:
                initial_coord[1] -= line_height
                continue

            offsets[:, :2] *= 1.5
            strokes = drawing.offsets_to_coords(offsets)
            strokes = drawing.denoise(strokes)
            strokes[:, :2] = drawing.align(strokes[:, :2])

            strokes[:, 1] *= -1
            strokes[:, :2] -= strokes[:, :2].min() + initial_coord
            strokes[:, 0] += (view_width - strokes[:, 0].max()) / 2

            path_data = "M{},{} ".format(0, 0)
            prev_eos = 1.0
            for x, y, eos in zip(*strokes.T):
                path_data += '{}{},{} '.format('M' if prev_eos == 1.0 else 'L', x, y)
                prev_eos = eos

            path = svgwrite.path.Path(path_data).stroke(color=color, width=width, linecap='round').fill("none")
            dwg.add(path)

            initial_coord[1] -= line_height

        return dwg.tostring()

    async def _generate_pdf(self, svg_output):
        """Async wrapper for PDF generation using run_in_executor"""
        loop = asyncio._get_running_loop()
        return await loop.run_in_executor(None, functools.partial(self._generate_pdf_sync, svg_output))

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

    def _encode_svg_to_base64(self, svg_output):
        svg_base64 = base64.b64encode(svg_output.encode()).decode('utf-8')
        return f"data:image/svg+xml;base64,{svg_base64}"
