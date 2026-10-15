"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./decision-support-report.module.css";

type CaseRecord = Record<string, unknown>;

type ReportAssessment = {
  [key: string]: unknown;
};

type ReportResponse = {
  success?: boolean;
  generated?: boolean;
  source?: string;
  case_id?: string;
  report?: {
    report_type?: string;
    prototype?: boolean;
    llm?: {
      provider?: string;
      model?: string;
      generated?: boolean;
    };
    source_evidence?: {
      case?: CaseRecord;
      ml_prediction?: {
        prediction?: string;
        probabilities?: Record<string, number>;
      };
    };
    llm_assessment?: ReportAssessment;
  };
};

const workflowSteps = [
  {
    number: "01",
    title: "Upload Document",
    description: "Source document uploaded",
    state: "complete",
  },
  {
    number: "02",
    title: "Document Extraction",
    description: "Information extracted from uploaded document",
    state: "complete",
  },
  {
    number: "03",
    title: "Officer Verification",
    description: "Officer verifies and enriches extracted information",
    state: "complete",
  },
  {
    number: "04",
    title: "AI Analysis",
    description: "ML analysis + SHAP explainability + RAG intelligence",
    state: "complete",
  },
  {
    number: "05",
    title: "Decision-Support Report",
    description: "Evidence package and investigation report",
    state: "current",
  },
  {
    number: "06",
    title: "Officer Review",
    description: "Final review and investigation action",
    state: "pending",
  },
];

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

function stringifyValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item)).join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return normalizeText(value);
}

