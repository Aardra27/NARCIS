"use client";

import { useState } from "react";
import styles from "./case-verification.module.css";

const workflow = [
  {
    number: "01",
    title: "Upload Document",
    description: "Upload the case document",
    status: "complete",
  },
  {
    number: "02",
    title: "Document Extraction",
    description: "Extract case information from uploaded document",
    status: "complete",
  },
  {
    number: "03",
    title: "Officer Verification",
    description: "Review and verify extracted information",
    status: "current",
  },
  {
    number: "04",
    title: "AI Analysis",
    description: "ML analysis + SHAP explainability + RAG intelligence",
    status: "next",
  },
  {
    number: "05",
    title: "Decision-Support Report",
    description: "Evidence package and LLM investigation report",
    status: "next",
  },
  {
    number: "06",
    title: "Officer Review",
    description: "Final officer review and case disposition",
    status: "next",
  },
];

type FieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  status?: "extracted" | "missing" | "added";
};

function Field({
  label,
  value,
  placeholder,
  status = "extracted",
}: FieldProps) {
  const [currentValue, setCurrentValue] = useState(value || "");

  return (
    <div className={styles.field}>
      <label>{label}</label>

      <input
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        placeholder={placeholder}
      />

      <span className={`${styles.fieldStatus} ${styles[status]}`}>
        {status === "extracted" && "● Extracted"}
        {status === "missing" && "● Missing"}
        {status === "added" && "● Added"}
      </span>
    </div>
  );
}

