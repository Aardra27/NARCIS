from pathlib import Path
import json

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


# ============================================================
# NARCIS RAG RETRIEVER
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

VECTOR_DB = BASE_DIR / "vector_db"

INDEX_FILE = VECTOR_DB / "cases.index"
METADATA_FILE = VECTOR_DB / "metadata.json"


# ============================================================
# LOAD VECTOR DATABASE
# ============================================================

if not INDEX_FILE.exists():
    raise FileNotFoundError(
        f"FAISS index not found:\n{INDEX_FILE}\n"
        "Run embeddings.py first."
    )


if not METADATA_FILE.exists():
    raise FileNotFoundError(
        f"Metadata file not found:\n{METADATA_FILE}\n"
        "Run embeddings.py first."
    )


print()
print("=" * 60)
print("NARCIS RAG RETRIEVER")
print("=" * 60)

print()
print("Loading FAISS index...")

index = faiss.read_index(
    str(INDEX_FILE)
)


with open(
    METADATA_FILE,
    "r",
    encoding="utf-8"
) as f:

    metadata = json.load(f)


print(
    f"Cases available : {index.ntotal}"
)


# ============================================================
# LOAD EMBEDDING MODEL
# ============================================================

print()
print("Loading embedding model...")

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ============================================================
# SEARCH FUNCTION
# ============================================================

def search_cases(query, top_k=3):

    if not query or not query.strip():

        return []


    # Convert the user's query into an embedding.

    query_embedding = model.encode(
        [query],
        convert_to_numpy=True
    )


    query_embedding = np.asarray(
        query_embedding,
        dtype=np.float32
    )


    # Search FAISS.

    distances, indices = index.search(
        query_embedding,
        min(top_k, index.ntotal)
    )


    results = []


    for distance, idx in zip(
        distances[0],
        indices[0]
    ):

        if idx < 0:
            continue


        case_data = metadata[idx]


        results.append(
            {
                "rank": len(results) + 1,
                "score": float(distance),
                "file": case_data["file"],
                "case": case_data["case"]
            }
        )


    return results


# ============================================================
# DISPLAY RESULTS
# ============================================================

def display_results(query, results):

    print()
    print("=" * 60)
    print("RAG SEARCH RESULTS")
    print("=" * 60)

    print()
    print(f"Query: {query}")

    if not results:

        print()
        print("No matching cases found.")

        return


    for result in results:

        case = result["case"]


        print()
        print("-" * 60)

        print(
            f"Rank           : {result['rank']}"
        )

        print(
            f"Distance Score : {result['score']:.4f}"
        )

        print(
            f"Case File      : {result['file']}"
        )

        print(
            f"Drug Type      : "
            f"{case.get('Drug_Type', 'Unknown')}"
        )

        print(
            f"Quantity       : "
            f"{case.get('Quantity', 'Unknown')}"
        )

        print(
            f"Agency         : "
            f"{case.get('Agency', 'Unknown')}"
        )

        print(
            f"Zonal Unit     : "
            f"{case.get('NCB_Zonal_Unit', 'Unknown')}"
        )

        print(
            f"Transport      : "
            f"{case.get('Transport_Mode', 'Unknown')}"
        )

        print(
            f"Route          : "
            f"{case.get('Route_Type', 'Unknown')}"
        )

        print(
            f"Interstate     : "
            f"{case.get('Interstate_Travel', 'Unknown')}"
        )


# ============================================================
# INTERACTIVE TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("Enter an investigation query.")
    print("Type 'exit' to stop.")

    while True:

        print()

        query = input(
            "Query: "
        ).strip()


        if query.lower() == "exit":

            print()
            print("Retriever stopped.")

            break


        if not query:

            continue


        results = search_cases(
            query,
            top_k=3
        )


        display_results(
            query,
            results
        )
