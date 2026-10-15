import re
from pathlib import Path
import json
import sys
import pandas as pd
import shap
import numpy as np
import joblib


# ============================================================
# NARCIS AGENTIC ORCHESTRATOR - PROTOTYPE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "output"
    / "Historical_Drug_Investigation_Dataset.csv"
)

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

FEATURE_COLUMNS_PATH = (
    BASE_DIR
    / "models"
    / "encoders"
    / "feature_columns.pkl"
)


# ------------------------------------------------------------
# Make rag package importable
# ------------------------------------------------------------

RAG_DIR = BASE_DIR / "rag"

if str(RAG_DIR) not in sys.path:
    sys.path.insert(
        0,
        str(RAG_DIR)
    )

from case_similarity import retrieve_similar_cases
from knowledge_retriever import retrieve_all_knowledge


# ============================================================
# DISPLAY
# ============================================================

print()
print("=" * 70)
print("NARCIS AGENTIC ORCHESTRATOR")
print("PROTOTYPE EVIDENCE ASSEMBLY")
print("=" * 70)


# ============================================================
# LOAD ML COMPONENTS
# ============================================================

print()
print("Loading ML components...")

model = joblib.load(
    MODEL_PATH
)

encoders = joblib.load(
    ENCODER_PATH
)

feature_columns = joblib.load(
    FEATURE_COLUMNS_PATH
)

print("  Random Forest       : loaded")
print("  Label encoders      : loaded")
print("  Feature columns     : loaded")


# ============================================================
# LOAD DATASET
# ============================================================

if not DATASET_PATH.exists():

    raise FileNotFoundError(
        f"Dataset not found:\n{DATASET_PATH}"
    )

dataset = pd.read_csv(
    DATASET_PATH
)

print(
    f"  Historical dataset  : "
    f"{len(dataset)} rows"
)


# ============================================================
# PRIORITY LABEL MAPPING
# ============================================================

PRIORITY_LABELS = {
    0: "Low",
    1: "Medium",
    2: "High"
}


# ============================================================
# PREPARE CASE FOR ML
# ============================================================

def prepare_case_for_ml(case):

    """
    Convert a verified case into the exact numeric feature
    representation expected by the trained Random Forest.

    Mirrors ml/preprocess.py:
      - identifier columns are excluded
      - categorical columns use the saved LabelEncoders
      - numeric columns remain numeric
      - unknown values are handled only for prototype testing

    The original case dictionary is never modified.
    """

    identifier_columns = [
        "Investigation_ID",
        "Suspect_ID",
        "Network_ID"
    ]

    # --------------------------------------------------------
    # Build raw input using ordinary Python objects.
    # Explicitly use object dtype so encoded integers can be
    # assigned safely on modern pandas versions.
    # --------------------------------------------------------

    row = {}

    for feature in feature_columns:

        if feature in identifier_columns:
            continue

        value = case.get(
            feature,
            "Unknown"
        )

        if value is None:
            value = "Unknown"

        row[feature] = value

    df = pd.DataFrame(
        [row],
        dtype=object
    )

    # --------------------------------------------------------
    # Encode categorical columns
    # --------------------------------------------------------

    for column, encoder in encoders.items():

        if column == "Investigation_Priority":
            continue

        if column not in df.columns:
            continue

        raw_value = df.at[
            0,
            column
        ]

        value = str(
            raw_value
        )

        known_classes = [
            str(x)
            for x in encoder.classes_
        ]

        # Exact match first.
        if value in known_classes:

            encoded_value = encoder.transform(
                [value]
            )[0]

        else:

            # ------------------------------------------------
            # Prototype fallback for unseen categorical values.
            #
            # We do NOT modify the original verified case.
            # The fallback is only used for the ML vector.
            # ------------------------------------------------

            if "Unknown" in known_classes:
                fallback_value = "Unknown"
            else:
                fallback_value = known_classes[0]

            encoded_value = encoder.transform(
                [fallback_value]
            )[0]

        df.at[
            0,
            column
        ] = int(
            encoded_value
        )

    # --------------------------------------------------------
    # Convert numerical columns
    # --------------------------------------------------------

    categorical_columns = {
        column
        for column in encoders.keys()
        if column != "Investigation_Priority"
    }

    numeric_columns = [
        column
        for column in feature_columns
        if column not in identifier_columns
        and column not in categorical_columns
    ]

    for column in numeric_columns:

        if column not in df.columns:
            continue

        raw_value = df.at[
            0,
            column
        ]

        try:

            if isinstance(
                raw_value,
                str
            ):

                cleaned = raw_value.strip()

                # --------------------------------------------
                # Handle quantities such as:
                # "20.326 Kg Heroin"
                # "310 gram MDMA"
                # --------------------------------------------

                quantity_match = re.search(
                    r"[-+]?\d+(?:\.\d+)?",
                    cleaned
                )

                if quantity_match:

                    numeric_value = float(
                        quantity_match.group()
                    )

                else:

                    numeric_value = float(
                        cleaned.replace(
                            ",",
                            ""
                        )
                    )

            else:

                numeric_value = float(
                    raw_value
                )

            df.at[
                0,
                column
            ] = numeric_value

        except (
            ValueError,
            TypeError
        ):

            # ------------------------------------------------
            # Prototype-only numerical fallback.
            # Use training-data median.
            # ------------------------------------------------

            if column in dataset.columns:

                numeric_series = pd.to_numeric(
                    dataset[column],
                    errors="coerce"
                )

                median_value = numeric_series.median()

                if pd.isna(
                    median_value
                ):
                    median_value = 0.0

            else:

                median_value = 0.0

            df.at[
                0,
                column
            ] = float(
                median_value
            )

    # --------------------------------------------------------
    # Final ordering
    # --------------------------------------------------------

    df = df.reindex(
        columns=feature_columns
    )

    # Convert everything to numeric.
    df = df.apply(
        pd.to_numeric,
        errors="coerce"
    )

    # --------------------------------------------------------
    # Final validation
    # --------------------------------------------------------

    if df.isnull().any().any():

        missing = df.columns[
            df.isnull().any()
        ].tolist()

        raise ValueError(
            "Could not create a complete numeric ML "
            f"feature vector. Problem columns: {missing}"
        )

    return df.astype(
        np.float64
    )