function WorkflowPanel() {
  return (
    <section className={styles.workflowCard}>
      <h2>NARCIS CASE WORKFLOW</h2>

      <div className={styles.workflow}>
        {workflow.map((step, index) => (
          <div className={styles.workflowStep} key={step.number}>
            <div className={styles.workflowMarker}>
              <div
                className={`${styles.stepNumber} ${
                  step.status === "complete"
                    ? styles.complete
                    : step.status === "current"
                    ? styles.current
                    : styles.next
                }`}
              >
                {step.status === "complete" ? "✓" : step.number}
              </div>

              {index !== workflow.length - 1 && (
                <div
                  className={`${styles.workflowLine} ${
                    index < 2 ? styles.completedLine : ""
                  }`}
                />
              )}
            </div>

            <div className={styles.stepText}>
              <div className={styles.stepTitle}>
                <strong>{step.title}</strong>

                {step.status === "complete" && (
                  <span className={styles.completeBadge}>COMPLETE</span>
                )}

                {step.status === "current" && (
                  <span className={styles.currentBadge}>CURRENT</span>
                )}

                {step.status === "next" && (
                  <span className={styles.nextBadge}>NEXT</span>
                )}
              </div>

              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CaseVerificationPage() {
  return (
    <div className={styles.page}>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className={styles.sidebar}>

        <div className={styles.logoArea}>
          <div className={styles.logoBox}>N</div>

          <div>
            <div className={styles.logoText}>NARCIS</div>
            <div className={styles.logoSubtitle}>
              Narcotics Analysis, Risk Classification
              <br />
              and Intelligent Support System
            </div>
          </div>
        </div>

        <div className={styles.sidebarDivider} />

        <nav className={styles.navigation}>
          <div className={styles.navItem}>
            <span>▦</span>
            Dashboard
          </div>

          <div className={`${styles.navItem} ${styles.active}`}>
            <span>＋</span>
            New Case
          </div>

          <div className={styles.navItem}>
            <span>□</span>
            Cases
          </div>

          <div className={styles.navItem}>
            <span>⌘</span>
            Intelligence
          </div>

          <div className={styles.navItem}>
            <span>▤</span>
            Reports
          </div>

          <div className={styles.navItem}>
            <span>◷</span>
            Case History
          </div>
        </nav>

        <div className={styles.sidebarDivider} />

        <nav className={styles.navigation}>
          <div className={styles.navItem}>
            <span>⚙</span>
            Settings
          </div>

          <div className={styles.navItem}>
            <span>?</span>
            Help &amp; Support
          </div>
        </nav>

        <div className={styles.sidebarBottom}>

          <div className={styles.officer}>
            <div className={styles.officerAvatar}>♟</div>

            <div>
              <strong>OFFICER</strong>
              <small>Authorized User</small>
            </div>
          </div>

          <div className={styles.secureSession}>
            <span>●</span>
            SECURE SESSION
          </div>

        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className={styles.main}>

        <header className={styles.header}>

          <div>
            <h1>CASE VERIFICATION</h1>

            <p>
              Review, verify and enrich the extracted case information.
            </p>

            <div className={styles.breadcrumb}>
              Dashboard
              <b>/</b>
              New Case
              <b>/</b>
              Document Extraction
              <b>/</b>
              <strong>Case Verification</strong>
            </div>
          </div>

          <div className={styles.headerRight}>

            <div className={styles.notification}>
              ♧
              <span>3</span>
            </div>

            <div className={styles.help}>?</div>

            <div className={styles.headerDivider} />

            <div className={styles.headerOfficer}>
              <div className={styles.headerAvatar}>♙</div>

              <div>
                <strong>Officer</strong>
                <small>
                  <i />
                  SECURE SESSION
                </small>
              </div>
            </div>

            <div className={styles.chevron}>⌄</div>

          </div>
        </header>

        <div className={styles.content}>

          {/* =================================================
              DOCUMENT STATUS
          ================================================= */}

          <section className={styles.documentBar}>

            <div className={styles.documentInfo}>
              <div className={styles.pdfIcon}>PDF</div>

              <div>
                <span>CASE DOCUMENT</span>
                <strong>case_report_2023.pdf</strong>
                <small>PDF Document • 4.8 MB</small>
              </div>
            </div>

            <div className={styles.statusItem}>
              <div className={styles.statusCircle}>✓</div>

              <div>
                <span>EXTRACTION STATUS</span>
                <strong>Extraction Complete</strong>
                <small>18 fields extracted</small>
              </div>
            </div>

            <div className={styles.statusItem}>
              <div className={styles.statusCircleOrange}>◷</div>

              <div>
                <span>VERIFICATION STATUS</span>
                <strong>Pending Officer Verification</strong>
                <small>Review extracted information</small>
              </div>
            </div>

          </section>

          {/* =================================================
              MAIN TWO COLUMN LAYOUT
          ================================================= */}

          <div className={styles.mainGrid}>

            <section className={styles.verificationCard}>

              <div className={styles.cardHeader}>
                <div>
                  <h2>VERIFIED CASE INFORMATION</h2>
                  <p>
                    Review and correct the information extracted from the
                    uploaded document.
                  </p>
                </div>

                <button className={styles.resetButton}>
                  ↶ Reset Changes
                </button>
              </div>

              <div className={styles.notice}>
                <div className={styles.noticeIcon}>i</div>

                <div>
                  <strong>Officer Verification Required</strong>
                  <p>
                    Verify all extracted information before continuing to
                    AI analysis.
                  </p>
                </div>
              </div>

              {/* CASE INFORMATION */}

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>CASE INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>

                  <Field
                    label="CASE ID"
                    value="NARCIS-025"
                  />

                  <Field
                    label="INVESTIGATION YEAR"
                    value="2023"
                  />

                  <Field
                    label="AGENCY"
                    value="NCB"
                  />

                  <Field
                    label="ZONAL UNIT"
                    value="Chandigarh Zonal Unit"
                  />

                </div>
              </section>

              {/* DRUG INFORMATION */}

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>DRUG INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>

                  <Field
                    label="DRUG TYPE"
                    value="Heroin"
                  />

                  <Field
                    label="QUANTITY"
                    value="20.326"
                  />

                  <Field
                    label="QUANTITY CATEGORY"
                    value="Commercial"
                  />

                  <Field
                    label="PURITY"
                    placeholder="Enter purity %"
                    status="missing"
                  />

                </div>
              </section>

              {/* INVESTIGATION */}

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>INVESTIGATION INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>

                  <Field
                    label="PERSONS ARRESTED"
                    value="20"
                  />

                  <Field
                    label="SOURCE TYPE"
                    value="Secret Information"
                  />

                  <Field
                    label="OPERATION TYPE"
                    value="International trafficking syndicate investigation and seizure"
                  />

                  <Field
                    label="CASE REFERENCE NO."
                    placeholder="Enter case reference"
                    status="missing"
                  />

                </div>
              </section>

              {/* ROUTE */}

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>ROUTE INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>

                  <Field
                    label="ORIGIN STATE"
                    value="Gujarat"
                  />

                  <Field
                    label="DESTINATION STATE"
                    value="Punjab"
                  />

                  <Field
                    label="TRANSPORT MODE"
                    value="Road"
                  />

                  <Field
                    label="ROUTE TYPE"
                    value="Interstate"
                  />

                </div>
              </section>

              {/* LEGAL */}

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>LEGAL INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>

                  <Field
                    label="APPLICABLE NDPS SECTIONS"
                    value="8(c), 21, 27A, 29"
                  />

                  <Field
                    label="OTHER LEGAL SECTIONS"
                    placeholder="Enter other sections"
                    status="added"
                  />

                  <Field
                    label="FIR NO."
                    placeholder="Enter FIR number"
                    status="missing"
                  />

                  <Field
                    label="FIR DATE"
                    placeholder="Select date"
                    status="missing"
                  />

                </div>
              </section>

              <button className={styles.addButton}>
                ＋ Add Additional Information
              </button>

            </section>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <aside className={styles.rightColumn}>

              <WorkflowPanel />

              <section className={styles.guidelineCard}>

                <h2>
                  <span>i</span>
                  VERIFICATION GUIDELINES
                </h2>

                <ul>
                  <li>Review each extracted field carefully</li>
                  <li>Correct inaccurate information</li>
                  <li>Enrich missing details wherever possible</li>
                  <li>All required fields must be completed</li>
                  <li>Changes are tracked for audit</li>
                </ul>

              </section>

              <section className={styles.legendCard}>

                <h2>FIELD STATUS LEGEND</h2>

                <div>
                  <i className={styles.blueDot} />
                  <b>Extracted</b>
                  <span>Auto extracted from document</span>
                </div>

                <div>
                  <i className={styles.orangeDot} />
                  <b>Edited</b>
                  <span>Modified by officer</span>
                </div>

                <div>
                  <i className={styles.greenDot} />
                  <b>Added</b>
                  <span>Added by officer</span>
                </div>

                <div>
                  <i className={styles.redDot} />
                  <b>Missing</b>
                  <span>Not found in document</span>
                </div>

              </section>

            </aside>

          </div>

          {/* =================================================
              BOTTOM ACTION BAR
          ================================================= */}

          <div className={styles.bottomBar}>

            <button className={styles.backButton}>
              ← BACK TO EXTRACTION
            </button>

            <div>

              <button className={styles.saveButton}>
                ▣ SAVE DRAFT
              </button>

              <button className={styles.continueButton}>
                CONTINUE TO ANALYSIS →
              </button>

            </div>

          </div>

        </div>
      </main>

      <footer className={styles.footer}>
        <strong>♧ NARCIS - Authorized Investigation Environment</strong>
        <span />
        All data is encrypted and access is monitored
        <span />
        Version 1.0.0
      </footer>

    </div>
  );
}
