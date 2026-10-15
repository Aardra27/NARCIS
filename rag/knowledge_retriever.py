from pathlib import Path
import json
import re


# ============================================================
# NARCIS KNOWLEDGE RETRIEVER
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_BASE = BASE_DIR / "knowledge_base"

DRUG_PROFILES_DIR = KNOWLEDGE_BASE / "drug_profiles"
LEGAL_DIR = KNOWLEDGE_BASE / "legal"
SOP_DIR = KNOWLEDGE_BASE / "sop"
PATTERNS_DIR = KNOWLEDGE_BASE / "trafficking_patterns"


# ============================================================
# HELPERS
# ============================================================

def load_json(path):
    """Load a JSON knowledge file, including files containing a UTF-8 BOM."""
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def normalize(value):
    """Normalize text for comparisons."""
    if value is None:
        return ""

    value = str(value).strip().lower()

    value = value.replace("_", " ")
    value = value.replace("-", " ")

    value = re.sub(r"\s+", " ", value)

    return value


def drug_matches(query_drug, candidate_drug):
    """
    Determine whether two drug names refer to the same
    supported drug for retrieval purposes.
    """

    q = normalize(query_drug)
    c = normalize(candidate_drug)

    if not q or not c:
        return False

    aliases = {
        "hashish / charas": "hashish",
        "hashish charas": "hashish",
        "charas": "hashish",
        "opium & poppy straw": "opium",
        "opium poppy straw": "opium",
    }

    q = aliases.get(q, q)
    c = aliases.get(c, c)

    return q == c


# ============================================================
# DRUG PROFILE
# ============================================================

def retrieve_drug_profile(case):
    """
    Retrieve the drug profile corresponding to the
    verified case's Drug_Type.
    """

    query_drug = case.get("Drug_Type", "")

    if not query_drug or normalize(query_drug) == "unknown":
        return {
            "status": "not_available",
            "reason": "Drug_Type is unknown."
        }

    files = sorted(DRUG_PROFILES_DIR.glob("*.json"))

    for file in files:

        try:
            data = load_json(file)

        except Exception as error:
            continue

        drug_info = data.get("drug_information", {})

        candidate_name = drug_info.get("drug_name", "")

        if drug_matches(query_drug, candidate_name):

            return {
                "status": "found",
                "source_file": file.name,
                "data": data
            }

    return {
        "status": "not_found",
        "drug": query_drug
    }


# ============================================================
# NDPS SECTION RETRIEVAL
# ============================================================

def retrieve_ndps_sections(case):
    """
    Retrieve NDPS sections relevant to the drug and/or
    sections explicitly present in the verified case.
    """

    sections_file = LEGAL_DIR / "ndps_sections.json"

    if not sections_file.exists():
        return {
            "status": "not_available"
        }

    data = load_json(sections_file)

    sections = data.get("ndps_sections", [])

    query_drug = normalize(case.get("Drug_Type", ""))

    explicit_sections = str(
        case.get("Applicable_NDPS_Sections", "")
    )

    explicit_sections_normalized = {
        normalize(x)
        for x in re.split(r"[,/;]+", explicit_sections)
        if normalize(x)
        and normalize(x) != "unknown"
    }

    matched = []

    for section in sections:

        section_number = normalize(
            section.get("section", "")
        )

        applicable_drugs = [
            normalize(x)
            for x in section.get(
                "applicable_drugs", []
            )
        ]

        drug_match = (
            query_drug in applicable_drugs
            or "all drugs" in applicable_drugs
        )

        explicit_match = (
            section_number in explicit_sections_normalized
        )

        if drug_match or explicit_match:

            matched.append(section)

    return {
        "status": "found",
        "source_file": sections_file.name,
        "sections": matched
    }


# ============================================================
# COMMERCIAL QUANTITY RETRIEVAL
# ============================================================

def retrieve_quantity_information(case):
    """
    Retrieve small/commercial quantity thresholds for
    the case drug.
    """

    quantity_file = LEGAL_DIR / "commercial_quantities.json"

    if not quantity_file.exists():
        return {
            "status": "not_available"
        }

    data = load_json(quantity_file)

    entries = data.get(
        "commercial_quantities",
        []
    )

    query_drug = case.get("Drug_Type", "")

    for entry in entries:

        if drug_matches(
            query_drug,
            entry.get("drug_name", "")
        ):

            return {
                "status": "found",
                "source_file": quantity_file.name,
                "data": entry,
                "case_quantity": case.get(
                    "Quantity",
                    "Unknown"
                ),
                "case_quantity_category": case.get(
                    "Quantity_Category",
                    "Unknown"
                )
            }

    return {
        "status": "not_found",
        "drug": query_drug
    }


# ============================================================
# SOP RETRIEVAL
# ============================================================

def retrieve_sop(case):
    """
    Retrieve SOP material relevant to the investigation.

    Currently retrieves:
      - search and seizure
      - evidence collection
      - chain of custody
      - arrest procedure
    """

    requested_files = [
        "search_and_seizure.json",
        "evidence_collection.json",
        "chain_of_custody.json",
        "arrest_procedure.json"
    ]

    results = []

    for filename in requested_files:

        path = SOP_DIR / filename

        if not path.exists():
            continue

        try:
            data = load_json(path)

            results.append(
                {
                    "source_file": filename,
                    "data": data
                }
            )

        except Exception:
            continue

    return {
        "status": "found" if results else "not_available",
        "sources": results
    }


# ============================================================
# TRAFFICKING PATTERN RETRIEVAL
# ============================================================

