"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./case-verification.module.css";

type Field = {
  key: string;
  label: string;
  value: string;
  status?: "Extracted" | "Edited" | "Added" | "Missing";
};

const navigation = [
  { icon: "▦", label: "Dashboard" },
  { icon: "＋", label: "New Case" },
  { icon: "□", label: "Cases" },
  { icon: "⌘", label: "Intelligence" },
  { icon: "▤", label: "Reports" },
  { icon: "◷", label: "Case History" },
];

const workflow = [
  {
    number: "01",
    title: "Upload Document",
    description: "Upload investigation document",
    state: "complete",
  },
  {
    number: "02",
    title: "Document Extraction",
    description: "Extract case information from document",
    state: "complete",
  },
  {
    number: "03",
    title: "Officer Verification",
    description: "Verify and enrich extracted information",
    state: "current",
  },
  {
    number: "04",
    title: "AI Analysis",
    description: "ML analysis + SHAP explainability + RAG intelligence",
    state: "next",
  },
  {
    number: "05",
    title: "Decision-Support Report",
    description: "Evidence package and investigation report",
    state: "next",
  },
  {
    number: "06",
    title: "Officer Review",
    description: "Final officer review and case disposition",
    state: "next",
  },
];

const initialFields: Record<string, Field[]> = {
  "CASE INFORMATION": [
    { key: "caseId", label: "Case ID", value: "NARCIS-025", status: "Extracted" },
    { key: "year", label: "Investigation Year", value: "2023", status: "Extracted" },
    { key: "agency", label: "Agency", value: "NCB", status: "Extracted" },
    { key: "zonalUnit", label: "Zonal Unit", value: "Chandigarh Zonal Unit", status: "Extracted" },
    { key: "personsArrested", label: "Persons Arrested", value: "20", status: "Extracted" },
  ],
  "DRUG INFORMATION": [
    { key: "drugType", label: "Drug Type", value: "Heroin", status: "Extracted" },
    { key: "quantity", label: "Quantity", value: "20.326 Kg", status: "Extracted" },
    { key: "quantityCategory", label: "Quantity Category", value: "Commercial", status: "Extracted" },
  ],
  "INVESTIGATION INFORMATION": [
    { key: "sourceType", label: "Source Type", value: "Secret Information", status: "Extracted" },
    {
      key: "operationType",
      label: "Operation Type",
      value: "International trafficking syndicate investigation and seizure",
      status: "Extracted",
    },
  ],
  "ROUTE INFORMATION": [
    { key: "originState", label: "Origin State", value: "Gujarat", status: "Extracted" },
    { key: "destinationState", label: "Destination State", value: "Punjab", status: "Extracted" },
    { key: "transportMode", label: "Transport Mode", value: "Road", status: "Extracted" },
    { key: "routeType", label: "Route Type", value: "Interstate", status: "Extracted" },
    { key: "interstateTravel", label: "Interstate Travel", value: "Yes", status: "Extracted" },
  ],
  "LEGAL INFORMATION": [
    {
      key: "ndpsSections",
      label: "Applicable NDPS Sections",
      value: "8(c), 21, 27A, 29",
      status: "Extracted",
    },
    {
      key: "vehicleType",
      label: "Vehicle Type",
      value: "Unknown",
      status: "Missing",
    },
  ],
};

