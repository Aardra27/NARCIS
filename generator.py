import random
import uuid
from datetime import datetime

from drugs import load_drug_profiles
from states import random_state
from cities import random_city
from transport import (
    random_transport_mode,
    random_vehicle,
    random_route_type,
)
from occupations import random_occupation
from agencies import random_agency
from evidence import random_evidence
from risk_scoring import calculate_priority


# --------------------------------------------------
# Load Drug Knowledge Base
# --------------------------------------------------

DRUGS = load_drug_profiles()


# --------------------------------------------------
# Dataset Constants
# --------------------------------------------------

SOURCE_TYPES = [
    "Confidential Informant",
    "Surveillance",
    "Public Tip",
    "Cyber Intelligence",
    "Inter-Agency Input"
]

INVESTIGATION_STATUS = [
    "Open",
    "Under Investigation",
    "Charges Filed",
    "Closed"
]

GENDERS = [
    "Male",
    "Female",
    "Other"
]

TRAVEL_FREQUENCY = [
    "Rare",
    "Occasional",
    "Frequent"
]


# --------------------------------------------------
# Probability Distributions
# --------------------------------------------------

PRIOR_NDPS_WEIGHTS = [65, 20, 10, 5]

CRIMINAL_HISTORY_WEIGHTS = [35, 30, 20, 10, 5]

TRAVEL_WEIGHTS = [45, 40, 15]

SEIZURE_WEIGHTS = [25, 75]

AGE_RANGE = list(range(18, 71))

AGE_WEIGHTS = [
    2 if age <= 22 else
    4 if age <= 30 else
    5 if age <= 40 else
    3 if age <= 50 else
    2
    for age in AGE_RANGE
]

# --------------------------------------------------
# Quantity Generation
# --------------------------------------------------

def random_quantity(drug):
    """
    Generate seizure quantity with a realistic distribution.
    Small cases are most common, followed by Intermediate
    and Commercial quantities.
    """

    small = drug["small_quantity"]["value"]
    commercial = drug["commercial_quantity"]["value"]

    category = random.choices(
        population=["Small", "Intermediate", "Commercial"],
        weights=[45, 35, 20],
        k=1
    )[0]

    if category == "Small":
        quantity = random.uniform(0.2, small)

    elif category == "Intermediate":
        quantity = random.uniform(
            small + 0.1,
            commercial - 0.1
        )

    else:
        quantity = random.uniform(
            commercial,
            commercial * 2.5
        )

    return round(quantity, 2)


def quantity_category(drug, quantity):
    """
    Determine NDPS quantity category.
    """

    small = drug["small_quantity"]["value"]
    commercial = drug["commercial_quantity"]["value"]

    if quantity <= small:
        return "Small"

    elif quantity >= commercial:
        return "Commercial"

    return "Intermediate"


# --------------------------------------------------
# Investigation Year
# --------------------------------------------------

def random_investigation_year():
    """
    Recent investigations are more common.
    """

    years = list(range(2020, datetime.now().year + 1))

    weights = [
        2,
        3,
        4,
        5,
        6,
        7,
        8
    ][:len(years)]

    return random.choices(
        years,
        weights=weights,
        k=1
    )[0]


# --------------------------------------------------
# Seizure History
# --------------------------------------------------

def random_seizure_history():

    return random.choices(
        population=["Yes", "No"],
        weights=SEIZURE_WEIGHTS,
        k=1
    )[0]


# --------------------------------------------------
# Route and Location Generation
# --------------------------------------------------

def generate_route():

    origin_state = random_state()

    route = random_route_type()

    if route == "Intrastate":

        destination_state = origin_state

    else:

        destination_state = random_state()

        while destination_state == origin_state:
            destination_state = random_state()

    origin_city = random_city(origin_state)
    destination_city = random_city(destination_state)

    interstate = "Yes" if route == "Interstate" else "No"

    transport_mode = random_transport_mode()
    vehicle_type = random_vehicle(transport_mode)

    return {
        "Origin_State": origin_state,
        "Destination_State": destination_state,
        "Origin_City": origin_city,
        "Destination_City": destination_city,
        "Route_Type": route,
        "Interstate_Travel": interstate,
        "Transport_Mode": transport_mode,
        "Vehicle_Type": vehicle_type
    }


# --------------------------------------------------
# Criminal Background
# --------------------------------------------------

