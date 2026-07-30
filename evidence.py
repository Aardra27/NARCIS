import random

EVIDENCE_TYPES = [
    "Drug Sample",
    "Mobile Phone",
    "SIM Card",
    "Call Detail Records",
    "Chat Messages",
    "Digital Payment Records",
    "Bank Transaction Records",
    "Vehicle Search",
    "Vehicle Registration Certificate",
    "Driving License",
    "Passport",
    "Flight Ticket",
    "Train Ticket",
    "Courier Receipt",
    "Parcel",
    "Fingerprint Evidence",
    "DNA Evidence",
    "CCTV Footage",
    "Witness Statement",
    "Confidential Informant Report"
]


def get_evidence_types():
    return EVIDENCE_TYPES


def random_evidence(min_items=1, max_items=5):
    count = random.randint(min_items, max_items)
    return random.sample(EVIDENCE_TYPES, count)


if __name__ == "__main__":
    print(random_evidence())
