import json
from config import DRUG_PROFILES


def normalize_strings(items):
    result = []

    if not isinstance(items, list):
        return result

    for item in items:
        if isinstance(item, str):
            result.append(item)

        elif isinstance(item, dict):
            value = (
                item.get("section")
                or item.get("name")
                or item.get("value")
                or item.get("description")
            )

            if value is not None:
                result.append(str(value))

    return result


def load_drug_profiles():
    """
    Load drug profiles and normalize both structured and legacy schemas.
    """

    drugs = {}

    for file in DRUG_PROFILES.glob("*.json"):

        with open(file, "r", encoding="utf-8-sig") as f:
            data = json.load(f)

        # Current structured schema
        if "drug_information" in data:

            info = data.get("drug_information", {})
            legal = data.get("legal_information", {})
            thresholds = legal.get("quantity_thresholds", {})
            operational = data.get(
                "operational_intelligence",
                {}
            )

            drug_name = info.get("drug_name")

            small = thresholds.get(
                "small_quantity",
                {}
            )

            commercial = thresholds.get(
                "commercial_quantity",
                {}
            )

            small_value = (
                small.get("value")
                if isinstance(small, dict)
                else small
            )

            commercial_value = (
                commercial.get("value")
                if isinstance(commercial, dict)
                else commercial
            )

            intelligence_sources = operational.get(
                "intelligence_inputs",
                []
            )

            concealment_methods = operational.get(
                "concealment_methods",
                []
            )

            sections = legal.get(
                "applicable_ndps_sections",
                []
            )

        # Legacy flat schema
        else:

            drug_name = data.get("drug_name")

            small = data.get(
                "small_quantity",
                {}
            )

            commercial = data.get(
                "commercial_quantity",
                {}
            )

            small_value = (
                small.get("value")
                if isinstance(small, dict)
                else small
            )

            commercial_value = (
                commercial.get("value")
                if isinstance(commercial, dict)
                else commercial
            )

            intelligence_sources = data.get(
                "typical_intelligence_sources",
                []
            )

            concealment_methods = data.get(
                "common_concealment_methods",
                []
            )

            sections = data.get(
                "applicable_ndps_sections",
                []
            )

        if not drug_name:
            print(
                f"Warning: Skipping invalid drug profile: {file.name}"
            )
            continue

        # None is valid for controlled precursor chemicals
        # where quantity thresholds are legally not applicable.
        if small_value is not None:
            try:
                small_value = float(small_value)
            except (TypeError, ValueError):
                print(
                    f"Warning: Invalid small quantity threshold: "
                    f"{file.name}"
                )
                continue

        if commercial_value is not None:
            try:
                commercial_value = float(commercial_value)
            except (TypeError, ValueError):
                print(
                    f"Warning: Invalid commercial quantity threshold: "
                    f"{file.name}"
                )
                continue

        normalized = {
            "drug_name": drug_name,

            "small_quantity": {
                "value": small_value
            },

            "commercial_quantity": {
                "value": commercial_value
            },

            "typical_intelligence_sources":
                normalize_strings(
                    intelligence_sources
                ),

            "common_concealment_methods":
                normalize_strings(
                    concealment_methods
                ),

            "applicable_ndps_sections":
                normalize_strings(
                    sections
                )
        }

        drugs[drug_name] = normalized

    return drugs


def get_drug_names():
    """
    Return a sorted list of available drug names.
    """
    return sorted(load_drug_profiles().keys())


def get_drug(drug_name):
    """
    Return a single drug profile.
    """
    return load_drug_profiles().get(drug_name)


if __name__ == "__main__":
    print(get_drug_names())
