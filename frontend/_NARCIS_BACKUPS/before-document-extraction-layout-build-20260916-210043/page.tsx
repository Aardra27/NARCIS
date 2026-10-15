"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./document-extraction.module.css";

type ExtractionCase = {
  Investigation_Year?: string;
  Agency?: string;
  Drug_Type?: string;
  NCB_Zonal_Unit?: string;
  Quantity?: string;
  Persons_Arrested?: string;
  Source_Type?: string;
  Applicable_NDPS_Sections?: string;
  Quantity_Category?: string;
  Operation_Type?: string;
  Origin_State?: string;
  Destination_State?: string;
  Vehicle_Type?: string;
  Transport_Mode?: string;
  Route_Type?: string;
  Interstate_Travel?: string;
};

type ExtractionResult = {
  success?: boolean;
  document_id?: string;
  filename?: string;
  file_size?: number;
  pages?: number;
  extraction_status?: string;
  case?: ExtractionCase;
  missing_fields?: string[];
  document_url?: string;
};

export default function DocumentExtractionPage() {
  const router = useRouter();

  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("narcis_extraction_result");

      if (!stored) {
        setLoading(false);
        return;
      }

      const parsed: ExtractionResult = JSON.parse(stored);
      setResult(parsed);
    } catch (error) {
      console.error("NARCIS: unable to read extraction result", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const caseData = result?.case;

  const fields = [
    ["Investigation Year", caseData?.Investigation_Year],
    ["Agency", caseData?.Agency],
    ["Drug Type", caseData?.Drug_Type],
    ["NCB Zonal Unit", caseData?.NCB_Zonal_Unit],
    ["Quantity", caseData?.Quantity],
    ["Persons Arrested", caseData?.Persons_Arrested],
    ["Source Type", caseData?.Source_Type],
    ["Applicable NDPS Sections", caseData?.Applicable_NDPS_Sections],
    ["Quantity Category", caseData?.Quantity_Category],
    ["Operation Type", caseData?.Operation_Type],
    ["Origin State", caseData?.Origin_State],
    ["Destination State", caseData?.Destination_State],
    ["Vehicle Type", caseData?.Vehicle_Type],
    ["Transport Mode", caseData?.Transport_Mode],
    ["Route Type", caseData?.Route_Type],
    ["Interstate Travel", caseData?.Interstate_Travel],
  ];

  return (
    <div className={styles.page}>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>

        <div className={styles.logoArea}>
          <div className={styles.logoMark}>N</div>
          <div>
            <div className={styles.logoText}>NARCIS</div>
            <div className={styles.logoSubtext}>
              NARCOTICS ANALYSIS
            </div>
          </div>
        </div>

        <nav className={styles.navigation}>

          <button
            className={styles.navItem}
            onClick={() => router.push("/dashboard")}
          >
            <span className={styles.navIcon}>⌂</span>
            Dashboard
          </button>

          <button
            className={styles.navItem}
            onClick={() => router.push("/new-case")}
          >
            <span className={styles.navIcon}>＋</span>
            New Case
          </button>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>▣</span>
            Cases
          </button>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>◈</span>
            Intelligence
          </button>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>▤</span>
            Reports
          </button>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>◷</span>
            Case History
          </button>

        </nav>

        <div className={styles.sidebarBottom}>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>⚙</span>
            Settings
          </button>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>?</span>
            Help & Support
          </button>

          <div className={styles.officerBlock}>
            <div className={styles.officerAvatar}>O</div>
            <div>
              <div className={styles.officerName}>OFFICER</div>
              <div className={styles.officerRole}>NARCIS USER</div>
            </div>
          </div>

          <div className={styles.secureSession}>
            <span className={styles.secureDot}></span>
            <span>SECURE SESSION</span>
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>

        <header className={styles.header}>
          <div>
            <div className={styles.breadcrumb}>
              NEW CASE <span>›</span> DOCUMENT EXTRACTION
            </div>

            <h1>Document Extraction</h1>

            <p>
              Review information extracted from the uploaded case document.
            </p>
          </div>

          <div className={styles.headerStatus}>
            <span className={styles.statusDot}></span>
            EXTRACTION COMPLETE
          </div>
        </header>

        {loading && (
          <section className={styles.loadingCard}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading extraction result...</h2>
            <p>Retrieving the extracted case information.</p>
          </section>
        )}

        {!loading && !result && (
          <section className={styles.emptyCard}>
            <div className={styles.emptyIcon}>!</div>
            <h2>No extraction result found</h2>
            <p>
              No document extraction result is currently available.
            </p>

            <button
              className={styles.primaryButton}
              onClick={() => router.push("/new-case")}
            >
              RETURN TO NEW CASE
              <span>→</span>
            </button>
          </section>
        )}

        {!loading && result && (
          <>
            {/* DOCUMENT SUMMARY */}
            <section className={styles.documentCard}>

              <div className={styles.documentIcon}>PDF</div>

              <div className={styles.documentInfo}>
                <span className={styles.sectionLabel}>
                  SOURCE DOCUMENT
                </span>

                <h2>{result.filename || "Uploaded Document"}</h2>

                <div className={styles.documentMeta}>
                  <span>
                    {result.pages ?? "-"} pages
                  </span>

                  <span>
                    {result.file_size
                      ? `${(result.file_size / (1024 * 1024)).toFixed(2)} MB`
                      : "-"}
                  </span>

                  <span>
                    ID: {result.document_id || "-"}
                  </span>
                </div>
              </div>

              <div className={styles.completeBadge}>
                <span></span>
                COMPLETE
              </div>

            </section>

            {/* EXTRACTION RESULTS */}
            <section className={styles.resultsSection}>

              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionLabel}>
                    AI DOCUMENT ANALYSIS
                  </span>

                  <h2>Extracted Case Information</h2>
                </div>

                <div className={styles.fieldCount}>
                  {fields.filter(([, value]) => value).length} FIELDS
                </div>
              </div>

              <div className={styles.fieldsGrid}>

                {fields.map(([label, value]) => (
                  <div
                    className={styles.fieldCard}
                    key={label}
                  >
                    <span className={styles.fieldLabel}>
                      {label}
                    </span>

                    <span className={styles.fieldValue}>
                      {value || "Not available"}
                    </span>
                  </div>
                ))}

              </div>

            </section>

            {/* MISSING FIELDS */}
            {result.missing_fields &&
              result.missing_fields.length > 0 && (
                <section className={styles.warningCard}>

                  <div className={styles.warningIcon}>!</div>

                  <div>
                    <h3>Missing Information</h3>
                    <p>
                      Some fields could not be extracted from the document.
                    </p>

                    <div className={styles.missingFields}>
                      {result.missing_fields.map((field) => (
                        <span key={field}>{field}</span>
                      ))}
                    </div>
                  </div>

                </section>
              )}

            {/* ACTIONS */}
            <div className={styles.actions}>

              <button
                className={styles.secondaryButton}
                onClick={() => router.push("/new-case")}
              >
                ← BACK TO NEW CASE
              </button>

              <button
                className={styles.primaryButton}
                onClick={() => {
                  console.log(
                    "NARCIS: extraction reviewed",
                    result
                  );
                }}
              >
                CONTINUE
                <span>→</span>
              </button>

            </div>
          </>
        )}

      </main>
    </div>
  );
}
