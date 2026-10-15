"""
NARCIS Validator

Checks extracted case fields before saving.
"""

UNKNOWN = "Unknown"

REQUIRED_FIELDS = [

    "Investigation_Year",
    "Agency",
    "Drug_Type",
    "Quantity",
    "Quantity_Category",
    "Transport_Mode",
    "Vehicle_Type",
    "Origin_State",
    "Destination_State",
    "Route_Type",
    "Interstate_Travel",
    "Persons_Arrested",
    "Applicable_NDPS_Sections"

]


def validate_case(case):

    validated = case.copy()

    missing = []

    for field in REQUIRED_FIELDS:

        if field not in validated:

            validated[field] = UNKNOWN

            missing.append(field)

            continue

        value = validated[field]

        if value is None:

            validated[field] = UNKNOWN

            missing.append(field)

        elif value == "":

            validated[field] = UNKNOWN

            missing.append(field)

        elif value == []:

            validated[field] = UNKNOWN

            missing.append(field)

    return validated, missing


if __name__ == "__main__":

    sample = {

        "Agency":"NCB",

        "Drug_Type":"Heroin",

        "Quantity":20.5

    }

    validated, missing = validate_case(sample)

    print()

    print("=" * 60)

    print("VALIDATOR TEST")

    print("=" * 60)

    print()

    print("Validated Fields")

    print()

    for key, value in validated.items():

        print(f"{key:28}: {value}")

    print()

    print("Missing Fields")

    print()

    for field in missing:

        print(field)
