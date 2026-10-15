import re

UNKNOWN = "Unknown"


def extract_investigation_information(text):

    result = {

        "Persons_Arrested": UNKNOWN,

        "Intelligence_Input": UNKNOWN,

        "Previous_Seizure_Link": UNKNOWN,

        "Network_Type": UNKNOWN,

        "Concealment_Method": UNKNOWN

    }

    lower = text.lower()

    # -----------------------------------------
    # Persons Arrested
    # -----------------------------------------

    arrest_patterns = [

        r'(\d+)\s+persons?\s+arrested',

        r'(\d+)\s+accused',

        r'total\s+arrest\s*[:\-]?\s*(\d+)'

    ]

    for pattern in arrest_patterns:

        match = re.search(
            pattern,
            lower
        )

        if match:

            result["Persons_Arrested"] = int(match.group(1))

            break

    # -----------------------------------------
    # Intelligence Input
    # -----------------------------------------

    intelligence_keywords = [

        "secret information",

        "specific intelligence",

        "credible information",

        "ncb intelligence",

        "operational intelligence"

    ]

    for keyword in intelligence_keywords:

        if keyword in lower:

            result["Intelligence_Input"] = keyword.title()

            break

    # -----------------------------------------
    # Previous Seizure Link
    # -----------------------------------------

    if any(

        phrase in lower

        for phrase in [

            "follow up investigation",

            "same syndicate",

            "previous seizure",

            "linked to"

        ]

    ):

        result["Previous_Seizure_Link"] = "Yes"

    else:

        result["Previous_Seizure_Link"] = "No"

    # -----------------------------------------
    # Network Type
    # -----------------------------------------

    if "international" in lower:

        result["Network_Type"] = "International"

    elif "interstate" in lower:

        result["Network_Type"] = "Interstate"

    elif "syndicate" in lower:

        result["Network_Type"] = "Organized"

    # -----------------------------------------
    # Concealment Method
    # -----------------------------------------

    concealment = [

        "hidden compartment",

        "commercial consignment",

        "drone payload",

        "courier parcel",

        "vehicle cavity",

        "luggage"

    ]

    for method in concealment:

        if method in lower:

            result["Concealment_Method"] = method.title()

            break

    return result


if __name__ == "__main__":

    sample = """

    Acting on specific intelligence,

    NCB officers intercepted a commercial
    consignment.

    20 persons arrested.

    Follow up investigation linked
    the same syndicate.

    """

    result = extract_investigation_information(sample)

    print()

    print("=" * 60)
    print("INVESTIGATION EXTRACTION TEST")
    print("=" * 60)

    for key, value in result.items():

        print(f"{key:28}: {value}")
