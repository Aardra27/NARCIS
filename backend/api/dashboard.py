from fastapi import APIRouter
from pathlib import Path
import json

from config import CASE_LIBRARY, OUTPUT_DIR

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


def load_case_library():
    cases = []

    for case_file in sorted(CASE_LIBRARY.glob("case[0-9][0-9][0-9].json")):
        with case_file.open("r", encoding="utf-8-sig") as file:
            data = json.load(file)

        verification = data.get("_verification", {})

        cases.append({
            "case_id": case_file.stem.upper(),
            "drug_type": data.get("Drug_Type", "Unknown"),
            "quantity": data.get("Quantity", "Unknown"),
            "quantity_category": data.get(
                "Quantity_Category",
                "Unknown"
            ),
            "origin_state": data.get(
                "Origin_State",
                "Unknown"
            ),
            "destination_state": data.get(
                "Destination_State",
                "Unknown"
            ),
            "transport_mode": data.get(
                "Transport_Mode",
                "Unknown"
            ),
            "route_type": data.get(
                "Route_Type",
                "Unknown"
            ),
            "investigation_year": data.get(
                "Investigation_Year",
                "Unknown"
            ),
            "verification_status": (
                "Verified"
                if verification.get("verified") is True
                else "Pending Verification"
            )
        })

    return cases


def load_evidence_package():
    evidence_path = OUTPUT_DIR / "prototype_evidence_package.json"

    if not evidence_path.exists():
        return None

    with evidence_path.open("r", encoding="utf-8-sig") as file:
        return json.load(file)


def load_final_report():
    report_path = OUTPUT_DIR / "final_investigation_report.json"

    if not report_path.exists():
        return None

    with report_path.open("r", encoding="utf-8-sig") as file:
        return json.load(file)


def identify_analyzed_case(evidence, cases):
    if not evidence:
        return None

    evidence_case = evidence.get("case", {})
    drug_type = evidence_case.get("Drug_Type", "Unknown")
    quantity = evidence_case.get("Quantity", "Unknown")

    matches = [
        case
        for case in cases
        if case["drug_type"] == drug_type
        and case["quantity"] == quantity
    ]

    return matches[0] if matches else None


@router.get("/stats")
def dashboard_stats():
    cases = load_case_library()
    evidence = load_evidence_package()
    report = load_final_report()

    verified_cases = [
        case
        for case in cases
        if case["verification_status"] == "Verified"
    ]

    analyzed_case = identify_analyzed_case(
        evidence,
        cases
    )

    analyzed_cases = 0
    high_priority = 0
    medium_priority = 0
    low_priority = 0

    if evidence:
        analyzed_cases = 1

        prediction = (
            evidence
            .get("ml_prediction", {})
            .get("prediction")
        )

        if prediction == "High":
            high_priority = 1

        if prediction == "Medium":
            medium_priority = 1

        if prediction == "Low":
            low_priority = 1

    return {
        "total_cases": len(cases),
        "active_cases": len(cases),
        "verified_cases": len(verified_cases),
        "pending_verification": (
            len(cases) - len(verified_cases)
        ),
        "analyzed_cases": analyzed_cases,
        "high_priority": high_priority,
        "medium_priority": medium_priority,
        "low_priority": low_priority,
        "reports_generated": (
            1 if report else 0
        ),
        "analyzed_case_id": (
            analyzed_case["case_id"]
            if analyzed_case
            else None
        )
    }


@router.get("/analysis")
def dashboard_analysis():
    evidence = load_evidence_package()

    if not evidence:
        return {
            "available": False,
            "message": "No completed NARCIS analysis artifact found."
        }

    ml = evidence.get("ml_prediction", {})
    shap = evidence.get("local_explainability", {})

    return {
        "available": True,
        "case": evidence.get("case", {}),
        "prediction": ml.get("prediction"),
        "probabilities": ml.get(
            "probabilities",
            {}
        ),
        "shap_factors": shap.get(
            "top_factors",
            []
        ),
        "historical_cases": evidence.get(
            "historical_cases",
            evidence.get(
                "similar_cases",
                []
            )
        ),
        "knowledge_sources": evidence.get(
            "knowledge_sources",
            {}
        )
    }


@router.get("/recent-cases")
def recent_cases():
    cases = load_case_library()

    cases = sorted(
        cases,
        key=lambda case: (
            str(case["investigation_year"]),
            case["case_id"]
        ),
        reverse=True
    )

    return cases[:10]


@router.get("/activity")
def dashboard_activity():
    cases = load_case_library()

    activity = {}

    for case in cases:
        year = str(case["investigation_year"])

        activity[year] = (
            activity.get(year, 0) + 1
        )

    return [
        {
            "date": year,
            "count": count
        }
        for year, count in sorted(
            activity.items(),
            reverse=True
        )
    ]
