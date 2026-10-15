"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./case-verification.module.css";

type ExtractionResult = {
  success?: boolean;
  document_id?: string;
  filename?: string;
  file_size?: number;
  pages?: number;
  extraction_status?: string;
  case?: Record<string, string>;
  missing_fields?: string[];
  document_url?: string;
};

type Field = {
  label: string;
  key: string;
};

const fieldGroups: {
  title: string;
  fields: Field[];
}[] = [
  {
    title: "CASE INFORMATION",
    fields: [
      { label: "Case ID", key: "Case_ID" },
      { label: "Investigation Year", key: "Investigation_Year" },
      { label: "Agency", key: "Agency" },
      { label: "Zonal Unit", key: "NCB_Zonal_Unit" },
    ],
  },
  {
    title: "DRUG INFORMATION",
    fields: [
      { label: "Drug Type", key: "Drug_Type" },
      { label: "Quantity", key: "Quantity" },
      { label: "Quantity Category", key: "Quantity_Category" },
      { label: "Persons Arrested", key: "Persons_Arrested" },
    ],
  },
  {
    title: "INVESTIGATION INFORMATION",
    fields: [
      { label: "Location", key: "Location" },
      { label: "Incident Date", key: "Incident_Date" },
      { label: "Source Type", key: "Source_Type" },
      { label: "Operation Type", key: "Operation_Type" },
    ],
  },
  {
    title: "ROUTE INFORMATION",
    fields: [
      { label: "Origin State", key: "Origin_State" },
      { label: "Destination State", key: "Destination_State" },
      { label: "Transport Mode", key: "Transport_Mode" },
      { label: "Route Type", key: "Route_Type" },
    ],
  },
  {
    title: "LEGAL INFORMATION",
    fields: [
      { label: "Applicable NDPS Sections", key: "Applicable_NDPS_Sections" },
      { label: "Vehicle Type", key: "Vehicle_Type" },
    ],
  },
];

const workflowSteps = [
  {
    number: "âœ“",
    title: "Upload Document",
    description: "Source document uploaded",
    state: "complete",
  },
  {
    number: "âœ“",
    title: "Document Extraction",
    description: "Information extracted from uploaded document",
    state: "complete",
  },
  {
    number: "03",
    title: "Officer Verification",
    description: "Officer verifies and enriches extracted information",
    state: "current",
  },
  {
    number: "04",
    title: "AI Analysis",
    description: "ML analysis + SHAP explainability + RAG intelligence",
    state: "pending",
  },
  {
    number: "05",
    title: "Decision-Support Report",
    description: "Evidence package and investigation report",
    state: "pending",
  },
];

