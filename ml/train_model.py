import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

from preprocess import load_dataset, preprocess_data

# --------------------------------------------------
# Project Paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models",
    "saved_models"
)

ENCODER_DIR = os.path.join(
    BASE_DIR,
    "models",
    "encoders"
)

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(ENCODER_DIR, exist_ok=True)

# --------------------------------------------------
# Load and Split Dataset
# --------------------------------------------------

def prepare_data():

    dataset = load_dataset()

    X, y, encoders = preprocess_data(dataset)

    feature_columns = X.columns.tolist()

    feature_path = os.path.join(
        ENCODER_DIR,
        "feature_columns.pkl"
    )

    joblib.dump(feature_columns, feature_path)

    print(f"\nFeature columns saved to:\n{feature_path}")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print("\n" + "=" * 60)
    print("DATA SPLIT COMPLETE")
    print("=" * 60)

    print(f"Training Samples : {len(X_train)}")
    print(f"Testing Samples  : {len(X_test)}")

    return X_train, X_test, y_train, y_test


# --------------------------------------------------
# Train Random Forest
# --------------------------------------------------

def train_model(X_train, y_train):

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )

    print("\nTraining Random Forest Model...")

    model.fit(X_train, y_train)

    model_path = os.path.join(
        MODEL_DIR,
        "random_forest.pkl"
    )

    joblib.dump(model, model_path)

    print(f"\nModel saved to:\n{model_path}")

    return model


# --------------------------------------------------
# Evaluate
# --------------------------------------------------

def evaluate_model(model, X_test, y_test):

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)

    print(f"Accuracy : {accuracy:.4f}")

    print("\nClassification Report\n")

    print(
        classification_report(
            y_test,
            predictions
        )
    )

    print("\nConfusion Matrix\n")

    print(
        confusion_matrix(
            y_test,
            predictions
        )
    )


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":

    X_train, X_test, y_train, y_test = prepare_data()

    model = train_model(
        X_train,
        y_train
    )

    evaluate_model(
        model,
        X_test,
        y_test
    )

    print("\n" + "=" * 60)
    print("MODEL TRAINING PIPELINE COMPLETED")
    print("=" * 60)
