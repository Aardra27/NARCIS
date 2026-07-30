import pandas as pd

from config import DATASET_SIZE, OUTPUT_DIR
from generator import generate_record


def generate_dataset():

    records = []

    for _ in range(DATASET_SIZE):
        records.append(generate_record())

    df = pd.DataFrame(records)

    # Replace any missing values with "None"
    df.fillna("None", inplace=True)

    output_file = OUTPUT_DIR / "Historical_Drug_Investigation_Dataset.csv"

    df.to_csv(output_file, index=False)

    print(f"Dataset generated successfully.")
    print(f"Records : {len(df)}")
    print(f"Saved to : {output_file}")


if __name__ == "__main__":
    generate_dataset()
