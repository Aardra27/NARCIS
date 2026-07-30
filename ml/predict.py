import os
import joblib
import pandas as pd

from preprocess import load_dataset, preprocess_data

# --------------------------------------------------
# Project Paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "saved_models",
    "random_forest.pkl"
)

ENCODER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "encoders",
    "label_encoders.pkl"
)
