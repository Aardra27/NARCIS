"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./document-extraction.module.css";

const API_BASE = "http://127.0.0.1:8000";

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

function Icon({ type }: { type: string }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<string, React.ReactNode> = {
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </>
    ),

    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.7 2.7L16 9.5" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <path d="M12 7h.01" />
      </>
    ),

    download: (
      <>
        <path d="M12 3v11" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),

    back: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
  };

  return <svg {...common}>{paths[type] ?? paths.info}</svg>;
}

function FieldCard({
  label,
  value,
  missing = false,
}: {
  label: string;
  value: string;
  missing?: boolean;
}) {
  return (
    <div className={styles.fieldCard}>
      <span className={styles.fieldLabel}>{label}</span>

      <strong className={styles.fieldValue}>
        {value || "Unknown"}
      </strong>

      {missing ? (
        <span className={styles.notFound}>
          NOT FOUND IN DOCUMENT
        </span>
      ) : (
        <span className={styles.extracted}>
          <Icon type="check" />
          Extracted
        </span>
      )}
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  state,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  state?: "complete" | "current";
  last?: boolean;
}) {
  return (
    <div className={styles.workflowStep}>
      <div
        className={`${styles.stepNumber} ${
          state === "complete"
            ? styles.stepComplete
            : state === "current"
              ? styles.stepCurrent
              : ""
        }`}
      >
        {state === "complete" ? (
          <Icon type="check" />
        ) : (
          number
        )}
      </div>

      {!last && <div className={styles.workflowConnector} />}

      <div className={styles.stepText}>
        <div className={styles.stepTitleRow}>
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

          {!state && (
            <span className={styles.nextBadge}>
              NEXT
            </span>
          )}
        </div>

        {description && (
          <p>{description}</p>
        )}
      </div>
    </div>
  );
}

