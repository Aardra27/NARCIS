import json
from pathlib import Path

from config import DRUG_PROFILES


def load_drug_profiles():
    """
    Load all drug profile JSON files from the knowledge base.
    """

    drugs = {}

    for file in DRUG_PROFILES.glob("*.json"):
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)

        drugs[data["drug_name"]] = data

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