function Icon({ type }: { type: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "back") {
    return (
      <svg {...common}>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    );
  }

  if (type === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  return null;
}

export default function CaseVerificationPage() {
  const router = useRouter();

  const [fields, setFields] = useState(initialFields);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("narcis_extraction_result");

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      if (!parsed || typeof parsed !== "object") {
        return;
      }

      console.log("NARCIS extraction result available:", parsed);
    } catch {
      console.log("NARCIS: extraction result could not be read.");
    }
  }, []);

  const updateField = (
    section: string,
    key: string,
    value: string
  ) => {
    setFields((current) => ({
      ...current,
      [section]: current[section].map((field) =>
        field.key === key
          ? {
              ...field,
              value,
              status:
                field.status === "Missing" && value.trim()
                  ? "Added"
                  : "Edited",
            }
          : field
      ),
    }));

    setSaved(false);
  };

  const saveVerification = () => {
    try {
      sessionStorage.setItem(
        "narcis_verified_case",
        JSON.stringify(fields)
      );
    } catch {
      console.log("NARCIS: verification data could not be saved.");
    }

    setSaved(true);
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>N</div>
          <div>
            <div className={styles.brandName}>NARCIS</div>
            <div className={styles.brandSub}>INVESTIGATION SYSTEM</div>
          </div>
        </div>

        <nav className={styles.navigation}>
          {navigation.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`${styles.navItem} ${
                item.label === "New Case" ? styles.activeNav : ""
              }`}
              onClick={() => {
                if (item.label === "Dashboard") {
                  router.push("/dashboard");
                }

                if (item.label === "New Case") {
                  router.push("/new-case");
                }
              }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarOfficer}>
          <div className={styles.officerAvatar}>AO</div>
          <div>
            <strong>Authorized Officer</strong>
            <span>Investigation Unit</span>
          </div>
        </div>

        <div className={styles.secureSession}>
          <span className={styles.secureDot} />
          <span>SECURE SESSION</span>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>OFFICER VERIFICATION / ENRICHMENT</h1>
            <p>
              Review, verify, correct, and enrich the extracted case
              information before analysis.
            </p>
          </div>

          <div className={styles.headerOfficer}>
            <span className={styles.headerBell}>♧</span>
            <span>AUTHORIZED OFFICER</span>
          </div>
        </header>

        <div className={styles.breadcrumb}>
          Dashboard / New Case / Upload Document / Extraction / Verification
        </div>

        <section className={styles.statusCard}>
          <div>
            <span className={styles.statusLabel}>CASE DOCUMENT</span>
            <strong>NARCIS-025</strong>
            <span className={styles.statusMeta}>PDF Document</span>
          </div>

          <div className={styles.statusDivider} />

          <div>
            <span className={styles.statusLabel}>EXTRACTION STATUS</span>
            <strong className={styles.completeText}>
              EXTRACTION COMPLETE
            </strong>
            <span className={styles.statusMeta}>Extracted just now</span>
          </div>

          <div className={styles.statusDivider} />

          <div>
            <span className={styles.statusLabel}>VERIFICATION STATUS</span>
            <strong className={styles.pendingText}>
              PENDING OFFICER VERIFICATION
            </strong>
            <span className={styles.statusMeta}>
              Review required before AI analysis
            </span>
          </div>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.cardEyebrow}>CASE REVIEW</span>
                  <h2>VERIFIED CASE INFORMATION</h2>
                </div>

                <span className={styles.editHint}>EDITABLE</span>
              </div>

              <p className={styles.instruction}>
                Review all extracted fields carefully. Correct inaccurate
                information and enrich missing details. The verified
                information will be used for AI analysis.
              </p>

              {Object.entries(fields).map(([section, sectionFields]) => (
                <div className={styles.fieldSection} key={section}>
                  <div className={styles.fieldSectionTitle}>{section}</div>

                  <div className={styles.fieldGrid}>
                    {sectionFields.map((field) => (
                      <label
                        className={styles.fieldCard}
                        key={field.key}
                      >
                        <div className={styles.fieldTop}>
                          <span>{field.label}</span>

                          <span
                            className={`${styles.fieldStatus} ${
                              field.status === "Missing"
                                ? styles.missing
                                : field.status === "Edited"
                                ? styles.edited
                                : field.status === "Added"
                                ? styles.added
                                : ""
                            }`}
                          >
                            {field.status}
                          </span>
                        </div>

                        <input
                          value={field.value}
                          onChange={(event) =>
                            updateField(
                              section,
                              field.key,
                              event.target.value
                            )
                          }
                          aria-label={field.label}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className={styles.verificationNotice}>
                <div className={styles.noticeIcon}>✓</div>
                <div>
                  <strong>OFFICER VERIFICATION REQUIRED</strong>
                  <p>
                    Verify the extracted information before continuing to
                    AI analysis.
                  </p>
                </div>
              </div>

              {saved && (
                <div className={styles.savedMessage}>
                  Verification data saved for this case.
                </div>
              )}
            </div>
          </div>

          <aside className={styles.rightColumn}>
            <div className={styles.workflowCard}>
              <div className={styles.workflowHeader}>
                <span>NARCIS CASE WORKFLOW</span>
              </div>

              <div className={styles.workflow}>
                {workflow.map((step, index) => (
                  <div key={step.number}>
                    <div className={styles.workflowStep}>
                      <div
                        className={`${styles.stepNumber} ${
                          step.state === "complete"
                            ? styles.stepComplete
                            : step.state === "current"
                            ? styles.stepCurrent
                            : ""
                        }`}
                      >
                        {step.state === "complete" ? "✓" : step.number}
                      </div>

                      <div className={styles.stepText}>
                        <div className={styles.stepTitle}>
                          <strong>{step.title}</strong>

                          {step.state === "current" && (
                            <span className={styles.currentBadge}>
                              CURRENT
                            </span>
                          )}

                          {step.state === "complete" && (
                            <span className={styles.completeBadge}>
                              COMPLETE
                            </span>
                          )}
                        </div>

                        <p>{step.description}</p>
                      </div>
                    </div>

                    {index < workflow.length - 1 && (
                      <div className={styles.workflowLine} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className={styles.actions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push("/document-extraction")}
          >
            <Icon type="back" />
            BACK
          </button>

          <button
            type="button"
            className={styles.saveButton}
            onClick={saveVerification}
          >
            SAVE VERIFICATION
          </button>

          <button
            type="button"
            className={styles.continueButton}
            onClick={() => {
              saveVerification();
              router.push("/ai-analysis");
            }}
          >
            CONTINUE TO AI ANALYSIS
            <Icon type="arrow" />
          </button>
        </section>

        <footer className={styles.footer}>
          <span>♧</span>
          <strong>NARCIS - Authorized Investigation Environment</strong>
          <i />
          <span>All data is encrypted and access is monitored</span>
          <i />
          <span>Version 1.0.0</span>
        </footer>
      </main>
    </div>
  );
}
