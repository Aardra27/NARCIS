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
    interstate_travel
)
from occupations import random_occupation
from agencies import random_agency
from evidence import random_evidence
from risk_scoring import calculate_priority


drugs = load_drug_profiles()


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


def random_quantity(drug):
    """
    Generate quantities with more realistic distribution.
    Small and Intermediate cases are more common than Commercial.
    """

    commercial = drug["commercial_quantity"]["value"]
    small = drug["small_quantity"]["value"]

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

    small = drug["small_quantity"]["value"]
    commercial = drug["commercial_quantity"]["value"]

    if quantity <= small:
        return "Small"

    if quantity >= commercial:
        return "Commercial"

    return "Intermediate"


def generate_record():

    drug = random.choice(list(drugs.values()))

    origin_state = random_state()
    destination_state = random_state()

    origin_city = random_city(origin_state)
    destination_city = random_city(destination_state)

    transport_mode = random_transport_mode()
    vehicle = random_vehicle(transport_mode)

    route = random_route_type()

    interstate = "Yes" if interstate_travel(route) else "No"

    quantity = random_quantity(drug)

    qty_category = quantity_category(drug, quantity)

    previous_ndps = random.choices(
        population=[0, 1, 2, 3],
        weights=[65, 20, 10, 5],
        k=1
    )[0]

    criminal_cases = previous_ndps + random.choices(
        population=[0, 1, 2, 3, 4],
        weights=[35, 30, 20, 10, 5],
        k=1
    )[0]

    seizure_link = random.choice(["Yes", "No"])

    sources = drug["typical_intelligence_sources"]

    intelligence = random.choices(
        population=["No Intelligence"] + sources,
        weights=[50] + [50 / len(sources)] * len(sources),
        k=1
    )[0]


    priority = calculate_priority(
        qty_category,
        previous_ndps,
        criminal_cases,
        seizure_link,
        interstate,
        intelligence,

    )

    return {

        "Investigation_ID": str(uuid.uuid4())[:8],

        "Investigation_Year": random.randint(
            2020,
            datetime.now().year
        ),

        "State": destination_state,

        "Origin_City": origin_city,

        "Destination_City": destination_city,

        "Agency": random_agency(),

        "Investigation_Status": random.choice(
            INVESTIGATION_STATUS
        ),

        "Source_Type": random.choice(
            SOURCE_TYPES
        ),

        "Suspect_ID": f"SUS-{random.randint(10000,99999)}",

        "Age": random.choices(
            population=list(range(18, 71)),
            weights=[
                2 if age <= 22 else
                4 if age <= 30 else
                5 if age <= 40 else
                3 if age <= 50 else
                2
                for age in range(18, 71)
            ],
            k=1
        )[0],

        "Gender": random.choice(GENDERS),

        "Occupation": random_occupation(),

        "Network_ID": f"NET-{random.randint(100,999)}",

        "Known_Associate_Count": random.randint(0,10),

        "Previous_NDPS_FIRs": previous_ndps,

        "Total_Criminal_Cases": criminal_cases,

        "Previous_Seizure_Link": seizure_link,

        "Transport_Mode": transport_mode,

        "Vehicle_Type": vehicle,

        "Route_Type": route,

        "Interstate_Travel": interstate,

        "Travel_Frequency": random.choices(
            population=[
                "Rare",
                "Occasional",
                "Frequent"
            ],
            weights=[
                35,
                50,
                15
            ],
            k=1
        )[0],

        "Drug_Type": drug["drug_name"],

        "Quantity": quantity,

        "Quantity_Category": qty_category,

        "Concealment_Method": random.choice(
            drug["common_concealment_methods"]
        ),

        "Intelligence_Input": intelligence,

        "Evidence_Type": ", ".join(
            random_evidence()
        ),


        "Applicable_NDPS_Sections": ", ".join(
            drug["applicable_ndps_sections"]
        ),

        "Investigation_Priority": priority
    }


if __name__ == "__main__":

    print(generate_record())
