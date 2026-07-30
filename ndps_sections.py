import json

from config import LEGAL


def load_ndps_sections():
    """
    Load NDPS sections from the legal knowledge base.
    """

    file_path = LEGAL / "ndps_sections.json"

    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data["sections"]


def get_section(section_number):
    """
    Return details of a specific NDPS section.
    """

    for section in load_ndps_sections():
        if section["section"] == section_number:
            return section

    return None


def get_sections_for_drug(drug_name):
    """
    Return all NDPS sections applicable to a drug.
    """

    results = []

    for section in load_ndps_sections():
        if drug_name in section["applicable_for"] or "All Narcotic Drugs" in section["applicable_for"]:
            results.append(section)

    return results


if __name__ == "__main__":
    print(get_section("21"))
    print(get_sections_for_drug("Heroin"))
