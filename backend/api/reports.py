from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from config import OUTPUT_DIR

router = APIRouter(prefix="/api/reports", tags=["Reports"])
REPORTS_DIR = OUTPUT_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
REPORT_REGISTRY_PATH = REPORTS_DIR / "report_registry.json"


def _file_exists(path: Path) -> bool:
    return path.exists() and path.is_file()


def _load_registry() -> list[dict]:
    if not REPORT_REGISTRY_PATH.exists():
        return []

    try:
        with REPORT_REGISTRY_PATH.open("r", encoding="utf-8-sig") as handle:
            payload = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return []

    if isinstance(payload, list):
        return payload

    if isinstance(payload, dict):
        items = payload.get("reports")
        return items if isinstance(items, list) else []

    return []


def _save_registry(items: list[dict]) -> None:
    with REPORT_REGISTRY_PATH.open("w", encoding="utf-8") as handle:
        json.dump(items, handle, indent=2, ensure_ascii=False)


def _normalize_report_entry(entry: dict) -> dict:
    if not isinstance(entry, dict):
        return {}

    case_id = str(entry.get("case_id") or entry.get("caseID") or "UNKNOWN").strip()
    report_id = str(entry.get("report_id") or entry.get("id") or case_id or "report").strip()
    pdf_path = Path(entry.get("pdf_path") or "")
    if not pdf_path.is_absolute():
        pdf_path = OUTPUT_DIR / pdf_path if str(pdf_path) else OUTPUT_DIR / "reports" / f"{case_id}_report.pdf"

    return {
        "report_id": report_id,
        "case_id": case_id,
        "title": entry.get("title") or "NARCIS Investigation Decision-Support Report",
        "priority": entry.get("priority") or "Unknown",
        "status": entry.get("status") or "FINALIZED",
        "created_at": entry.get("created_at") or entry.get("reviewed_at") or "Unknown",
        "reviewed_at": entry.get("reviewed_at") or entry.get("created_at") or "Unknown",
        "officer_decision": entry.get("officer_decision") or "Pending",
        "pdf_path": str(pdf_path),
        "json_path": entry.get("json_path") or str(OUTPUT_DIR / "final_investigation_report.json"),
    }


@router.get("")
def list_finalized_reports():
    items = _load_registry()
    normalized = [_normalize_report_entry(item) for item in items]
    if not normalized and _file_exists(OUTPUT_DIR / "final_investigation_report.json"):
        report_data = json.loads((OUTPUT_DIR / "final_investigation_report.json").read_text(encoding="utf-8-sig"))
        case_data = report_data.get("source_evidence", {}).get("case") or {}
        case_id = str(case_data.get("Case_ID") or case_data.get("case_id") or "UNKNOWN").upper()
        pdf_candidate = OUTPUT_DIR / "reports" / f"{case_id}_report.pdf"
        normalized = [{
            "report_id": f"report-{case_id}",
            "case_id": case_id,
            "title": report_data.get("report_type") or "NARCIS Investigation Decision-Support Report",
            "priority": report_data.get("source_evidence", {}).get("ml_prediction", {}).get("prediction") or "Unknown",
            "status": "FINALIZED",
            "created_at": "Current",
            "reviewed_at": "Current",
            "officer_decision": "Pending",
            "pdf_path": str(pdf_candidate),
            "json_path": str(OUTPUT_DIR / "final_investigation_report.json"),
        }]

    return {
        "success": True,
        "count": len(normalized),
        "items": normalized,
    }


@router.get("/{report_id}")
def get_report_detail(report_id: str):
    for item in _load_registry():
        record = _normalize_report_entry(item)
        if str(record.get("report_id")) == report_id:
            return {
                "success": True,
                "report": record,
            }

    raise HTTPException(status_code=404, detail="Report not found.")


@router.get("/{report_id}/pdf")
def get_report_pdf(report_id: str):
    for item in _load_registry():
        record = _normalize_report_entry(item)
        if str(record.get("report_id")) == report_id:
            pdf_path = Path(record["pdf_path"])
            if not pdf_path.exists():
                raise HTTPException(status_code=404, detail="Report PDF not found.")
            return FileResponse(
                path=str(pdf_path),
                media_type="application/pdf",
                filename=f"{record['case_id']}_report.pdf",
            )

    raise HTTPException(status_code=404, detail="Report PDF not found.")
