from pathlib import Path
import importlib.util
import json
import re
import sys
import uuid
from datetime import datetime

import joblib
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

from config import CASE_LIBRARY, OUTPUT_DIR

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from agent.orchestrator import analyze_case
except Exception:  # pragma: no cover
    analyze_case = None

# NARCIS project root
BASE_DIR = Path(__file__).resolve().parents[2]

# Allow importer modules to be imported
IMPORTER_DIR = BASE_DIR / "importer"

if str(IMPORTER_DIR) not in sys.path:
    sys.path.insert(0, str(IMPORTER_DIR))

from extractor import extract_text
from mapper import build_case_dictionary
from validator import validate_case


router = APIRouter(
    prefix="/api/cases",
    tags=["Cases"]
)

GLOBAL_SHAP_PATH = BASE_DIR / "shap_summary.png"
LOCAL_SHAP_DIR = BASE_DIR / "output" / "plots"
MODEL_PATH = BASE_DIR / "models" / "saved_models" / "random_forest.pkl"
DATASET_PATH = BASE_DIR / "output" / "Historical_Drug_Investigation_Dataset.csv"

UPLOAD_DIR = BASE_DIR / "documents" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
CASE_LIBRARY.mkdir(parents=True, exist_ok=True)
LOCAL_SHAP_DIR.mkdir(parents=True, exist_ok=True)


def find_local_shap_image() -> Path:
    candidates = sorted(
        LOCAL_SHAP_DIR.glob("*.png"),
        key=lambda item: item.stat().st_mtime,
        reverse=True,
    )

    for candidate in candidates:
        name = candidate.name.lower()
        if any(marker in name for marker in ["shap", "local", "waterfall", "force", "explain"]):
            return candidate

    raise HTTPException(
        status_code=404,
        detail="No local SHAP visualization file is available in the project output folder."
    )


def next_case_number():
    existing = sorted(CASE_LIBRARY.glob("case*.json"))
    next_number = 1

    for file_path in existing:
        name = file_path.stem
        if name.startswith("case") and name[4:].isdigit():
            value = int(name[4:])
            next_number = max(next_number, value + 1)

    return next_number


def load_latest_verified_case():
    candidates = []

    for case_file in sorted(CASE_LIBRARY.glob("case*.json")):
        try:
            with case_file.open("r", encoding="utf-8-sig") as file:
                data = json.load(file)
        except (OSError, json.JSONDecodeError):
            continue

        if not isinstance(data, dict):
            continue

        verification = data.get("_verification") or {}
        if verification.get("verified") is not True:
            continue

        case_id = data.get("Case_ID") or case_file.stem.upper()

        candidates.append({
            "case": data,
            "case_id": case_id,
            "filename": case_file.name,
            "path": str(case_file),
            "mtime": case_file.stat().st_mtime,
        })

    if not candidates:
        raise HTTPException(
            status_code=404,
            detail="No verified case found in the case library."
        )

    latest = max(candidates, key=lambda item: item["mtime"])

    return {
        "success": True,
        "case_id": latest["case_id"],
        "filename": latest["filename"],
        "path": latest["path"],
        "case": latest["case"],
    }


def save_verified_case_to_library(case_data: dict):
    if not isinstance(case_data, dict):
        raise HTTPException(status_code=400, detail="Case payload must be an object.")

    cleaned_case = dict(case_data)
    cleaned_case["_verification"] = {
        "verified": True,
        "verification_timestamp": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "verification_method": "Officer verification"
    }

    case_number = next_case_number()
    filename = f"case{case_number:03d}.json"
    output_path = CASE_LIBRARY / filename

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(cleaned_case, file, indent=4, ensure_ascii=False)

    return {
        "success": True,
        "case_id": filename.replace(".json", "").upper(),
        "filename": filename,
        "path": str(output_path),
    }


def _sanitize_case_id(case_data: dict | None) -> str:
    if not isinstance(case_data, dict):
        return "UNKNOWN"

    raw = (
        case_data.get("Case_ID")
        or case_data.get("case_id")
        or case_data.get("Case Id")
        or case_data.get("CaseID")
        or case_data.get("caseId")
    )

    text = str(raw).strip() if raw is not None else ""
    if not text:
        return "UNKNOWN"

    return text.upper()