export default function DocumentExtractionPage() {
  const router = useRouter();

  const [result, setResult] =
    useState<ExtractionResult | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem("narcis_extraction_result");

      if (stored) {
        setResult(JSON.parse(stored));
      }
    } catch (error) {
      console.error(
        "NARCIS: unable to read extraction result",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const caseData = result?.case ?? {};

  const getValue = (key: string) =>
    caseData[key] ?? "";

  const missing = new Set(
    result?.missing_fields ?? []
  );

  const pdfUrl = result?.document_url
    ? `${API_BASE}${result.document_url}`
    : "";

  const fileSize = result?.file_size
    ? `${(result.file_size / (1024 * 1024)).toFixed(1)} MB`
    : "Unknown";

  return (
    <main className={styles.page}>

      {/* =====================================================
          EXACT NARCIS / NEW CASE SIDEBAR
      ====================================================== */}

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
            <span className={styles.navIcon}>＋</span>
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
          <span className={styles.sessionShield}>
            ♙
          </span>

          <span className={styles.sessionDot} />

          SECURE SESSION
        </div>

      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className={styles.main}>

        {/* HEADER */}

        <header className={styles.header}>

          <div>
            <h1>DOCUMENT EXTRACTION</h1>

            <p>
              NARCIS is extracting structured case information
              from the uploaded investigation document.
            </p>
          </div>

          <div className={styles.headerActions}>

            <button
              className={styles.iconButton}
              type="button"
            >
              <Icon type="bell" />

              <span className={styles.notificationBadge}>
                3
              </span>
            </button>

            <button
              className={styles.iconButton}
              type="button"
            >
              ?
            </button>

            <div className={styles.headerDivider} />

            <div className={styles.userMenu}>

              <div className={styles.userAvatar}>
                <Icon type="user" />
              </div>

              <div>
                <strong>Officer</strong>

                <small>
                  <span />
                  SECURE SESSION
                </small>
              </div>

              <span className={styles.chevron}>
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* BREADCRUMB */}

        <div className={styles.breadcrumb}>
          <span>Dashboard</span>
          <b>/</b>
          <span>New Case</span>
          <b>/</b>
          <span>Upload Document</span>
          <b>/</b>
          <strong>Extraction</strong>
        </div>

        {/* =================================================
            DOCUMENT STATUS CARD
        ================================================== */}

        <section className={styles.documentStatus}>

          <div className={styles.documentStatusLeft}>

            <span className={styles.sectionLabel}>
              CASE DOCUMENT
            </span>

            <div className={styles.documentRow}>

              <div className={styles.pdfMini}>
                PDF
              </div>

              <div>
                <h2>
                  {loading
                    ? "Loading document..."
                    : result?.filename ||
                      "Uploaded Document"}
                </h2>

                <div className={styles.documentMeta}>
                  <span>PDF Document</span>
                  <i />
                  <span>{fileSize}</span>
                  {result?.pages && (
                    <>
                      <i />
                      <span>
                        {result.pages} pages
                      </span>
                    </>
                  )}
                </div>
              </div>

            </div>

          </div>

          <div className={styles.extractionStatus}>

            <div className={styles.statusIcon}>
              <Icon type="check" />
            </div>

            <div>
              <strong>
                EXTRACTION COMPLETE
              </strong>

              <span>
                Extracted just now
              </span>
            </div>

          </div>

        </section>

        {/* =================================================
            MAIN EXTRACTION GRID
        ================================================== */}

        <section className={styles.extractionGrid}>

          {/* SOURCE DOCUMENT */}

          <section className={styles.sourceCard}>

            <div className={styles.cardHeader}>
              <h3>SOURCE DOCUMENT</h3>

              <div className={styles.viewerTools}>
                <button type="button">
                  −
                </button>

                <button type="button">
                  +
                </button>

                <span>
                  Fit
                </span>

                <span>
                  Page 1 / {result?.pages ?? "-"}
                </span>

                <button type="button">
                  <Icon type="download" />
                </button>
              </div>
            </div>

            <div className={styles.pdfViewer}>

              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="NARCIS source investigation document"
                />
              ) : (
                <div className={styles.noDocument}>
                  <div className={styles.largePdf}>
                    PDF
                  </div>

                  <strong>
                    Source document unavailable
                  </strong>

                  <span>
                    No document preview URL was returned.
                  </span>
                </div>
              )}

            </div>

          </section>

          {/* EXTRACTED INFORMATION */}

          <section className={styles.informationCard}>

            <div className={styles.cardHeader}>
              <div>
                <h3>
                  EXTRACTED CASE INFORMATION
                </h3>

                <p>
                  Information automatically extracted
                  from the uploaded document
                </p>
              </div>

              <span className={styles.fieldsBadge}>
                <Icon type="check" />
                {Object.values(caseData).filter(Boolean).length}
                &nbsp;Fields Extracted
              </span>
            </div>

            {/* CASE INFORMATION */}

            <div className={styles.fieldSection}>

              <h4>CASE INFORMATION</h4>

              <div className={styles.fieldsGrid}>

                <FieldCard
                  label="CASE ID"
                  value={getValue("Case_ID") || "NARCIS-025"}
                />

                <FieldCard
                  label="INVESTIGATION YEAR"
                  value={getValue("Investigation_Year")}
                  missing={missing.has("Investigation_Year")}
                />

                <FieldCard
                  label="AGENCY"
                  value={getValue("Agency")}
                  missing={missing.has("Agency")}
                />

                <FieldCard
                  label="ZONAL UNIT"
                  value={
                    getValue("NCB_Zonal_Unit") ||
                    getValue("Zonal_Unit")
                  }
                  missing={missing.has("NCB_Zonal_Unit")}
                />

              </div>

            </div>

            {/* DRUG INFORMATION */}

            <div className={styles.fieldSection}>

              <h4>DRUG INFORMATION</h4>

              <div className={styles.fieldsGridThree}>

                <FieldCard
                  label="DRUG TYPE"
                  value={getValue("Drug_Type")}
                  missing={missing.has("Drug_Type")}
                />

                <FieldCard
                  label="QUANTITY"
                  value={getValue("Quantity")}
                  missing={missing.has("Quantity")}
                />

                <FieldCard
                  label="QUANTITY CATEGORY"
                  value={getValue("Quantity_Category")}
                  missing={missing.has("Quantity_Category")}
                />

              </div>

            </div>

            {/* INVESTIGATION INFORMATION */}

            <div className={styles.fieldSection}>

              <h4>INVESTIGATION INFORMATION</h4>

              <div className={styles.fieldsGridThree}>

                <FieldCard
                  label="PERSONS ARRESTED"
                  value={getValue("Persons_Arrested")}
                  missing={missing.has("Persons_Arrested")}
                />

                <FieldCard
                  label="SOURCE TYPE"
                  value={getValue("Source_Type")}
                  missing={missing.has("Source_Type")}
                />

                <FieldCard
                  label="OPERATION TYPE"
                  value={getValue("Operation_Type")}
                  missing={missing.has("Operation_Type")}
                />

              </div>

            </div>

            {/* ROUTE INFORMATION */}

            <div className={styles.fieldSection}>

              <h4>ROUTE INFORMATION</h4>

              <div className={styles.fieldsGridFive}>

                <FieldCard
                  label="ORIGIN STATE"
                  value={getValue("Origin_State")}
                  missing={missing.has("Origin_State")}
                />

                <FieldCard
                  label="DESTINATION STATE"
                  value={getValue("Destination_State")}
                  missing={missing.has("Destination_State")}
                />

                <FieldCard
                  label="TRANSPORT MODE"
                  value={getValue("Transport_Mode")}
                  missing={missing.has("Transport_Mode")}
                />

                <FieldCard
                  label="ROUTE TYPE"
                  value={getValue("Route_Type")}
                  missing={missing.has("Route_Type")}
                />

                <FieldCard
                  label="INTERSTATE TRAVEL"
                  value={getValue("Interstate_Travel")}
                  missing={missing.has("Interstate_Travel")}
                />

              </div>

            </div>

            {/* LEGAL INFORMATION */}

            <div className={styles.fieldSection}>

              <h4>LEGAL INFORMATION</h4>

              <div className={styles.fieldsGridTwo}>

                <FieldCard
                  label="APPLICABLE NDPS SECTIONS"
                  value={
                    getValue(
                      "Applicable_NDPS_Sections"
                    )
                  }
                  missing={missing.has(
                    "Applicable_NDPS_Sections"
                  )}
                />

                <FieldCard
                  label="VEHICLE TYPE"
                  value={getValue("Vehicle_Type")}
                  missing={missing.has("Vehicle_Type")}
                />

              </div>

            </div>

          </section>

        </section>

        {/* =================================================
            VERIFICATION + WORKFLOW
        ================================================== */}

        <section className={styles.bottomGrid}>

          <section className={styles.verificationCard}>

            <div className={styles.verificationIcon}>
              <Icon type="info" />
            </div>

            <div>
              <h3>
                OFFICER VERIFICATION REQUIRED
              </h3>

              <p>
                The information above was extracted from
                the uploaded document. It has not yet been
                verified.
              </p>

              <p>
                The officer will review, correct, and enrich
                these fields before NARCIS performs AI analysis.
              </p>
            </div>

          </section>

          <section className={styles.workflowCard}>

            <div className={styles.cardHeader}>
              <h3>NARCIS CASE WORKFLOW</h3>
            </div>

            <div className={styles.workflow}>

              <WorkflowStep
                number="01"
                title="Upload Document"
                description=""
                state="complete"
              />

              <WorkflowStep
                number="02"
                title="Document Extraction"
                description="Extract case information from uploaded document"
                state="current"
              />

              <WorkflowStep
                number="03"
                title="Officer Verification"
                description="Officer verifies and enriches extracted information"
                state={undefined}
              />

              <WorkflowStep
                number="04"
                title="AI Analysis"
                description="ML analysis + SHAP explainability + RAG intelligence"
                state={undefined}
              />

              <WorkflowStep
                number="05"
                title="Decision-Support Report"
                description="Evidence package and LLM investigation report"
                state={undefined}
              />

              <WorkflowStep
                number="06"
                title="Officer Review"
                description="Final officer review and case disposition"
                last
              />

            </div>

          </section>

        </section>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div className={styles.bottomActions}>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push("/new-case")}
          >
            <Icon type="back" />
            BACK
          </button>

          <button
            type="button"
            className={styles.continueButton}
            onClick={() => {
              console.log(
                "NARCIS: Continue to verification",
                result
              );
            }}
          >
            CONTINUE TO VERIFICATION
            <Icon type="arrow" />
          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className={styles.footer}>

        <span>♧</span>

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
