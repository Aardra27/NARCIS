import re


# ============================================================
# NARCIS CASE MAPPER
# Standardized Narrative Case Report Format
# ============================================================


# ------------------------------------------------------------
# Utility Functions
# ------------------------------------------------------------

def clean(value):
    if not value:
        return "Unknown"

    value = re.sub(r"\s+", " ", value).strip()
    value = value.strip(" :-\t")

    return value if value else "Unknown"


def search_first(patterns, text, flags=re.IGNORECASE):
    for pattern in patterns:
        match = re.search(pattern, text, flags)
        if match:
            return clean(match.group(1))

    return "Unknown"


# ------------------------------------------------------------
# Investigation Year
# ------------------------------------------------------------

def extract_year(text):

    patterns = [
        r"Investigation\s+Year\s*[:\-]?\s*(20\d{2})",
        r"Report\s*/?\s*Investigation\s+Year\s*[:\-]?\s*(20\d{2})",
        r"\b(20\d{2})\b"
    ]

    return search_first(patterns, text)


# ------------------------------------------------------------
# Agency
# ------------------------------------------------------------

def extract_agency(text):

    patterns = [
        r"Agency\s*[:\-]?\s*([A-Za-z ]+)",
        r"\b(NCB)\b",
        r"Narcotics Control Bureau"
    ]

    result = search_first(patterns, text)

    if result.lower() == "narcotics control bureau":
        return "NCB"

    return result


# ------------------------------------------------------------
# Drug Type
# ------------------------------------------------------------

def extract_drug(text):

    patterns = [

        r"Name\s+of\s+the\s+Drug\s*[:\-]?\s*(.+?)(?=\s+NCB\s+Zonal|\s+Qty\.|\s+Total\s+Arrest|$)",

        r"Name\s+of\s+Drug\s*[:\-]?\s*(.+?)(?=\s+NCB\s+Zonal|\s+Qty\.|\s+Total\s+Arrest|$)",

        r"Drug\s+Type\s*[:\-]?\s*(.+?)(?=\s+NCB|\s+Qty|\s+Total|$)"
    ]

    return search_first(patterns, text)


# ------------------------------------------------------------
# NCB Zonal Unit
# ------------------------------------------------------------

def extract_zonal_unit(text):

    patterns = [

        r"NCB\s+Zonal\s+Unit\s*[:\-]?\s*(.+?)(?=\s+Qty\.|\s+Quantity|\s+Total\s+Arrest|$)",

        r"Zonal\s+Unit\s*[:\-]?\s*(.+?)(?=\s+Qty\.|\s+Quantity|\s+Total\s+Arrest|$)"
    ]

    return search_first(patterns, text)


# ------------------------------------------------------------
# Quantity
# ------------------------------------------------------------

