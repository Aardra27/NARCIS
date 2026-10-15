"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./reports.module.css";

type ReportEntry = {
  case_id?: string;
  report_type?: string;
  generated_at?: string;
  pdf_download_url?: string;
  pdf_file?: string;
};

export default function ReportsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/cases/reports");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || "Unable to load the generated reports.");
        }

        const payload = await response.json();
        setItems(payload.items || []);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "The report list could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, []);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.logoArea}>
            <img src="/narcis-logo.png" alt="NARCIS" className={styles.logo} />
            <span>NARCIS</span>
          </div>
          <p>
            Narcotics Analysis, Risk Classification
            <br />
            and Intelligent Support System
          </p>
        </div>

        <nav className={styles.navigation}>
          <button className={styles.navItem} type="button" onClick={() => router.push("/dashboard")}>
            <span className={styles.navIcon}>▦</span>
            <span>Dashboard</span>
          </button>
          <button className={styles.navItem} type="button" onClick={() => router.push("/new-case")}>
            <span className={styles.navIcon}>+</span>
            <span>New Case</span>
          </button>
          <button className={styles.navItem} type="button" onClick={() => router.push("/cases")}>
            <span className={styles.navIcon}>□</span>
            <span>Cases</span>
          </button>
          <button className={`${styles.navItem} ${styles.navActive}`} type="button" onClick={() => router.push("/reports")}>
            <span className={styles.navIcon}>▤</span>
            <span>Reports</span>
          </button>
        </nav>

        <div className={styles.sidebarDivider} />
        <div className={styles.sidebarOfficer}>
          <div className={styles.officerAvatar}>♟</div>
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

      <section className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>REPORT LIBRARY</h1>
            <p>Generated investigation and decision-support reports.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconButton} type="button" aria-label="Generate report" onClick={() => router.push("/decision-support-report")}>
              ⎈
            </button>
            <div className={styles.headerDivider} />
            <div className={styles.userMenu}>
              <div className={styles.userAvatar}>●</div>
              <div>
                <strong>Officer</strong>
                <small>
                  <span />
                  SECURE SESSION
                </small>
              </div>
              <span className={styles.chevron}>˅</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.breadcrumb}>
            <span>Dashboard</span>
            <b>/</b>
            <strong>Reports</strong>
          </div>

          <section className={styles.verificationHero}>
            <div>
              <span className={styles.verificationHeroLabel}>REPORTS</span>
              <h2>{loading ? "Loading reports..." : `${items.length} report(s) available`}</h2>
              <p>The case library currently contains generated decision-support reports and finalized PDF artifacts.</p>
            </div>
            <div className={styles.verificationStatus}>
              <div className={styles.verificationStatusIcon} style={{ background: error ? "#c25d56" : "#1d69d4" }}>
                {error ? "!" : "✓"}
              </div>
              <div>
                <strong>{error ? "REPORT ISSUE" : "REPORTS READY"}</strong>
                <small>{error || "Recent reports downloaded"}</small>
              </div>
            </div>
          </section>

          <div className={styles.verificationCard}>
            {loading ? (
              <div className={styles.loadingState}>Loading report inventory...</div>
            ) : error ? (
              <div className={styles.errorCard}>{error}</div>
            ) : (
              <div className={styles.reportList}>
                {items.length === 0 ? (
                  <div className={styles.emptyState}>No generated reports are currently available.</div>
                ) : (
                  items.map((entry) => (
                    <div className={styles.reportCard} key={`${entry.case_id || "report"}-${entry.pdf_file || "generated"}`}>
                      <div>
                        <div className={styles.caseHeader}>
                          <span className={styles.caseBadge}>REPORT</span>
                          <strong>{entry.case_id || "UNKNOWN"}</strong>
                        </div>
                        <div className={styles.caseMeta}>
                          <span>{entry.report_type || "NARCIS investigation report"}</span>
                          <span>{entry.generated_at || "Generated"}</span>
                        </div>
                      </div>
                      <div className={styles.caseActionRow}>
                        <small>{entry.pdf_file || "PDF available"}</small>
                        <button type="button" onClick={() => {
                          const url = entry.pdf_download_url || "";
                          if (url) {
                            window.open(`http://127.0.0.1:8000${url}`, "_blank", "noopener,noreferrer");
                          }
                        }}>
                          OPEN PDF
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>◇</span>
        <strong>NARCIS - Authorized Investigation Environment</strong>
        <i />
        <span>All data is encrypted and access is monitored</span>
        <i />
        <span>Version 1.0.0</span>
      </footer>
    </main>
  );
}
