"use client";

import { useState } from "react";
import styles from "./case-verification.module.css";

const workflow = [
  {
    number: "01",
    title: "Upload Document",
    description: "",
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

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoMark}>
          <span>N</span>
        </div>

        <div>
          <div className={styles.brandName}>NARCIS</div>
          <div className={styles.brandSubtitle}>
            Narcotics Analysis, Risk Classification
            <br />
            and Intelligent Support System
          </div>
        </div>
      </div>

      <div className={styles.sidebarLine} />

      <nav className={styles.nav}>
        <div className={styles.navItem}>
          <span className={styles.navIcon}>▦</span>
          <span>Dashboard</span>
        </div>

        <div className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.navIcon}>＋</span>
          <span>New Case</span>
        </div>

        <div className={styles.navItem}>
          <span className={styles.navIcon}>□</span>
          <span>Cases</span>
        </div>

        <div className={styles.navItem}>
          <span className={styles.navIcon}>⌘</span>
          <span>Intelligence</span>
        </div>

        <div className={styles.navItem}>
          <span className={styles.navIcon}>▤</span>
          <span>Reports</span>
        </div>

        <div className={styles.navItem}>
          <span className={styles.navIcon}>◷</span>
          <span>Case History</span>
        </div>
      </nav>

      <div className={styles.sidebarLine} />

      <nav className={styles.nav}>
        <div className={styles.navItem}>
          <span className={styles.navIcon}>⚙</span>
          <span>Settings</span>
        </div>

        <div className={styles.navItem}>
          <span className={styles.navIcon}>?</span>
          <span>Help &amp; Support</span>
        </div>
      </nav>

      <div className={styles.sidebarBottom}>
        <div className={styles.officer}>
          <div className={styles.officerIcon}>♟</div>
          <div>
            <strong>OFFICER</strong>
            <span>Authorized User</span>
          </div>
        </div>

        <div className={styles.secureSession}>
          <span className={styles.lock}>●</span>
          <span>SECURE SESSION</span>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className={styles.header}>
      <div>
        <h1>OFFICER VERIFICATION / ENRICHMENT</h1>
        <p>
          Review, verify, correct, and enrich the extracted case information
          before analysis.
        </p>

        <div className={styles.breadcrumbs}>
          <span>Dashboard</span>
          <b>/</b>
          <span>New Case</span>
          <b>/</b>
          <span>Upload Document</span>
          <b>/</b>
          <span>Extraction</span>
          <b>/</b>
          <strong>Verification</strong>
        </div>
      </div>

      <div className={styles.headerActions}>
        <div className={styles.bell}>
          ♧
          <span>3</span>
        </div>

        <div className={styles.help}>?</div>

        <div className={styles.headerDivider} />

        <div className={styles.headerOfficer}>
          <div className={styles.headerAvatar}>♙</div>
          <div>
            <strong>Officer</strong>
            <span>
              <i />
              SECURE SESSION
            </span>
          </div>
        </div>

        <div className={styles.chevron}>⌄</div>
      </div>
    </header>
  );
}

