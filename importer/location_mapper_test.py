import re

UNKNOWN = "Unknown"

STATES = [

    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu",
    "Kashmir"

]


def extract_location_information(text):

    result = {

        "Origin_State": UNKNOWN,
        "Destination_State": UNKNOWN,
        "Origin_City": UNKNOWN,
        "Destination_City": UNKNOWN,
        "Route_Type": UNKNOWN,
        "Interstate_Travel": UNKNOWN

    }

    found_states = []

    lower = text.lower()

    for state in STATES:

        if state.lower() in lower:

            found_states.append(state)

    found_states = list(dict.fromkeys(found_states))

    if len(found_states) >= 2:

        result["Origin_State"] = found_states[0]
        result["Destination_State"] = found_states[1]

    elif len(found_states) == 1:

        result["Origin_State"] = found_states[0]

    if (

        result["Origin_State"] != UNKNOWN

        and

        result["Destination_State"] != UNKNOWN

    ):

        if result["Origin_State"] == result["Destination_State"]:

            result["Route_Type"] = "Intrastate"

            result["Interstate_Travel"] = "No"

        else:

            result["Route_Type"] = "Interstate"

            result["Interstate_Travel"] = "Yes"

    return result


if __name__ == "__main__":

    sample = """

    Heroin transported from Punjab
    to Gujarat by road.

    """

    result = extract_location_information(sample)

    print()

    print("=" * 60)
    print("LOCATION EXTRACTION TEST")
    print("=" * 60)

    for key, value in result.items():

        print(f"{key:25}: {value}")