def retrieve_trafficking_patterns(case):
    """
    Retrieve trafficking-pattern information relevant to
    route, transport, concealment and intelligence inputs.
    """

    results = []

    route_type = normalize(
        case.get("Route_Type", "")
    )

    transport_mode = normalize(
        case.get("Transport_Mode", "")
    )

    vehicle_type = normalize(
        case.get("Vehicle_Type", "")
    )

    concealment = normalize(
        case.get("Concealment_Method", "")
    )

    intelligence = normalize(
        case.get("Intelligence_Input", "")
    )

    # --------------------------------------------------------
    # ROUTES
    # --------------------------------------------------------

    route_file = PATTERNS_DIR / "routes.json"

    if route_file.exists():

        try:
            data = load_json(route_file)

            route_patterns = data.get(
                "route_patterns",
                []
            )

            matching_routes = []

            for pattern in route_patterns:

                pattern_type = normalize(
                    pattern.get("route_type", "")
                )

                if (
                    route_type
                    and route_type != "unknown"
                    and pattern_type == route_type
                ):
                    matching_routes.append(pattern)

            results.append(
                {
                    "source_file": "routes.json",
                    "matches": matching_routes,
                    "data": data
                }
            )

        except Exception:
            pass

    # --------------------------------------------------------
    # TRANSPORT
    # --------------------------------------------------------

    transport_file = PATTERNS_DIR / "transport.json"

    if transport_file.exists():

        try:
            data = load_json(transport_file)

            results.append(
                {
                    "source_file": "transport.json",
                    "query_transport": transport_mode,
                    "query_vehicle": vehicle_type,
                    "data": data
                }
            )

        except Exception:
            pass

    # --------------------------------------------------------
    # CONCEALMENT
    # --------------------------------------------------------

    concealment_file = PATTERNS_DIR / "concealment.json"

    if concealment_file.exists():

        try:
            data = load_json(concealment_file)

            results.append(
                {
                    "source_file": "concealment.json",
                    "query": concealment,
                    "data": data
                }
            )

        except Exception:
            pass

    # --------------------------------------------------------
    # INTELLIGENCE SOURCES
    # --------------------------------------------------------

    intelligence_file = (
        PATTERNS_DIR / "intelligence_sources.json"
    )

    if intelligence_file.exists():

        try:
            data = load_json(intelligence_file)

            results.append(
                {
                    "source_file": "intelligence_sources.json",
                    "query": intelligence,
                    "data": data
                }
            )

        except Exception:
            pass

    return {
        "status": "found" if results else "not_available",
        "sources": results
    }


# ============================================================
# COMPLETE KNOWLEDGE RETRIEVAL
# ============================================================

def retrieve_all_knowledge(case):
    """
    Retrieve all knowledge relevant to a verified case.

    This is the main function that the future Agentic
    Orchestrator will call.
    """

    return {
        "drug_profile": retrieve_drug_profile(case),

        "ndps_sections": retrieve_ndps_sections(case),

        "quantity_information": retrieve_quantity_information(
            case
        ),

        "sop": retrieve_sop(case),

        "trafficking_patterns":
            retrieve_trafficking_patterns(case)
    }


# ============================================================
# TEST MODE
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print("NARCIS KNOWLEDGE RETRIEVER")
    print("=" * 60)

    case = {
        "Drug_Type": "Heroin",
        "Quantity": "20.326 Kg Heroin",
        "Quantity_Category": "Unknown",
        "Applicable_NDPS_Sections": "Unknown",
        "Route_Type": "Interstate",
        "Interstate_Travel": "Yes",
        "Transport_Mode": "Unknown",
        "Vehicle_Type": "Unknown",
        "Concealment_Method": "Unknown",
        "Intelligence_Input": "Unknown"
    }

    print()
    print("TEST CASE")
    print("-" * 60)

    for key, value in case.items():
        print(f"{key}: {value}")

    print()
    print("Retrieving knowledge...")

    result = retrieve_all_knowledge(case)

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("KNOWLEDGE RETRIEVAL SUMMARY")
    print("=" * 60)

    drug = result["drug_profile"]

    print()
    print("Drug Profile:")
    print(
        f"  Status: {drug.get('status')}"
    )

    if drug.get("source_file"):
        print(
            f"  Source: {drug['source_file']}"
        )

    legal = result["ndps_sections"]

    print()
    print("NDPS Sections:")
    print(
        f"  Status: {legal.get('status')}"
    )

    for section in legal.get("sections", []):

        print(
            f"  - Section {section.get('section')}: "
            f"{section.get('title')}"
        )

    quantity = result["quantity_information"]

    print()
    print("Quantity Information:")
    print(
        f"  Status: {quantity.get('status')}"
    )

    if quantity.get("data"):

        q = quantity["data"]

        print(
            f"  Drug: {q.get('drug_name')}"
        )

        print(
            f"  Small: "
            f"{q.get('small_quantity', {}).get('value')} "
            f"{q.get('small_quantity', {}).get('unit')}"
        )

        print(
            f"  Commercial: "
            f"{q.get('commercial_quantity', {}).get('value')} "
            f"{q.get('commercial_quantity', {}).get('unit')}"
        )

    sop = result["sop"]

    print()
    print("SOP Knowledge:")
    print(
        f"  Status: {sop.get('status')}"
    )

    for source in sop.get("sources", []):

        print(
            f"  - {source.get('source_file')}"
        )

    patterns = result["trafficking_patterns"]

    print()
    print("Trafficking Patterns:")
    print(
        f"  Status: {patterns.get('status')}"
    )

    for source in patterns.get("sources", []):

        print(
            f"  - {source.get('source_file')}"
        )

    print()
    print("=" * 60)
    print("KNOWLEDGE RETRIEVAL TEST COMPLETED")
    print("=" * 60)
