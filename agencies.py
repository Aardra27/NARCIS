import random

AGENCIES = [
    "Narcotics Control Bureau (NCB)",
    "Directorate of Revenue Intelligence (DRI)",
    "State Police",
    "Customs",
    "Central Bureau of Narcotics (CBN)",
    "Railway Protection Force (RPF)",
    "Border Security Force (BSF)",
    "Assam Rifles",
    "Coast Guard",
    "Central Industrial Security Force (CISF)"
]


def get_agencies():
    return AGENCIES


def random_agency():
    return random.choice(AGENCIES)


if __name__ == "__main__":
    print(random_agency())