def _resolve_case_storage_path(case_data: dict | None) -> Path:
    preferred_id = _sanitize_case_id(case_data)
    case_key = preferred_id.lower()

    for case_file in sorted(CASE_LIBRARY.glob("case*.json")):
        try:
            with case_file.open("r", encoding="utf-8-sig") as file:
                existing = json.load(file)
        except (OSError, json.JSONDecodeError):
            continue

        if not isinstance(existing, dict):
            continue

        existing_case_id = _sanitize_case_id(existing)
        if existing_case_id == preferred_id:
            return case_file

        if case_file.stem.lower() == case_key:
            return case_file

    return CASE_LIBRARY / f"case{next_case_number():03d}.json"


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_pdf_bytes(case_id: str, case_data: dict | None, report_data: dict | None, officer_decision: str, officer_remarks: str, reviewed_at: str) -> bytes:
    summary = report_data or {}
    llm_assessment = summary.get("llm_assessment") if isinstance(summary, dict) else {}
    executive_assessment = llm_assessment.get("executive_assessment", "NARCIS decision support report") if isinstance(llm_assessment, dict) else "NARCIS decision support report"
    priority = summary.get("source_evidence", {}).get("ml_prediction", {}).get("prediction") if isinstance(summary, dict) else "Unknown"
    probabilities = summary.get("source_evidence", {}).get("ml_prediction", {}).get("probabilities") if isinstance(summary, dict) else {}
    knowledge = summary.get("source_evidence", {}).get("knowledge", {}) if isinstance(summary, dict) else {}

    lines = [
        "NARCIS Investigation Decision-Support Report",
        f"Case ID: {case_id}",
        f"Drug Type: {case_data.get('Drug_Type', 'Unknown') if isinstance(case_data, dict) else 'Unknown'}",
        f"Quantity: {case_data.get('Quantity', 'Unknown') if isinstance(case_data, dict) else 'Unknown'}",
        f"Route Type: {case_data.get('Route_Type', 'Unknown') if isinstance(case_data, dict) else 'Unknown'}",
        f"Interstate Travel: {case_data.get('Interstate_Travel', 'Unknown') if isinstance(case_data, dict) else 'Unknown'}",
        f"Predicted Priority: {priority}",
        "",
        "Executive Assessment:",
        str(executive_assessment)[:600],
        "",
        "Probability Distribution:",
        ", ".join(f"{key}: {value}" for key, value in (probabilities.items() if isinstance(probabilities, dict) else [])),
        "",
        "SHAP / Historical / Domain Knowledge:",
        f"SHAP summary: {summary.get('source_evidence', {}).get('local_explainability', {}).get('top_factors', [])[:3] if isinstance(summary, dict) else 'Unknown'}",
        f"Knowledge sources: {knowledge if isinstance(knowledge, dict) else 'Unknown'}",
        "",
        "Officer Decision:",
        officer_decision,
        "",
        "Officer Remarks:",
        officer_remarks[:700],
        "",
        f"Reviewed At: {reviewed_at}",
        "Final Status: FINALIZED",
    ]

    text = "\n".join(lines)
    content_lines = []
    y = 760
    for raw_line in text.splitlines():
        cleaned = raw_line[:110]
        escaped = _pdf_escape(cleaned)
        content_lines.append(f"BT /F1 12 Tf 72 {y} Td ({escaped}) Tj ET")
        y -= 18
        if y < 45:
            break

    stream_text = "\n".join(content_lines)
    stream = f"BT\n/F1 12 Tf\n{stream_text}\nET"
    encoded = stream.encode("latin-1", "replace")

    objects = [
        "",
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        f"<< /Length {len(encoded)} >>\nstream\n{encoded.decode('latin-1')}\nendstream",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]

    for index, obj in enumerate(objects[1:], start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n{obj}\nendobj\n".encode("latin-1"))

    xref_position = len(pdf)
    pdf.extend(f"xref\n0 {len(objects)}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))

    pdf.extend(f"trailer\n<< /Size {len(objects)} /Root 1 0 R >>\nstartxref\n{xref_position}\n%%EOF\n".encode("latin-1"))
    return bytes(pdf)


def _case_signature(case_data: dict | None) -> str:
    if not isinstance(case_data, dict):
        return ""
    return json.dumps(case_data, sort_keys=True, ensure_ascii=False)


def _load_existing_report_for_case(case_data: dict | None):
    report_path = OUTPUT_DIR / "final_investigation_report.json"
    if not report_path.exists():
        return None

    try:
        with report_path.open("r", encoding="utf-8-sig") as file:
            report = json.load(file)
    except (OSError, json.JSONDecodeError):
        return None

    if not isinstance(report, dict):
        return None

    existing_case = report.get("source_evidence", {}).get("case", {})
    if not existing_case:
        return None

    if _case_signature(case_data) == _case_signature(existing_case):
        return report

    return None


def _generate_report_via_existing_pipeline(case_data: dict):
    if analyze_case is None:
        raise HTTPException(
            status_code=500,
            detail="AI analysis orchestration is unavailable."
        )

    evidence = analyze_case(case_data)
    evidence["success"] = True
    evidence["analysis_status"] = "complete"

    evidence_path = OUTPUT_DIR / "prototype_evidence_package.json"
    evidence_path.parent.mkdir(parents=True, exist_ok=True)

    with evidence_path.open("w", encoding="utf-8") as file:
        json.dump(evidence, file, indent=4, ensure_ascii=False, default=str)

    generator_path = BASE_DIR / "llm" / "report_generator.py"
    if not generator_path.exists():
        raise HTTPException(
            status_code=500,
            detail="The existing Gemini report generator file is missing."
        )

    spec = importlib.util.spec_from_file_location(
        "narcis_llm_report_generator",
        generator_path,
    )

    if spec is None or spec.loader is None:
        raise HTTPException(
            status_code=500,
            detail="Unable to load the existing report-generator module."
        )

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    if not hasattr(module, "generate_report_from_evidence"):
        raise HTTPException(
            status_code=500,
            detail="The existing report generator does not expose a reusable generation function."
        )

    try:
        generated_report = module.generate_report_from_evidence(
            evidence_path=evidence_path,
            output_path=OUTPUT_DIR / "final_investigation_report.json",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {exc}",
        ) from exc

    return generated_report


@router.get("/verified/latest")
def get_latest_verified_case():
    return load_latest_verified_case()


@router.get("/report")
def get_report_for_latest_case():
    latest = load_latest_verified_case()
    case_data = latest.get("case") if isinstance(latest, dict) else None
    existing = _load_existing_report_for_case(case_data)

    if existing is not None:
        return {
            "success": True,
            "generated": False,
            "source": "existing_report",
            "case_id": latest.get("case_id"),
            "report": existing,
        }

    try:
        generated = _generate_report_via_existing_pipeline(case_data)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {exc}",
        ) from exc

    return {
        "success": True,
        "generated": True,
        "source": "generated_report",
        "case_id": latest.get("case_id"),
        "report": generated,
    }


@router.post("/report")
async def generate_report_for_case(case_payload: dict):
    case_data = None

    if isinstance(case_payload, dict):
        case_data = case_payload.get("case")

    if not isinstance(case_data, dict):
        case_data = load_latest_verified_case().get("case")

    if not isinstance(case_data, dict):
        raise HTTPException(
            status_code=400,
            detail="A valid case object is required to generate a report."
        )

    existing = _load_existing_report_for_case(case_data)
    if existing is not None:
        return {
            "success": True,
            "generated": False,
            "source": "existing_report",
            "case_id": case_data.get("Case_ID") or case_data.get("case_id") or "UNKNOWN",
            "report": existing,
        }

    try:
        generated = _generate_report_via_existing_pipeline(case_data)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {exc}",
        ) from exc

    return {
        "success": True,
        "generated": True,
        "source": "generated_report",
        "case_id": case_data.get("Case_ID") or case_data.get("case_id") or "UNKNOWN",
        "report": generated,
    }


