import os
import joblib
import pandas as pd

from sklearn.preprocessing import LabelEncoder

# --------------------------------------------------
# Project Paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "output",
    "Historical_Drug_Investigation_Dataset.csv"
)

ENCODER_DIR = os.path.join(
    BASE_DIR,
    "models",
    "encoders"
)

os.makedirs(ENCODER_DIR, exist_ok=True)

# --------------------------------------------------
# Load Dataset
# --------------------------------------------------

def load_dataset():

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found:\n{DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    print("\n" + "=" * 60)
    print("DATASET INFORMATION")
    print("=" * 60)

    print(f"Shape: {df.shape}")

    print("\nColumns:")
    print(df.columns.tolist())

    print("\nMissing Values:")
    print(df.isnull().sum())

    print("\nTarget Distribution:")
    print(df["Investigation_Priority"].value_counts())

    return df


# --------------------------------------------------
# Encode Categorical Features
# --------------------------------------------------

def preprocess_data(df):

    df = df.copy()

    target_column = "Investigation_Priority"

    categorical_columns = df.select_dtypes(
        include=["object", "string"]
    ).columns.tolist()

    if target_column in categorical_columns:
        categorical_columns.remove(target_column)

    identifier_columns = [
        "Investigation_ID",
        "Suspect_ID",
        "Network_ID"
    ]

    for column in identifier_columns:
        if column in categorical_columns:
            categorical_columns.remove(column)

    print("\nEncoding categorical columns...")

    encoders = {}

    for column in categorical_columns:

        encoder = LabelEncoder()

        df[column] = encoder.fit_transform(
            df[column].astype(str)
        )

        encoders[column] = encoder

        print(f"Encoded: {column}")

    target_encoder = LabelEncoder()

    df[target_column] = target_encoder.fit_transform(
        df[target_column]
    )

    encoders[target_column] = target_encoder

    encoder_path = os.path.join(
        ENCODER_DIR,
        "label_encoders.pkl"
    )

    joblib.dump(encoders, encoder_path)

    print(f"\nEncoders saved to:\n{encoder_path}")

    df = df.drop(columns=identifier_columns)

    X = df.drop(columns=[target_column])

    y = df[target_column]

    return X, y, encoders


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":

    dataset = load_dataset()

    X, y, encoders = preprocess_data(dataset)

    print("\n" + "=" * 60)
    print("PREPROCESSING COMPLETE")
    print("=" * 60)

    print(f"Features Shape : {X.shape}")
    print(f"Target Shape   : {y.shape}")

    print("\nFirst Five Rows:")

    print(X.head())