export default function DecisionSupportReportPage() {
  const router = useRouter();
  const hasLoadedRef = useRef(false);
  const [verifiedCase, setVerifiedCase] = useState<CaseRecord>({});
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;

    const loadReport = async () => {
      try {
        const latestCaseResponse = await fetch(
          "http://127.0.0.1:8000/api/cases/verified/latest"
        );

        if (!latestCaseResponse.ok) {
          const payload = await latestCaseResponse.json().catch(() => ({}));
          throw new Error(
            payload.detail || "No verified case is available to generate a report."
          );
        }

        const casePayload = await latestCaseResponse.json();
        const caseData = casePayload.case || {};
        setVerifiedCase(caseData);

        const reportResponse = await fetch(
          "http://127.0.0.1:8000/api/cases/report",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ case: caseData }),
          }
        );

        if (!reportResponse.ok) {
          const responseText = await reportResponse.text();
          console.error(
            "Decision-Support Report API error:",
            reportResponse.status,
            responseText
          );

          let payload: { detail?: string } = {};
          try {
            payload = JSON.parse(responseText) as { detail?: string };
          } catch {
            payload = {};
          }

          throw new Error(
            payload.detail || responseText || "The decision-support report could not be generated."
          );
        }

        const reportPayload: ReportResponse = await reportResponse.json();
        setReport(reportPayload);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load the generated investigation report.";

        console.error("Decision-Support Report fetch failed:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, []);

  const caseId = getCaseId(verifiedCase);
  const reportData = report?.report ?? null;
  const assessment = reportData?.llm_assessment ?? {};
  const prediction =
    reportData?.source_evidence?.ml_prediction?.prediction ||
    (assessment.priority_assessment ? "Available" : "Unknown");
  const probabilities = reportData?.source_evidence?.ml_prediction?.probabilities ?? {};

  const hasSuccessfulReport = !!report && report.success === true && !!reportData;
  const reportTitle = loading
    ? "Generating decision-support report..."
    : error
      ? "Report unavailable"
      : report?.generated === false
        ? "Existing report loaded"
        : hasSuccessfulReport
          ? "Report generated successfully."
          : "Report unavailable";

  const reportDescription = loading
    ? "The NARCIS pipeline is assembling the verified case, model signal, explainability findings, and historical intelligence into a decision-support report."
    : error
      ? error
      : hasSuccessfulReport
        ? "This report is generated from the verified case and the active analytical evidence package, including model output, explainability, historical comparisons, and domain knowledge."
        : "A valid report response could not be confirmed from the backend.";

  const reportStatusText = loading
    ? "GENERATING REPORT..."
    : error
      ? "REPORT UNAVAILABLE"
      : report?.generated === false
        ? "EXISTING REPORT LOADED"
        : hasSuccessfulReport
          ? "DECISION SUPPORT READY"
          : "REPORT UNAVAILABLE";

  const renderAssessmentSection = (title: string, keyName: string) => {
    const value = assessment[keyName];
    if (value === undefined || value === null || value === "") {
      return null;
    }

    if (Array.isArray(value)) {
      return (
        <div className={styles.reportSection}>
          <h3>{title}</h3>
          <ul className={styles.list}>
            {value.map((item, index) => (
              <li key={`${title}-${index}`}>{stringifyValue(item)}</li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className={styles.reportSection}>
        <h3>{title}</h3>
        <p>{stringifyValue(value)}</p>
      </div>
    );
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

          <button className={`${styles.navItem} ${styles.navActive}`} type="button" onClick={() => router.push("/new-case")}>
            <span className={styles.navIcon}>+</span>
            <span>New Case</span>
          </button>

          <button className={styles.navItem} type="button">
            <span className={styles.navIcon}>□</span>
            <span>Cases</span>
          </button>

          <button className={styles.navItem} type="button">
            <span className={styles.navIcon}>⌘</span>
            <span>Intelligence</span>
          </button>

          <button className={styles.navItem} type="button">
            <span className={styles.navIcon}>▤</span>
            <span>Reports</span>
          </button>

          <button className={styles.navItem} type="button">
            <span className={styles.navIcon}>◷</span>
            <span>Case History</span>
          </button>
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

      <section className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>DECISION-SUPPORT REPORT</h1>
            <p>
              NARCIS-generated investigation report based on the verified case,
              model analysis, explainability, historical intelligence, and domain knowledge.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconButton} type="button" aria-label="Notifications">
              ♧
              <span className={styles.notificationBadge}>3</span>
            </button>
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
            <span>Risk Classification</span>
            <b>/</b>
            <strong>Decision-Support Report</strong>
          </div>

          <section className={styles.verificationHero}>
            <div>
              <span className={styles.verificationHeroLabel}>DECISION-SUPPORT REPORT</span>
              <h2>{reportTitle}</h2>
              <p>{reportDescription}</p>
            </div>

            <div className={styles.verificationStatus}>
              <div
                className={styles.verificationStatusIcon}
                style={{ background: error ? "#c25d56" : hasSuccessfulReport ? "#1d69d4" : "#7d8ea5" }}
              >
                {error ? "!" : hasSuccessfulReport ? "✓" : "…"}
              </div>
              <div>
                <strong>{error ? "REPORT STATUS" : hasSuccessfulReport ? "REPORT READY" : "REPORT STATUS"}</strong>
                <small>{reportStatusText}</small>
              </div>
            </div>
          </section>

          <div className={styles.verificationGrid}>
            <div className={styles.verificationCard}>
              {loading ? (
                <div className={styles.loadingCard}>Loading generated report…</div>
              ) : error ? (
                <div className={styles.errorCard}>{error}</div>
              ) : (
                <>
                  <div className={styles.reportOverview}>
                    <div>
                      <span className={styles.reportOverviewLabel}>CASE INFORMATION</span>
                      <h3>{reportData?.report_type || "NARCIS Investigation Decision-Support Report"}</h3>
                    </div>

                    <div className={styles.reportMetaList}>
                      <div className={styles.metaRow}>
                        <span>Case ID</span>
                        <strong>{report?.case_id || caseId || "Unknown"}</strong>
                      </div>
                      <div className={styles.metaRow}>
                        <span>Priority</span>
                        <strong>{prediction}</strong>
                      </div>
                      <div className={styles.metaRow}>
                        <span>Source</span>
                        <strong>{report?.generated ? "Generated" : "Loaded"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportSection}>
                    <h3>Executive Assessment</h3>
                    <p>{stringifyValue(assessment.executive_assessment)}</p>
                  </div>

                  {renderAssessmentSection("Priority Assessment", "priority_assessment")}
                  {renderAssessmentSection("Historical Case Assessment", "historical_case_assessment")}
                  {renderAssessmentSection("Knowledge Assessment", "knowledge_assessment")}
                  {renderAssessmentSection("Why the Model Predicted This Priority", "why_model_predicted_this_priority")}
                  {renderAssessmentSection("Verification Required", "verification_required")}
                  {renderAssessmentSection("Recommended Investigative Follow-Up", "recommended_investigative_follow_up")}
                  {renderAssessmentSection("Limitations", "limitations")}

                  <div className={styles.reportSection}>
                    <h3>Model Assessment</h3>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span>Prediction</span>
                        <strong>{prediction}</strong>
                      </div>
                      <div className={styles.infoItem}>
                        <span>Probability</span>
                        <strong>
                          {Object.entries(probabilities)
                            .map(([label, value]) => `${label}: ${(Number(value) * 100).toFixed(1)}%`)
                            .join(" | ") || "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportSection}>
                    <h3>Investigation Summary</h3>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span>Drug Type</span>
                        <strong>{normalizeText(verifiedCase.Drug_Type)}</strong>
                      </div>
                      <div className={styles.infoItem}>
                        <span>Quantity</span>
                        <strong>{normalizeText(verifiedCase.Quantity)}</strong>
                      </div>
                      <div className={styles.infoItem}>
                        <span>Route Type</span>
                        <strong>{normalizeText(verifiedCase.Route_Type)}</strong>
                      </div>
                      <div className={styles.infoItem}>
                        <span>Interstate Travel</span>
                        <strong>{normalizeText(verifiedCase.Interstate_Travel)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className={styles.officerReviewBox}>
                    <h3>OFFICER REVIEW REQUIRED</h3>
                    <p>
                      NARCIS provides analytical decision support. Final investigative
                      judgment remains with the authorized officer and must be validated
                      against case evidence, operational context, and any additional
                      verification required by law and procedure.
                    </p>
                  </div>

                  <div className={styles.buttonRow}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => router.push("/risk-classification")}
                    >
                      BACK TO RISK CLASSIFICATION
                    </button>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => router.push("/officer-review")}
                    >
                      CONTINUE TO OFFICER REVIEW
                    </button>
                  </div>
                </>
              )}
            </div>

            <aside className={styles.workflowCard}>
              <div className={styles.workflowHeader}>
                <span className={styles.workflowHeaderLabel}>NARCIS CASE FLOW</span>
                <h2>Investigation Workflow</h2>
              </div>

              <div className={styles.workflow}>
                {workflowSteps.map((step) => (
                  <div key={step.title} className={styles.workflowStep}>
                    <div
                      className={`${styles.workflowCircle} ${
                        step.state === "complete"
                          ? styles.workflowComplete
                          : step.state === "current"
                            ? styles.workflowCurrent
                            : ""
                      }`}
                    >
                      {step.state === "complete" ? "✓" : step.number}
                    </div>

                    <div className={styles.workflowStepBody}>
                      <h3>
                        {step.title}
                        {step.state === "complete" ? (
                          <span className={`${styles.workflowBadge} ${styles.workflowCompleteBadge}`}>
                            COMPLETE
                          </span>
                        ) : step.state === "current" ? (
                          <span className={`${styles.workflowBadge} ${styles.workflowCurrentBadge}`}>
                            CURRENT
                          </span>
                        ) : (
                          <span className={`${styles.workflowBadge} ${styles.workflowPendingBadge}`}>
                            PENDING
                          </span>
                        )}
                      </h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
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
