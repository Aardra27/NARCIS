from pathlib import Path
import json
import os
import time
from typing import Any

try:
    from google import genai
except ModuleNotFoundError as exc:  # pragma: no cover
    raise RuntimeError(
        "Required dependency 'google-genai' is not installed. Run: pip install google-genai"
    ) from exc


# ============================================================
# NARCIS LLM REPORT GENERATOR
# GEMINI-POWERED PROTOTYPE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
GEMINI_MODEL = "gemini-3.8-flash"
MAX_GEMINI_RETRIES = 4

EVIDENCE_PATH = BASE_DIR / "output" / "prototype_evidence_package.json"
OUTPUT_PATH = BASE_DIR / "output" / "final_investigation_report.json"


def _is_retryable_gemini_error(exc: BaseException) -> bool:
    code = getattr(exc, "code", None)
    status = str(getattr(exc, "status", "")).upper()
    message = str(exc).upper()

    retryable_codes = {429, 500, 502, 503, 504}
    if code in retryable_codes:
        return True

    retryable_tokens = (
        "429",
        "RATE_LIMIT",
        "RESOURCE_EXHAUSTED",
        "UNAVAILABLE",
        "SERVICE_UNAVAILABLE",
        "OVERLOADED",
        "INTERNAL_ERROR",
        "TIMEOUT",
        "TEMPORARY",
    )
    if any(token in status or token in message for token in retryable_tokens):
        return True

    invalid_key_tokens = (
        "INVALID_API_KEY",
        "API_KEY_INVALID",
        "API_KEY IS INVALID",
        "PERMISSION_DENIED",
        "AUTHORIZATION",
        "UNAUTHORIZED",
    )
    if any(token in message for token in invalid_key_tokens):
        return False

    return False


def _format_gemini_error(exc: BaseException) -> str:
    code = getattr(exc, "code", None)
    status = getattr(exc, "status", None)
    message = str(exc).strip()

    if code is not None and status:
        return f"Gemini request failed ({code} {status}). {message}"
    if code is not None:
        return f"Gemini request failed ({code}). {message}"
    return f"Gemini request failed. {message}"


def _parse_llm_report(raw_text: str) -> dict[str, Any]:
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        cleaned = raw_text

        if cleaned.startswith("```json"):
            cleaned = cleaned[len("```json") :].strip()

        if cleaned.startswith("```"):
            cleaned = cleaned[3:].strip()

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3].strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise RuntimeError("Could not parse Gemini response as JSON.") from exc


def generate_report_from_evidence(
    evidence_path: Path | str | None = None,
    output_path: Path | str | None = None,
) -> dict[str, Any]:
    evidence_file = Path(evidence_path) if evidence_path is not None else EVIDENCE_PATH
    output_file = Path(output_path) if output_path is not None else OUTPUT_PATH

    if not evidence_file.exists():
        raise FileNotFoundError(f"Evidence package not found: {evidence_file}")

    with open(evidence_file, "r", encoding="utf-8-sig") as file:
        evidence = json.load(file)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set in the current PowerShell session."
        )

    client = genai.Client(api_key=api_key)
    evidence_json = json.dumps(evidence, indent=2, ensure_ascii=False)

    prompt = f"""
You are the report-generation component of NARCIS,
a decision-support prototype for drug investigation analysis.

Your task is to synthesize the evidence already produced by
the NARCIS pipeline into a clear investigation decision-support
report.

IMPORTANT RULES:

1. Use ONLY information contained in the supplied evidence.
2. Do NOT invent missing facts.
3. Do NOT convert "Unknown" into a guessed value.
4. Clearly distinguish:
   - model prediction
   - SHAP explanation
   - historical case comparison
   - retrieved domain knowledge
   - information requiring officer verification
5. A historical case with a different drug type must NOT be described
   as a same-drug precedent.
6. If there are zero same-drug historical cases, explicitly state that
   no same-drug comparison was available in the current case library.
7. SHAP values describe model contribution. Do not claim they prove
   that a factor caused the real-world investigation outcome.
8. Do not make an autonomous legal conclusion.
9. Do not recommend punishment or guilt.
10. The final output is decision support for an investigating officer.
11. Keep the report factual, concise, and professional.
12. Mention uncertainty where important.

Generate a JSON object with EXACTLY these top-level keys:

{{
  "executive_assessment": "...",
  "priority_assessment": "...",
  "why_model_predicted_this_priority": [
    "...",
    "..."
  ],
  "historical_case_assessment": "...",
  "knowledge_assessment": "...",
  "verification_required": [
    "...",
    "..."
  ],
  "recommended_investigative_follow_up": [
    "...",
    "..."
  ],
  "limitations": [
    "...",
    "..."
  ]
}}

The report must not contain markdown code fences.

NARCIS EVIDENCE PACKAGE:
{evidence_json}
"""

    last_error: BaseException | None = None
    response = None

    for attempt in range(1, MAX_GEMINI_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            break
        except Exception as exc:  # pragma: no cover - relies on Google SDK exceptions
            last_error = exc
            if not _is_retryable_gemini_error(exc) or attempt >= MAX_GEMINI_RETRIES:
                raise RuntimeError(_format_gemini_error(exc)) from exc

            wait_seconds = min(1 * (2 ** (attempt - 1)), 8)
            time.sleep(wait_seconds)

    if response is None:
        raise RuntimeError(
            "Gemini request failed after retrying transient errors."
            if last_error is None else _format_gemini_error(last_error)
        ) from last_error

    raw_text = response.text.strip()
    if not raw_text:
        raise RuntimeError("Gemini returned an empty response.")

    llm_report = _parse_llm_report(raw_text)

    final_report = {
        "report_type": "NARCIS Investigation Decision-Support Report",
        "prototype": True,
        "llm": {
            "provider": "Google Gemini",
            "model": GEMINI_MODEL,
            "generated": True,
        },
        "source_evidence": evidence,
        "llm_assessment": llm_report,
    }

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(final_report, file, indent=4, ensure_ascii=False)

    return final_report


if __name__ == "__main__":
    generate_report_from_evidence()