function getValue(
  data: Record<string, string>,
  key: string
): string {
  const alternatives: Record<string, string[]> = {
    Case_ID: ["Case_ID", "Case_Id", "case_id", "Case ID"],
    Investigation_Year: [
      "Investigation_Year",
      "investigation_year",
      "Investigation Year",
    ],
    Agency: ["Agency", "agency"],
    NCB_Zonal_Unit: [
      "NCB_Zonal_Unit",
      "Zonal_Unit",
      "NCB Zonal Unit",
      "Zonal Unit",
    ],
    Drug_Type: ["Drug_Type", "drug_type", "Drug Type"],
    Quantity: ["Quantity", "quantity"],
    Quantity_Category: [
      "Quantity_Category",
      "quantity_category",
      "Quantity Category",
    ],
    Persons_Arrested: [
      "Persons_Arrested",
      "persons_arrested",
      "Persons Arrested",
    ],
    Location: ["Location", "location"],
    Incident_Date: [
      "Incident_Date",
      "incident_date",
      "Incident Date",
    ],
    Source_Type: ["Source_Type", "source_type", "Source Type"],
    Operation_Type: [
      "Operation_Type",
      "operation_type",
      "Operation Type",
    ],
    Origin_State: ["Origin_State", "origin_state", "Origin State"],
    Destination_State: [
      "Destination_State",
      "destination_state",
      "Destination State",
    ],
    Transport_Mode: [
      "Transport_Mode",
      "transport_mode",
      "Transport Mode",
    ],
    Route_Type: ["Route_Type", "route_type", "Route Type"],
    Applicable_NDPS_Sections: [
      "Applicable_NDPS_Sections",
      "NDPS_Sections",
      "Applicable NDPS Sections",
    ],
    Vehicle_Type: ["Vehicle_Type", "vehicle_type", "Vehicle Type"],
  };

  const keys = alternatives[key] || [key];

  for (const candidate of keys) {
    const value = data[candidate];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return "";
}

export default function CaseVerificationPage() {
  const router = useRouter();

  const [result, setResult] =
    useState<ExtractionResult | null>(null);

  const [formData, setFormData] =
    useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(
        "narcis_extraction_result"
      );

      if (stored) {
        const parsed: ExtractionResult = JSON.parse(stored);
        setResult(parsed);

        const extracted = parsed.case || {};
        const initial: Record<string, string> = {};

        for (const group of fieldGroups) {
          for (const field of group.fields) {
            initial[field.key] = getValue(
              extracted,
              field.key
            );
          }
        }

        setFormData(initial);
      }
    } catch (error) {
      console.error(
        "NARCIS: unable to load extraction result",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = (
    key: string,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveVerification = () => {
    const previous = result || {};

    const updatedCase = {
      ...(previous.case || {}),
      ...formData,
    };

    const updatedResult = {
      ...previous,
      case: updatedCase,
    };

    sessionStorage.setItem(
      "narcis_extraction_result",
      JSON.stringify(updatedResult)
    );

    setResult(updatedResult);

    alert("Verification data saved.");
  };

  const continueToAnalysis = () => {
    const previous = result || {};

    const updatedResult = {
      ...previous,
      case: {
        ...(previous.case || {}),
        ...formData,
      },
    };

    sessionStorage.setItem(
      "narcis_extraction_result",
      JSON.stringify(updatedResult)
    );

    router.push("/ai-analysis");
  };

  return (
    <main className={styles.page}>

      {/* =====================================================
          EXACT DOCUMENT EXTRACTION SIDEBAR
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
            <span className={styles.navIcon}>â–¦</span>
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
            <span className={styles.navIcon}>â–¡</span>
            <span>Cases</span>
          </button>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>âŒ˜</span>
            <span>Intelligence</span>
          </button>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>â–¤</span>
            <span>Reports</span>
          </button>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>â—·</span>
            <span>Case History</span>
          </button>

        </nav>

        <div className={styles.sidebarDivider} />

        <nav className={styles.navigation}>

          <button
            className={styles.navItem}
            type="button"
          >
            <span className={styles.navIcon}>âš™</span>
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
            <span>â™Ÿ</span>
          </div>

          <div>
            <strong>OFFICER</strong>
            <small>Authorized User</small>
          </div>

        </div>

        <div className={styles.secureSession}>

          <span className={styles.sessionShield}>
            â™™
          </span>

          <span className={styles.sessionDot} />

          SECURE SESSION

        </div>

      </aside>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <section className={styles.main}>

        <header className={styles.header}>

          <div>

            <h1>
              OFFICER VERIFICATION / ENRICHMENT
            </h1>

            <p>
              Review, verify, correct, and enrich the
              extracted case information before analysis.
            </p>

          </div>

          <div className={styles.headerActions}>

            <button
              className={styles.iconButton}
              type="button"
              aria-label="Notifications"
            >
              â™§
              <span className={styles.notificationBadge}>
                3
              </span>
            </button>

            <button
              className={styles.iconButton}
              type="button"
              aria-label="Help"
            >
              ?
            </button>

            <div className={styles.headerDivider} />

            <div className={styles.userMenu}>

              <div className={styles.userAvatar}>
                â—
              </div>

              <div>

                <strong>Officer</strong>

                <small>
                  <span />
                  SECURE SESSION
                </small>

              </div>

              <span className={styles.chevron}>
                Ë…
              </span>

            </div>

          </div>

        </header>


        <div className={styles.content}>

          {/* =================================================
              BREADCRUMB
              ================================================= */}

          <div className={styles.breadcrumb}>

            <span>Dashboard</span>
            <b>/</b>
            <span>New Case</span>
            <b>/</b>
            <span>Document Extraction</span>
            <b>/</b>
            <strong>Verification</strong>

          </div>


          {/* =================================================
              HERO
              ================================================= */}

          <section className={styles.verificationHero}>

            <div>

              <span className={styles.verificationHeroLabel}>
                CASE DOCUMENT
              </span>

              <h2>
                Extracted Case Information
              </h2>

              <p>
                Review information extracted from the
                uploaded investigation document.
              </p>

            </div>

            <div className={styles.verificationStatus}>

              <div className={styles.verificationStatusIcon}>
                âœ“
              </div>

              <div>
                <strong>
                  PENDING OFFICER VERIFICATION
                </strong>

                <small>
                  Extraction complete
                </small>
              </div>

            </div>

          </section>


          {/* =================================================
              VERIFICATION + WORKFLOW
              ================================================= */}

          <div className={styles.verificationGrid}>

            {/* ===============================================
                FIELDS
                =============================================== */}

            <section className={styles.verificationCard}>

              <div className={styles.verificationCardHeader}>

                <div>

                  <span className={styles.verificationHeroLabel}>
                    VERIFIED CASE INFORMATION
                  </span>

                  <h2>
                    Review &amp; Enrich
                  </h2>

                  <p>
                    Correct inaccurate values and complete
                    missing details.
                  </p>

                </div>

                <div className={styles.legend}>

                  <span className={styles.legendItem}>
                    <span
                      className={`${styles.legendDot} ${styles.legendExtracted}`}
                    />
                    Extracted
                  </span>

                  <span className={styles.legendItem}>
                    <span
                      className={`${styles.legendDot} ${styles.legendAdded}`}
                    />
                    Added
                  </span>

                  <span className={styles.legendItem}>
                    <span
                      className={`${styles.legendDot} ${styles.legendMissing}`}
                    />
                    Missing
                  </span>

                </div>

              </div>


              {loading ? (

                <div className={styles.fieldSection}>
                  Loading extracted information...
                </div>

              ) : (

                fieldGroups.map((group) => (

                  <section
                    className={styles.fieldSection}
                    key={group.title}
                  >

                    <div className={styles.fieldSectionTitle}>

                      <h3>
                        {group.title}
                      </h3>

                      <span className={styles.collapseMark}>
                        âˆ’
                      </span>

                    </div>


                    <div className={styles.fieldsGrid}>

                      {group.fields.map((field) => {

                        const value =
                          formData[field.key] || "";

                        const hasValue =
                          value.trim() !== "";

                        const statusClass =
                          hasValue
                            ? styles.statusExtracted
                            : styles.statusMissing;

                        return (

                          <div
                            className={styles.field}
                            key={field.key}
                          >

                            <div className={styles.fieldLabelRow}>

                              <label
                                className={styles.fieldLabel}
                              >
                                {field.label}
                              </label>

                              <span
                                className={`${styles.fieldStatus} ${statusClass}`}
                              >
                                {hasValue
                                  ? "EXTRACTED"
                                  : "MISSING"}
                              </span>

                            </div>

                            <input
                              className={styles.fieldInput}
                              value={value}
                              placeholder={
                                hasValue
                                  ? ""
                                  : "Information not found. Enter value."
                              }
                              onChange={(event) =>
                                updateField(
                                  field.key,
                                  event.target.value
                                )
                              }
                            />

                          </div>

                        );
                      })}

                    </div>

                  </section>

                ))

              )}


              <div className={styles.workflowActions}>

                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => router.push("/document-extraction")}
                >
                  BACK TO EXTRACTION
                </button>

                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={saveVerification}
                >
                  SAVE VERIFICATION
                </button>

              </div>

            </section>


            {/* ===============================================
                WORKFLOW
                =============================================== */}

            <aside className={styles.workflowCard}>

              <div className={styles.workflowHeader}>

                <span className={styles.workflowHeaderLabel}>
                  CASE WORKFLOW
                </span>

                <h2>
                  NARCIS CASE WORKFLOW
                </h2>

                <p>
                  Case processing stages
                </p>

              </div>


              <div className={styles.workflow}>

                {workflowSteps.map((step) => (

                  <div
                    className={styles.workflowStep}
                    key={`${step.number}-${step.title}`}
                  >

                    <div
                      className={`${styles.workflowCircle} ${
                        step.state === "complete"
                          ? styles.workflowComplete
                          : step.state === "current"
                            ? styles.workflowCurrent
                            : ""
                      }`}
                    >
                      {step.number}
                    </div>

                    <div className={styles.workflowStepBody}>

                      <h3>

                        {step.title}

                        {step.state === "complete" && (
                          <span
                            className={`${styles.workflowBadge} ${styles.workflowCompleteBadge}`}
                          >
                            COMPLETE
                          </span>
                        )}

                        {step.state === "current" && (
                          <span
                            className={`${styles.workflowBadge} ${styles.workflowCurrentBadge}`}
                          >
                            CURRENT
                          </span>
                        )}

                      </h3>

                      <p>
                        {step.description}
                      </p>

                    </div>

                  </div>

                ))}

              </div>


              <div className={styles.workflowActions}>

                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={continueToAnalysis}
                >
                  CONTINUE TO AI ANALYSIS
                </button>

              </div>

            </aside>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className={styles.footer}>

        <span>
          â—‡
        </span>

        <strong>
          NARCIS - Authorized Investigation Environment
        </strong>

        <i />

        <span>
          All data is encrypted and access is monitored
        </span>

        <i />

        <span>
          Version 1.0.0
        </span>

      </footer>

    </main>
  );
}

