from pathlib import Path
import re

from ndps_rules import determine_quantity_category

# ==================================================
# NARCIS CASE MAPPER
# ==================================================

UNKNOWN = "Unknown"

DRUGS = {

    "Heroin": [
        "heroin",
        "diacetylmorphine"
    ],

    "Cocaine": [
        "cocaine"
    ],

    "Ganja": [
        "ganja",
        "marijuana",
        "cannabis"
    ],

    "Hashish": [
        "hashish",
        "charas"
    ],

    "Opium": [
        "opium"
    ],

    "Methamphetamine": [
        "methamphetamine",
        "meth"
    ],

    "MDMA": [
        "mdma",
        "ecstasy"
    ],

    "Mephedrone": [
        "mephedrone",
        "meow meow"
    ]
}


# --------------------------------------------------
# Drug Information
# --------------------------------------------------

def extract_drug_information(text):

    result = {

        "Drug_Type": UNKNOWN,

        "Quantity": None,

        "Quantity_Unit": None,

        "Quantity_Category": UNKNOWN,

        "Drug_Confidence": 0.0

    }

    lower = text.lower()

    # ------------------------------
    # Drug Type
    # ------------------------------

    for drug, aliases in DRUGS.items():

        for alias in aliases:

            if re.search(
                rf"\b{re.escape(alias)}\b",
                lower
            ):

                result["Drug_Type"] = drug

                result["Drug_Confidence"] = 0.99

                break

        if result["Drug_Type"] != UNKNOWN:

            break

    # ------------------------------
    # Quantity
    # ------------------------------

    quantity_pattern = re.compile(

        r"(\d+(?:\.\d+)?)\s*(kg|kilograms?|g|grams?|mg|milligrams?)",

        re.IGNORECASE

    )

    match = quantity_pattern.search(text)

    if match:

        value = float(match.group(1))

        unit = match.group(2).lower()

        result["Quantity_Unit"] = unit

        if unit.startswith("mg"):

            value /= 1000000

        elif unit.startswith("g"):

            value /= 1000

        result["Quantity"] = round(value, 6)

    # ------------------------------
    # Quantity Category
    # ------------------------------

    if (

        result["Drug_Type"] != UNKNOWN

        and

        result["Quantity"] is not None

    ):

        result["Quantity_Category"] = determine_quantity_category(

            result["Drug_Type"],

            result["Quantity"]

        )

    return result


# --------------------------------------------------
# Test
# --------------------------------------------------

if __name__ == "__main__":

    sample = """
    Officers of NCB seized
    20.326 kg heroin during
    investigation.
    """

    result = extract_drug_information(sample)

    print()

    print("=" * 60)

    print("DRUG EXTRACTION TEST")

    print("=" * 60)

    for key, value in result.items():

        print(f"{key:22}: {value}")