# ============================================================
# ML PREDICTION
# ============================================================

def predict_priority(case):

    features = prepare_case_for_ml(
        case
    )

    prediction = model.predict(
        features
    )[0]

    probabilities = model.predict_proba(
        features
    )[0]

    probability_dict = {}

    for class_id, probability in zip(
        model.classes_,
        probabilities
    ):

        probability_dict[
            PRIORITY_LABELS.get(
                int(class_id),
                str(class_id)
            )
        ] = round(
            float(probability),
            4
        )

    return {
        "prediction": PRIORITY_LABELS.get(
            int(prediction),
            str(prediction)
        ),
        "probabilities": probability_dict,
        "feature_vector": features.iloc[
            0
        ].to_dict()
    }


# ============================================================
# LOCAL SHAP
# ============================================================

def explain_prediction(case):

    features = prepare_case_for_ml(
        case
    )

    print()
    print("Calculating local SHAP explanation...")

    explainer = shap.TreeExplainer(
        model
    )

    shap_values = explainer.shap_values(
        features
    )

    prediction = int(
        model.predict(features)[0]
    )

    # SHAP has slightly different output structures
    # between versions, so normalize them here.

    if isinstance(
        shap_values,
        list
    ):

        class_values = np.asarray(
            shap_values[prediction]
        )[0]

    else:

        values = np.asarray(
            shap_values
        )

        if values.ndim == 3:

            class_values = values[
                0,
                :,
                prediction
            ]

        elif values.ndim == 2:

            class_values = values[
                0
            ]

        else:

            class_values = values

    class_values = np.asarray(
        class_values,
        dtype=float
    ).flatten()

    feature_values = features.iloc[
        0
    ]

    explanations = []

    for feature, impact in zip(
        feature_columns,
        class_values
    ):

        original_value = case.get(
            feature,
            "Unknown"
        )

        if (
            original_value is None
            or str(original_value).strip() == ""
        ):

            original_value = "Unknown"

        explanations.append(
            {
                "feature": feature,
                "value": original_value,
                "encoded_value": (
                    float(
                        feature_values[
                            feature
                        ]
                    )
                ),
                "shap_impact": round(
                    float(impact),
                    6
                ),
                "direction": (
                    "increased support"
                    if impact > 0
                    else "decreased support"
                    if impact < 0
                    else "neutral"
                )
            }
        )

    explanations.sort(
        key=lambda x:
        abs(x["shap_impact"]),
        reverse=True
    )

    return {
        "predicted_class": PRIORITY_LABELS.get(
            prediction,
            str(prediction)
        ),
        "top_factors": explanations[:10]
    }


# ============================================================
# MAIN ORCHESTRATION
# ============================================================

