import random

TRANSPORT_MODES = [
    "Road",
    "Rail",
    "Air",
    "Sea",
    "Courier"
]

# Research-informed probabilities
# Road trafficking is most common in domestic narcotics investigations,
# followed by rail and courier. Air and sea are comparatively less common.
TRANSPORT_WEIGHTS = [
    50,   # Road
    20,   # Rail
    8,    # Air
    7,    # Sea
    15    # Courier
]

VEHICLE_TYPES = {
    "Road": [
        "Car",
        "Motorcycle",
        "Bus",
        "Truck",
        "Van"
    ],
    "Rail": [
        "Passenger Train",
        "Freight Train"
    ],
    "Air": [
        "Commercial Flight",
        "Cargo Aircraft"
    ],
    "Sea": [
        "Fishing Boat",
        "Cargo Ship",
        "Container Vessel"
    ],
    "Courier": [
        "Courier Parcel",
        "Postal Package"
    ]
}

ROUTE_TYPES = [
    "Intrastate",
    "Interstate",
    "International"
]

# Approximate research-informed route distribution
ROUTE_WEIGHTS = [
    60,   # Intrastate
    30,   # Interstate
    10    # International
]


def get_transport_modes():
    return TRANSPORT_MODES


def random_transport_mode():
    return random.choices(
        TRANSPORT_MODES,
        weights=TRANSPORT_WEIGHTS,
        k=1
    )[0]


def get_vehicle_types(mode):
    return VEHICLE_TYPES.get(mode, [])


def random_vehicle(mode):
    vehicles = get_vehicle_types(mode)
    return random.choice(vehicles) if vehicles else None


def random_route_type():
    return random.choices(
        ROUTE_TYPES,
        weights=ROUTE_WEIGHTS,
        k=1
    )[0]


def interstate_travel(route_type):
    return route_type in [
        "Interstate",
        "International"
    ]


if __name__ == "__main__":

    mode = random_transport_mode()
    vehicle = random_vehicle(mode)

    print(f"Transport Mode : {mode}")
    print(f"Vehicle Type   : {vehicle}")
    print(f"Route Type     : {random_route_type()}")
