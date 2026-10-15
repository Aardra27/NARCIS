import json
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd
import shap


# ============================================================
# NARCIS LOCAL SHAP - HIGH PRIORITY CASE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "output" / "Historical_Drug_Investigation_Dataset.csv"

if not DATASET_PATH.exists():
    DATASET_PATH = BASE_DIR / "Historical_Drug_Investigation_Dataset.csv"

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "saved_models"
    / "random_forest.pkl"
)

ENCODER_PATH = (
    BASE_DIR
    / "models"
    / "encoders"
    / "label_encoders.pkl"
)

FEATURE_PATH = (
    BASE_DIR
    / "models"
    / "encoders"
    / "feature_columns.pkl"
)

OUTPUT_DIR = (
    BASE_DIR
    / "output"
    / "plots"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# LOAD
# ============================================================

print()
print("=" * 60)
print("NARCIS LOCAL SHAP - HIGH PRIORITY CASE")
print("=" * 60)

df = pd.read_csv(DATASET_PATH)

model = joblib.load(MODEL_PATH)
encoders = joblib.load(ENCODER_PATH)
feature_columns = joblib.load(FEATURE_PATH)

print()
print("Model and dataset loaded.")
print(f"Dataset rows : {len(df)}")
print(f"Features     : {len(feature_columns)}")


# ============================================================
# FIND A REAL HIGH-PRIORITY CASE
# ============================================================

high_cases = df[
    df["Investigation_Priority"].astype(str).str.lower()
    == "high"
]

if high_cases.empty:
    raise RuntimeError(
        "No High-priority cases found in the dataset."
    )

case = high_cases.iloc[[0]].copy()

actual_priority = str(
    case["Investigation_Priority"].iloc[0]
)

investigation_id = str(
    case["Investigation_ID"].iloc[0]
)

print()
print("=" * 60)
print("SELECTED HISTORICAL CASE")
print("=" * 60)

print(
    f"Investigation ID : {investigation_id}"
)

print(
    f"Actual Priority  : {actual_priority}"
)


# ============================================================
# KEEP ORIGINAL VALUES FOR HUMAN EXPLANATION
# ============================================================

original_case = case.copy()


# ============================================================
# PREPARE MODEL INPUT
# ============================================================

DROP_COLUMNS = [
    "Investigation_ID",
    "Suspect_ID",
    "Network_ID",
    "Investigation_Priority"
]

X = case.drop(
    columns=[
        column
        for column in DROP_COLUMNS
        if column in case.columns
    ]
)


# ============================================================
# ENCODE CATEGORICAL FEATURES
# ============================================================

for column, encoder in encoders.items():

    if column == "Investigation_Priority":
        continue

    if column not in X.columns:
        continue

    values = X[column].astype(str)

    known_values = set(
        encoder.classes_
    )

    values = values.apply(
        lambda value:
        value
        if value in known_values
        else encoder.classes_[0]
    )

    X[column] = encoder.transform(
        values
    )


# ============================================================
# EXACT TRAINING FEATURE ORDER
# ============================================================

X = X.reindex(
    columns=feature_columns,
    fill_value=0
)


# ============================================================
# MODEL PREDICTION
# ============================================================

prediction_encoded = int(
    model.predict(X)[0]
)

probabilities = model.predict_proba(X)[0]


# Current NARCIS target mapping
priority_mapping = {
    0: "High",
    1: "Low",
    2: "Medium"
}

prediction = priority_mapping.get(
    prediction_encoded,
    str(prediction_encoded)
)


print()
print("=" * 60)
print("MODEL PREDICTION")
print("=" * 60)

print(
    f"Predicted Priority : {prediction}"
)

print(
    f"Actual Priority    : {actual_priority}"
)

print()
print("Class Probabilities:")

probability_names = [
    priority_mapping.get(
        index,
        str(index)
    )
    for index in range(
        len(probabilities)
    )
]

for class_name, probability in zip(
    probability_names,
    probabilities
):

    print(
        f"  {class_name:<10}: "
        f"{probability:.4f} "
        f"({probability * 100:.2f}%)"
    )


# ============================================================
# LOCAL SHAP
# ============================================================

print()
print("=" * 60)
print("CALCULATING LOCAL SHAP")
print("=" * 60)

explainer = shap.TreeExplainer(
    model
)

shap_values = explainer.shap_values(
    X
)


# ============================================================
# HANDLE SHAP OUTPUT FORMATS
# ============================================================

if isinstance(shap_values, list):

    # Older SHAP multiclass format:
    # list[class] -> samples x features

    class_shap = shap_values[
        prediction_encoded
    ][0]

elif getattr(
    shap_values,
    "ndim",
    0
) == 3:

    # Newer SHAP format:
    # samples x features x classes

    class_shap = shap_values[
        0,
        :,
        prediction_encoded
    ]

else:

    class_shap = shap_values[0]


# ============================================================
# GET BASE VALUE
# ============================================================

expected_value = explainer.expected_value

if hasattr(
    expected_value,
    "ndim"
):

    if expected_value.ndim == 0:

        base_value = float(
            expected_value
        )

    else:

        base_value = float(
            expected_value[
                prediction_encoded
            ]
        )

else:

    try:

        base_value = float(
            expected_value[
                prediction_encoded
            ]
        )

    except (
        TypeError,
        IndexError
    ):

        base_value = float(
            expected_value
        )


# ============================================================
# CREATE HUMAN-READABLE EXPLANATION
# ============================================================

explanations = []

for feature_name, shap_value in zip(
    feature_columns,
    class_shap
):

    if feature_name in original_case.columns:

        raw_value = original_case[
            feature_name
        ].iloc[0]

    else:

        raw_value = "Unknown"

    # Convert numpy values to normal Python values
    if hasattr(
        raw_value,
        "item"
    ):

        try:
            raw_value = raw_value.item()
        except Exception:
            pass

    shap_value = float(
        shap_value
    )

    if shap_value > 0:

        effect = (
            "increased support for "
            f"{prediction}"
        )

    elif shap_value < 0:

        effect = (
            "decreased support for "
            f"{prediction}"
        )

    else:

        effect = (
            "had negligible influence"
        )

    explanations.append(
        {
            "feature": feature_name,
            "value": str(raw_value),
            "shap_value": shap_value,
            "effect": effect
        }
    )


# Strongest local factors first
explanations.sort(
    key=lambda item: abs(
        item["shap_value"]
    ),
    reverse=True
)


# ============================================================
# DISPLAY OFFICER-READABLE EXPLANATION
# ============================================================

print()
print("=" * 60)
print("WHY DID NARCIS MAKE THIS PREDICTION?")
print("=" * 60)

for rank, item in enumerate(
    explanations[:10],
    start=1
):

    print(
        f"{rank}. {item['feature']}"
    )

    print(
        f"   Actual value : "
        f"{item['value']}"
    )

    print(
        f"   SHAP impact  : "
        f"{item['shap_value']:+.4f}"
    )

    print(
        f"   Effect       : "
        f"{item['effect']}"
    )

    print()


# ============================================================
# CREATE HUMAN-READABLE WATERFALL LABELS
# ============================================================

display_features = []

for item in explanations:

    display_features.append(
        f"{item['feature']} = {item['value']}"
    )


# SHAP Explanation object must remain aligned
# with the original feature order.

ordered_explanations = sorted(
    explanations,
    key=lambda item:
    feature_columns.index(
        item["feature"]
    )
)

import numpy as np

ordered_shap = np.asarray(
    [
        item["shap_value"]
        for item in ordered_explanations
    ],
    dtype=float
)

ordered_labels = [
    f"{item['feature']} = {item['value']}"
    for item in ordered_explanations
]


# ============================================================
# WATERFALL PLOT
# ============================================================

local_explanation = shap.Explanation(
    values=ordered_shap,
    base_values=base_value,
    data=ordered_labels,
    feature_names=ordered_labels
)

waterfall_path = (
    OUTPUT_DIR
    / "local_high_waterfall.png"
)

plt.figure(
    figsize=(12, 9)
)

shap.plots.waterfall(
    local_explanation,
    max_display=10,
    show=False
)

plt.savefig(
    waterfall_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()


# ============================================================
# SAVE STRUCTURED EXPLANATION
# ============================================================

explanation_output = {

    "investigation_id":
        investigation_id,

    "actual_priority":
        actual_priority,

    "predicted_priority":
        prediction,

    "probabilities":
        {
            name: float(probability)
            for name, probability
            in zip(
                probability_names,
                probabilities
            )
        },

    "base_value":
        base_value,

    "top_factors":
        explanations[:10]
}

json_path = (
    OUTPUT_DIR.parent
    / "local_high_explanation.json"
)

with open(
    json_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        explanation_output,
        file,
        indent=4,
        ensure_ascii=False
    )


# ============================================================
# COMPLETE
# ============================================================

print("=" * 60)
print("LOCAL HIGH-PRIORITY SHAP COMPLETED")
print("=" * 60)

print()
print(
    f"Waterfall plot : {waterfall_path}"
)

print(
    f"Explanation    : {json_path}"
)

print()