@router.get("/library")
def list_case_library():
    items = []

    for case_file in sorted(CASE_LIBRARY.glob("case*.json")):
        if case_file.name in {"case_schema.json", "case_source_registry.json"}:
            continue

        try:
            with case_file.open("r", encoding="utf-8-sig") as file:
                payload = json.load(file)
        except (OSError, json.JSONDecodeError):
            continue

        if not isinstance(payload, dict):
            continue

        case_id = _sanitize_case_id(payload) or case_file.stem.upper()
        verification = payload.get("_verification") or {}
        items.append({
            "case_id": case_id,
            "filename": case_file.name,
            "status": "Finalized" if payload.get("finalized") is True or verification.get("verified") is True else "Verified",
            "drug_type": payload.get("Drug_Type", "Unknown"),
            "quantity": payload.get("Quantity", "Unknown"),
            "location": payload.get("Location", "Unknown"),
            "route_type": payload.get("Route_Type", "Unknown"),
            "updated_at": verification.get("verification_timestamp") or payload.get("updated_at") or "Unknown",
        })

    return {
        "success": True,
        "count": len(items),
        "items": items,
    }


@router.get("/reports")
def list_reports():
    items = []

    report_path = OUTPUT_DIR / "final_investigation_report.json"
    if report_path.exists():
        try:
            with report_path.open("r", encoding="utf-8-sig") as file:
                report_payload = json.load(file)
        except (OSError, json.JSONDecodeError):
            report_payload = None

        if isinstance(report_payload, dict):
            case_data = report_payload.get("source_evidence", {}).get("case") or {}
            case_id = _sanitize_case_id(case_data) or "UNKNOWN"
            pdf_name = f"{case_id.lower()}.pdf"
            items.append({
                "case_id": case_id,
                "report_type": report_payload.get("report_type", "NARCIS Report"),
                "generated_at": report_payload.get("generated_at") or "Current",
                "pdf_download_url": f"/api/cases/finalized-pdf/{case_id}",
                "pdf_file": pdf_name,
            })

    pdf_dir = OUTPUT_DIR / "finalized_reports"
    if pdf_dir.exists():
        for pdf_file in sorted(pdf_dir.glob("*.pdf")):
            case_id = pdf_file.stem.upper()
            if not any(item["case_id"] == case_id for item in items):
                items.append({
                    "case_id": case_id,
                    "report_type": "Finalized report",
                    "generated_at": "Current",
                    "pdf_download_url": f"/api/cases/finalized-pdf/{pdf_file.stem}",
                    "pdf_file": pdf_file.name,
                })

    return {
        "success": True,
        "count": len(items),
        "items": items,
    }


