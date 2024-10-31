import os
import logging

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HANDWRITING_DIR = os.path.join(BASE_DIR, "handwriting")
CHECKPOINT_DIR = os.path.join(HANDWRITING_DIR, "checkpoints")
STYLES_DIR = os.path.join(HANDWRITING_DIR, "styles")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
LOG_DIR = os.path.join(BASE_DIR, "logs")
PREDICTIONS_DIR = os.path.join(HANDWRITING_DIR, "predictions")

MODEL_CONFIG = {
    "learning_rates": [0.0001, 0.00005, 0.00002],
    "batch_sizes": [32, 64, 64],
    "patiences": [1500, 1000, 500],
    "beta1_decays": [0.9, 0.9, 0.9],
    "validation_batch_size": 32,
    "optimizer": "rms",
    "num_training_steps": 100000,
    "warm_start_init_step": 17900,
    "regularization_constant": 0.0,
    "keep_prob": 1.0,
    "enable_parameter_averaging": False,
    "min_steps_to_checkpoint": 2000,
    "log_interval": 20,
    "grad_clip": 10,
    "lstm_size": 400,
    "output_mixture_components": 20,
    "attention_mixture_components": 10,
}

OUTPUT_CONFIG = {
    "line_height": 60,
    "view_width": 1000,
    "default_stroke_width": 2,
    "default_stroke_color": "black",
}

LOGGING_LEVEL = logging.INFO
LOGGING_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

def setup_logging(log_file=None):
    logging.basicConfig(
        level=LOGGING_LEVEL,
        format=LOGGING_FORMAT,
        handlers=[
            logging.FileHandler(log_file) if log_file else logging.StreamHandler()
        ]
    )
    