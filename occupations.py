import random

OCCUPATIONS = [
    "Student",
    "Unemployed",
    "Farmer",
    "Driver",
    "Truck Driver",
    "Taxi Driver",
    "Business Owner",
    "Shopkeeper",
    "Laborer",
    "Construction Worker",
    "Factory Worker",
    "Electrician",
    "Plumber",
    "Mechanic",
    "Delivery Executive",
    "Courier Staff",
    "Sales Executive",
    "Government Employee",
    "Private Employee",
    "IT Professional",
    "Teacher",
    "Professor",
    "Doctor",
    "Nurse",
    "Pharmacist",
    "Accountant",
    "Lawyer",
    "Hotel Employee",
    "Restaurant Worker",
    "Tourist Guide",
    "Security Guard",
    "Fisherman",
    "Domestic Worker",
    "Retired",
    "Unknown"
]


def get_occupations():
    return OCCUPATIONS


def random_occupation():
    return random.choice(OCCUPATIONS)


if __name__ == "__main__":
    print(random_occupation())
