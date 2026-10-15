from pathlib import Path
import json
import shutil
from datetime import datetime


# ============================================================
# NARCIS OFFICER VERIFICATION MODULE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

CASE_LIBRARY_DIR = (
    BASE_DIR
    / "knowledge_base"
    / "case_library"
)

VERIFIED_DIR = (
    BASE_DIR
    / "output"
    / "verified_cases"
)

VERIFIED_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# FIELDS THAT MUST BE VERIFIED
# ============================================================

VERIFICATION_FIELDS = [
    "Previous_NDPS_FIRs",
    "Previous_Seizure_Link",
    "Applicable_NDPS_Sections",
    "Vehicle_Type",
    "Concealment_Method",
    "Intelligence_Input",
    "Origin_City",
    "Destination_City",
    "Occupation",
    "Total_Criminal_Cases"
]


# ============================================================
# LOAD CASE
# ============================================================

def load_case(case_path):

    case_path = Path(case_path)

    if not case_path.exists():
        raise FileNotFoundError(
            f"Case file not found:\n{case_path}"
        )

    with open(
        case_path,
        "r",
        encoding="utf-8-sig"
    ) as f:

        return json.load(f)


# ============================================================
# SAVE JSON
# ============================================================

def save_case(case, output_path):

    output_path = Path(output_path)

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        output_path,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            case,
            f,
            indent=4,
            ensure_ascii=False
        )


# ============================================================
# DISPLAY CASE
# ============================================================

def display_case(case):

    print()
    print("=" * 70)
    print("NARCIS OFFICER VERIFICATION")
    print("=" * 70)

    print()
    print("EXTRACTED CASE")
    print("-" * 70)

    for field, value in case.items():

        print(
            f"{field:<30}: {value}"
        )


# ============================================================
# FIND UNKNOWN FIELDS
# ============================================================

def find_unknown_fields(case):

    unknown_fields = []

    for field in VERIFICATION_FIELDS:

        value = case.get(
            field,
            "Unknown"
        )

        if (
            value is None
            or str(value).strip().lower()
            in {
                "",
                "unknown",
                "not available",
                "n/a",
                "na"
            }
        ):

            unknown_fields.append(field)

    return unknown_fields


# ============================================================
# OFFICER VERIFICATION
# ============================================================

def verify_case(case):

    display_case(case)

    unknown_fields = find_unknown_fields(
        case
    )

    print()
    print("=" * 70)
    print("FIELDS REQUIRING VERIFICATION")
    print("=" * 70)

    if not unknown_fields:

        print(
            "\nNo Unknown fields detected."
        )

    else:

        print()

        for field in unknown_fields:

            current_value = case.get(
                field,
                "Unknown"
            )

            print(
                f"\n{field}"
            )

            print(
                f"Current value: {current_value}"
            )

            print(
                "Enter verified value."
            )

            print(
                "Press ENTER to keep Unknown."
            )

            value = input(
                "Verified value: "
            ).strip()

            if value:

                case[field] = value

    # --------------------------------------------------------
    # FINAL CONFIRMATION
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("FINAL VERIFICATION")
    print("=" * 70)

    print()

    for field, value in case.items():

        print(
            f"{field:<30}: {value}"
        )

    print()

    confirmation = input(
        "Officer confirms this case is VERIFIED? [Y/N]: "
    ).strip().lower()

    if confirmation != "y":

        print()
        print(
            "Verification cancelled."
        )

        return None

    # --------------------------------------------------------
    # VERIFICATION METADATA
    # --------------------------------------------------------

    case["_verification"] = {
        "verified": True,
        "verification_timestamp":
            datetime.now().isoformat(),
        "verification_method":
            "Officer verification"
    }

    return case


# ============================================================
# SAVE VERIFIED CASE
# ============================================================

def save_verified_case(
    case,
    original_case_path
):

    original_case_path = Path(
        original_case_path
    )

    output_path = (
        VERIFIED_DIR
        / original_case_path.name
    )

    save_case(
        case,
        output_path
    )

    return output_path


# ============================================================
# VERIFY EXISTING CASE
# ============================================================

def verify_existing_case(case_path):

    case = load_case(
        case_path
    )

    verified_case = verify_case(
        case
    )

    if verified_case is None:

        return None

    output_path = save_verified_case(
        verified_case,
        case_path
    )

    print()
    print("=" * 70)
    print("CASE VERIFIED AND SAVED")
    print("=" * 70)

    print()
    print(
        f"Saved to:\n{output_path}"
    )

    return output_path


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("NARCIS OFFICER VERIFICATION MODULE")
    print("=" * 70)

    case_path = input(
        "\nEnter case JSON path: "
    ).strip()

    if not case_path:

        raise RuntimeError(
            "No case JSON path supplied."
        )

    verify_existing_case(
        case_path
    )