function Workflow() {
  return (
    <section className={styles.workflowCard}>
      <h2>NARCIS CASE WORKFLOW</h2>

      <div className={styles.workflow}>
        {workflow.map((step, index) => (
          <div className={styles.workflowStep} key={step.number}>
            <div className={styles.workflowLeft}>
              <div
                className={`${styles.stepCircle} ${
                  step.status === "complete"
                    ? styles.completeCircle
                    : step.status === "current"
                    ? styles.currentCircle
                    : styles.nextCircle
                }`}
              >
                {step.status === "complete" ? "✓" : step.number}
              </div>

              {index < workflow.length - 1 && (
                <div
                  className={`${styles.workflowLine} ${
                    index < 2 ? styles.completedLine : ""
                  }`}
                />
              )}
            </div>

            <div className={styles.stepContent}>
              <div className={styles.stepTitleRow}>
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

              {step.description && (
                <p>{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  value: string;
  required?: boolean;
  status?: "extracted" | "missing" | "added";
  placeholder?: string;
};

function Field({
  label,
  value,
  required,
  status = "extracted",
  placeholder,
}: FieldProps) {
  return (
    <div className={styles.field}>
      <label>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>

      <div
        className={`${styles.input} ${
          status === "missing" ? styles.missingInput : ""
        }`}
      >
        {value || (
          <span className={styles.placeholder}>
            {placeholder || "Enter information"}
          </span>
        )}
      </div>

      <div className={`${styles.fieldStatus} ${styles[status]}`}>
        <span>
          {status === "extracted"
            ? "●"
            : status === "added"
            ? "●"
            : "●"}
        </span>

        {status === "extracted"
          ? "Extracted"
          : status === "added"
          ? "Added"
          : "Missing"}
      </div>
    </div>
  );
}

function VerificationSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.formSection}>
      <div className={styles.sectionTitle}>
        <strong>{title}</strong>
        <span>⌃</span>
      </div>

      <div className={styles.fieldsGrid}>{children}</div>
    </section>
  );
}

export default function VerificationPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <Header />

        <div className={styles.content}>
          <div className={styles.topStatus}>
            <div className={styles.documentInfo}>
              <div className={styles.pdfIcon}>PDF</div>

              <div>
                <span className={styles.smallLabel}>CASE DOCUMENT</span>
                <strong>case_report_2023.pdf</strong>
                <p>PDF Document&nbsp; • &nbsp;4.8 MB</p>
              </div>
            </div>

            <div className={styles.statusBlock}>
              <span className={`${styles.statusIcon} ${styles.green}`}>
                ✓
              </span>

              <div>
                <span className={styles.smallLabel}>EXTRACTION STATUS</span>
                <strong>Extraction Complete</strong>
                <p>18 fields extracted</p>
              </div>
            </div>

            <div className={styles.statusBlock}>
              <span className={`${styles.statusIcon} ${styles.orange}`}>
                ◷
              </span>

              <div>
                <span className={styles.smallLabel}>VERIFICATION STATUS</span>
                <strong>Pending Officer Verification</strong>
                <p>Review and enrich the extracted information</p>
              </div>
            </div>
          </div>

          <div className={styles.layout}>
            <div className={styles.leftColumn}>
              <section className={styles.verificationCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2>
                      VERIFIED CASE INFORMATION
                      <span className={styles.info}>i</span>
                    </h2>
                  </div>

                  <button
                    className={styles.resetButton}
                    onClick={() => setSaved(false)}
                  >
                    ↶&nbsp; Reset Changes
                  </button>
                </div>

                <div className={styles.notice}>
                  <div className={styles.noticeIcon}>i</div>

                  <div>
                    <p>
                      Please review all extracted fields. Correct any
                      inaccurate information and enrich missing details.
                    </p>
                    <p>
                      The verified information will be used for AI analysis.
                    </p>
                  </div>
                </div>

                <VerificationSection title="CASE INFORMATION">
                  <Field
                    label="CASE ID"
                    value="NARCIS-025"
                    required
                  />
                  <Field
                    label="INVESTIGATION YEAR"
                    value="2023"
                    required
                  />
                  <Field
                    label="AGENCY"
                    value="NCB"
                    required
                  />
                  <Field
                    label="ZONAL UNIT"
                    value="Chandigarh Zonal Unit"
                    required
                  />
                </VerificationSection>

                <VerificationSection title="DRUG INFORMATION">
                  <Field
                    label="DRUG TYPE"
                    value="Heroin"
                    required
                  />
                  <Field
                    label="QUANTITY"
                    value="20.326"
                    required
                  />
                  <Field
                    label="QUANTITY CATEGORY"
                    value="Commercial"
                    required
                  />
                  <Field
                    label="PURITY (IF KNOWN)"
                    value=""
                    placeholder="Enter purity %"
                    status="missing"
                  />
                </VerificationSection>

                <VerificationSection title="INVESTIGATION INFORMATION">
                  <Field
                    label="PERSONS ARRESTED"
                    value="20"
                    required
                  />
                  <Field
                    label="SOURCE TYPE"
                    value="Secret Information"
                    required
                  />
                  <Field
                    label="OPERATION TYPE"
                    value="International trafficking syndicate investigation and seizure"
                    required
                  />
                  <Field
                    label="CASE REFERENCE NO."
                    value=""
                    placeholder="Enter case reference no."
                    status="missing"
                  />
                </VerificationSection>

                <VerificationSection title="ROUTE INFORMATION">
                  <Field
                    label="ORIGIN STATE"
                    value="Gujarat"
                    required
                  />
                  <Field
                    label="DESTINATION STATE"
                    value="Punjab"
                    required
                  />
                  <Field
                    label="TRANSPORT MODE"
                    value="Road"
                    required
                  />
                  <Field
                    label="ROUTE TYPE"
                    value="Interstate"
                    required
                  />
                  <Field
                    label="INTERSTATE TRAVEL"
                    value="Yes"
                    required
                  />
                </VerificationSection>

                <VerificationSection title="LEGAL INFORMATION">
                  <Field
                    label="APPLICABLE NDPS SECTIONS"
                    value="8(c), 21, 27A, 29"
                    required
                  />
                  <Field
                    label="OTHER LEGAL SECTIONS"
                    value=""
                    placeholder="Enter other sections"
                    status="added"
                  />
                  <Field
                    label="FIR NO."
                    value=""
                    placeholder="Enter FIR number"
                    status="missing"
                  />
                  <Field
                    label="FIR DATE"
                    value=""
                    placeholder="Select date"
                    status="missing"
                  />
                </VerificationSection>

                <button className={styles.additionalButton}>
                  ＋&nbsp; Add Additional Information
                </button>
              </section>
            </div>

            <div className={styles.rightColumn}>
              <Workflow />

              <section className={styles.guidelineCard}>
                <h2>
                  <span>i</span>
                  VERIFICATION GUIDELINES
                </h2>

                <ul>
                  <li>Review each extracted field carefully</li>
                  <li>Correct any inaccurate information</li>
                  <li>Enrich missing details wherever possible</li>
                  <li>
                    All <b>*</b> marked fields are mandatory
                  </li>
                  <li>Changes will be tracked for audit</li>
                </ul>
              </section>

              <section className={styles.legendCard}>
                <h2>FIELD STATUS LEGEND</h2>

                <div>
                  <span className={`${styles.legendDot} ${styles.blueDot}`} />
                  <b>Extracted</b>
                  <span>Auto extracted from document</span>
                </div>

                <div>
                  <span className={`${styles.legendDot} ${styles.orangeDot}`} />
                  <b>Edited</b>
                  <span>Modified by officer</span>
                </div>

                <div>
                  <span className={`${styles.legendDot} ${styles.greenDot}`} />
                  <b>Added</b>
                  <span>Added by officer</span>
                </div>

                <div>
                  <span className={`${styles.legendDot} ${styles.redDot}`} />
                  <b>Missing</b>
                  <span>Not found in document</span>
                </div>
              </section>
            </div>
          </div>

          <div className={styles.bottomActions}>
            <button className={styles.backButton}>
              ← &nbsp; BACK TO EXTRACTION
            </button>

            <div className={styles.rightActions}>
              <button
                className={styles.saveButton}
                onClick={() => setSaved(true)}
              >
                ▣ &nbsp; {saved ? "DRAFT SAVED" : "SAVE DRAFT"}
              </button>

              <button className={styles.continueButton}>
                CONTINUE TO ANALYSIS &nbsp; →
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>♧</span>
        <strong>NARCIS - Authorized Investigation Environment</strong>
        <i />
        <span>All data is encrypted and access is monitored</span>
        <i />
        <span>Version 1.0.0</span>
      </footer>
    </div>
  );
}

