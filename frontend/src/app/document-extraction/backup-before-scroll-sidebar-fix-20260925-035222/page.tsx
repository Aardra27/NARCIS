"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./document-extraction.module.css";

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

const fieldGroups = [
  {
    title: "CASE INFORMATION",
    fields: [
      ["Investigation Year", "Investigation_Year"],
      ["Agency", "Agency"],
      ["NCB Zonal Unit", "NCB_Zonal_Unit"],
    ],
  },
  {
    title: "DRUG INFORMATION",
    fields: [
      ["Drug Type", "Drug_Type"],
      ["Quantity", "Quantity"],
      ["Quantity Category", "Quantity_Category"],
    ],
  },
  {
    title: "INVESTIGATION INFORMATION",
    fields: [
      ["Persons Arrested", "Persons_Arrested"],
      ["Source Type", "Source_Type"],
      ["Operation Type", "Operation_Type"],
    ],
  },
  {
    title: "ROUTE INFORMATION",
    fields: [
      ["Origin State", "Origin_State"],
      ["Destination State", "Destination_State"],
      ["Transport Mode", "Transport_Mode"],
      ["Route Type", "Route_Type"],
      ["Interstate Travel", "Interstate_Travel"],
    ],
  },
  {
    title: "LEGAL INFORMATION",
    fields: [
      ["Applicable NDPS Sections", "Applicable_NDPS_Sections"],
      ["Vehicle Type", "Vehicle_Type"],
    ],
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Upload Document",
    description: "Upload the investigation document",
  },
  {
    number: "02",
    title: "Document Extraction",
    description: "Extract case information from uploaded document",
  },
  {
    number: "03",
    title: "Officer Verification",
    description: "Officer verifies and enriches extracted information",
  },
  {
    number: "04",
    title: "AI Analysis",
    description: "ML analysis + SHAP explainability + RAG intelligence",
  },
  {
    number: "05",
    title: "Decision-Support Report",
    description: "Evidence package and LLM investigation report",
  },
  {
    number: "06",
    title: "Officer Review",
    description: "Final officer review and case disposition",
  },
];

