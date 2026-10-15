"use client";

import { useMemo, useState } from "react";
import styles from "./case-verification.module.css";

type CaseData = {
  caseId: string;
  investigationYear: string;
  agency: string;
  zonalUnit: string;
  drugType: string;
  quantity: string;
  quantityCategory: string;
  personsArrested: string;
  location: string;
  incidentDate: string;
  sourceDocument: string;
  intelligenceSummary: string;
};

const initialData: CaseData = {
  caseId: "CASE-01",
  investigationYear: "2023",
  agency: "Narcotics Control Bureau",
  zonalUnit: "Indore Zonal Unit",
  drugType: "Opium & Poppy Straw",
  quantity: "10.286 Kg Opium; 7.220 Kg Poppy Straw",
  quantityCategory: "Opium / Poppy Straw",
  personsArrested: "03",
  location: "Mandsaur, Madhya Pradesh",
  incidentDate: "21.01.2023",
  sourceDocument: "Case_01_Opium_Poppy_Straw.pdf",
  intelligenceSummary:
    "Three persons were reported in connection with the seizure of illicit Opium and Poppy Straw at Mandsaur, Madhya Pradesh."
};

export default function CaseVerificationPage() {

  const [data, setData] = useState<CaseData>(initialData);
  const [saved, setSaved] = useState(false);

  const updateField = (field: keyof CaseData, value: string) => {
    setData((current) => ({
      ...current,
      [field]: value
    }));

    setSaved(false);
  };

  const fieldCount = useMemo(
    () => Object.values(data).filter((value) => value.trim() !== "").length,
    [data]
  );

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <div className={styles.page}>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className={styles.sidebar}>

        <div className={styles.sidebarBrand}>
          <div className={styles.logoArea}>
            <img
              src="/narcis-logo.png"
              alt="NARCIS"
              className={styles.logo}
            />
            <span>NARCIS</span>
          </div>

          <p>
            Narcotics Analysis, Risk Classification
            <br />
            and Intelligent Support System
          </p>
        </div>

        <nav className={styles.navigation}>

          <button
            className={styles.navItem}
            type="button"
            onClick={() => router.push("/dashboard")}
          >
            <span className={styles.navIcon}>▦</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`${styles.navItem} ${styles.navActive}`}
            type="button"
            onClick={() => router.push("/new-case")}
          >
            <span className={styles.navIcon}>+</span>
            <span>New Case</span>
          </button>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>□</span>
            <span>Cases</span>
          </button>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>⌘</span>
            <span>Intelligence</span>
          </button>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>▤</span>
            <span>Reports</span>
          </button>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>◷</span>
            <span>Case History</span>
          </button>

        </nav>

        <div className={styles.sidebarDivider} />

        <nav className={styles.navigation}>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>⚙</span>
            <span>Settings</span>
          </button>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>?</span>
            <span>Help &amp; Support</span>
          </button>

        </nav>

        <div className={styles.sidebarOfficer}>
          <div className={styles.officerAvatar}>
            <span>♟</span>
          </div>

          <div>
            <strong>OFFICER</strong>
            <small>Authorized User</small>
          </div>
        </div>

        <div className={styles.secureSession}>
          <span className={styles.sessionShield}>♙</span>
          <span className={styles.sessionDot} />
          SECURE SESSION
        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className={styles.main}>

        {/* HEADER */}

        <header className={styles.header}>

          <div className={styles.headerLeft}>

            <h1>OFFICER VERIFICATION / ENRICHMENT</h1>

            <p>
              Review, verify, correct, and enrich the extracted case
              information before analysis.
            </p>

            <div className={styles.breadcrumbs}>
              <span>Dashboard</span>
              <span>/</span>
              <span>New Case</span>
              <span>/</span>
              <span>Upload Document</span>
              <span>/</span>
              <strong>Verification</strong>
            </div>

          </div>

          <div className={styles.headerRight}>

            <span className={styles.helpIcon}>?</span>

            <span className={styles.notification}>
              ♟
              <b>3</b>
            </span>

            <div className={styles.headerDivider}></div>

            <div className={styles.headerOfficer}>
              <div className={styles.headerAvatar}>•</div>

              <div>
                <strong>Officer</strong>
                <small>
                  <span className={styles.secureDot}></span>
                  SECURE SESSION
                </small>
              </div>
            </div>

            <span className={styles.headerChevron}>▼</span>

          </div>

        </header>


        {/* =====================================================
            DOCUMENT SUMMARY CARD
            ===================================================== */}

        <section className={styles.documentCard}>

          <div className={styles.documentIcon}>
            PDF
          </div>

          <div className={styles.documentInfo}>

            <div className={styles.eyebrow}>
              CASE DOCUMENT
            </div>

            <h2>
              {data.sourceDocument}
            </h2>

            <p>
              PDF Document · Extracted case information available for verification
            </p>

          </div>

          <div className={styles.extractionStatus}>

            <div className={styles.statusCheck}>
              ✓
            </div>

            <div>
              <strong>EXTRACTION COMPLETE</strong>
              <small>Ready for officer verification</small>
            </div>

          </div>

        </section>


        {/* =====================================================
            CONTENT GRID
            ===================================================== */}

        <div className={styles.contentGrid}>


          {/* ===================================================
              VERIFICATION FORM
              =================================================== */}

          <section className={styles.verificationCard}>

            <div className={styles.cardHeader}>

              <div>
                <div className={styles.eyebrow}>
                  VERIFIED CASE INFORMATION
                </div>

                <h2>Review & Enrich</h2>

                <p>
                  Correct inaccurate values and complete missing details.
                </p>
              </div>

              <div className={styles.legend}>

                <span>
                  <i className={styles.dotExtracted}></i>
                  Extracted
                </span>

                <span>
                  <i className={styles.dotAdded}></i>
                  Added
                </span>

                <span>
                  <i className={styles.dotMissing}></i>
                  Missing
                </span>

              </div>

            </div>


            {/* CASE INFORMATION */}

            <div className={styles.formSection}>

              <div className={styles.sectionTitle}>
                <span>CASE INFORMATION</span>
                <span>−</span>
              </div>

              <div className={styles.fieldGrid}>

                <EditableField
                  label="CASE ID"
                  value={data.caseId}
                  status="EXTRACTED"
                  onChange={(value) => updateField("caseId", value)}
                />

                <EditableField
                  label="INVESTIGATION YEAR"
                  value={data.investigationYear}
                  status="EXTRACTED"
                  onChange={(value) => updateField("investigationYear", value)}
                />

                <EditableField
                  label="AGENCY"
                  value={data.agency}
                  status="EXTRACTED"
                  onChange={(value) => updateField("agency", value)}
                />

                <EditableField
                  label="ZONAL UNIT"
                  value={data.zonalUnit}
                  status="EXTRACTED"
                  onChange={(value) => updateField("zonalUnit", value)}
                />

              </div>

            </div>


            {/* DRUG INFORMATION */}

            <div className={styles.formSection}>

              <div className={styles.sectionTitle}>
                <span>DRUG INFORMATION</span>
                <span>−</span>
              </div>

              <div className={styles.fieldGrid}>

                <EditableField
                  label="DRUG TYPE"
                  value={data.drugType}
                  status="EXTRACTED"
                  onChange={(value) => updateField("drugType", value)}
                />

                <EditableField
                  label="QUANTITY"
                  value={data.quantity}
                  status="EXTRACTED"
                  onChange={(value) => updateField("quantity", value)}
                />

                <EditableField
                  label="QUANTITY CATEGORY"
                  value={data.quantityCategory}
                  status="ADDED"
                  onChange={(value) => updateField("quantityCategory", value)}
                />

                <EditableField
                  label="PERSONS ARRESTED"
                  value={data.personsArrested}
                  status="EXTRACTED"
                  onChange={(value) => updateField("personsArrested", value)}
                />

              </div>

            </div>


            {/* INVESTIGATION INFORMATION */}

            <div className={styles.formSection}>

              <div className={styles.sectionTitle}>
                <span>INVESTIGATION INFORMATION</span>
                <span>−</span>
              </div>

              <div className={styles.fieldGrid}>

                <EditableField
                  label="LOCATION"
                  value={data.location}
                  status="EXTRACTED"
                  onChange={(value) => updateField("location", value)}
                />

                <EditableField
                  label="INCIDENT DATE"
                  value={data.incidentDate}
                  status="EXTRACTED"
                  onChange={(value) => updateField("incidentDate", value)}
                />

              </div>

              <div className={styles.fullField}>

                <label>
                  INTELLIGENCE SUMMARY
                  <span className={styles.statusBadgeAdded}>ADDED</span>
                </label>

                <textarea
                  value={data.intelligenceSummary}
                  onChange={(event) =>
                    updateField("intelligenceSummary", event.target.value)
                  }
                />

              </div>

            </div>


            {/* ACTION BAR */}

            <div className={styles.formActions}>

              <div className={styles.fieldCount}>
                {fieldCount} fields populated
              </div>

              <div className={styles.actionButtons}>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setData(initialData)}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSave}
                >
                  ✓ Save Verification
                </button>

              </div>

            </div>

            {saved && (
              <div className={styles.savedMessage}>
                Verification data saved successfully.
              </div>
            )}

          </section>


          {/* ===================================================
              WORKFLOW
              =================================================== */}

          <aside className={styles.workflowCard}>

            <div className={styles.workflowHeader}>

              <div className={styles.eyebrow}>
                NARCIS CASE WORKFLOW
              </div>

              <h2>Case Processing Stages</h2>

              <p>Track the current case processing stage.</p>

            </div>


            <WorkflowStep
              number="✓"
              title="Upload Document"
              description="Upload the investigation document"
              state="complete"
            />

            <WorkflowStep
              number="✓"
              title="Document Extraction"
              description="Information extracted from uploaded document"
              state="complete"
            />

            <WorkflowStep
              number="03"
              title="Officer Verification"
              description="Officer verifies and enriches extracted information"
              state="current"
            />

            <WorkflowStep
              number="04"
              title="AI Analysis"
              description="ML analysis + SHAP explainability + RAG intelligence"
              state="pending"
            />

            <WorkflowStep
              number="05"
              title="Decision-Support Report"
              description="Evidence package and investigation report"
              state="pending"
              last
            />

          </aside>

        </div>

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className={styles.footer}>

        <span>♢</span>

        <strong>NARCIS - Authorized Investigation Environment</strong>

        <i></i>

        <span>All data is encrypted and access is monitored</span>

        <i></i>

        <span>Version 1.0.0</span>

      </footer>


      {/* =====================================================
          SCROLL TOP
          ===================================================== */}

      <button
        type="button"
        className={styles.scrollTopButton}
        onClick={() => {
          const main = document.querySelector("main");
          if (main) {
            main.scrollTo({
              top: 0,
              behavior: "smooth"
            });
          }
        }}
        aria-label="Scroll to top"
      >
        ↑
      </button>

    </div>
  );
}


