from pathlib import Path
import json
import os

from google import genai


# ============================================================
# NARCIS LLM REPORT GENERATOR
# GEMINI-POWERED PROTOTYPE
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
print("GEMINI-POWERED PROTOTYPE")
print("=" * 70)

print("\nLoading evidence package:")
print(EVIDENCE_PATH)

with open(EVIDENCE_PATH, "r", encoding="utf-8-sig") as f:
    evidence = json.load(f)

print("\nEvidence package loaded.")


# ============================================================
# GEMINI CLIENT
# ============================================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is not set in the current PowerShell session."
    )

print("Gemini API key detected.")

client = genai.Client(api_key=api_key)


# ============================================================
# PREPARE LLM PROMPT
# ============================================================

evidence_json = json.dumps(
    evidence,
    indent=2,
    ensure_ascii=False
)

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


# ============================================================
# CALL GEMINI
# ============================================================

print("\nGenerating LLM decision-support report...")
print("Sending evidence package to Gemini...")

response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=prompt
)

raw_text = response.text.strip()

if not raw_text:
    raise RuntimeError("Gemini returned an empty response.")


# ============================================================
# PARSE GEMINI JSON
# ============================================================

try:
    llm_report = json.loads(raw_text)

except json.JSONDecodeError:

    # Defensive cleanup in case the model returned code fences.
    cleaned = raw_text

    if cleaned.startswith("```json"):
        cleaned = cleaned[len("```json"):].strip()

    if cleaned.startswith("```"):
        cleaned = cleaned[3:].strip()

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    try:
        llm_report = json.loads(cleaned)

    except json.JSONDecodeError as exc:
        print("\nGemini returned non-JSON output:")
        print(raw_text)
        raise RuntimeError(
            "Could not parse Gemini response as JSON."
        ) from exc


# ============================================================
# COMBINE EVIDENCE + LLM REPORT
# ============================================================

final_report = {
    "report_type":
        "NARCIS Investigation Decision-Support Report",

    "prototype": True,

    "llm": {
        "provider": "Google Gemini",
        "model": "gemini-3.6-flash",
        "generated": True
    },

    "source_evidence": evidence,

    "llm_assessment": llm_report
}


# ============================================================
# SAVE FINAL REPORT
# ============================================================

with open(
    OUTPUT_PATH,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        final_report,
        f,
        indent=4,
        ensure_ascii=False
    )


# ============================================================
# DISPLAY
# ============================================================

case = evidence.get("case", {})
ml = evidence.get("ml_prediction", {})

print("\n")
print("=" * 70)
print("NARCIS INVESTIGATION DECISION-SUPPORT REPORT")
print("GEMINI-POWERED PROTOTYPE")
print("=" * 70)

print("\nCASE")
print("-" * 70)

print(
    f"Drug       : {case.get('Drug_Type', 'Unknown')}"
)

print(
    f"Quantity   : {case.get('Quantity', 'Unknown')}"
)

print(
    f"Route      : "
    f"{case.get('Origin_State', 'Unknown')} "
    f"-> "
    f"{case.get('Destination_State', 'Unknown')}"
)

print("\nML PRIORITY")
print("-" * 70)

print(
    f"Prediction : {ml.get('prediction', 'Unknown')}"
)

probabilities = ml.get("probabilities", {})

for label in ["Low", "Medium", "High"]:

    if label in probabilities:

        print(
            f"  {label:<8}: "
            f"{probabilities[label] * 100:.2f}%"
        )


print("\nLLM EXECUTIVE ASSESSMENT")
print("-" * 70)

print(
    llm_report.get(
        "executive_assessment",
        "Not available"
    )
)


print("\nWHY THE MODEL PREDICTED THIS PRIORITY")
print("-" * 70)

for item in llm_report.get(
    "why_model_predicted_this_priority",
    []
):

    print(f"  - {item}")


print("\nHISTORICAL CASE ASSESSMENT")
print("-" * 70)

print(
    llm_report.get(
        "historical_case_assessment",
        "Not available"
    )
)


print("\nKNOWLEDGE ASSESSMENT")
print("-" * 70)

print(
    llm_report.get(
        "knowledge_assessment",
        "Not available"
    )
)


print("\nVERIFICATION REQUIRED")
print("-" * 70)

for item in llm_report.get(
    "verification_required",
    []
):

    print(f"  - {item}")


print("\nRECOMMENDED INVESTIGATIVE FOLLOW-UP")
print("-" * 70)

for item in llm_report.get(
    "recommended_investigative_follow_up",
    []
):

    print(f"  - {item}")


print("\nLIMITATIONS")
print("-" * 70)

for item in llm_report.get(
    "limitations",
    []
):

    print(f"  - {item}")


print("\n")
print("=" * 70)
print("LLM REPORT GENERATION COMPLETED")
print("=" * 70)

print("\nSaved to:")
print(OUTPUT_PATH)