@router.get("/finalized-pdf/{case_id}")
def get_finalized_pdf(case_id: str):
    safe_case_id = re.sub(r"[^A-Za-z0-9_-]", "", case_id).strip()
    if not safe_case_id:
        raise HTTPException(status_code=400, detail="Invalid case ID.")

    pdf_path = OUTPUT_DIR / "finalized_reports" / f"{safe_case_id.lower()}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found for the requested case.")

    return FileResponse(
        str(pdf_path),
        media_type="application/pdf",
        filename=pdf_path.name,
    )


@router.post("/finalize")
async def finalize_case(case_payload: dict):
    if not isinstance(case_payload, dict):
        raise HTTPException(status_code=400, detail="A valid case payload is required.")

    case_id = str(case_payload.get("case_id") or "").strip() or None
    officer_decision = str(case_payload.get("officer_decision") or "").strip()
    officer_remarks = str(case_payload.get("officer_remarks") or "").strip()
    reviewed_at = str(case_payload.get("reviewed_at") or datetime.utcnow().isoformat(timespec="seconds") + "Z").strip()
    report_status = str(case_payload.get("report_status") or "FINALIZED").strip()

    if not officer_decision and case_payload.get("decision"):
        officer_decision = str(case_payload.get("decision"))

    if not officer_decision:
        raise HTTPException(status_code=400, detail="An officer decision is required before finalizing the case.")

    if case_payload.get("confirmed") is not True and case_payload.get("confirmation") is not True:
        raise HTTPException(status_code=400, detail="Officer confirmation is required before finalization.")

    existing_case = None
    if case_id:
        for case_file in sorted(CASE_LIBRARY.glob("case*.json")):
            try:
                with case_file.open("r", encoding="utf-8-sig") as file:
                    data = json.load(file)
            except (OSError, json.JSONDecodeError):
                continue
            if isinstance(data, dict) and _sanitize_case_id(data) == case_id.upper():
                existing_case = data
                break

    if existing_case is None and case_payload.get("case") is not None:
        case_data = case_payload.get("case")
        if isinstance(case_data, dict):
            existing_case = case_data
            case_id = _sanitize_case_id(existing_case) or case_id

    if existing_case is None:
        try:
            latest = load_latest_verified_case()
            existing_case = latest.get("case") if isinstance(latest, dict) else None
        except HTTPException:
            pass

    if not isinstance(existing_case, dict):
        raise HTTPException(status_code=400, detail="A valid verified case is required to finalize the workflow.")

    case_id = case_id or _sanitize_case_id(existing_case) or "UNKNOWN"
    report_data = _load_existing_report_for_case(existing_case) or {}
    if not report_data and OUTPUT_DIR.joinpath("final_investigation_report.json").exists():
        try:
            with OUTPUT_DIR.joinpath("final_investigation_report.json").open("r", encoding="utf-8-sig") as file:
                report_data = json.load(file)
        except (OSError, json.JSONDecodeError):
            report_data = {}

    storage_path = _resolve_case_storage_path(existing_case)
    final_case = dict(existing_case)
    final_case["finalized"] = True
    final_case["status"] = "FINALIZED"
    final_case["_finalization"] = {
        "status": "FINALIZED",
        "officer_decision": officer_decision,
        "officer_remarks": officer_remarks,
        "reviewed_at": reviewed_at,
        "report_status": report_status,
    }

    try:
        with storage_path.open("w", encoding="utf-8") as file:
            json.dump(final_case, file, indent=4, ensure_ascii=False)
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Unable to save the finalized case: {exc}") from exc

    pdf_output_dir = OUTPUT_DIR / "reports"
    pdf_output_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = pdf_output_dir / f"{case_id.upper()}_report.pdf"

    try:
        pdf_bytes = _build_pdf_bytes(case_id.upper(), final_case, report_data, officer_decision, officer_remarks, reviewed_at)
        pdf_path.write_bytes(pdf_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to generate the finalized PDF: {exc}") from exc

    report_id = f"REPORT-{case_id.upper()}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    report_record = {
        "report_id": report_id,
        "case_id": case_id.upper(),
        "title": "NARCIS Investigation Decision-Support Report",
        "priority": str(report_data.get("source_evidence", {}).get("ml_prediction", {}).get("prediction") or existing_case.get("Priority") or "Unknown"),
        "status": "FINALIZED",
        "created_at": reviewed_at,
        "reviewed_at": reviewed_at,
        "officer_decision": officer_decision,
        "officer_remarks": officer_remarks,
        "pdf_path": str(pdf_path),
        "json_path": str(OUTPUT_DIR / "final_investigation_report.json"),
    }

    registry_path = pdf_output_dir / "report_registry.json"
    existing_registry = []
    if registry_path.exists():
        try:
            with registry_path.open("r", encoding="utf-8-sig") as file:
                existing_registry = json.load(file)
        except (OSError, json.JSONDecodeError):
            existing_registry = []

    if not isinstance(existing_registry, list):
        existing_registry = []

    existing_registry = [item for item in existing_registry if not isinstance(item, dict) or str(item.get("case_id") or "").upper() != case_id.upper()]
    existing_registry.append(report_record)

    try:
        with registry_path.open("w", encoding="utf-8") as file:
            json.dump(existing_registry, file, indent=2, ensure_ascii=False)
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Unable to save the finalized report record: {exc}") from exc

    final_report = report_data if isinstance(report_data, dict) else {}
    final_report.setdefault("finalization", {})
    final_report["finalization"] = {
        "status": "FINALIZED",
        "case_id": case_id.upper(),
        "report_id": report_id,
        "officer_decision": officer_decision,
        "officer_remarks": officer_remarks,
        "reviewed_at": reviewed_at,
        "pdf_path": str(pdf_path),
    }

    try:
        with (OUTPUT_DIR / "final_investigation_report.json").open("w", encoding="utf-8") as file:
            json.dump(final_report, file, indent=4, ensure_ascii=False)
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Unable to persist the finalized report JSON: {exc}") from exc

    return {
        "success": True,
        "finalized": True,
        "case_id": case_id.upper(),
        "report_id": report_id,
        "pdf_path": str(pdf_path),
        "redirect": "/reports",
    }


