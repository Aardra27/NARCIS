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


def get_drug_name(drug):
    return drug["drug_name"]


def get_quantity_thresholds(drug):
    small = drug["small_quantity"]["value"]
    commercial = drug["commercial_quantity"]["value"]

    return small, commercial


def get_intelligence_sources(drug):
    sources = drug.get(
        "typical_intelligence_sources",
        []
    )

    if not sources:
        sources = ["Confidential Information"]

    return sources


def get_concealment_methods(drug):
    methods = drug.get(
        "common_concealment_methods",
        []
    )

    if not methods:
        methods = ["Unknown"]

    return methods


def get_ndps_sections(drug):
    sections = drug.get(
        "applicable_ndps_sections",
        []
    )

    if not sections:
        sections = ["Unknown"]

    return sections


def random_quantity(drug):
    """
    Generate a research-informed synthetic quantity.

    For Pseudoephedrine, quantity thresholds are legally not
    applicable, so a synthetic seized quantity is generated
    independently.
    """

    if get_drug_name(drug) == "Pseudoephedrine":
        return round(
            random.uniform(1000, 100000),
            2
        )

    small, commercial = get_quantity_thresholds(drug)

    category = random.choices(
        population=["Small", "Intermediate", "Commercial"],
        weights=[45, 35, 20],
        k=1
    )[0]

    if category == "Small":
        quantity = random.uniform(
            max(0.2, small * 0.05),
            small
        )

    elif category == "Intermediate":
        lower = small + max(0.1, small * 0.01)
        upper = commercial - max(0.1, commercial * 0.01)

        if lower >= upper:
            quantity = random.uniform(
                small,
                commercial
            )
        else:
            quantity = random.uniform(
                lower,
                upper
            )

    else:
        quantity = random.uniform(
            commercial,
            commercial * 2.5
        )

    return round(quantity, 2)


def quantity_category(drug, quantity):

    if get_drug_name(drug) == "Pseudoephedrine":
        return "Not Applicable"

    small, commercial = get_quantity_thresholds(drug)

    if quantity <= small:
        return "Small"

    if quantity >= commercial:
        return "Commercial"

    return "Intermediate"


def generate_record():

    drug = random.choice(
        list(drugs.values())
    )

    origin_state = random_state()
    destination_state = random_state()

    origin_city = random_city(origin_state)
    destination_city = random_city(destination_state)

    transport_mode = random_transport_mode()
    vehicle = random_vehicle(transport_mode)

    route = random_route_type()

    interstate = (
        "Yes"
        if interstate_travel(route)
        else "No"
    )

    quantity = random_quantity(drug)

    qty_category = quantity_category(
        drug,
        quantity
    )

    previous_ndps = random.choices(
        population=[0, 1, 2, 3],
        weights=[65, 20, 10, 5],
        k=1
    )[0]

    criminal_cases = (
        previous_ndps
        + random.choices(
            population=[0, 1, 2, 3, 4],
            weights=[35, 30, 20, 10, 5],
            k=1
        )[0]
    )

    seizure_link = random.choice(
        ["Yes", "No"]
    )

    sources = get_intelligence_sources(
        drug
    )

    intelligence = random.choices(
        population=["No Intelligence"] + sources,
        weights=[50] + [
            50 / len(sources)
        ] * len(sources),
        k=1
    )[0]

    priority = calculate_priority(
        qty_category,
        previous_ndps,
        criminal_cases,
        seizure_link,
        interstate,
        intelligence
    )

    return {

        "Investigation_ID":
            str(uuid.uuid4())[:8],

        "Investigation_Year":
            random.randint(
                2020,
                datetime.now().year
            ),

        "Origin_State":
            origin_state,

        "Destination_State":
            destination_state,

        "Origin_City":
            origin_city,

        "Destination_City":
            destination_city,

        "Agency":
            random_agency(),

        "Investigation_Status":
            random.choice(
                INVESTIGATION_STATUS
            ),

        "Source_Type":
            random.choice(
                SOURCE_TYPES
            ),

        "Suspect_ID":
            f"SUS-{random.randint(10000, 99999)}",

        "Age":
            random.choices(
                population=list(
                    range(18, 71)
                ),
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

        "Gender":
            random.choice(GENDERS),

        "Occupation":
            random_occupation(),

        "Network_ID":
            f"NET-{random.randint(100, 999)}",

        "Known_Associate_Count":
            random.randint(0, 10),

        "Previous_NDPS_FIRs":
            previous_ndps,

        "Total_Criminal_Cases":
            criminal_cases,

        "Previous_Seizure_Link":
            seizure_link,

        "Transport_Mode":
            transport_mode,

        "Vehicle_Type":
            vehicle,

        "Route_Type":
            route,

        "Interstate_Travel":
            interstate,

        "Travel_Frequency":
            random.choices(
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

        "Drug_Type":
            get_drug_name(drug),

        "Quantity":
            quantity,

        "Quantity_Category":
            qty_category,

        "Concealment_Method":
            random.choice(
                get_concealment_methods(
                    drug
                )
            ),

        "Intelligence_Input":
            intelligence,

        "Evidence_Type":
            ", ".join(
                random_evidence()
            ),

        "Applicable_NDPS_Sections":
            ", ".join(
                get_ndps_sections(drug)
            ),

        "Investigation_Priority":
            priority
    }


if __name__ == "__main__":
    print(generate_record())
