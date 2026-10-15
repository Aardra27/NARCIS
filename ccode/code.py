from pathlib import Path
from html import escape
from datetime import datetime

# ============================================================
# NARCIS CONVERSATION CONTEXT
# Paste the consolidated conversation/project context here.
# ============================================================

context = r"""
NARCIS PROJECT - CONSOLIDATED GPT CONVERSATION CONTEXT

PROJECT
-------
NARCIS = Narcotics Analysis, Risk Classification and Intelligent Support System.

Purpose:
Initial investigation decision-support prototype.

Core workflow:

PDF
 ↓
Document Extraction
 ↓
Officer Verification / Enrichment
 ↓
Verified Case JSON
 ↓
ML + RAG + SHAP
 ↓
Evidence Package
 ↓
LLM Investigation Report
 ↓
Officer Review / Investigative Decision

IMPORTANT:
Verification happens BEFORE ML.
Unknown is a valid value when information is not established.
The officer retains final investigative judgment.

PROJECT PATH
------------
C:\Users\AARDRA\Downloads\NARCIS

PROJECT STRUCTURE
-----------------
agent/
importer/
knowledge_base/
ml/
rag/
llm/
output/
vector_db/
documents/
frontend/
backend/

KNOWLEDGE BASE
--------------
knowledge_base/
├── case_library/
├── drug_profiles/
├── embeddings/
├── legal/
├── sop/
├── trafficking_patterns/
└── vector_store/

CASE LIBRARY
------------
case001.json ... case010.json

DRUG PROFILES
-------------
Opium
Heroin
Ganja
Hashish / Charas
Cocaine
Mephedrone
Methamphetamine
Pseudoephedrine
Alprazolam
MDMA


CASE 001
--------
Investigation_Year: 2023
Agency: NCB
Drug_Type: Opium & Poppy Straw
NCB_Zonal_Unit: Indore Zonal Unit
Quantity: 10.286 Kg Opium; 7.220 Kg Poppy Straw
Persons_Arrested: 03
Source_Type: Secret Information
Applicable_NDPS_Sections: 8/15/18/25/27A/29
Quantity_Category:
Commercial (Opium); Above Small Quantity and Below Commercial Quantity (Poppy Straw)
Operation_Type: Seizure and follow-up recovery
Origin_State: Madhya Pradesh
Destination_State: Punjab
Vehicle_Type: Unknown
Transport_Mode: Road
Route_Type: Interstate
Interstate_Travel: Yes


CASE 002
--------
Investigation_Year: 2022
Agency: NCB
Drug_Type: Heroin
NCB_Zonal_Unit: Chandigarh Zonal Unit
Quantity: 20.326 Kg Heroin
Persons_Arrested: 20
Source_Type: Secret Information
Applicable_NDPS_Sections: 8(c), 21, 27A, 29
Quantity_Category: Commercial
Operation_Type:
International trafficking syndicate investigation and seizure
Origin_State: Gujarat
Destination_State: Punjab
Vehicle_Type: Unknown
Transport_Mode: Road
Route_Type: Interstate
Interstate_Travel: Yes

Verification:
_verified.verified = true
Method = Officer verification
Unknown field = Vehicle_Type


RAG / ML
--------
RAG rebuilt successfully with 10 cases.
FAISS shape = (10,384)

Index:
C:\Users\AARDRA\Downloads\NARCIS\vector_db\cases.index

Metadata stored in vector_db.

ML dataset:
Historical_Drug_Investigation_Dataset.csv

Rows: 10,000
Columns: 31
Target: Investigation_Priority

Priority distribution:
Medium = 4770
Low = 3947
High = 1283

All 10 drugs represented at approximately 1000 each.

Pseudoephedrine:
Quantity_Category = Not Applicable
Synthetic numeric quantity = 1000–100000g

MODEL
-----
RandomForest
200 trees
balanced
random_state = 42
Accuracy = 0.9590

Categorical encoders explicitly include:
Unknown

Unseen categorical fallback:
Unknown when available.

SHAP:
Local TreeExplainer works.


CASE 002 MODEL RESULT
---------------------
Prediction = High

Probabilities:
Low = 9%
Medium = 27%
High = 64%

Top SHAP factors:

1. Quantity_Category Commercial +0.1283
2. Previous_NDPS_FIRs Unknown +0.0821
3. Applicable_NDPS_Sections 8(c),21,27A,29 -0.0389
4. Total_Criminal_Cases Unknown +0.0310
5. Route_Type Interstate +0.0228
6. Previous_Seizure_Link Unknown +0.02125
7. Destination_City Unknown +0.011354
8. Interstate_Travel Yes +0.010202
9. Intelligence_Input Unknown +0.009533
10. Concealment_Method Unknown +0.008316

Evidence package:
output/prototype_evidence_package.json

LLM:
Gemini 3.6/3.7 Flash returned 503 high demand.
Gemini 3.5 Flash works.
API key works.
AFC warning is harmless.

Report:
output/final_investigation_report.json

Report UX caveat:
Unknown values can affect model output.
Unknown/missing information must NOT itself be represented as evidence of risk.
The UI should communicate model uncertainty appropriately.


FRONTEND
--------
Framework:
Next.js

Version:
Next.js 16.2.12
React 19.2.4
React DOM 19.2.4

Node:
v22.21.0

npm:
10.9.4

Scripts:
npm run dev
npm run build
npm run start
npm run lint

Next/Turbopack is used for realtime development.
Live Server extension is unnecessary.

Frontend structure:

frontend/src/app/favicon.ico
frontend/src/app/globals.css
frontend/src/app/layout.tsx
frontend/src/app/page.tsx

frontend/src/app/login/page.tsx
frontend/src/app/login/login.module.css

frontend/src/app/dashboard/page.tsx
frontend/src/app/dashboard/dashboard.module.css

frontend/src/app/new-case/page.tsx
frontend/src/app/new-case/new-case.module.css


DESIGN SYSTEM
-------------
Deep Navy: #0B1F3A
Professional Blue: #145DA0
Alert Red: #C6283D
White: #FFFFFF
Light Gray: #F5F7FA

Blue = intelligence / technology.
Red = controlled alert accent.

Logo:
Distinctive geometric interconnected/circuit-like NARCIS symbol.
Red central element.
Avoid generic police badges, guns, handcuffs, magnifying glasses, etc.

A transparent PNG version of the chosen NARCIS logo exists.


PAGE ORDER
----------
1. Intro
2. Secure Officer Login
3. Dashboard / NARCIS Command Center
4. New Case / Upload Document
5. Document Extraction
6. Officer Verification / Enrichment
7. AI Analysis
8. Risk Classification & SHAP Explainability
9. Historical Case Intelligence
10. Legal & SOP Intelligence
11. Decision-Support Investigation Report
12. Officer Review
13. Case History / Records

Supporting pages:
Cases
Intelligence
Reports
Settings
Help & Support


PAGE 1 - INTRO
--------------
Cinematic NARCIS opening.

Stages:
cinematicStage 0 → 7

Voice:
Google UK English Female

Speech:
1. Introducing Narcis.
2. Your AI-powered intelligence and investigation support system.
3. Full system name.

After final utterance:
intro-fade-out
then navigate to /login.

Pointer interaction unlocks speech synthesis.

Desired transition:
Clean fade.
No liquid transition.


PAGE 2 - LOGIN
--------------
Desired composition:
Centered overall layout.

NARCIS logo above.

NARCIS INTELLIGENCE SYSTEM
Large and one line.

SECURE INVESTIGATION ENVIRONMENT

Centered login panel.

SECURE ACCESS

OFFICER LOGIN
Large italic serif.

Description:
Authenticate to access the NARCIS investigation intelligence environment.

Description should remain one line on desktop if possible.

Use larger field labels, input text and button text.

Split-screen concept was considered but repeatedly rejected because it looked messy.
Do not reintroduce split-screen unless explicitly requested.

Authentication state:
visible
authenticating
authenticated
transitioning
officerId
password
error

Authentication:
POST http://127.0.0.1:8000/api/auth/login

Successful authentication:
setAuthenticated(true)

Current transition:
after approximately 350ms:
setTransitioning(true)

then navigation to:
window.location.href = "/dashboard"

Current login exit animation:
.transitioning {
  animation:
    loginExit
    850ms
    cubic-bezier(.65, 0, .35, 1)
    forwards;
  pointer-events: none;
}

@keyframes loginExit {
  0% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }

  55% {
    opacity: .65;
    transform: scale(1.006);
    filter: blur(1px);
  }

  100% {
    opacity: 0;
    transform: scale(1.012);
    filter: blur(3px);
  }
}

IMPORTANT CURRENT UX REQUEST:
After clicking Authenticate, the authentication/verification state should remain visible for longer.
The transition should feel smoother.
Dashboard should also fade in smoothly.
The verification state should not disappear too quickly.


LOGIN CORRUPTED CHARACTERS
--------------------------
Previously detected:

â— ONLINE
should be:
● ONLINE

Previously detected:
Â·Â·Â·
should be:
···
or …
for authentication loading.

Previously detected:
â†’
should be:
→

Previously detected:
âœ“
should be:
✓

Latest scan showed the main remaining corrupted string:
LINK STATUS <b>â— ONLINE</b>

login.module.css did not show corrupted characters in the latest scan.


PAGE 3 - DASHBOARD
------------------
Title:
NARCIS COMMAND CENTER

Subtitle:
Investigation intelligence overview and active case monitoring

Dashboard is already connected to backend data.

Current stats:

total_cases = 10
active_cases = 10
verified_cases = 1
pending_verification = 9
analyzed_cases = 1
high_priority = 1
medium_priority = 0
low_priority = 0
reports_generated = 1
analyzed_case_id = CASE002

Dashboard cards:
ACTIVE CASES = 10
HIGH PRIORITY = 1
PENDING VERIFICATION = 9
VERIFIED CASES = 1

Priority Overview:
This is the distribution of ANALYZED CASES.
It is NOT the probability distribution of the current case.

Current:
High = 100%
Medium = 0%
Low = 0%

Individual CASE002 probability belongs on the intelligence/risk page:
High = 64%
Medium = 27%
Low = 9%

This distinction was explicitly corrected.

Dashboard donut:
High = #ef3038
Medium = #216bc5
Low = #aeb9ca

Current screenshot:
Donut fully red.
Legend:
100%
0%
0%

Dashboard backend uses actual NARCIS case library and generated artifacts.

Do NOT use the abandoned SQLAlchemy Case table.
That table has 0 rows and is not the source of dashboard data.

Dashboard backend endpoints:
GET /api/dashboard/stats
GET /api/dashboard/analysis
GET /api/dashboard/recent-cases
GET /api/dashboard/activity

There is currently a redundant /analysis fetch in the dashboard frontend.
It can be cleaned later.


DASHBOARD BUTTON INTEGRATION
----------------------------
IMPORTANT USER REQUIREMENT:

Do NOT forget to connect all dashboard buttons/navigation later AFTER all pages have been created.

Buttons/navigation to eventually connect:
New Case
Cases
Intelligence
Reports
Case History
Settings
Relevant dashboard controls

Strategy:
Build pages one by one.
After page set exists, connect dashboard navigation comprehensively.


PAGE 4 - NEW CASE / UPLOAD DOCUMENT
-----------------------------------
This is a direct continuation of the Dashboard.

This point was explicitly emphasized by the user.

The page must preserve the Dashboard shell and visual language.
It should NOT look like a completely separate application.

Reference design:

Header:
NEW CASE

Subtitle:
Upload an investigation document to begin the NARCIS analysis workflow

Breadcrumb:
Dashboard / New Case / Upload Document

Main card:
UPLOAD INVESTIGATION DOCUMENT

Supporting text:
Upload the investigation document containing the case information.
NARCIS will extract relevant case details for officer verification.

Large upload area:
DRAG & DROP YOUR PDF HERE

or

Browse Files

Supported format: PDF
Maximum file size: 25 MB

Document processing information panel.

Right-side workflow:
NARCIS CASE WORKFLOW

01 Upload Document
CURRENT

02 Document Extraction
Extract case information from uploaded document

03 Officer Verification
Officer verifies and enriches extracted information

04 AI Analysis
ML analysis + SHAP explainability + RAG intelligence

05 Decision-Support Report
Evidence package and LLM investigation report

06 Officer Review
Final officer review and case disposition

Bottom action area:
CANCEL
CONTINUE TO EXTRACTION

Footer:
NARCIS - Authorized Investigation Environment
All data is encrypted and access is monitored
Version 1.0.0

Existing files:
frontend/src/app/new-case/page.tsx
frontend/src/app/new-case/new-case.module.css

Existing implementation is NOT considered final.
It needs visual refinement to accurately match the supplied reference and continue the Dashboard design.

The page currently has:
- NARCIS sidebar
- upload area
- PDF file input
- 25 MB UI limit
- document processing panel
- workflow
- Cancel
- Continue to Extraction

Backend connection is not completed yet.


PAGE 5 - DOCUMENT EXTRACTION
----------------------------
Reference design:

Header:
DOCUMENT EXTRACTION

Subtitle:
NARCIS is extracting structured case information from the uploaded investigation document.

Breadcrumb:
Dashboard / New Case / Upload Document / Extraction

Top status card:
CASE DOCUMENT
PDF file name
PDF Document
file size

EXTRACTION COMPLETE
Extracted just now

Main content:
Left:
SOURCE DOCUMENT
PDF preview area
page controls
zoom
page count
download

Right:
EXTRACTED CASE INFORMATION

Fields grouped by:
CASE INFORMATION
DRUG INFORMATION
INVESTIGATION INFORMATION
ROUTE INFORMATION
LEGAL INFORMATION

Example CASE002 extracted values:
Case ID: NARCIS-025
Investigation Year: 2023
Agency: NCB
Zonal Unit: Chandigarh Zonal Unit
Drug Type: Heroin
Quantity: 20.326 Kg
Quantity Category: Commercial
Persons Arrested: 20
Source Type: Secret Information
Operation Type:
International trafficking syndicate investigation and seizure
Origin State: Gujarat
Destination State: Punjab
Transport Mode: Road
Route Type: Interstate
Interstate Travel: Yes
Applicable NDPS Sections:
8(c), 21, 27A, 29
Vehicle Type: Unknown
Not found in document.

Bottom information:
OFFICER VERIFICATION REQUIRED

The officer must review, correct and enrich before NARCIS performs AI analysis.

Right workflow:
01 Upload Document - COMPLETE
02 Document Extraction - CURRENT
03 Officer Verification - NEXT
04 AI Analysis
05 Decision-Support Report
06 Officer Review

Bottom:
BACK
CONTINUE TO VERIFICATION


PAGE 6 - OFFICER VERIFICATION / ENRICHMENT
-------------------------------------------
Reference design supplied by user.

Header:
OFFICER VERIFICATION / ENRICHMENT

Subtitle:
Review, verify, correct, and enrich the extracted case information before analysis.

Breadcrumb:
Dashboard / New Case / Upload Document / Extraction / Verification

Top status:
CASE DOCUMENT
EXTRACTION STATUS = Extraction Complete
VERIFICATION STATUS = Pending Officer Verification

Main:
VERIFIED CASE INFORMATION

Instruction:
Review all extracted fields carefully.
Correct inaccurate information.
Enrich missing details.
The verified information will be used for AI analysis.

Sections:
CASE INFORMATION
DRUG INFORMATION
INVESTIGATION INFORMATION
ROUTE INFORMATION
LEGAL INFORMATION

Fields can have statuses:
Extracted
Edited
Added
Missing

Example:
CASE ID: NARCIS-025
INVESTIGATION YEAR: 2023
AGENCY: NCB
ZONAL UNIT: Chandigarh Zonal Unit
DRUG TYPE: Heroin
QUANTITY: 20.326 Kg
QUANTITY CATEGORY: Commercial
PERSONS ARRESTED: 20
SOURCE TYPE: Secret Information
OPERATION TYPE:
International trafficking syndicate investigation and seizure
ORIGIN STATE: Gujarat
DESTINATION STATE: Punjab
TRANSPORT MODE: Road
ROUTE TYPE: Interstate
INTERSTATE TRAVEL: Yes
APPLICABLE NDPS SECTIONS:
8(c), 21, 27A, 29

Missing example:
Purity (if known)
Case Reference No.
FIR No.
FIR Date

Right workflow:
01 Upload Document COMPLETE
02 Document Extraction COMPLETE
03 Officer Verification CURRENT
04 AI Analysis NEXT
05 Decision-Support Report
06 Officer Review

Guidelines:
Review each extracted field carefully.
Correct inaccurate information.
Enrich missing details wherever possible.
All * marked fields are mandatory.
Changes tracked for audit.

Bottom:
BACK TO EXTRACTION
SAVE DRAFT
CONTINUE TO ANALYSIS


PAGE 7 - AI CASE ANALYSIS
-------------------------
Reference supplied by user.

Header:
AI CASE ANALYSIS

Subtitle:
NARCIS is analyzing the verified case using machine learning, explainable AI, and historical intelligence.

Main verified case summary:
CASE ID
DRUG
QUANTITY
ROUTE
VERIFICATION STATUS = Officer Verified

NARCIS INTELLIGENCE ENGINE:
ML PRIORITY MODEL
SHAP EXPLAINABILITY
HISTORICAL CASE INTELLIGENCE
DOMAIN KNOWLEDGE

Analysis Engine:
Engine Status = Operational
Model = Random Forest Classifier
Explainability = SHAP TreeExplainer
Historical Intelligence = RAG Retrieval
Knowledge Sources = Drug Profile, NDPS Sections, SOP, Trafficking Patterns

Verified Inputs:
Drug Type
Quantity
Quantity Category
Source Type
Transport Mode
Route Type
Interstate Travel
Previous NDPS FIRs
Total Criminal Cases

Pipeline:
01 Verified Case Loaded - COMPLETE
02 ML Priority Prediction - ANALYZING
03 SHAP Explanation - QUEUED
04 Historical Case Retrieval - QUEUED
05 Domain Knowledge Retrieval - QUEUED
06 Evidence Package - PENDING

Right information panel:
NARCIS IS ANALYZING THE VERIFIED CASE

AI provides decision support.
Officer retains investigative judgment.

Bottom:
BACK TO VERIFICATION
ANALYSIS IN PROGRESS...


PAGE 8 - RISK CLASSIFICATION & SHAP
-----------------------------------
Reference supplied by user.

Header:
RISK CLASSIFICATION & SHAP EXPLAINABILITY

Subtitle:
ML prediction results with explainable AI insights for the verified case.

Risk Score:
0.82
High Risk
Model confidence: 82%

Global SHAP:
Quantity (kg) +0.42
Quantity Category +0.18
Interstate Travel +0.11
Source Type +0.09
Route Type +0.06
Previous NDPS FIRs +0.03
Total Criminal Cases +0.02
Transport Mode +0.01

Top Risk Drivers:
1. Large quantity of narcotics +0.42
2. Quantity category - Commercial +0.18
3. Interstate travel pattern +0.11
4. Source type - Secret Information +0.09
5. Interstate route type +0.06

Local SHAP explanation displayed separately.

Probability distribution:
High Risk = 82%
Medium Risk = 15%
Low Risk = 3%

Risk Summary:
Risk Level = HIGH
Risk Score = 0.82 / 1.00
Model Confidence = 82%
Prediction = High Priority Investigation

Recommendation:
Proceed with detailed investigation and intelligence gathering.

AI disclaimer:
AI provides decision support.
Officer retains full investigative authority and decision-making responsibility.


PAGE 9 - HISTORICAL CASE INTELLIGENCE
-------------------------------------
Reference supplied by user.

Header:
HISTORICAL CASE INTELLIGENCE

Subtitle:
Similar past cases retrieved using AI-powered semantic search and pattern matching.

Current Case:
NARCIS-025
Heroin
20.326 Kg
Gujarat → Punjab
Officer Verified

Similar cases:
NARCIS-078
Heroin
18.750 Kg
Gujarat → Punjab
Secret Information
Similarity = 0.92
Pattern Match = 92%

NARCIS-062
Heroin
15.300 Kg
Gujarat → Haryana → Punjab
Secret Information
Similarity = 0.81

NARCIS-041
Heroin
12.500 Kg
Rajasthan → Punjab
Secret Information
Similarity = 0.71

NARCIS-033
Charas
25.200 Kg
Himachal Pradesh → Punjab
Secret Information
Similarity = 0.42

NARCIS-015
Cocaine
5.600 Kg
Goa → Maharashtra
Intelligence Input
Similarity = 0.28

Filters:
Similarity Threshold
Drug Type
Route Match
Apply Filters

Bottom:
BACK TO RISK & SHAP
VIEW LEGAL & SOP INTELLIGENCE


PAGE 10 - LEGAL & SOP INTELLIGENCE
----------------------------------
Planned page.

Purpose:
Retrieve relevant legal provisions, NDPS sections, SOP guidance, trafficking patterns and domain knowledge.

Should follow the same NARCIS workflow shell.

AI/RAG information must be clearly distinguished from official legal authority.


PAGE 11 - DECISION-SUPPORT REPORT
----------------------------------
Planned page.

Purpose:
Present evidence package and LLM-generated investigation report.

Should include:
Case summary
Verified facts
ML prediction
Model probability
SHAP factors
Historical intelligence
Legal/SOP intelligence
Investigation recommendations
Uncertainty / limitations
AI disclaimer

The report should be evidence-supported.
Officer remains final decision-maker.


PAGE 12 - OFFICER REVIEW
------------------------
Planned page.

Purpose:
Final officer review of NARCIS outputs.

Should NOT force the officer to fill every previously missing field.

Officer reviews:
Verified case
Risk classification
SHAP explanation
Historical intelligence
Legal/SOP information
Decision-support report

Officer makes final investigative decision/disposition.


PAGE 13 - CASE HISTORY / RECORDS
---------------------------------
Planned supporting page.

Purpose:
View prior NARCIS investigations and their processing states.

Should connect to the actual case library.


BACKEND
=======

Structure:

backend/
├── main.py
├── auth/
│   ├── authentication.py
│   └── security.py
├── database/
│   ├── database.py
│   └── models.py
└── api/
    ├── auth.py
    └── dashboard.py

Python venv:
C:\Users\AARDRA\Downloads\NARCIS\backend\.venv

Installed requirements:
fastapi
uvicorn[standard]
sqlalchemy
pydantic
passlib[bcrypt]
python-multipart

bcrypt:
4.0.1


AUTHENTICATION
==============

No public signup.
Admin creates officer accounts.

SQLite prototype.

Officer table:
id
officer_id
password_hash
name
role
status
created_at
last_login

Roles:
Officer
Senior Officer / Supervisor
Admin

Never store plaintext passwords.

Test officer:
Officer ID = NARCIS-001
Password = Narcis@123
Name = NARCIS Test Officer
Role = Officer
Status = Active

Backend:
http://127.0.0.1:8000

Health:
GET /api/health
returns:
{"status":"healthy"}

Valid login:
200

Invalid password:
401


CORS
----
Allowed:
http://localhost:3000
http://127.0.0.1:3000


DASHBOARD BACKEND
=================

backend/api/dashboard.py reads:
knowledge_base/case_library/case001.json
through
case010.json

Reads:
_verification

Endpoints:
 /stats
 /analysis
 /recent-cases
 /activity

Stats:
total_cases = 10
active_cases = 10
verified_cases = 1
pending_verification = 9
analyzed_cases = 1
high_priority = 1
medium_priority = 0
low_priority = 0
reports_generated = 1
analyzed_case_id = CASE002

Analysis:
available = true
case = CASE002
prediction = High
probabilities:
Low = 0.09
Medium = 0.27
High = 0.64

SHAP factors present.
Historical cases currently empty in backend response.
Knowledge sources currently empty in backend response.


BACKUPS
=======

User preference:
Do NOT create a backup for every incremental frontend change.

Existing clean dashboard backup:
C:\Users\AARDRA\Downloads\NARCIS\frontend_backup_DASHBOARD_CLEAN_2026-09-07_15-54-25

Contains:
src\app\dashboard\page.tsx
src\app\dashboard\dashboard.module.css
public\narcis-logo.png

Working intro backups also exist.

Only create new backups when explicitly requested.


TERMINAL WORKFLOW
=================

User works primarily through PowerShell.

Important:
Avoid PowerShell if/else blocks pasted separately.
Use one self-contained block.

Prefer:
- direct commands
- temporary Python patch scripts
- absolute paths
- Select-String for verification
- Get-Content for inspection

Absolute frontend root:
C:\Users\AARDRA\Downloads\NARCIS\frontend

Absolute backend Python:
C:\Users\AARDRA\Downloads\NARCIS\backend\.venv\Scripts\python.exe

After TSX changes:
npx tsc --noEmit

For visual testing:
npm run dev

Never print a success message without verifying the file actually changed.


CURRENT DEVELOPMENT STRATEGY
============================

Build each page one by one.

Do NOT try to build every page in one huge edit.

Current order:
Dashboard
 ↓
New Case / Upload Document
 ↓
Document Extraction
 ↓
Officer Verification
 ↓
AI Analysis
 ↓
Risk + SHAP
 ↓
Historical Intelligence
 ↓
Legal & SOP
 ↓
Investigation Report
 ↓
Officer Review

After all pages are created:
Connect all Dashboard buttons and workflow navigation.

The New Case page must look like a continuation of the Dashboard.

Smooth transitions are important:
Intro → Login
Login authentication state → Dashboard
Each workflow page should feel like the same application rather than disconnected pages.


CURRENT IMMEDIATE TASK
======================

The next actual development task is to refine/create the New Case page accurately from the supplied reference image.

It must:
- continue Dashboard styling
- use the same sidebar
- use the same header treatment
- use the same typography
- use the same cards/borders/shadows
- use the same footer
- show New Case / Upload Document as workflow step 01
- support PDF upload UI
- lead to Document Extraction
- remain visually consistent with Dashboard

Do not forget:
Dashboard buttons will be connected later after all pages have been made.


REFERENCE IMAGES PROVIDED
=========================

User supplied visual references for:
1. Dashboard / NARCIS Command Center
2. New Case / Upload Investigation Document
3. Document Extraction
4. Officer Verification / Enrichment
5. AI Case Analysis
6. Risk Classification & SHAP Explainability
7. Historical Case Intelligence

The supplied images are the visual source of truth for page layout and continuity.


KEY USER PREFERENCES
====================

- Build incrementally.
- One page at a time.
- Preserve existing folder structure.
- Do not randomly redesign working pages.
- Use terminal-first workflow.
- Provide complete commands when modifying files.
- Prefer absolute Windows paths.
- Verify modifications.
- Do not create backups unless requested.
- Dashboard navigation must eventually be fully connected.
- New Case must be a continuation of Dashboard.
- Smooth transitions matter.
- Authentication verification state should remain visible longer.
- Avoid corrupted Unicode characters.
- Keep AI decision-support framing responsible.
- Unknown is a valid field value.
- Do not represent missing information itself as suspicious evidence.
"""

