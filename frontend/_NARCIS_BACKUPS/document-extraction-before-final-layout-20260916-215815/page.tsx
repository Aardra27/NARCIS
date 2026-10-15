"use client";

import { useEffect, useState, type ReactNode } from "react";
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

const navigation = [
  { icon: "▦", label: "Dashboard" },
  { icon: "＋", label: "New Case", active: true },
  { icon: "□", label: "Cases" },
  { icon: "⌘", label: "Intelligence" },
  { icon: "▤", label: "Reports" },
  { icon: "◷", label: "Case History" },
];

const fieldGroups = [
  {
    title: "CASE INFORMATION",
    fields: [
      ["Case ID", "Case_ID"],
      ["Investigation Year", "Investigation_Year"],
      ["Agency", "Agency"],
      ["Zonal Unit", "NCB_Zonal_Unit"],
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

  const paths: Record<string, ReactNode> = {
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

    download: (
      <>
        <path d="M12 4v12" />
        <path d="m7 11 5 5 5-5" />
        <path d="M5 20h14" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <path d="M12 7h.01" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  };

  return <svg {...common}>{paths[type] ?? paths.info}</svg>;
}

export default function DocumentExtractionPage() {
  const router = useRouter();

  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [loading, setLoading] = useState(true);

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
    sessionStorage.setItem(
      "narcis_extraction_result",
      JSON.stringify(result)
    );

    router.push("/case-verification");
  };

  const caseData = result?.case ?? {};

  /*
   * Backend returns:
   * /api/cases/document/{document_id}
   *
   * That is a backend URL, not a Next.js frontend URL.
   * Therefore relative URLs are explicitly prefixed with the
   * running FastAPI server.
   */
  const pdfUrl = result?.document_url
    ? result.document_url.startsWith("http")
      ? result.document_url
      : `http://127.0.0.1:8000${result.document_url}`
    : "";

  const fileSize = result?.file_size
    ? `${(result.file_size / (1024 * 1024)).toFixed(1)} MB`
    : "Unknown";

  const fieldCount = Object.keys(caseData).length;

  return (
    <main className={styles.page}>

      {/* =========================================================
          SAME SIDEBAR AS WORKING NEW CASE PAGE
          ========================================================= */}

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

          {navigation.map((item) => (

            <button
              key={item.label}
              className={`${styles.navItem} ${
                item.active ? styles.navActive : ""
              }`}
              type="button"
              onClick={() => {

                if (item.label === "Dashboard") {
                  router.push("/dashboard");
                }

                if (item.label === "New Case") {
                  router.push("/new-case");
                }

              }}
            >

              <span className={styles.navIcon}>
                {item.icon}
              </span>

              <span>{item.label}</span>

            </button>

          ))}

        </nav>

        <div className={styles.sidebarDivider} />

        <nav className={styles.navigation}>

          <button className={styles.navItem} type="button">

            <span className={styles.navIcon}>⚙</span>

            <span>Settings</span>

          </button>

          <button className={styles.navItem} type="button">

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


      {/* =========================================================
          MAIN CONTENT
          ========================================================= */}

      <section className={styles.main}>

        {/* SAME HEADER STRUCTURE AS NEW CASE */}

        <header className={styles.header}>

          <div>

            <h1>DOCUMENT EXTRACTION</h1>

            <p>
              NARCIS is extracting structured case information from the uploaded investigation document.
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


        {/* SAME BREADCRUMB STYLE */}

        <div className={styles.breadcrumb}>

          <span>Dashboard</span>

          <b>/</b>

          <span>New Case</span>

          <b>/</b>

          <span>Upload Document</span>

          <b>/</b>

          <strong>Extraction</strong>

        </div>


        {loading ? (

          <div className={styles.loadingCard}>

            <div className={styles.spinner} />

            <h2>Loading Extraction Result</h2>

            <p>
              Retrieving the processed case document...
            </p>

          </div>

        ) : !result ? (

          <div className={styles.emptyCard}>

            <div className={styles.emptyIcon}>
              !
            </div>

            <h2>No Extraction Result Found</h2>

            <p>
              No processed document was found for this session.
              Return to New Case and upload a document.
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={goBack}
            >
              BACK TO NEW CASE
            </button>

          </div>

        ) : (

          <div className={styles.pageContent}>

            {/* =====================================================
                TOP DOCUMENT STATUS
                ===================================================== */}

            <section className={styles.documentCard}>

              <div className={styles.documentLeft}>

                <div className={styles.pdfMiniIcon}>
                  PDF
                </div>

                <div className={styles.documentInfo}>

                  <span className={styles.cardLabel}>
                    CASE DOCUMENT
                  </span>

                  <h2>
                    {result.filename || "Case Document"}
                  </h2>

                  <p>
                    PDF Document
                    {"  ·  "}
                    {fileSize}
                    {"  ·  "}
                    {result.pages ?? "-"} pages
                  </p>

                </div>

              </div>

              <div className={styles.extractionComplete}>

                <span className={styles.completeCircle}>
                  ✓
                </span>

                <div>

                  <strong>
                    {result.extraction_status === "complete"
                      ? "EXTRACTION COMPLETE"
                      : "EXTRACTION PROCESSED"}
                  </strong>

                  <span>
                    Extracted just now
                  </span>

                </div>

              </div>

            </section>


            {/* =====================================================
                TOP AREA
                LEFT = PDF VIEWER
                RIGHT = NEW CASE WORKFLOW
                ===================================================== */}

            <div className={styles.topGrid}>

              {/* ===================================================
                  SOURCE DOCUMENT
                  =================================================== */}

              <section className={styles.sourceCard}>

                <div className={styles.cardHeader}>

                  <h3>SOURCE DOCUMENT</h3>

                  <div className={styles.pdfControls}>

                    <button type="button">
                      −
                    </button>

                    <button type="button">
                      +
                    </button>

                    <button type="button">
                      Fit
                    </button>

                    <span>
                      Page 1 / {result.pages ?? "-"}
                    </span>

                    <button
                      type="button"
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
                      <Icon type="download" />
                    </button>

                  </div>

                </div>


                <div className={styles.pdfViewer}>

                  {pdfUrl ? (

                    <iframe
                      src={pdfUrl}
                      title="Uploaded investigation document"
                      className={styles.pdfFrame}
                    />

                  ) : (

                    <div className={styles.pdfPlaceholder}>

                      <div className={styles.pdfLargeIcon}>
                        PDF
                      </div>

                      <strong>
                        SOURCE DOCUMENT
                      </strong>

                      <span>
                        {result.filename ||
                          "Uploaded investigation document"}
                      </span>

                      <small>
                        The document URL is not available.
                      </small>

                    </div>

                  )}

                </div>

              </section>


              {/* ===================================================
                  EXACT NEW CASE WORKFLOW
                  STEP 1 = COMPLETE
                  STEP 2 = CURRENT
                  =================================================== */}

              <aside className={styles.workflowCard}>

                <div className={styles.cardHeader}>

                  <h3>NARCIS CASE WORKFLOW</h3>

                </div>

                <div className={styles.workflow}>

                  {/* STEP 01 */}

                  <div
                    className={`${styles.workflowStep} ${styles.completeStep}`}
                  >

                    <div className={styles.stepNumber}>
                      ✓
                    </div>

                    <div className={styles.stepText}>

                      <div className={styles.stepTitle}>

                        <strong>
                          Upload Document
                        </strong>

                        <span className={styles.completeBadge}>
                          COMPLETE
                        </span>

                      </div>

                    </div>

                  </div>


                  <div className={styles.workflowLine} />


                  {/* STEP 02 */}

                  <div
                    className={`${styles.workflowStep} ${styles.currentStep}`}
                  >

                    <div className={styles.stepNumber}>
                      02
                    </div>

                    <div className={styles.stepText}>

                      <div className={styles.stepTitle}>

                        <strong>
                          Document Extraction
                        </strong>

                        <span className={styles.currentBadge}>
                          CURRENT
                        </span>

                      </div>

                      <span>
                        Extract case information from uploaded document
                      </span>

                    </div>

                  </div>


                  <div className={styles.workflowLine} />


                  {/* STEP 03 */}

                  <div className={styles.workflowStep}>

                    <div className={styles.stepNumber}>
                      03
                    </div>

                    <div className={styles.stepText}>

                      <strong>
                        Officer Verification
                      </strong>

                      <span>
                        Officer verifies and enriches extracted information
                      </span>

                    </div>

                  </div>


                  <div className={styles.workflowLine} />


                  {/* STEP 04 */}

                  <div className={styles.workflowStep}>

                    <div className={styles.stepNumber}>
                      04
                    </div>

                    <div className={styles.stepText}>

                      <strong>
                        AI Analysis
                      </strong>

                      <span>
                        ML analysis + SHAP explainability + RAG intelligence
                      </span>

                    </div>

                  </div>


                  <div className={styles.workflowLine} />


                  {/* STEP 05 */}

                  <div className={styles.workflowStep}>

                    <div className={styles.stepNumber}>
                      05
                    </div>

                    <div className={styles.stepText}>

                      <strong>
                        Decision-Support Report
                      </strong>

                      <span>
                        Evidence package and LLM investigation report
                      </span>

                    </div>

                  </div>


                  <div className={styles.workflowLine} />


                  {/* STEP 06 */}

                  <div className={styles.workflowStep}>

                    <div className={styles.stepNumber}>
                      06
                    </div>

                    <div className={styles.stepText}>

                      <strong>
                        Officer Review
                      </strong>

                      <span>
                        Final officer review and case disposition
                      </span>

                    </div>

                  </div>

                </div>

              </aside>

            </div>


            {/* =====================================================
                EVERYTHING BELOW THIS POINT IS AFTER SCROLL
                ===================================================== */}

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
                    Information automatically extracted from the uploaded document
                  </p>

                </div>

                <span className={styles.fieldCount}>
                  ✓ {fieldCount} Fields Extracted
                </span>

              </div>


              {fieldGroups.map((group) => (

                <section
                  className={styles.fieldGroup}
                  key={group.title}
                >

                  <h3>
                    {group.title}
                  </h3>

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

                            {value ? (
                              value
                            ) : (
                              <span className={styles.missing}>
                                Not found in document
                              </span>
                            )}

                          </div>

                          <span className={styles.extractedStatus}>
                            ✓ Extracted
                          </span>

                        </div>

                      );

                    })}

                  </div>

                </section>

              ))}

            </section>


            {/* =====================================================
                VERIFICATION NOTICE
                ===================================================== */}

            <section className={styles.verificationCard}>

              <div className={styles.verificationIcon}>
                <Icon type="info" />
              </div>

              <div>

                <h3>
                  OFFICER VERIFICATION REQUIRED
                </h3>

                <p>
                  The information above was extracted from the uploaded document.
                  It has not yet been verified.
                </p>

                <p>
                  The officer will review, correct, and enrich these fields
                  before NARCIS performs AI analysis.
                </p>

              </div>

            </section>


            {/* =====================================================
                ACTIONS
                ===================================================== */}

            <div className={styles.actions}>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={goBack}
              >
                ← BACK
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={continueToVerification}
              >
                CONTINUE TO VERIFICATION
                <span>→</span>
              </button>

            </div>

          </div>

        )}

      </section>


      {/* =========================================================
          SAME FOOTER STYLE AS NEW CASE
          ========================================================= */}

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