@router.post("/analyze")
async def analyze_verified_case(case_payload: dict):
    case_data = None

    if isinstance(case_payload, dict):
        case_data = case_payload.get("case")

    if not isinstance(case_data, dict):
        case_data = load_latest_verified_case().get("case")

    if not isinstance(case_data, dict):
        raise HTTPException(
            status_code=400,
            detail="A valid case object is required for AI analysis."
        )

    if analyze_case is None:
        raise HTTPException(
            status_code=500,
            detail="AI analysis orchestration is unavailable."
        )

    try:
        evidence = analyze_case(case_data)
        evidence["success"] = True
        evidence["analysis_status"] = "complete"
        return evidence
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(exc)}"
        )


@router.get("/shap/summary")
def get_global_shap_summary():
    if not GLOBAL_SHAP_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Global SHAP summary image not found on disk."
        )

    return FileResponse(
        str(GLOBAL_SHAP_PATH),
        media_type="image/png",
        filename="shap_summary.png",
    )


@router.get("/shap/local")
def get_local_shap_image():
    local_path = find_local_shap_image()
    return FileResponse(
        str(local_path),
        media_type="image/png",
        filename=local_path.name,
    )


@router.get("/model-evaluation")
def get_model_evaluation():
    if not MODEL_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="The trained Random Forest model has not been saved yet."
        )

    if not DATASET_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="The historical training dataset was not found."
        )

    try:
        from ml.preprocess import load_dataset, preprocess_data
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=500,
            detail=f"Unable to import the ML preprocessing pipeline: {exc}"
        ) from exc

    dataset = load_dataset()
    X, y, _ = preprocess_data(dataset)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = joblib.load(MODEL_PATH)
    predictions = model.predict(X_test)

    accuracy = float(accuracy_score(y_test, predictions))
    report = classification_report(
        y_test,
        predictions,
        output_dict=True,
        zero_division=0,
    )
    confusion = confusion_matrix(y_test, predictions, labels=[0, 1, 2]).tolist()

    labels = ["Low", "Medium", "High"]
    class_metrics = {}

    for index, label in enumerate(labels):
        stats = report.get(str(index), {})
        class_metrics[label] = {
            "precision": float(stats.get("precision", 0.0) or 0.0),
            "recall": float(stats.get("recall", 0.0) or 0.0),
            "f1_score": float(stats.get("f1-score", 0.0) or 0.0),
            "support": int(stats.get("support", 0) or 0),
        }

    return {
        "success": True,
        "model": "Random Forest Classifier",
        "evaluation_scope": "test_data",
        "accuracy": accuracy,
        "class_labels": labels,
        "class_metrics": class_metrics,
        "confusion_matrix": confusion,
        "confusion_matrix_labels": labels,
        "overall": {
            "macro_precision": float(report.get("macro avg", {}).get("precision", 0.0) or 0.0),
            "macro_recall": float(report.get("macro avg", {}).get("recall", 0.0) or 0.0),
            "macro_f1_score": float(report.get("macro avg", {}).get("f1-score", 0.0) or 0.0),
            "weighted_precision": float(report.get("weighted avg", {}).get("precision", 0.0) or 0.0),
            "weighted_recall": float(report.get("weighted avg", {}).get("recall", 0.0) or 0.0),
            "weighted_f1_score": float(report.get("weighted avg", {}).get("f1-score", 0.0) or 0.0),
        },
        "note": "MODEL PERFORMANCE ON TEST DATA: These metrics evaluate the trained model on the held-out evaluation set and do not represent probability for the current case.",
    }


