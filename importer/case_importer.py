"""
NARCIS CASE IMPORTER

Workflow

PDF
 ↓
extractor.py
 ↓
mapper.py
 ↓
validator.py
 ↓
Officer Verification
 ↓
Verified Case JSON
 ↓
knowledge_base/case_library
 ↓
ML / RAG / LLM
"""

import json
from pathlib import Path
from datetime import datetime

from extractor import extract_text
from mapper import build_case_dictionary
from validator import validate_case


# --------------------------------------------------
# Project Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

OUTPUT_DIR = (
    BASE_DIR
    / "knowledge_base"
    / "case_library"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# --------------------------------------------------
# Fields that should be reviewed by the officer
# --------------------------------------------------

REVIEW_FIELDS = [
    "Investigation_Year",
    "Agency",
    "Drug_Type",
    "NCB_Zonal_Unit",
    "Quantity",
    "Persons_Arrested",
    "Source_Type",
    "Applicable_NDPS_Sections",
    "Quantity_Category",
    "Operation_Type",
    "Origin_State",
    "Destination_State",
    "Vehicle_Type",
    "Transport_Mode",
    "Route_Type",
    "Interstate_Travel",
]


# --------------------------------------------------
# Helper
# --------------------------------------------------

def is_unknown(value):

    if value is None:
        return True

    value = str(value).strip()

    return value == "" or value.lower() == "unknown"


# --------------------------------------------------
# Officer Verification
# --------------------------------------------------

def officer_verify(case, missing_fields):

    print()
    print("=" * 70)
    print("NARCIS OFFICER VERIFICATION")
    print("=" * 70)

    print(
        "\nReview the extracted case information below."
    )

    print(
        "\nThe officer may correct any field."
    )

    print(
        "If information cannot currently be established,"
    )

    print(
        "press ENTER or enter 'Unknown'."
    )

    print(
        "\nThis is intentional: NARCIS is an initial"
    )

    print(
        "investigation decision-support system."
    )

    print(
        "Unknown information is NOT automatically treated"
    )

    print(
        "as an error."
    )

    # ----------------------------------------------
    # Display current extraction
    # ----------------------------------------------

    print()
    print("-" * 70)
    print("CURRENT CASE INFORMATION")
    print("-" * 70)

    for field in REVIEW_FIELDS:

        value = case.get(
            field,
            "Unknown"
        )

        print(
            f"{field:28}: {value}"
        )

    # ----------------------------------------------
    # Verification
    # ----------------------------------------------

    print()
    print("-" * 70)
    print("OFFICER REVIEW")
    print("-" * 70)

    print(
        "\nFor each field:"
    )

    print(
        "  ENTER        = keep current value"
    )

    print(
        "  Unknown      = explicitly mark Unknown"
    )

    print(
        "  Any other    = replace with verified value"
    )

    print()

    for field in REVIEW_FIELDS:

        current = case.get(
            field,
            "Unknown"
        )

        if is_unknown(current):

            prompt = (
                f"{field} "
                f"[currently Unknown]: "
            )

        else:

            prompt = (
                f"{field} "
                f"[{current}]: "
            )

        answer = input(prompt).strip()

        if answer:

            case[field] = answer

        elif field not in case:

            case[field] = "Unknown"

    # ----------------------------------------------
    # Verification metadata
    # ----------------------------------------------

    case["_verification"] = {

        "verified": True,

        "verification_timestamp":
            datetime.now().astimezone().isoformat(),

        "verification_method":
            "Officer verification",

        "unknown_fields": [
            field
            for field in REVIEW_FIELDS
            if is_unknown(case.get(field))
        ]
    }

    print()
    print("-" * 70)

    unknown_fields = case["_verification"]["unknown_fields"]

    if unknown_fields:

        print(
            "Officer verification completed."
        )

        print(
            "\nFields intentionally remaining Unknown:"
        )

        for field in unknown_fields:

            print(
                f"  - {field}"
            )

    else:

        print(
            "Officer verification completed."
        )

        print(
            "No reviewed fields remain Unknown."
        )

    return case


# --------------------------------------------------
# Save Verified Case
# --------------------------------------------------

def save_case(case):

    existing = list(
        OUTPUT_DIR.glob(
            "case[0-9][0-9][0-9].json"
        )
    )

    case_number = len(existing) + 1

    filename = (
        OUTPUT_DIR
        / f"case{case_number:03}.json"
    )

    with open(
        filename,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            case,
            file,
            indent=4,
            ensure_ascii=False
        )

    return filename


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":

    print()
    print("=" * 70)
    print("NARCIS CASE IMPORTER")
    print("=" * 70)

    pdf = input(
        "\nEnter case file path: "
    ).strip().strip('"')

    # ----------------------------------------------
    # Extraction
    # ----------------------------------------------

    print(
        "\n[1/4] Reading document..."
    )

    text, pages = extract_text(pdf)

    print(
        f"      Extracted {pages} page(s)."
    )

    # ----------------------------------------------
    # Mapping
    # ----------------------------------------------

    print(
        "\n[2/4] Extracting structured case fields..."
    )

    case = build_case_dictionary(text)

    # ----------------------------------------------
    # Validation
    # ----------------------------------------------

    print(
        "\n[3/4] Validating extracted case..."
    )

    validated, missing = validate_case(case)

    # ----------------------------------------------
    # Officer verification
    # ----------------------------------------------

    print(
        "\n[4/4] Starting officer verification..."
    )

    verified_case = officer_verify(
        validated,
        missing
    )

    # ----------------------------------------------
    # Save
    # ----------------------------------------------

    filename = save_case(
        verified_case
    )

    print()
    print("=" * 70)
    print("CASE IMPORT SUCCESSFUL")
    print("=" * 70)

    print(
        f"\nSaved verified case to:"
    )

    print(
        filename
    )

    print(
        "\nVerification status: VERIFIED"
    )

    unknown_fields = (
        verified_case
        .get("_verification", {})
        .get("unknown_fields", [])
    )

    print(
        f"Unknown fields remaining: "
        f"{len(unknown_fields)}"
    )
