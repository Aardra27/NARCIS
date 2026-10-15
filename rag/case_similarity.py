from pathlib import Path
import json

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


# ============================================================
# NARCIS HYBRID CASE SIMILARITY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

VECTOR_DB = BASE_DIR / "vector_db"
INDEX_FILE = VECTOR_DB / "cases.index"
METADATA_FILE = VECTOR_DB / "metadata.json"

print()
print("=" * 60)
print("NARCIS HYBRID CASE SIMILARITY ENGINE")
print("=" * 60)


# ============================================================
# LOAD VECTOR DATABASE
# ============================================================

if not INDEX_FILE.exists():
    raise FileNotFoundError(
        f"FAISS index not found:\n{INDEX_FILE}"
    )

if not METADATA_FILE.exists():
    raise FileNotFoundError(
        f"Metadata file not found:\n{METADATA_FILE}"
    )

print()
print("Loading FAISS index...")

index = faiss.read_index(
    str(INDEX_FILE)
)

print(
    f"Cases available : {index.ntotal}"
)

with open(
    METADATA_FILE,
    "r",
    encoding="utf-8-sig"
) as file:
    metadata = json.load(file)

if len(metadata) != index.ntotal:
    raise RuntimeError(
        "FAISS index and metadata count do not match."
    )


# ============================================================
# EMBEDDING MODEL
# ============================================================

print()
print("Loading embedding model...")

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ============================================================
# FIELDS USED FOR STRUCTURED SIMILARITY
# ============================================================

WEIGHTS = {
    "Drug_Type": 20,
    "Quantity_Category": 10,
    "Origin_State": 5,
    "Destination_State": 5,
    "Transport_Mode": 5,
    "Vehicle_Type": 3,
    "Route_Type": 5,
    "Interstate_Travel": 3,
    "Applicable_NDPS_Sections": 2,
    "Operation_Type": 2
}


# ============================================================
# CASE → SEARCH TEXT
# ============================================================

SEARCH_FIELDS = [
    "Investigation_Year",
    "Agency",
    "Drug_Type",
    "NCB_Zonal_Unit",
    "Quantity",
    "Persons_Arrested",
    "Source_Type",
    "Applicable_NDPS_Sections",
    "Quantity_Category",
    "Operation_Type",
    "Origin_State",
    "Destination_State",
    "Vehicle_Type",
    "Transport_Mode",
    "Route_Type",
    "Interstate_Travel"
]


def case_to_text(case):

    lines = []

    for field in SEARCH_FIELDS:

        value = case.get(
            field,
            "Unknown"
        )

        if value is None:
            value = "Unknown"

        lines.append(
            f"{field}: {value}"
        )

    return "\n".join(lines)


# ============================================================
# NORMALIZATION
# ============================================================

def normalize(value):

    if value is None:
        return "unknown"

    value = str(value).strip().lower()

    if value == "":
        return "unknown"

    return value


# ============================================================
# FIELD MATCHING
# ============================================================

def field_match(
    query_value,
    historical_value
):

    q = normalize(query_value)
    h = normalize(historical_value)

    if q == "unknown" or h == "unknown":
        return 0.0

    if q == h:
        return 1.0

    # Handle some common textual variations
    q_clean = (
        q.replace("-", " ")
         .replace("/", " ")
    )

    h_clean = (
        h.replace("-", " ")
         .replace("/", " ")
    )

    if q_clean == h_clean:
        return 1.0

    return 0.0


# ============================================================
# STRUCTURED SCORE
# ============================================================

def structured_similarity(
    query_case,
    historical_case
):

    score = 0.0
    maximum = 0.0

    matched_fields = []
    partial_notes = []

    for field, weight in WEIGHTS.items():

        query_value = query_case.get(
            field,
            "Unknown"
        )

        historical_value = historical_case.get(
            field,
            "Unknown"
        )

        q = normalize(
            query_value
        )

        h = normalize(
            historical_value
        )

        # Unknown fields should not penalize
        # a historical case.
        if (
            q == "unknown"
            or h == "unknown"
        ):
            continue

        maximum += weight

        match = field_match(
            query_value,
            historical_value
        )

        score += (
            match * weight
        )

        if match == 1.0:

            matched_fields.append(
                field
            )

    if maximum == 0:
        return 0.0, matched_fields

    return (
        (score / maximum) * 100,
        matched_fields
    )


# ============================================================
# QUANTITY SIMILARITY
# ============================================================

def extract_quantity(
    value
):

    if value is None:
        return None

    text = str(value).lower()

    import re

    match = re.search(
        r"(\d+(?:\.\d+)?)",
        text
    )

    if not match:
        return None

    try:
        return float(
            match.group(1)
        )
    except ValueError:
        return None


def quantity_similarity(
    query_case,
    historical_case
):

    q = extract_quantity(
        query_case.get(
            "Quantity"
        )
    )

    h = extract_quantity(
        historical_case.get(
            "Quantity"
        )
    )

    if q is None or h is None:
        return None

    if q == 0 or h == 0:
        return None

    difference = abs(q - h)

    maximum = max(
        q,
        h
    )

    similarity = (
        1
        - (difference / maximum)
    ) * 100

    return max(
        0.0,
        min(
            100.0,
            similarity
        )
    )


# ============================================================
# COSINE SIMILARITY
# ============================================================

