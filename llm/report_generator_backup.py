from pathlib import Path
import json


# ============================================================
# NARCIS LLM REPORT GENERATOR
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

EVIDENCE_PATH = (
    BASE_DIR
    / "output"
    / "prototype_evidence_package.json"
)

OUTPUT_PATH = (
    BASE_DIR
    / "output"
    / "final_investigation_report.json"
)


# ============================================================
# LOAD EVIDENCE
# ============================================================

print("=" * 70)
print("NARCIS LLM REPORT GENERATOR")
print("PROTOTYPE")
print("=" * 70)

print(f"\nLoading evidence package:")
print(EVIDENCE_PATH)

with open(EVIDENCE_PATH, "r", encoding="utf-8-sig") as f:
    evidence = json.load(f)

print("\nEvidence package loaded.")
print("\nGenerating structured decision-support report...\n")


# ============================================================
# EXTRACT SECTIONS
# ============================================================

case = evidence.get("case", {})
ml = evidence.get("ml_prediction", {})
explainability = evidence.get(
    "local_explainability",
    {}
)

similar_cases = evidence.get(
    "similar_historical_cases",
    []
)

knowledge = evidence.get(
    "knowledge",
    {} 
)


# ============================================================
# CASE SUMMARY
# ============================================================

case_summary = {
    "Investigation_Year": case.get(
        "Investigation_Year",
        "Not available"
    ),
    "Agency": case.get(
        "Agency",
        "Not available"
    ),
    "Drug_Type": case.get(
        "Drug_Type",
        "Not available"
    ),
    "Quantity": case.get(
        "Quantity",
        "Not available"
    ),
    "Quantity_Category": case.get(
        "Quantity_Category",
        "Not available"
    ),
    "Origin_State": case.get(
        "Origin_State",
        "Not available"
    ),
    "Destination_State": case.get(
        "Destination_State",
        "Not available"
    ),
    "Transport_Mode": case.get(
        "Transport_Mode",
        "Not available"
    ),
    "Vehicle_Type": case.get(
        "Vehicle_Type",
        "Not available"
    ),
    "Route_Type": case.get(
        "Route_Type",
        "Not available"
    ),
    "Interstate_Travel": case.get(
        "Interstate_Travel",
        "Not available"
    ),
    "Persons_Arrested": case.get(
        "Persons_Arrested",
        "Not available"
    ),
    "Source_Type": case.get(
        "Source_Type",
        "Not available"
    ),
    "Operation_Type": case.get(
        "Operation_Type",
        "Not available"
    ),
}


# ============================================================
# ML PRIORITY
# ============================================================

ml_prediction = {
    "prediction": ml.get(
        "prediction",
        "Not available"
    ),
    "probabilities": ml.get(
        "probabilities",
        {}
    ),
}


# ============================================================
# SHAP FACTORS
# ============================================================

top_factors = explainability.get(
    "top_factors",
    []
)

formatted_factors = []

for factor in top_factors:

    formatted_factors.append({
        "feature": factor.get(
            "feature",
            "Unknown"
        ),
        "value": factor.get(
            "value",
            "Unknown"
        ),
        "shap_impact": factor.get(
            "shap_impact",
            0
        ),
        "direction": factor.get(
            "direction",
            "Unknown"
        )
    })


# ============================================================
# HISTORICAL CASES
# ============================================================

same_drug_matches = []
cross_drug_matches = []

current_drug = case.get(
    "Drug_Type",
    ""
).strip().lower()

for item in similar_cases:

    historical_case = item.get(
        "case",
        {}
    )

    historical_drug = str(
        historical_case.get(
            "Drug_Type",
            ""
        )
    ).strip().lower()

    simplified_case = {
        "rank": item.get(
            "rank",
            "Unknown"
        ),
        "file": item.get(
            "file",
            "Unknown"
        ),
        "drug": historical_case.get(
            "Drug_Type",
            "Unknown"
        ),
        "quantity": historical_case.get(
            "Quantity",
            "Unknown"
        ),
        "origin": historical_case.get(
            "Origin_State",
            "Unknown"
        ),
        "destination": historical_case.get(
            "Destination_State",
            "Unknown"
        ),
        "transport": historical_case.get(
            "Transport_Mode",
            "Unknown"
        ),
        "route": historical_case.get(
            "Route_Type",
            "Unknown"
        ),
        "final_score": item.get(
            "final_score",
            0
        ),
        "semantic_score": item.get(
            "semantic_score",
            0
        ),
        "structured_score": item.get(
            "structured_score",
            0
        ),
        "quantity_similarity": item.get(
            "quantity_similarity",
            0
        ),
        "matching_fields": item.get(
            "matching_fields",
            []
        )
    }

    if historical_drug == current_drug:
        same_drug_matches.append(
            simplified_case
        )
    else:
        cross_drug_matches.append(
            simplified_case
        )


# ============================================================
# KNOWLEDGE STATUS
# ============================================================