def generate_criminal_history():

    previous_ndps = random.choices(
        population=[0,1,2,3],
        weights=PRIOR_NDPS_WEIGHTS,
        k=1
    )[0]

    criminal_cases = previous_ndps + random.choices(
        population=[0,1,2,3,4],
        weights=CRIMINAL_HISTORY_WEIGHTS,
        k=1
    )[0]

    associates = random.choices(
        population=list(range(11)),
        weights=[18,17,15,12,10,8,7,5,4,3,1],
        k=1
    )[0]

    return {
        "Previous_NDPS_FIRs": previous_ndps,
        "Total_Criminal_Cases": criminal_cases,
        "Known_Associate_Count": associates,
        "Previous_Seizure_Link": random_seizure_history()
    }


# --------------------------------------------------
# Intelligence Generation
# --------------------------------------------------

def generate_intelligence(drug):

    sources = drug["typical_intelligence_sources"]

    return random.choices(
        population=["No Intelligence"] + sources,
        weights=[50] + [50 / len(sources)] * len(sources),
        k=1
    )[0]


# --------------------------------------------------
# Main Record Generator
# --------------------------------------------------

def generate_record():

    drug = random.choice(list(DRUGS.values()))

    route = generate_route()

    criminal = generate_criminal_history()

    quantity = random_quantity(drug)

    quantity_type = quantity_category(
        drug,
        quantity
    )

    intelligence = generate_intelligence(drug)

    priority = calculate_priority(
        quantity_type,
        criminal["Previous_NDPS_FIRs"],
        criminal["Total_Criminal_Cases"],
        criminal["Previous_Seizure_Link"],
        route["Interstate_Travel"],
        intelligence
    )

    record = {

        # ----------------------------
        # Investigation Details
        # ----------------------------

        "Investigation_ID": str(uuid.uuid4())[:8],

        "Investigation_Year": random_investigation_year(),

        "Agency": random_agency(),

        "Investigation_Status": random.choice(
            INVESTIGATION_STATUS
        ),

        "Source_Type": random.choice(
            SOURCE_TYPES
        ),

        # ----------------------------
        # Suspect Information
        # ----------------------------

        "Suspect_ID": f"SUS-{random.randint(10000,99999)}",

        "Age": random.choices(
            AGE_RANGE,
            weights=AGE_WEIGHTS,
            k=1
        )[0],

        "Gender": random.choice(GENDERS),

        "Occupation": random_occupation(),

        "Network_ID": f"NET-{random.randint(1000,9999)}",

        "Known_Associate_Count":
            criminal["Known_Associate_Count"],

        "Previous_NDPS_FIRs":
            criminal["Previous_NDPS_FIRs"],

        "Total_Criminal_Cases":
            criminal["Total_Criminal_Cases"],

        "Previous_Seizure_Link":
            criminal["Previous_Seizure_Link"],

        # ----------------------------
        # Route Information
        # ----------------------------

        "Origin_State":
            route["Origin_State"],

        "Destination_State":
            route["Destination_State"],

        "Origin_City":
            route["Origin_City"],

        "Destination_City":
            route["Destination_City"],

        "Transport_Mode":
            route["Transport_Mode"],

        "Vehicle_Type":
            route["Vehicle_Type"],

        "Route_Type":
            route["Route_Type"],

        "Interstate_Travel":
            route["Interstate_Travel"],

        "Travel_Frequency": random.choices(
            TRAVEL_FREQUENCY,
            weights=TRAVEL_WEIGHTS,
            k=1
        )[0],

        # ----------------------------
        # Drug Details
        # ----------------------------

        "Drug_Type":
            drug["drug_name"],

        "Quantity":
            quantity,

        "Quantity_Category":
            quantity_type,

        "Concealment_Method":
            random.choice(
                drug["common_concealment_methods"]
            ),

        # ----------------------------
        # Intelligence & Evidence
        # ----------------------------

        "Intelligence_Input":
            intelligence,

        "Evidence_Type":
            ", ".join(random_evidence()),

        "Applicable_NDPS_Sections":
            ", ".join(
                drug["applicable_ndps_sections"]
            ),

        # ----------------------------
        # Target Variable
        # ----------------------------

        "Investigation_Priority":
            priority

    }

    return record


# --------------------------------------------------
# Main Program
# --------------------------------------------------

if __name__ == "__main__":

    print("\nGenerating Sample Investigation Record...\n")

    record = generate_record()

    for key, value in record.items():
        print(f"{key}: {value}")

