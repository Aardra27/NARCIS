from pathlib import Path
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


# ============================================================
# NARCIS RAG EMBEDDING BUILDER
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

CASE_LIBRARY = BASE_DIR / "knowledge_base" / "case_library"
VECTOR_DB = BASE_DIR / "vector_db"

VECTOR_DB.mkdir(exist_ok=True)

INDEX_FILE = VECTOR_DB / "cases.index"
METADATA_FILE = VECTOR_DB / "metadata.json"


# ============================================================
# START
# ============================================================

print()
print("=" * 60)
print("NARCIS RAG EMBEDDING BUILDER")
print("=" * 60)


# ============================================================
# CHECK CASE LIBRARY
# ============================================================

if not CASE_LIBRARY.exists():

    raise FileNotFoundError(
        f"Case library not found:\n{CASE_LIBRARY}"
    )


# Only actual numbered case files.
# Excludes case_schema.json and case_source_registry.json.

case_files = sorted(
    CASE_LIBRARY.glob("case[0-9][0-9][0-9].json")
)


print()
print(f"Case Library : {CASE_LIBRARY}")
print(f"Case Files   : {len(case_files)}")


if not case_files:

    raise RuntimeError(
        "No numbered case JSON files found in case_library."
    )


# ============================================================
# LOAD CASES
# ============================================================

documents = []
metadata = []

print()
print("Loading cases...")


for file in case_files:

    try:

        with open(
            file,
            "r",
            encoding="utf-8-sig"
        ) as f:

            case = json.load(f)


        # Convert structured case into searchable text.

        lines = []

        for key, value in case.items():

            lines.append(
                f"{key}: {value}"
            )

        case_text = "\n".join(lines)

        documents.append(case_text)


        metadata.append(
            {
                "file": file.name,
                "path": str(file),
                "case": case
            }
        )


        print(
            f"  Loaded: {file.name} "
            f"({case.get('Drug_Type', 'Unknown')})"
        )


    except Exception as error:

        print(
            f"  ERROR loading {file.name}: {error}"
        )


if not documents:

    raise RuntimeError(
        "No valid cases could be loaded."
    )


# ============================================================
# SAFETY CHECK
# ============================================================

print()

if len(documents) != len(case_files):

    raise RuntimeError(
        "Some case files failed to load. "
        "RAG index was not created."
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
# GENERATE EMBEDDINGS
# ============================================================

print()
print("Generating embeddings...")

embeddings = model.encode(
    documents,
    show_progress_bar=True,
    convert_to_numpy=True
)

embeddings = np.asarray(
    embeddings,
    dtype=np.float32
)


if embeddings.ndim != 2:

    raise RuntimeError(
        f"Unexpected embedding shape: {embeddings.shape}"
    )


print()
print(f"Embedding Shape : {embeddings.shape}")


# ============================================================
# BUILD FAISS INDEX
# ============================================================

print()
print("Building FAISS index...")

dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(
    dimension
)

index.add(
    embeddings
)


# ============================================================
# SAVE INDEX
# ============================================================

faiss.write_index(
    index,
    str(INDEX_FILE)
)


with open(
    METADATA_FILE,
    "w",
    encoding="utf-8-sig"
) as f:

    json.dump(
        metadata,
        f,
        indent=4,
        ensure_ascii=False
    )


# ============================================================
# COMPLETE
# ============================================================

print()
print("=" * 60)
print("VECTOR DATABASE CREATED")
print("=" * 60)

print(
    f"Cases Indexed : {len(documents)}"
)

print(
    f"Vector Size   : {dimension}"
)

print(
    f"FAISS Index   : {INDEX_FILE}"
)

print(
    f"Metadata      : {METADATA_FILE}"
)

print()
print("RAG case knowledge base is ready.")

