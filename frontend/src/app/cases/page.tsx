"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./cases.module.css";

type CaseEntry = {
  case_id?: string;
  filename?: string;
  status?: string;
  drug_type?: string;
  quantity?: string;
  location?: string;
  route_type?: string;
  updated_at?: string;
};

export default function CasesPage() {
  const router = useRouter();
  const [items, setItems] = useState<CaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCases = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/cases/library");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || "Unable to load the case library.");
        }

        const payload = await response.json();
        setItems(payload.items || []);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "The case library could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    void loadCases();
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
          <button className={`${styles.navItem} ${styles.navActive}`} type="button" onClick={() => router.push("/cases")}>
            <span className={styles.navIcon}>□</span>
            <span>Cases</span>
          </button>
          <button className={styles.navItem} type="button" onClick={() => router.push("/reports")}>
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
            <h1>CASE LIBRARY</h1>
            <p>Verified and finalized NARCIS case records.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconButton} type="button" aria-label="New case" onClick={() => router.push("/new-case")}>
              +
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
            <strong>Cases</strong>
          </div>

          <section className={styles.verificationHero}>
            <div>
              <span className={styles.verificationHeroLabel}>CASE LIBRARY</span>
              <h2>{loading ? "Loading case records..." : `${items.length} records available`}</h2>
              <p>All verified and finalized case records currently present in the NARCIS case library.</p>
            </div>
            <div className={styles.verificationStatus}>
              <div className={styles.verificationStatusIcon} style={{ background: error ? "#c25d56" : "#1d69d4" }}>
                {error ? "!" : "✓"}
              </div>
              <div>
                <strong>{error ? "LIBRARY ISSUE" : "LIBRARY READY"}</strong>
                <small>{error || "Recent records loaded"}</small>
              </div>
            </div>
          </section>

          <div className={styles.verificationCard}>
            {loading ? (
              <div className={styles.loadingState}>Loading case records...</div>
            ) : error ? (
              <div className={styles.errorCard}>{error}</div>
            ) : (
              <div className={styles.caseList}>
                {items.length === 0 ? (
                  <div className={styles.emptyState}>No verified or finalized cases are currently in the library.</div>
                ) : (
                  items.map((entry) => (
                    <div className={styles.caseCard} key={`${entry.case_id || entry.filename || "case"}-${entry.filename || "record"}`}>
                      <div>
                        <div className={styles.caseHeader}>
                          <span className={styles.caseBadge}>{entry.status || "Verified"}</span>
                          <strong>{entry.case_id || entry.filename || "Unknown"}</strong>
                        </div>
                        <div className={styles.caseMeta}>
                          <span>Drug Type: {entry.drug_type || "Unknown"}</span>
                          <span>Quantity: {entry.quantity || "Unknown"}</span>
                          <span>Location: {entry.location || "Unknown"}</span>
                          <span>Route: {entry.route_type || "Unknown"}</span>
                        </div>
                      </div>
                      <div className={styles.caseActionRow}>
                        <small>{entry.updated_at || "Updated recently"}</small>
                        <button type="button" onClick={() => router.push("/reports")}>VIEW REPORTS</button>
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
