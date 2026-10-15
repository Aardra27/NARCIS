"""
NDPS Quantity Thresholds

Values are stored in kilograms.

These thresholds are used to determine:
- Small Quantity
- Intermediate Quantity
- Commercial Quantity

Reference:
NDPS Act Notification (standardized for NARCIS dataset)
"""

NDPS_THRESHOLDS = {

    "Heroin": {
        "small": 0.005,
        "commercial": 0.250
    },

    "Cocaine": {
        "small": 0.002,
        "commercial": 0.100
    },

    "Ganja": {
        "small": 1.0,
        "commercial": 20.0
    },

    "Hashish": {
        "small": 0.100,
        "commercial": 1.0
    },

    "Opium": {
        "small": 0.025,
        "commercial": 2.5
    },

    "Methamphetamine": {
        "small": 0.002,
        "commercial": 0.050
    },

    "MDMA": {
        "small": 0.010,
        "commercial": 0.500
    },

    "Mephedrone": {
        "small": 0.002,
        "commercial": 0.050
    }

}


def determine_quantity_category(drug, quantity):

    if drug not in NDPS_THRESHOLDS:
        return "Unknown"

    if quantity is None:
        return "Unknown"

    limits = NDPS_THRESHOLDS[drug]

    if quantity <= limits["small"]:
        return "Small"

    elif quantity >= limits["commercial"]:
        return "Commercial"

    else:
        return "Intermediate"


if __name__ == "__main__":

    print(determine_quantity_category("Heroin",0.003))
    print(determine_quantity_category("Heroin",0.050))
    print(determine_quantity_category("Heroin",1.5))