@router.post("/verify")
async def verify_case(case_payload: dict):
    case_data = case_payload.get("case") if isinstance(case_payload, dict) else None

    if not isinstance(case_data, dict):
        raise HTTPException(
            status_code=400,
            detail="A valid case object is required in the request body."
        )

    result = save_verified_case_to_library(case_data)
    return result


@router.post("/extract")
async def extract_case(file: UploadFile = File(...)):

    # -----------------------------------------------------
    # Validate filename
    # -----------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    filename = Path(file.filename).name

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    # -----------------------------------------------------
    # Read uploaded file
    # -----------------------------------------------------

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    # 25 MB limit
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File exceeds the 25 MB limit."
        )

    # -----------------------------------------------------
    # Save temporary uploaded document
    # -----------------------------------------------------

    document_id = uuid.uuid4().hex

    stored_path = UPLOAD_DIR / f"{document_id}.pdf"

    try:

        stored_path.write_bytes(content)

        # -------------------------------------------------
        # EXISTING NARCIS EXTRACTION PIPELINE
        # -------------------------------------------------

        text, pages = extract_text(stored_path)

        if not text or not text.strip():
            raise HTTPException(
                status_code=422,
                detail="No readable text could be extracted from this PDF."
            )

        case = build_case_dictionary(text)

        validated_case, missing_fields = validate_case(case)

        # -------------------------------------------------
        # Return data to frontend
        # -------------------------------------------------

        return {
            "success": True,
            "document_id": document_id,
            "filename": filename,
            "file_size": len(content),
            "pages": pages,
            "extraction_status": "complete",
            "case": validated_case,
            "missing_fields": missing_fields,
            "document_url": f"/api/cases/document/{document_id}"
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Document extraction failed: {str(exc)}"
        )


@router.get("/document/{document_id}")
def get_document(document_id: str):

    # Prevent path traversal
    if (
        not document_id
        or "/" in document_id
        or "\\" in document_id
        or ".." in document_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID."
        )

    document_path = UPLOAD_DIR / f"{document_id}.pdf"

    if not document_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    from fastapi.responses import FileResponse

    return FileResponse(
        document_path,
        media_type="application/pdf"
    )