function formatFileSize(bytes?: number) {
  if (!bytes) return "Size unavailable";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveDocumentUrl(url?: string) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `http://127.0.0.1:8000${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function DocumentExtractionPage() {
  const router = useRouter();

  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("narcis_extraction_result");

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

  const goBack = () => {
    router.push("/new-case");
  };

  const continueToVerification = () => {
    if (result) {
      sessionStorage.setItem(
        "narcis_extraction_result",
        JSON.stringify(result)
      );
    }

    router.push("/case-verification");
  };

  const caseData = result?.case || {};

  const extractedFieldCount = Object.values(caseData).filter(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  ).length;

  const pdfUrl = resolveDocumentUrl(result?.document_url);

  return (
    <main className={styles.page}>

      {/* =====================================================
          SIDEBAR
          SAME NARCIS SHELL AS NEW CASE
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

      <section className={styles.main}>

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
              aria-label="Notifications"
            >
              ♧
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
                ●
              </div>

              <div>
                <strong>Officer</strong>

                <small>
                  <span />
                  SECURE SESSION
                </small>
              </div>

              <span className={styles.chevron}>
                ˅
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
            <span>Upload Document</span>
            <b>/</b>
            <strong>Extraction</strong>
          </div>


          {/* =================================================
              TOP DOCUMENT STATUS CARD
              ================================================= */}

          {loading ? (
            <div className={styles.loadingCard}>
              Loading extraction result...
            </div>
          ) : !result ? (
            <div className={styles.emptyCard}>
              <h2>No Extraction Result Found</h2>

              <p>
                No processed document was found for this session.
                Return to New Case and upload a document.
              </p>

              <button
                className={styles.primaryButton}
                type="button"
                onClick={goBack}
              >
                BACK TO NEW CASE
              </button>
            </div>
          ) : (
            <>

              <section className={styles.documentStatusCard}>

                <div className={styles.pdfBadge}>
                  PDF
                </div>

                <div className={styles.documentStatusInfo}>

                  <span className={styles.cardLabel}>
                    CASE DOCUMENT
                  </span>

                  <h2>
                    {result.filename || "Case Document"}
                  </h2>

                  <p>
                    PDF Document
                    {" · "}
                    {formatFileSize(result.file_size)}
                    {" · "}
                    {result.pages ?? "-"} pages
                  </p>

                </div>

                <div className={styles.extractionStatus}>

                  <span className={styles.statusCheck}>
                    ✓
                  </span>

                  <div>
                    <strong>
                      EXTRACTION COMPLETE
                    </strong>

                    <small>
                      Extracted just now
                    </small>
                  </div>

                </div>

              </section>


              {/* =============================================
                  DOCUMENT + WORKFLOW
                  SAME HEIGHT
                  ============================================= */}

              <div className={styles.topGrid}>

                {/* SOURCE DOCUMENT */}

                <section className={styles.documentPanel}>

                  <div className={styles.panelHeader}>

                    <h2>SOURCE DOCUMENT</h2>

                    <div className={styles.pdfControls}>

                      <button
                        type="button"
                        aria-label="Zoom out"
                      >
                        −
                      </button>

                      <button
                        type="button"
                        aria-label="Zoom in"
                      >
                        +
                      </button>

                      <button
                        type="button"
                      >
                        Fit
                      </button>

                      <span>
                        Page 1 / {result.pages ?? 1}
                      </span>

                      <button
                        type="button"
                        aria-label="Download document"
                        onClick={() => {
                          if (pdfUrl) {
                            window.open(
                              pdfUrl,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }}
                      >
                        ↓
                      </button>

                    </div>

                  </div>


                  <div className={styles.pdfViewer}>

                    {pdfUrl && !pdfError ? (

                      <iframe
                        src={pdfUrl}
                        title="Uploaded investigation document"
                        className={styles.pdfFrame}
                        onError={() => setPdfError(true)}
                      />

                    ) : (

                      <div className={styles.pdfFallback}>

                        <div className={styles.pdfFallbackIcon}>
                          PDF
                        </div>

                        <strong>
                          Document preview unavailable
                        </strong>

                        <span>
                          The extracted information is still available below.
                        </span>

                        {pdfUrl && (
                          <button
                            type="button"
                            className={styles.openPdfButton}
                            onClick={() => {
                              window.open(
                                pdfUrl,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                          >
                            OPEN PDF
                          </button>
                        )}

                      </div>

                    )}

                  </div>

                </section>


                {/* WORKFLOW */}

                <aside className={styles.workflowCard}>

                  <div className={styles.workflowHeader}>
                    <h2>NARCIS CASE WORKFLOW</h2>
                  </div>

                  <div className={styles.workflowBody}>

                    {workflowSteps.map((step, index) => {

                      const isComplete = index === 0;
                      const isCurrent = index === 1;

                      return (
                        <div
                          className={styles.workflowStep}
                          key={step.number}
                        >

                          <div className={styles.workflowRail}>

                            <div
                              className={`
                                ${styles.stepNumber}
                                ${isComplete ? styles.complete : ""}
                                ${isCurrent ? styles.current : ""}
                              `}
                            >
                              {isComplete ? "✓" : step.number}
                            </div>

                            {index < workflowSteps.length - 1 && (
                              <div
                                className={`
                                  ${styles.workflowLine}
                                  ${isComplete ? styles.lineComplete : ""}
                                `}
                              />
                            )}

                          </div>

                          <div className={styles.stepContent}>

                            <div className={styles.stepTitleRow}>

                              <strong>
                                {step.title}
                              </strong>

                              {isComplete && (
                                <span className={styles.completeBadge}>
                                  COMPLETE
                                </span>
                              )}

                              {isCurrent && (
                                <span className={styles.currentBadge}>
                                  CURRENT
                                </span>
                              )}

                            </div>

                            <p>
                              {step.description}
                            </p>

                          </div>

                        </div>
                      );
                    })}

                  </div>

                </aside>

              </div>


              {/* =============================================
                  EXTRACTED INFORMATION
                  BELOW THE TWO TOP PANELS
                  ============================================= */}

              <section className={styles.extractedSection}>

                <div className={styles.extractedHeader}>

                  <div>

                    <span className={styles.cardLabel}>
                      AI EXTRACTED DATA
                    </span>

                    <h2>
                      EXTRACTED CASE INFORMATION
                    </h2>

                    <p>
                      Structured information extracted from the uploaded
                      investigation document.
                    </p>

                  </div>

                  <span className={styles.fieldCount}>
                    {extractedFieldCount} FIELDS EXTRACTED
                  </span>

                </div>


                {fieldGroups.map((group) => (

                  <section
                    className={styles.fieldGroup}
                    key={group.title}
                  >

                    <div className={styles.fieldGroupHeader}>
                      <strong>{group.title}</strong>
                      <span>⌃</span>
                    </div>

                    <div className={styles.fieldsGrid}>

                      {group.fields.map(([label, key]) => {

                        const value = caseData[key];

                        return (
                          <div
                            className={styles.fieldCard}
                            key={key}
                          >

                            <label>
                              {label}
                            </label>

                            <div className={styles.fieldValue}>
                              {value &&
                              String(value).trim() !== "" ? (
                                value
                              ) : (
                                <span className={styles.missing}>
                                  Not detected
                                </span>
                              )}
                            </div>

                            <div className={styles.extractedTag}>
                              <span />
                              Extracted
                            </div>

                          </div>
                        );

                      })}

                    </div>

                  </section>

                ))}


                {result.missing_fields &&
                  result.missing_fields.length > 0 && (

                    <div className={styles.warningCard}>

                      <div className={styles.warningIcon}>
                        !
                      </div>

                      <div>

                        <strong>
                          FIELDS REQUIRING REVIEW
                        </strong>

                        <p>
                          Some information could not be confidently
                          extracted from the document.
                        </p>

                        <div className={styles.warningFields}>

                          {result.missing_fields.map((field) => (
                            <span key={field}>
                              {field}
                            </span>
                          ))}

                        </div>

                      </div>

                    </div>

                  )}


                {/* ===========================================
                    VERIFICATION MESSAGE
                    =========================================== */}

                <div className={styles.verificationNotice}>

                  <div className={styles.infoCircle}>
                    i
                  </div>

                  <div>

                    <strong>
                      OFFICER VERIFICATION REQUIRED
                    </strong>

                    <p>
                      The officer must review, correct and enrich
                      the extracted information before NARCIS performs
                      AI analysis.
                    </p>

                  </div>

                </div>


                {/* ===========================================
                    ACTIONS
                    =========================================== */}

                <div className={styles.actions}>

                  <button
                    className={styles.backButton}
                    type="button"
                    onClick={goBack}
                  >
                    ← BACK
                  </button>

                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={continueToVerification}
                  >
                    CONTINUE TO VERIFICATION →
                  </button>

                </div>

              </section>

            </>
          )}

        </div>

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

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
