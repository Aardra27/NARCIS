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

const fields = [
  ["Investigation Year", "Investigation_Year"],
  ["Agency", "Agency"],
  ["Drug Type", "Drug_Type"],
  ["NCB Zonal Unit", "NCB_Zonal_Unit"],
  ["Quantity", "Quantity"],
  ["Persons Arrested", "Persons_Arrested"],
  ["Source Type", "Source_Type"],
  ["Applicable NDPS Sections", "Applicable_NDPS_Sections"],
  ["Quantity Category", "Quantity_Category"],
  ["Operation Type", "Operation_Type"],
  ["Origin State", "Origin_State"],
  ["Destination State", "Destination_State"],
  ["Vehicle Type", "Vehicle_Type"],
  ["Transport Mode", "Transport_Mode"],
  ["Route Type", "Route_Type"],
  ["Interstate Travel", "Interstate_Travel"],
];

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
      console.error("NARCIS: failed to read extraction result", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const goBack = () => {
    router.push("/new-case");
  };

  const continueToAnalysis = () => {
    sessionStorage.setItem(
      "narcis_extraction_result",
      JSON.stringify(result)
    );

    router.push("/case-analysis");
  };

  const caseData = result?.case || {};

  return (
    <main className={styles.page}>

      {/* ================================================== */}
      {/* SIDEBAR - SAME NARCIS SHELL */}
      {/* ================================================== */}

      <aside className={styles.sidebar}>

        <div className={styles.sidebarTop}>

          <div className={styles.logoArea}>
            <div className={styles.logoMark}>N</div>
            <div className={styles.logoText}>
              <div>NARCIS</div>
              <span>INTELLIGENCE SYSTEM</span>
            </div>
          </div>

          <nav className={styles.navigation}>

            <button
              className={styles.navItem}
              onClick={() => router.push("/dashboard")}
            >
              <span className={styles.navIcon}>⌂</span>
              <span>Dashboard</span>
            </button>

            <button
              className={`${styles.navItem} ${styles.active}`}
              onClick={() => router.push("/new-case")}
            >
              <span className={styles.navIcon}>＋</span>
              <span>New Case</span>
            </button>

            <button
              className={styles.navItem}
              onClick={() => router.push("/case-analysis")}
            >
              <span className={styles.navIcon}>◫</span>
              <span>Case Analysis</span>
            </button>

            <button
              className={styles.navItem}
              onClick={() => router.push("/search")}
            >
              <span className={styles.navIcon}>⌕</span>
              <span>Search Cases</span>
            </button>

            <button
              className={styles.navItem}
              onClick={() => router.push("/alerts")}
            >
              <span className={styles.navIcon}>!</span>
              <span>Alerts</span>
            </button>

          </nav>

          <div className={styles.sectionTitle}>SYSTEM</div>

          <nav className={styles.navigation}>

            <button className={styles.navItem}>
              <span className={styles.navIcon}>⚙</span>
              <span>Settings</span>
            </button>

            <button className={styles.navItem}>
              <span className={styles.navIcon}>?</span>
              <span>Help &amp; Support</span>
            </button>

          </nav>

        </div>

        <div className={styles.sidebarBottom}>

          <div className={styles.officer}>
            <div className={styles.officerAvatar}>O</div>

            <div className={styles.officerInfo}>
              <strong>OFFICER</strong>
              <span>Logged in</span>
            </div>

            <button className={styles.logout}>↪</button>
          </div>

          <div className={styles.secureSession}>
            <span className={styles.secureDot}></span>

            <div>
              <strong>SECURE SESSION</strong>
              <span>Encrypted connection</span>
            </div>
          </div>

        </div>

      </aside>

      {/* ================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================== */}

      <section className={styles.main}>

        <header className={styles.header}>

          <div>
            <div className={styles.breadcrumb}>
              NEW CASE <span>/</span> DOCUMENT EXTRACTION
            </div>

            <h1>Document Extraction</h1>

            <p>
              Review information extracted from the uploaded case document.
            </p>
          </div>

          <div className={styles.headerStatus}>
            <span></span>
            EXTRACTION ENGINE ONLINE
          </div>

        </header>

        <div className={styles.content}>

          {/* Progress */}

          <div className={styles.progressCard}>

            <div className={styles.progressStep}>
              <div className={styles.stepNumber}>1</div>
              <div>
                <strong>DOCUMENT UPLOAD</strong>
                <span>Completed</span>
              </div>
            </div>

            <div className={styles.progressLine}></div>

            <div className={`${styles.progressStep} ${styles.currentStep}`}>
              <div className={styles.stepNumber}>2</div>
              <div>
                <strong>DOCUMENT EXTRACTION</strong>
                <span>Current step</span>
              </div>
            </div>

            <div className={styles.progressLine}></div>

            <div className={styles.progressStep}>
              <div className={styles.stepNumber}>3</div>
              <div>
                <strong>CASE ANALYSIS</strong>
                <span>Next</span>
              </div>
            </div>

          </div>

          {loading ? (

            <div className={styles.loadingCard}>
              <div className={styles.spinner}></div>
              <h2>Loading Extraction Result</h2>
              <p>Retrieving the processed case document...</p>
            </div>

          ) : !result ? (

            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>!</div>
              <h2>No Extraction Result Found</h2>
              <p>
                No processed document was found for this session.
                Return to New Case and upload a document.
              </p>

              <button
                className={styles.primaryButton}
                onClick={goBack}
              >
                BACK TO NEW CASE
              </button>
            </div>

          ) : (

            <>
              {/* Document information */}

              <div className={styles.documentCard}>

                <div className={styles.documentIcon}>PDF</div>

                <div className={styles.documentInfo}>
                  <span className={styles.cardLabel}>UPLOADED DOCUMENT</span>

                  <h2>{result.filename || "Case Document"}</h2>

                  <p>
                    {result.pages ?? "-"} pages
                    {" · "}
                    {result.file_size
                      ? `${(result.file_size / 1024).toFixed(1)} KB`
                      : "Size unavailable"}
                  </p>
                </div>

                <div className={styles.extractionComplete}>
                  <span></span>
                  {result.extraction_status === "complete"
                    ? "EXTRACTION COMPLETE"
                    : "EXTRACTION PROCESSED"}
                </div>

              </div>

              {/* Extracted case */}

              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.cardLabel}>AI EXTRACTED DATA</span>
                  <h2>Case Information</h2>
                </div>

                <span className={styles.fieldCount}>
                  {Object.keys(caseData).length} FIELDS
                </span>
              </div>

              <div className={styles.fieldsGrid}>

                {fields.map(([label, key]) => (
                  <div className={styles.fieldCard} key={key}>

                    <label>{label}</label>

                    <div className={styles.fieldValue}>
                      {caseData[key] || (
                        <span className={styles.missing}>Not detected</span>
                      )}
                    </div>

                  </div>
                ))}

              </div>

              {result.missing_fields &&
                result.missing_fields.length > 0 && (
                  <div className={styles.warningCard}>
                    <strong>FIELDS REQUIRING REVIEW</strong>

                    <p>
                      Some information could not be confidently extracted
                      from the document.
                    </p>

                    <div>
                      {result.missing_fields.map((field) => (
                        <span key={field}>{field}</span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Actions */}

              <div className={styles.actions}>

                <button
                  className={styles.secondaryButton}
                  onClick={goBack}
                >
                  ← BACK TO NEW CASE
                </button>

                <button
                  className={styles.primaryButton}
                  onClick={continueToAnalysis}
                >
                  CONTINUE TO CASE ANALYSIS →
                </button>

              </div>

            </>

          )}

        </div>

      </section>

    </main>
  );
}