def cosine_similarity(
    query_vector,
    database_vectors
):

    query_norm = np.linalg.norm(
        query_vector
    )

    database_norms = np.linalg.norm(
        database_vectors,
        axis=1
    )

    if query_norm == 0:
        return np.zeros(
            len(database_vectors)
        )

    query_vector = (
        query_vector
        / query_norm
    )

    safe_norms = np.where(
        database_norms == 0,
        1,
        database_norms
    )

    database_vectors = (
        database_vectors
        / safe_norms[:, None]
    )

    return (
        database_vectors
        @ query_vector
    )


# ============================================================
# RETRIEVE
# ============================================================

def retrieve_similar_cases(
    query_case,
    top_k=3,
    exclude_file=None
):

    query_text = case_to_text(
        query_case
    )

    query_embedding = model.encode(
        [query_text],
        convert_to_numpy=True
    )[0]

    query_embedding = np.asarray(
        query_embedding,
        dtype=np.float32
    )

    database_vectors = index.reconstruct_n(
        0,
        index.ntotal
    )

    database_vectors = np.asarray(
        database_vectors,
        dtype=np.float32
    )

    semantic_scores = cosine_similarity(
        query_embedding,
        database_vectors
    )

    candidates = []

    for index_position in range(
        len(metadata)
    ):

        historical = metadata[
            index_position
        ]

        filename = historical.get(
            "file",
            ""
        )

        if (
            exclude_file
            and Path(exclude_file).name
            == filename
        ):
            continue

        historical_case = historical.get(
            "case",
            {}
        )

        semantic_score = float(
            semantic_scores[
                index_position
            ]
        )

        semantic_percent = max(
            0.0,
            min(
                100.0,
                semantic_score * 100
            )
        )

        structured_score, matched_fields = (
            structured_similarity(
                query_case,
                historical_case
            )
        )

        q_similarity = quantity_similarity(
            query_case,
            historical_case
        )

        # ----------------------------------------------------
        # FINAL HYBRID SCORE
        # ----------------------------------------------------

        final_score = (
            semantic_percent * 0.40
            + structured_score * 0.60
        )

        candidates.append(
            {
                "file": filename,
                "semantic_score": round(
                    semantic_percent,
                    2
                ),
                "structured_score": round(
                    structured_score,
                    2
                ),
                "quantity_similarity": (
                    round(
                        q_similarity,
                        2
                    )
                    if q_similarity is not None
                    else None
                ),
                "final_score": round(
                    final_score,
                    2
                ),
                "matching_fields": (
                    matched_fields
                ),
                "case": historical_case
            }
        )

    candidates.sort(
        key=lambda item:
        item["final_score"],
        reverse=True
    )

    results = []

    for rank, result in enumerate(
        candidates[:top_k],
        start=1
    ):

        result["rank"] = rank

        results.append(
            result
        )

    return results


# ============================================================
# COMMAND LINE TEST
# ============================================================

if __name__ == "__main__":

    print()
    print(
        "Enter verified case JSON path."
    )

    case_path = input(
        "Case JSON: "
    ).strip()

    path = Path(
        case_path
    )

    if not path.exists():

        raise FileNotFoundError(
            f"Case file not found:\n{path}"
        )

    with open(
        path,
        "r",
        encoding="utf-8-sig"
    ) as file:

        query_case = json.load(
            file
        )

    print()
    print("=" * 60)
    print("INPUT CASE")
    print("=" * 60)

    print(
        case_to_text(
            query_case
        )
    )

    print()
    print("=" * 60)
    print("HYBRID CASE SEARCH")
    print("=" * 60)

    results = retrieve_similar_cases(
        query_case,
        top_k=3,
        exclude_file=path
    )

    for result in results:

        historical = result[
            "case"
        ]

        print()
        print("-" * 60)

        print(
            f"Rank              : "
            f"{result['rank']}"
        )

        print(
            f"Case File         : "
            f"{result['file']}"
        )

        print(
            f"Final Similarity  : "
            f"{result['final_score']:.2f}%"
        )

        print(
            f"Semantic Score    : "
            f"{result['semantic_score']:.2f}%"
        )

        print(
            f"Structured Score  : "
            f"{result['structured_score']:.2f}%"
        )

        if (
            result[
                "quantity_similarity"
            ]
            is not None
        ):

            print(
                f"Quantity Similarity: "
                f"{result['quantity_similarity']:.2f}%"
            )

        print()
        print(
            "Historical Case:"
        )

        print(
            f"  Drug        : "
            f"{historical.get('Drug_Type', 'Unknown')}"
        )

        print(
            f"  Quantity    : "
            f"{historical.get('Quantity', 'Unknown')}"
        )

        print(
            f"  Origin      : "
            f"{historical.get('Origin_State', 'Unknown')}"
        )

        print(
            f"  Destination : "
            f"{historical.get('Destination_State', 'Unknown')}"
        )

        print(
            f"  Transport   : "
            f"{historical.get('Transport_Mode', 'Unknown')}"
        )

        print(
            f"  Vehicle     : "
            f"{historical.get('Vehicle_Type', 'Unknown')}"
        )

        print(
            f"  Route       : "
            f"{historical.get('Route_Type', 'Unknown')}"
        )

        print(
            f"  Interstate  : "
            f"{historical.get('Interstate_Travel', 'Unknown')}"
        )

        print()
        print(
            "Matching Characteristics:"
        )

        if result[
            "matching_fields"
        ]:

            for field in result[
                "matching_fields"
            ]:

                print(
                    f"  ✓ {field}"
                )

        else:

            print(
                "  None"
            )

    print()
    print("=" * 60)
    print("HYBRID RAG RETRIEVAL COMPLETED")
    print("=" * 60)