def extract_quantity(text):

    # First priority: explicitly labelled quantity field.
    # Capture the complete line, including parentheses.

    patterns = [

        r"Qty\.\s*Seized\s*[:\-]?\s*([^\r\n]+)",

        r"Quantity\s+Seized\s*[:\-]?\s*([^\r\n]+)"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            value = clean(match.group(1))

            value = re.split(
                r"\s+(?:Total\s+Arrest|Persons?\s+Arrested)\b",
                value,
                flags=re.IGNORECASE
            )[0]

            return value.strip()

    # Narrative fallback.

    patterns = [

        r"seized\s+(.{0,150}?\d[\d,.]*\s*(?:kg|kgs|kilograms?|gram|grams|g|capsules|tablets)(?:\s*\([^)]*\))?)",

        r"seizure\s+of\s+(.{0,150}?\d[\d,.]*\s*(?:kg|kgs|kilograms?|gram|grams|g|capsules|tablets)(?:\s*\([^)]*\))?)"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.DOTALL
        )

        if match:

            return clean(match.group(1))

    return "Unknown"


# ------------------------------------------------------------
# Persons Arrested
# ------------------------------------------------------------

def extract_arrests(text):

    patterns = [

        r"Total\s+Arrest\s*[:\-]?\s*(\d+)\s*(?:Persons?|People)?",

        r"(\d+)\s+persons?\s+were\s+arrested",

        r"arrested\s+(\d+)\s+persons?",

        r"arrest\s+of\s+(\d+)\s+persons?"
    ]

    return search_first(patterns, text)


# ------------------------------------------------------------
# Source Type
# ------------------------------------------------------------

def extract_source_type(text):

    explicit_patterns = [

        (r"\bsecret\s+information\b", "Secret Information"),

        (r"\bspecific\s+information\b", "Specific Information"),

        (r"\bspecific\s+input\b", "Specific Input"),

        (r"\bintelligence\s+input\b", "Intelligence Input"),

        (r"\bintelligence\s+information\b", "Intelligence Information"),

        (r"\bactive\s+intelligence\b", "Active Intelligence"),

        (r"\bspecific\s+intelligence\b", "Specific Intelligence"),

        (r"\bon\s+the\s+basis\s+of\s+information\b", "Information"),

        (r"\bpursuant\s+to\s+active\s+intelligence\b", "Active Intelligence"),

        (r"\bbased\s+on\s+specific\s+information\b", "Specific Information"),

        (r"\bbased\s+on\s+secret\s+information\b", "Secret Information")
    ]

    for pattern, result in explicit_patterns:

        if re.search(pattern, text, re.IGNORECASE):

            return result

    return "Unknown"


# ------------------------------------------------------------
# NDPS Sections
# ------------------------------------------------------------

def extract_ndps_sections(text):

    # Matches patterns such as:
    # Sections 8, 15, 18, 25, 27A and 29 of the NDPS Act
    # Sections 9A, 25A, 26, 29 and 38 of the NDPS Act

    patterns = [

        r"Sections?\s+([0-9A-Za-z,\s\/]+?)\s+(?:and\s+)?(?:\d+[A-Za-z]*)?\s*of\s+the\s+NDPS",

        r"Sections?\s+([0-9A-Za-z,\s\/]+(?:\s+and\s+[0-9A-Za-z]+)?)\s+of\s+the\s+NDPS",

        r"Sections?\s+([0-9A-Za-z,\s\/]+)\s+of\s+the\s+NDPS"
    ]

    result = search_first(patterns, text)

    if result == "Unknown":
        return "Unknown"

    result = re.sub(r"\s+and\s+", ", ", result, flags=re.IGNORECASE)
    result = re.sub(r"\s*,\s*", ", ", result)
    result = result.strip(" ,")

    return result


# ------------------------------------------------------------
# Quantity Category
# ------------------------------------------------------------

def extract_quantity_category(text):

    if re.search(r"\bcommercial\s+quantity\b", text, re.IGNORECASE):
        return "Commercial"

    if re.search(r"\bsmall\s+quantity\b", text, re.IGNORECASE):
        return "Small"

    if re.search(r"\bintermediate\s+quantity\b", text, re.IGNORECASE):
        return "Intermediate"

    return "Unknown"


# ------------------------------------------------------------
# Operation Type
# ------------------------------------------------------------

def extract_operation_type(text):

    # Only classify an operation when the report explicitly
    # describes the trafficking/operation method.

    patterns = [

        (
            r"\bparcel\s+trafficking\b",
            "Parcel Trafficking"
        ),

        (
            r"\bcourier\s+trafficking\b",
            "Courier Trafficking"
        ),

        (
            r"\bclandestine\s+laborator",
            "Clandestine Laboratory"
        ),

        (
            r"\bdrug\s+syndicate\b",
            "Syndicate Trafficking"
        ),

        (
            r"\bdrug\s+trafficking\s+(?:network|syndicate|operation)\b",
            "Drug Trafficking"
        ),

        (
            r"\bsmuggling\s+(?:network|operation|route)\b",
            "Drug Smuggling"
        )
    ]

    for pattern, result in patterns:

        if re.search(pattern, text, re.IGNORECASE):

            return result

    return "Unknown"


# ------------------------------------------------------------
# State Extraction
# ------------------------------------------------------------

INDIAN_STATES = [
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
    "Jammu and Kashmir"
]


def extract_states(text):

    # Explicit origin/destination phrases are preferred.
    origin = "Unknown"
    destination = "Unknown"

    origin_patterns = [
        r"\bfrom\s+([A-Z][A-Za-z .]+?),\s*(?:India|Indian)?\b",
        r"\bsourced\s+from\s+([A-Z][A-Za-z .]+?),\s*(?:India|Indian)?\b",
        r"\borigin(?:ated)?\s+from\s+([A-Z][A-Za-z .]+?),"
    ]

    destination_patterns = [
        r"\bto\s+([A-Z][A-Za-z .]+?),\s*(?:India|Indian)?\b",
        r"\bdestination\s+(?:was\s+|is\s+)?([A-Z][A-Za-z .]+?),",
        r"\bdestined\s+for\s+([A-Z][A-Za-z .]+?),"
    ]

    # First try explicit state names.
    for state in INDIAN_STATES:

        if re.search(
            r"\bfrom\s+" + re.escape(state) + r"\b",
            text,
            re.IGNORECASE
        ):

            origin = state
            break

    for state in INDIAN_STATES:

        if re.search(
            r"\b(?:to|destination|destined\s+for)\s+"
            + re.escape(state)
            + r"\b",
            text,
            re.IGNORECASE
        ):

            destination = state
            break

    # If explicit state wording wasn't found, use mentions
    # of states, preserving document order.
    if origin == "Unknown" or destination == "Unknown":

        found = []

        for state in INDIAN_STATES:

            matches = list(
                re.finditer(
                    r"\b" + re.escape(state) + r"\b",
                    text,
                    re.IGNORECASE
                )
            )

            for match in matches:
                found.append((match.start(), state))

        found.sort()

        ordered = []

        for _, state in found:

            if state not in ordered:
                ordered.append(state)

        if origin == "Unknown" and len(ordered) >= 1:
            origin = ordered[0]

        if destination == "Unknown" and len(ordered) >= 2:
            destination = ordered[1]

    return origin, destination


# ------------------------------------------------------------
# Vehicle
# ------------------------------------------------------------

def extract_vehicle(text):

    vehicle_patterns = [

        (r"\bTATA\s+truck\b", "Truck"),
        (r"\btruck\b", "Truck"),
        (r"\bcontainer\b", "Container"),
        (r"\bvan\b", "Van"),
        (r"\bcar\b", "Car"),
        (r"\bvehicle\b", "Vehicle"),
        (r"\bvessel\b", "Vessel"),
        (r"\bship\b", "Ship")
    ]

    for pattern, result in vehicle_patterns:

        if re.search(pattern, text, re.IGNORECASE):
            return result

    return "Unknown"


# ------------------------------------------------------------
# Transport Mode
# ------------------------------------------------------------

def extract_transport_mode(text):

    patterns = [

        (r"\bby\s+air\b|\bvia\s+air\b|\bair\s+route\b", "Air"),

        (r"\bby\s+sea\b|\bvia\s+sea\b|\bsea\s+route\b|\bmaritime\b", "Sea"),

        (r"\bby\s+rail\b|\bvia\s+rail\b|\brailway\b|\btrain\b", "Rail"),

        (r"\bby\s+road\b|\bvia\s+road\b|\broad\s+route\b", "Road"),

        (r"\bparcel\b|\bcourier\b", "Parcel")
    ]

    for pattern, result in patterns:

        if re.search(pattern, text, re.IGNORECASE):

            return result

    # Use physical transport objects only when the text
    # clearly describes movement.
    if re.search(
        r"\btransported\s+by\s+(?:truck|vehicle)\b|\bcarried\s+in\s+(?:a\s+)?truck\b",
        text,
        re.IGNORECASE
    ):
        return "Road"

    if re.search(
        r"\btransported\s+by\s+(?:vessel|ship)\b",
        text,
        re.IGNORECASE
    ):
        return "Sea"

    return "Unknown"


# ------------------------------------------------------------
# Route Type
# ------------------------------------------------------------

def extract_route_type(origin, destination, text):

    if origin != "Unknown" and destination != "Unknown":

        if origin.lower() != destination.lower():
            return "Interstate"

        return "Intrastate"

    if re.search(
        r"\binterstate\b|\bmultiple\s+states\b|\bmulti[- ]state\b",
        text,
        re.IGNORECASE
    ):
        return "Interstate"

    return "Unknown"


# ------------------------------------------------------------
# Interstate Travel
# ------------------------------------------------------------

def extract_interstate(route_type, text):

    if route_type == "Interstate":
        return "Yes"

    if route_type == "Intrastate":
        return "No"

    if re.search(
        r"\binterstate\b|\bmulti[- ]state\b|\bmultiple\s+states\b",
        text,
        re.IGNORECASE
    ):
        return "Yes"

    return "Unknown"


# ============================================================
# MAIN CASE MAPPER
# ============================================================

def build_case_dictionary(text):

    origin, destination = extract_states(text)

    route_type = extract_route_type(
        origin,
        destination,
        text
    )

    case = {}

    # Basic Information

    case["Investigation_Year"] = extract_year(text)

    case["Agency"] = extract_agency(text)

    case["Drug_Type"] = extract_drug(text)

    case["NCB_Zonal_Unit"] = extract_zonal_unit(text)

    case["Quantity"] = extract_quantity(text)

    case["Persons_Arrested"] = extract_arrests(text)


    # Investigation

    case["Source_Type"] = extract_source_type(text)

    case["Applicable_NDPS_Sections"] = extract_ndps_sections(text)

    case["Quantity_Category"] = extract_quantity_category(text)

    case["Operation_Type"] = extract_operation_type(text)


    # Location

    case["Origin_State"] = origin

    case["Destination_State"] = destination


    # Transport

    case["Vehicle_Type"] = extract_vehicle(text)

    case["Transport_Mode"] = extract_transport_mode(text)

    case["Route_Type"] = route_type

    case["Interstate_Travel"] = extract_interstate(
        route_type,
        text
    )


    return case


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    sample = """

    NARCOTICS CONTROL BUREAU

    INVESTIGATION CASE REPORT

    CASE STUDY - 02

    Name of the Drug : Heroin

    NCB Zonal Unit : Chandigarh Zonal Unit

    Qty. Seized : 20.326 Kg Heroin

    Total Arrest : 20 Persons

    Based on secret information, the NCB-Chandigarh team
    apprehended one person with 20.326 kg of Heroin.

    The investigation involved Mundra Port in Gujarat,
    ICP Attari in Punjab and routes through Jammu and Kashmir.

    Two kingpins were arrested at Jaipur International Airport
    while attempting to leave for Sharjah, UAE.

    """

    data = build_case_dictionary(sample)

    print()
    print("=" * 60)
    print("NARCIS MAPPER TEST")
    print("=" * 60)

    for key, value in data.items():

        print(f"{key:30}: {value}")