knowledge_status = {
    "Drug Profile": knowledge.get(
        "drug_profile",
        {}
    ).get(
        "status",
        "not found"
    ),

    "NDPS Sections": knowledge.get(
        "ndps_sections",
        {}
    ).get(
        "status",
        "not found"
    ),

    "Quantity Information": knowledge.get(
        "quantity_information",
        {}
    ).get(
        "status",
        "not found"
    ),

    "SOP": knowledge.get(
        "sop",
        {}
    ).get(
        "status",
        "not found"
    ),

    "Trafficking Patterns": knowledge.get(
        "trafficking_patterns",
        {}
    ).get(
        "status",
        "not found"
    )
}


# ============================================================
# VERIFICATION REQUIRED
# ============================================================

verification_fields = []

for field in [
    "Previous_NDPS_FIRs",
    "Previous_Seizure_Link",
    "Applicable_NDPS_Sections",
    "Quantity_Category",
    "Transport_Mode",
    "Vehicle_Type",
    "Concealment_Method",
    "Intelligence_Input"
]:

    value = case.get(field)

    if (
        value is None
        or str(value).strip().lower()
        in ["unknown", "not available", ""]
    ):
        verification_fields.append(field)


# ============================================================
# FINAL REPORT
# ============================================================

report = {
    "report_type": (
        "NARCIS Investigation "
        "Decision-Support Report"
    ),

    "prototype": True,

    "case_summary": case_summary,

    "ml_priority_assessment": ml_prediction,

    "top_explanatory_factors": (
        formatted_factors
    ),

    "historical_case_comparison": {
        "same_drug_matches": (
            same_drug_matches
        ),
        "cross_drug_matches": (
            cross_drug_matches
        ),
        "same_drug_count": len(
            same_drug_matches
        ),
        "cross_drug_count": len(
            cross_drug_matches
        )
    },

    "knowledge_sources": knowledge_status,

    "verification_required": (
        verification_fields
    )
}


# ============================================================
# SAVE
# ============================================================

with open(
    OUTPUT_PATH,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        report,
        f,
        indent=4,
        ensure_ascii=False
    )


# ============================================================
# DISPLAY
# ============================================================

print("\n")
print("=" * 70)
print("NARCIS INVESTIGATION DECISION-SUPPORT REPORT")
print("PROTOTYPE")
print("=" * 70)

print("\nCASE SUMMARY")
print("-" * 70)

print(
    f"Drug              : "
    f"{case_summary['Drug_Type']}"
)

print(
    f"Quantity          : "
    f"{case_summary['Quantity']}"
)

print(
    f"Quantity Category : "
    f"{case_summary['Quantity_Category']}"
)

print(
    f"Route             : "
    f"{case_summary['Origin_State']} "
    f"-> "
    f"{case_summary['Destination_State']}"
)

print(
    f"Transport         : "
    f"{case_summary['Transport_Mode']}"
)


print("\nML PRIORITY ASSESSMENT")
print("-" * 70)

print(
    f"Prediction : "
    f"{ml_prediction['prediction']}"
)

probabilities = ml_prediction.get(
    "probabilities",
    {}
)

for label in ["Low", "Medium", "High"]:

    if label in probabilities:

        print(
            f"  {label:<8}: "
            f"{probabilities[label] * 100:.2f}%"
        )


print("\nTOP EXPLANATORY FACTORS")
print("-" * 70)

for index, factor in enumerate(
    formatted_factors[:10],
    start=1
):

    print(
        f"{index}. "
        f"{factor['feature']} = "
        f"{factor['value']} "
        f"({factor['shap_impact']:+.4f})"
    )


print("\nHISTORICAL CASE COMPARISON")
print("-" * 70)

print(
    f"Same-drug matches : "
    f"{len(same_drug_matches)}"
)

print(
    f"Cross-drug matches: "
    f"{len(cross_drug_matches)}"
)

for item in similar_cases:

    print(
        f"Rank {item.get('rank', '?')}: "
        f"{item.get('file', 'Unknown')} | "
        f"{item.get('final_score', 0):.2f}%"
    )

    historical_case = item.get(
        "case",
        {}
    )

    print(
        f"  Drug: "
        f"{historical_case.get('Drug_Type', 'Unknown')}"
    )

    matches = item.get(
        "matching_fields",
        []
    )

    print(
        "  Matches: "
        + (
            ", ".join(matches)
            if matches
            else "None"
        )
    )


print("\nKNOWLEDGE SOURCES")
print("-" * 70)

for name, status in knowledge_status.items():

    print(
        f"{name:<20}: {status}"
    )


print("\nVERIFICATION REQUIRED")
print("-" * 70)

if verification_fields:

    for field in verification_fields:
        print(
            f"  - {field}"
        )

else:

    print(
        "  None"
    )


print("\n")
print("=" * 70)
print("REPORT GENERATION COMPLETED")
print("=" * 70)

print("\nSaved to:")
print(OUTPUT_PATH)