def analyze_case(
    case,
    source_case_file=None
):

    print()
    print("=" * 70)
    print("ORCHESTRATING CASE ANALYSIS")
    print("=" * 70)

    # --------------------------------------------------------
    # STEP 1: ML
    # --------------------------------------------------------

    print()
    print("[1/4] Running ML priority prediction...")

    ml_result = predict_priority(
        case
    )

    print(
        f"      Prediction: "
        f"{ml_result['prediction']}"
    )

    # --------------------------------------------------------
    # STEP 2: SHAP
    # --------------------------------------------------------

    print()
    print("[2/4] Generating local SHAP explanation...")

    shap_result = explain_prediction(
        case
    )

    print(
        "      Top factors:"
    )

    for factor in shap_result[
        "top_factors"
    ][:5]:

        print(
            f"        {factor['feature']}: "
            f"{factor['shap_impact']:+.4f}"
        )

    # --------------------------------------------------------
    # STEP 3: HISTORICAL CASE RAG
    # --------------------------------------------------------

    print()
    print("[3/4] Searching historical case library...")

    similar_cases = retrieve_similar_cases(
        case,
        top_k=3,
        exclude_file=source_case_file
    )

    print(
        f"      Similar cases found: "
        f"{len(similar_cases)}"
    )

    # --------------------------------------------------------
    # STEP 4: KNOWLEDGE
    # --------------------------------------------------------

    print()
    print("[4/4] Retrieving domain knowledge...")

    knowledge = retrieve_all_knowledge(
        case
    )

    print(
        f"      Drug profile: "
        f"{knowledge['drug_profile'].get('status')}"
    )

    print(
        f"      NDPS sections: "
        f"{knowledge['ndps_sections'].get('status')}"
    )

    print(
        f"      Quantity information: "
        f"{knowledge['quantity_information'].get('status')}"
    )

    print(
        f"      SOP: "
        f"{knowledge['sop'].get('status')}"
    )

    print(
        f"      Trafficking patterns: "
        f"{knowledge['trafficking_patterns'].get('status')}"
    )

    # --------------------------------------------------------
    # BUILD EVIDENCE PACKAGE
    # --------------------------------------------------------

    evidence_package = {

        "case": case,

        "ml_prediction": ml_result,

        "local_explainability": shap_result,

        "similar_historical_cases": similar_cases,

        "knowledge": knowledge
    }

    return evidence_package


# ============================================================
# HUMAN-READABLE SUMMARY
# ============================================================

def print_summary(
    package
):

    print()
    print("=" * 70)
    print("NARCIS EVIDENCE PACKAGE")
    print("=" * 70)

    ml = package[
        "ml_prediction"
    ]

    print()
    print("ML PRIORITY")
    print("-" * 70)

    print(
        f"Prediction : "
        f"{ml['prediction']}"
    )

    for label, probability in (
        ml["probabilities"]
    ).items():

        print(
            f"  {label:<8}: "
            f"{probability * 100:.2f}%"
        )

    print()
    print("TOP SHAP FACTORS")
    print("-" * 70)

    for number, factor in enumerate(
        package[
            "local_explainability"
        ][
            "top_factors"
        ][:5],
        start=1
    ):

        print(
            f"{number}. "
            f"{factor['feature']} = "
            f"{factor['value']} "
            f"({factor['shap_impact']:+.4f})"
        )

    print()
    print("SIMILAR HISTORICAL CASES")
    print("-" * 70)

    for result in package[
        "similar_historical_cases"
    ]:

        historical = result[
            "case"
        ]

        print(
            f"Rank {result['rank']}: "
            f"{result['file']} | "
            f"{result['final_score']:.2f}%"
        )

        print(
            f"  Drug: "
            f"{historical.get('Drug_Type', 'Unknown')}"
        )

        matching_fields = result.get(
            "matching_fields",
            []
        )

        matching_text = (
            ", ".join(matching_fields)
            if matching_fields
            else "None"
        )

        print(
            f"  Matches: {matching_text}"
        )

    print()
    print("KNOWLEDGE SOURCES")
    print("-" * 70)

    knowledge = package[
        "knowledge"
    ]

    print(
        "Drug Profile       : "
        f"{knowledge['drug_profile'].get('status')}"
    )

    print(
        "NDPS Sections      : "
        f"{knowledge['ndps_sections'].get('status')}"
    )

    print(
        "Quantity Information: "
        f"{knowledge['quantity_information'].get('status')}"
    )

    print(
        "SOP                : "
        f"{knowledge['sop'].get('status')}"
    )

    print(
        "Trafficking        : "
        f"{knowledge['trafficking_patterns'].get('status')}"
    )

    print()
    print("=" * 70)
    print("ORCHESTRATOR PROTOTYPE TEST COMPLETED")
    print("=" * 70)


# ============================================================
# TEST CASE
# ============================================================

if __name__ == "__main__":

    test_case_path = (
        BASE_DIR
        / "knowledge_base"
        / "case_library"
        / "case002.json"
    )

    if not test_case_path.exists():

        raise FileNotFoundError(
            f"Test case not found:\n"
            f"{test_case_path}"
        )

    with open(
        test_case_path,
        "r",
        encoding="utf-8-sig"
    ) as f:

        test_case = json.load(
            f
        )

    package = analyze_case(
        test_case,
        source_case_file=test_case_path
    )

    print_summary(
        package
    )

    # Save prototype evidence package
    output_dir = BASE_DIR / "output"

    output_dir.mkdir(
        exist_ok=True
    )

    output_file = (
        output_dir
        / "prototype_evidence_package.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            package,
            f,
            indent=4,
            ensure_ascii=False,
            default=str
        )

    print()
    print(
        f"Evidence package saved to:\n"
        f"{output_file}"
    )
