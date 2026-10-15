import re

UNKNOWN = "Unknown"


def extract_legal_information(text):

    result = {

        "Applicable_NDPS_Sections": [],

        "Prosecution_Stage": UNKNOWN,

        "Case_Status": UNKNOWN,

        "Investigation_Priority": UNKNOWN

    }

    lower = text.lower()

    # -----------------------------------------
    # NDPS Sections
    # -----------------------------------------

    sections = re.findall(

        r'(?:(?:section|sections)\s*)?(\d+[A-Za-z]?(?:\([a-z]\))?)',

        text,

        flags=re.IGNORECASE

    )

    valid_sections = []

    for section in sections:

        if section not in valid_sections:

            valid_sections.append(section)

    result["Applicable_NDPS_Sections"] = valid_sections

    # -----------------------------------------
    # Prosecution Stage
    # -----------------------------------------

    if "supplementary complaint filed" in lower:

        result["Prosecution_Stage"] = "Supplementary Complaint Filed"

    elif "complaint filed" in lower:

        result["Prosecution_Stage"] = "Complaint Filed"

    elif "chargesheet filed" in lower:

        result["Prosecution_Stage"] = "Chargesheet Filed"

    elif "under investigation" in lower:

        result["Prosecution_Stage"] = "Investigation Ongoing"

    # -----------------------------------------
    # Case Status
    # -----------------------------------------

    if "convicted" in lower:

        result["Case_Status"] = "Convicted"

    elif "trial" in lower:

        result["Case_Status"] = "Trial"

    elif "investigation" in lower:

        result["Case_Status"] = "Investigation"

    # -----------------------------------------
    # Investigation Priority
    # (Temporary Rule-Based Version)
    # -----------------------------------------

    if (

        "commercial" in lower

        or

        "international" in lower

        or

        "syndicate" in lower

    ):

        result["Investigation_Priority"] = "High"

    elif (

        "intermediate" in lower

    ):

        result["Investigation_Priority"] = "Medium"

    else:

        result["Investigation_Priority"] = "Low"

    return result


if __name__ == "__main__":

    sample = """

    Sections 8(c), 21, 27A and 29
    of NDPS Act invoked.

    Complaint filed before Special Court.

    Commercial quantity recovered.

    International syndicate involved.

    """

    result = extract_legal_information(sample)

    print()

    print("=" * 60)
    print("LEGAL EXTRACTION TEST")
    print("=" * 60)

    for key, value in result.items():

        print(f"{key:30}: {value}")
