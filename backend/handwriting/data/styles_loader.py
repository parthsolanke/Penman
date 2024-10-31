import numpy as np
import utils.drawing_utils as drawing
from config import STYLES_DIR

class StylesLoader:
    def __init__(self, style_directory=STYLES_DIR):
        self.style_directory = style_directory

    def load_style(self, line, style_index):
        try:
            strokes = np.load(f'{self.style_directory}/style-{style_index}-strokes.npy')
            chars = np.load(f'{self.style_directory}/style-{style_index}-chars.npy').tobytes().decode('utf-8')
            return strokes, drawing.encode_ascii(chars + " " + line)
        except Exception as e:
            raise ValueError(f"Error loading style {style_index}: {e}")
        