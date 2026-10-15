"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./case-verification.module.css";

type Field = {
  key: string;
  label: string;
  value: string;
  status: "extracted" | "missing" | "added";
};

const initialFields: Field[] = [
  {
    key: "investigationYear",
    label: "INVESTIGATION YEAR",
    value: "2023",
    status: "extracted",
  },
  {
    key: "agency",
    label: "AGENCY",
    value: "NCB",
    status: "extracted",
  },
  {
    key: "zonalUnit",
    label: "NCB ZONAL UNIT",
    value: "Chandigarh Zonal Unit",
    status: "extracted",
  },
  {
    key: "drugType",
    label: "DRUG TYPE",
    value: "Heroin",
    status: "extracted",
  },
  {
    key: "quantity",
    label: "QUANTITY",
    value: "20.326",
    status: "extracted",
  },
  {
    key: "quantityCategory",
    label: "QUANTITY CATEGORY",
    value: "Commercial",
    status: "extracted",
  },
  {
    key: "personsArrested",
    label: "PERSONS ARRESTED",
    value: "20",
    status: "extracted",
  },
  {
    key: "sourceType",
    label: "SOURCE TYPE",
    value: "Secret Information",
    status: "extracted",
  },
  {
    key: "operationType",
    label: "OPERATION TYPE",
    value: "International trafficking syndicate investigation and seizure",
    status: "extracted",
  },
  {
    key: "ndpsSections",
    label: "APPLICABLE NDPS SECTIONS",
    value: "8(c), 21, 27A, 29",
    status: "extracted",
  },
  {
    key: "originState",
    label: "ORIGIN STATE",
    value: "Gujarat",
    status: "extracted",
  },
  {
    key: "destinationState",
    label: "DESTINATION STATE",
    value: "Punjab",
    status: "extracted",
  },
  {
    key: "vehicleType",
    label: "VEHICLE TYPE",
    value: "Truck",
    status: "extracted",
  },
  {
    key: "transportMode",
    label: "TRANSPORT MODE",
    value: "Road",
    status: "extracted",
  },
  {
    key: "routeType",
    label: "ROUTE TYPE",
    value: "Interstate",
    status: "extracted",
  },
  {
    key: "interstateTravel",
    label: "INTERSTATE TRAVEL",
    value: "Yes",
    status: "extracted",
  },
  {
    key: "firNumber",
    label: "FIR NUMBER",
    value: "",
    status: "missing",
  },
  {
    key: "firDate",
    label: "FIR DATE",
    value: "",
    status: "missing",
  },
];

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
    description: "Evidence package and investigation report",
    status: "next",
  },
  {
    number: "06",
    title: "Officer Review",
    description: "Final officer review and case disposition",
    status: "next",
  },
];

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

              {index < workflow.length - 1 && (
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

function VerificationField({
  field,
  onChange,
}: {
  field: Field;
  onChange: (value: string) => void;
}) {
  const statusText =
    field.status === "missing"
      ? "● Missing"
      : field.status === "added"
      ? "● Added"
      : "● Extracted";

  return (
    <div className={styles.field}>
      <label>{field.label}</label>

      <input
        value={field.value}
        placeholder={
          field.status === "missing"
            ? "Enter information"
            : "Edit extracted value"
        }
        onChange={(e) => onChange(e.target.value)}
      />

      <span
        className={`${styles.fieldStatus} ${
          field.status === "missing"
            ? styles.missing
            : field.status === "added"
            ? styles.added
            : styles.extracted
        }`}
      >
        {statusText}
      </span>
    </div>
  );
}

export default function CaseVerificationPage() {
  const router = useRouter();

  const [fields, setFields] = useState<Field[]>(initialFields);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("narcis-case-verification");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed) && parsed.length === initialFields.length) {
          setFields(parsed);
        }
      }
    } catch {
      // Keep default values if browser storage is unavailable.
    }
  }, []);

  function updateField(key: string, value: string) {
    setSaved(false);

    setFields((current) =>
      current.map((field) =>
        field.key === key
          ? {
              ...field,
              value,
              status:
                value.trim() === ""
                  ? "missing"
                  : field.status === "missing"
                  ? "added"
                  : field.status,
            }
          : field
      )
    );
  }

  function resetChanges() {
    setFields(initialFields);
    setSaved(false);
    localStorage.removeItem("narcis-case-verification");
  }

  function saveDraft() {
    localStorage.setItem(
      "narcis-case-verification",
      JSON.stringify(fields)
    );

    setSaved(true);
  }

  return (
    <div className={styles.page}>
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

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>CASE VERIFICATION</h1>

            <p>
              Review and verify the information extracted from the case
              document.
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
          <section className={styles.documentBar}>
            <div className={styles.documentInfo}>
              <div className={styles.pdfIcon}>PDF</div>

              <div>
                <span>CASE DOCUMENT</span>
                <strong>case_report_2023.pdf</strong>
                <small>PDF Document • Extraction Complete</small>
              </div>
            </div>

            <div className={styles.statusItem}>
              <div className={styles.statusCircle}>✓</div>

              <div>
                <span>EXTRACTION STATUS</span>
                <strong>Extraction Complete</strong>
                <small>18 fields available for review</small>
              </div>
            </div>

            <div className={styles.statusItem}>
              <div className={styles.statusCircleOrange}>◷</div>

              <div>
                <span>VERIFICATION STATUS</span>
                <strong>Pending Verification</strong>
                <small>Officer review required</small>
              </div>
            </div>
          </section>

          <div className={styles.mainGrid}>
            <section className={styles.verificationCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>VERIFIED CASE INFORMATION</h2>

                  <p>
                    Review, edit and verify all extracted information before
                    continuing.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={resetChanges}
                >
                  ↶ RESET CHANGES
                </button>
              </div>

              <div className={styles.notice}>
                <div className={styles.noticeIcon}>i</div>

                <div>
                  <strong>OFFICER VERIFICATION REQUIRED</strong>

                  <p>
                    Review every field. Correct inaccurate values and complete
                    missing information.
                  </p>
                </div>
              </div>

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>CASE INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>
                  {fields.slice(0, 3).map((field) => (
                    <VerificationField
                      key={field.key}
                      field={field}
                      onChange={(value) =>
                        updateField(field.key, value)
                      }
                    />
                  ))}
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>DRUG INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>
                  {fields.slice(3, 6).map((field) => (
                    <VerificationField
                      key={field.key}
                      field={field}
                      onChange={(value) =>
                        updateField(field.key, value)
                      }
                    />
                  ))}
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>INVESTIGATION INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>
                  {fields.slice(6, 10).map((field) => (
                    <VerificationField
                      key={field.key}
                      field={field}
                      onChange={(value) =>
                        updateField(field.key, value)
                      }
                    />
                  ))}
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>ROUTE &amp; TRANSPORT INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>
                  {fields.slice(10, 16).map((field) => (
                    <VerificationField
                      key={field.key}
                      field={field}
                      onChange={(value) =>
                        updateField(field.key, value)
                      }
                    />
                  ))}
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <strong>LEGAL INFORMATION</strong>
                  <span>⌃</span>
                </div>

                <div className={styles.fieldsGrid}>
                  {fields.slice(16, 18).map((field) => (
                    <VerificationField
                      key={field.key}
                      field={field}
                      onChange={(value) =>
                        updateField(field.key, value)
                      }
                    />
                  ))}
                </div>
              </section>

              <div className={styles.fieldCount}>
                <span>18 verification fields</span>

                <span>
                  Review all fields before continuing to AI Analysis.
                </span>
              </div>
            </section>

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
                  <li>Complete missing details where possible</li>
                  <li>Verify all required information</li>
                  <li>Changes are tracked for audit</li>
                </ul>
              </section>

              <section className={styles.legendCard}>
                <h2>FIELD STATUS LEGEND</h2>

                <div>
                  <i className={styles.blueDot} />
                  <b>Extracted</b>
                  <span>Auto extracted</span>
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
                  <span>Not found</span>
                </div>
              </section>
            </aside>
          </div>

          <div className={styles.bottomBar}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.push("/document-extraction")}
            >
              ← BACK TO EXTRACTION
            </button>

            <div>
              <button
                type="button"
                className={styles.saveButton}
                onClick={saveDraft}
              >
                {saved ? "✓ SAVED" : "▣ SAVE DRAFT"}
              </button>

              <button
                type="button"
                className={styles.continueButton}
                onClick={() => router.push("/analysis")}
              >
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
