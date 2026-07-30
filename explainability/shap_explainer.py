import os
import sys
import joblib
import shap
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from ml.preprocess import load_dataset, preprocess_data

# --------------------------------------------------
# Project Paths
# --------------------------------------------------

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "saved_models",
    "random_forest.pkl"
)

PLOT_DIR = os.path.join(
    BASE_DIR,
    "output",
    "plots"
)

os.makedirs(PLOT_DIR, exist_ok=True)

# --------------------------------------------------
# Load Model and Prepare Data
# --------------------------------------------------

def load_resources():

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found:`n{MODEL_PATH}"
        )

    model = joblib.load(MODEL_PATH)

    dataset = load_dataset()

    X, y, encoders = preprocess_data(dataset)

    print("`n" + "=" * 60)
    print("MODEL AND DATA LOADED")
    print("=" * 60)

    print(f"Samples  : {len(X)}")
    print(f"Features : {X.shape[1]}")

    return model, X, y


# --------------------------------------------------
# Create SHAP Explainer
# --------------------------------------------------

def generate_shap_values(model, X):

    print("\nCreating SHAP Explainer...")

    explainer = shap.TreeExplainer(model)

    X_sample = X.sample(n=1000, random_state=42)
    shap_values = explainer.shap_values(X_sample)

    print("SHAP values generated successfully.")

    return explainer, shap_values, X_sample


# --------------------------------------------------
# Generate SHAP Summary Plot
# --------------------------------------------------

def save_summary_plot(shap_values, X_sample):

    import matplotlib.pyplot as plt

    print("\nGenerating SHAP Summary Plot...")

    plot_path = os.path.join(
        PLOT_DIR,
        "shap_summary.png"
    )

    shap.summary_plot(
        shap_values[:, :, 2],
        
        
        X_sample,
        show=False
    )

    plt.tight_layout()

    plt.savefig(
        plot_path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    print(f"Summary plot saved to:\n{plot_path}")


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":

    model, X, y = load_resources()

    explainer, shap_values, X_sample = generate_shap_values(
        model,
        X
    )

    save_summary_plot(
        shap_values,
        X_sample
    )

    print("\n" + "=" * 60)
    print("SHAP EXPLAINABILITY COMPLETED")
    print("=" * 60)