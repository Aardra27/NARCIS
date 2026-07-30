from pathlib import Path

# Project Root
PROJECT_ROOT = Path(__file__).resolve().parent

# Knowledge Base
KNOWLEDGE_BASE = PROJECT_ROOT / "knowledge_base"

DRUG_PROFILES = KNOWLEDGE_BASE / "drug_profiles"
LEGAL = KNOWLEDGE_BASE / "legal"
SOP = KNOWLEDGE_BASE / "sop"
TRAFFICKING_PATTERNS = KNOWLEDGE_BASE / "trafficking_patterns"
CASE_LIBRARY = KNOWLEDGE_BASE / "case_library"
EMBEDDINGS = KNOWLEDGE_BASE / "embeddings"
VECTOR_STORE = KNOWLEDGE_BASE / "vector_store"

# Output
OUTPUT_DIR = PROJECT_ROOT / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# Dataset
DATASET_SIZE = 10000

# Random Seed
RANDOM_SEED = 42
