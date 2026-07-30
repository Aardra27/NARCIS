from drugs import load_drug_profiles
from states import get_states
from cities import get_cities
from transport import get_transport_modes, get_vehicle_types
from occupations import get_occupations
from agencies import get_agencies
from evidence import get_evidence_types
from ndps_sections import load_ndps_sections


def validate():
    """
    Validate the knowledge base before dataset generation.
    """

    # Drug Profiles
    drugs = load_drug_profiles()

    assert len(drugs) > 0, "No drug profiles found."

    # States
    states = get_states()

    assert len(states) > 0, "No states loaded."

    for state in states:
        assert len(get_cities(state)) > 0, f"No cities found for {state}"

    # Transport
    modes = get_transport_modes()

    assert len(modes) > 0, "No transport modes."

    for mode in modes:
        assert len(get_vehicle_types(mode)) > 0, f"No vehicles for {mode}"

    # Occupations
    assert len(get_occupations()) > 0, "No occupations."

    # Agencies
    assert len(get_agencies()) > 0, "No agencies."

    # Evidence
    assert len(get_evidence_types()) > 0, "No evidence types."

    # NDPS Sections
    sections = load_ndps_sections()

    assert len(sections) > 0, "No NDPS sections."

    print("Knowledge base validation successful.")


if __name__ == "__main__":
    validate()
