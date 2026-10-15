"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./officer-review.module.css";

type CaseRecord = Record<string, unknown>;

type ReportResponse = {
  success?: boolean;
  generated?: boolean;
  case_id?: string;
  report?: {
    report_type?: string;
    source_evidence?: {
      case?: CaseRecord;
      ml_prediction?: {
        prediction?: string;
      };
    };
    llm_assessment?: Record<string, unknown>;
  };
};

function normalizeText(value: unknown): string {
  if (typeof value === "string") {
    const text = value.trim();
    return text !== "" ? text : "Unknown";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return "Unknown";
}

function getCaseId(caseData: CaseRecord): string {
  const raw = caseData?.Case_ID ?? caseData?.case_id ?? "";
  return normalizeText(raw).toUpperCase();
}

export default function OfficerReviewPage() {
  const router = useRouter();
  const hasLoadedRef = useRef(false);
  const [caseData, setCaseData] = useState<CaseRecord>({});
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState("Proceed with referral");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;

    const loadReviewData = async () => {
      try {
        const latestCaseResponse = await fetch("http://127.0.0.1:8000/api/cases/verified/latest");
        if (!latestCaseResponse.ok) {
          const payload = await latestCaseResponse.json().catch(() => ({}));
          throw new Error(payload.detail || "No verified case is available for review.");
        }

        const latestCasePayload = await latestCaseResponse.json();
        const activeCase = latestCasePayload.case || {};
        setCaseData(activeCase);

        const reportResponse = await fetch("http://127.0.0.1:8000/api/cases/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ case: activeCase }),
        });

        if (!reportResponse.ok) {
          const payload = await reportResponse.json().catch(() => ({}));
          throw new Error(payload.detail || "The decision-support report could not be loaded.");
        }

        const reportPayload: ReportResponse = await reportResponse.json();
        setReport(reportPayload);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load the case review data.");
      } finally {
        setLoading(false);
      }
    };

    void loadReviewData();
  }, []);

  const caseId = getCaseId(caseData);
  const prediction = report?.report?.source_evidence?.ml_prediction?.prediction || "Pending";

  const submitFinalReview = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/cases/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: getCaseId(caseData),
          case: caseData,
          report: report?.report ?? {},
          officer_decision: decision,
          officer_remarks: notes,
          decision,
          confirmed: true,
          confirmation: true,
          report_status: "FINALIZED",
          reviewed_at: new Date().toISOString(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail || "The finalized case could not be saved.");
      }

      router.push("/cases");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The final review submission failed.");
    } finally {
      setSaving(false);
    }
  };

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
            <h1>OFFICER REVIEW</h1>
            <p>Final investigative review and case disposition before case finalization.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconButton} type="button" aria-label="Help">
              ?
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
            <span>New Case</span>
            <b>/</b>
            <span>Document Extraction</span>
            <b>/</b>
            <span>Verification</span>
            <b>/</b>
            <span>AI Analysis</span>
            <b>/</b>
            <span>Decision-Support Report</span>
            <b>/</b>
            <strong>Officer Review</strong>
          </div>

          <section className={styles.verificationHero}>
            <div>
              <span className={styles.verificationHeroLabel}>OFFICER REVIEW</span>
              <h2>{loading ? "Loading review case..." : `Case ${caseId || "Unknown"}`}</h2>
              <p>{loading ? "Preparing the verified case and generated decision-support report." : "Validate the recommendation, document the disposition, and finalize the case."}</p>
            </div>
            <div className={styles.verificationStatus}>
              <div className={styles.verificationStatusIcon} style={{ background: error ? "#c25d56" : "#1d69d4" }}>
                {error ? "!" : "✓"}
              </div>
              <div>
                <strong>{error ? "REVIEW BLOCKED" : "REVIEW READY"}</strong>
                <small>{error || "Decision support ready for final review"}</small>
              </div>
            </div>
          </section>

          <div className={styles.verificationGrid}>
            <div className={styles.verificationCard}>
              {loading ? (
                <div className={styles.loadingState}>Loading the verified case and analytical recommendation...</div>
              ) : (
                <form onSubmit={(event) => { event.preventDefault(); void submitFinalReview(); }} className={styles.reviewForm}>
                  <div className={styles.sectionLabel}>CASE SUMMARY</div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span>Case ID</span>
                      <strong>{caseId}</strong>
                    </div>
                    <div className={styles.infoItem}>
                      <span>Drug Type</span>
                      <strong>{normalizeText(caseData.Drug_Type)}</strong>
                    </div>
                    <div className={styles.infoItem}>
                      <span>Route Type</span>
                      <strong>{normalizeText(caseData.Route_Type)}</strong>
                    </div>
                    <div className={styles.infoItem}>
                      <span>Prediction</span>
                      <strong>{prediction}</strong>
                    </div>
                  </div>

                  <div className={styles.formFieldGroup}>
                    <label htmlFor="disposition">Recommended disposition</label>
                    <select id="disposition" value={decision} onChange={(event) => setDecision(event.target.value)}>
                      <option value="Proceed with referral">Proceed with referral</option>
                      <option value="Request additional verification">Request additional verification</option>
                      <option value="Continue monitoring and investigation">Continue monitoring and investigation</option>
                    </select>
                  </div>

                  <div className={styles.formFieldGroup}>
                    <label htmlFor="notes">Officer notes</label>
                    <textarea
                      id="notes"
                      rows={6}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Capture investigative notes, verification steps, and justification for final case disposition."
                    />
                  </div>

                  {error ? <div className={styles.errorCard}>{error}</div> : null}

                  <div className={styles.buttonRow}>
                    <button className={styles.secondaryButton} type="button" onClick={() => router.push("/decision-support-report")}>
                      BACK TO REPORT
                    </button>
                    <button className={styles.primaryButton} type="submit" disabled={saving || loading}>
                      {saving ? "FINALIZING..." : "FINAL REVIEW DONE"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className={styles.workflowCard}>
              <div className={styles.workflowHeader}>
                <span className={styles.workflowHeaderLabel}>CASE STATUS</span>
                <h2>Review Checklist</h2>
              </div>
              <div className={styles.workflowList}>
                <div className={styles.checkItem}><span>✓</span> Verified case retrieved</div>
                <div className={styles.checkItem}><span>✓</span> AI analysis reviewed</div>
                <div className={styles.checkItem}><span>✓</span> Decision-support report generated</div>
                <div className={styles.checkItem}><span>✓</span> Final disposition captured</div>
              </div>
            </aside>
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