/* ============================================================
   EDITABLE FIELD
   ============================================================ */

function EditableField({
  label,
  value,
  status,
  onChange
}: {
  label: string;
  value: string;
  status: "EXTRACTED" | "ADDED" | "MISSING";
  onChange: (value: string) => void;
}) {

  return (
    <div className={styles.field}>

      <label>

        <span>{label}</span>

        {status === "EXTRACTED" && (
          <span className={styles.statusBadgeExtracted}>
            EXTRACTED
          </span>
        )}

        {status === "ADDED" && (
          <span className={styles.statusBadgeAdded}>
            ADDED
          </span>
        )}

        {status === "MISSING" && (
          <span className={styles.statusBadgeMissing}>
            MISSING
          </span>
        )}

      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

    </div>
  );
}


/* ============================================================
   WORKFLOW STEP
   ============================================================ */

function WorkflowStep({
  number,
  title,
  description,
  state,
  last = false
}: {
  number: string;
  title: string;
  description: string;
  state: "complete" | "current" | "pending";
  last?: boolean;
}) {

  return (
    <div className={`${styles.workflowStep} ${last ? styles.workflowLast : ""}`}>

      <div
        className={`
          ${styles.workflowCircle}
          ${state === "complete" ? styles.workflowComplete : ""}
          ${state === "current" ? styles.workflowCurrent : ""}
          ${state === "pending" ? styles.workflowPending : ""}
        `}
      >
        {number}
      </div>

      <div className={styles.workflowLine}></div>

      <div className={styles.workflowText}>

        <div className={styles.workflowTitleRow}>

          <strong>{title}</strong>

          {state === "complete" && (
            <span className={styles.completeBadge}>
              COMPLETE
            </span>
          )}

          {state === "current" && (
            <span className={styles.currentBadge}>
              CURRENT
            </span>
          )}

        </div>

        <p>{description}</p>

      </div>

    </div>
  );
}