# ============================================================
# GENERATE HTML
# ============================================================

timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>NARCIS - GPT Conversation Context</title>

<style>
:root {{
    --navy: #0B1F3A;
    --blue: #145DA0;
    --red: #C6283D;
    --bg: #F5F7FA;
    --white: #FFFFFF;
    --text: #17243A;
    --muted: #64748B;
    --border: #DCE3ED;
}}

* {{
    box-sizing: border-box;
}}

body {{
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: Arial, Helvetica, sans-serif;
}}

header {{
    background:
        linear-gradient(135deg, #07182d, #0B1F3A 60%, #145DA0);
    color: white;
    padding: 42px 7vw;
    border-bottom: 5px solid var(--red);
}}

header h1 {{
    margin: 0 0 8px;
    font-size: 34px;
    letter-spacing: .04em;
}}

header p {{
    margin: 0;
    opacity: .85;
    font-size: 16px;
}}

main {{
    width: min(1250px, 92vw);
    margin: 30px auto 60px;
}}

.info {{
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 22px;
    margin-bottom: 22px;
    color: var(--muted);
    font-size: 14px;
}}

pre {{
    margin: 0;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 32px;
    white-space: pre-wrap;
    overflow-x: auto;
    word-wrap: break-word;
    font-family:
        "Cascadia Code",
        "SFMono-Regular",
        Consolas,
        monospace;
    font-size: 13px;
    line-height: 1.65;
    box-shadow: 0 8px 30px rgba(11,31,58,.07);
}}

footer {{
    background: var(--navy);
    color: white;
    text-align: center;
    padding: 22px;
    font-size: 13px;
}}
</style>
</head>

<body>

<header>
    <h1>NARCIS</h1>
    <p>Consolidated GPT Conversation Context</p>
</header>

<main>

<div class="info">
    <strong>Generated:</strong> {timestamp}<br>
    This document preserves the consolidated NARCIS project context,
    architecture, workflow, UI requirements, backend state, ML state,
    and development decisions from the conversation.
</div>

<pre>{escape(context.strip())}</pre>

</main>

<footer>
    NARCIS - Authorized Investigation Environment
</footer>

</body>
</html>
"""

# Save HTML file
output_file = Path("NARCIS_conversation_context.html")
output_file.write_text(html, encoding="utf-8")

print("HTML file created successfully:")
print(output_file.resolve())