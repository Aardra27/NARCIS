"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./risk-classification.module.css";

type CaseRecord = Record<string, unknown>;

type ModelMetricEntry = {
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
};

type ModelEvaluationResponse = {
  success?: boolean;
  model?: string;
  accuracy?: number;
  class_labels?: string[];
  class_metrics?: Record<string, ModelMetricEntry>;
  confusion_matrix?: number[][];
  confusion_matrix_labels?: string[];
  note?: string;
};

type AnalysisResponse = {
  success?: boolean;
  analysis_status?: string;
  case?: CaseRecord;
  ml_prediction?: {
    prediction?: string;
    probabilities?: Record<string, number>;
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

function formatPercentage(value: number | undefined): string {
  const safeValue = Number(value ?? 0) * 100;
  return `${safeValue.toFixed(1)}%`;
}

export default function RiskClassificationPage() {
  const router = useRouter();
  const hasLoadedRef = useRef(false);
  const [verifiedCase, setVerifiedCase] = useState<CaseRecord>({});
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [evaluation, setEvaluation] = useState<ModelEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;

    const loadData = async () => {
      try {
        const latestCaseResponse = await fetch(
          "http://127.0.0.1:8000/api/cases/verified/latest"
        );

        if (!latestCaseResponse.ok) {
          const payload = await latestCaseResponse.json().catch(() => ({}));
          throw new Error(
            payload.detail || "No verified case is available for risk classification."
          );
        }

        const casePayload = await latestCaseResponse.json();
        const nextCase = casePayload.case || {};
        setVerifiedCase(nextCase);

        const analysisResponse = await fetch(
          "http://127.0.0.1:8000/api/cases/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ case: nextCase }),
          }
        );

        if (!analysisResponse.ok) {
          const payload = await analysisResponse.json().catch(() => ({}));
          throw new Error(
            payload.detail || "The AI analysis result is unavailable."
          );
        }

        const analysisPayload: AnalysisResponse = await analysisResponse.json();
        setAnalysis(analysisPayload);

        const evaluationResponse = await fetch(
          "http://127.0.0.1:8000/api/cases/model-evaluation"
        );

        if (!evaluationResponse.ok) {
          const payload = await evaluationResponse.json().catch(() => ({}));
          throw new Error(
            payload.detail || "Model evaluation metrics are unavailable."
          );
        }

        const evaluationPayload: ModelEvaluationResponse =
          await evaluationResponse.json();
        setEvaluation(evaluationPayload);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load classification data."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const caseId = getCaseId(verifiedCase);
  const predictedPriority = analysis?.ml_prediction?.prediction || "Unknown";
  const classificationBadge =
    predictedPriority && predictedPriority !== "Unknown"
      ? predictedPriority.toUpperCase()
      : "UNKNOWN";
  const probabilityEntries = Object.entries(
    analysis?.ml_prediction?.probabilities ?? {}
  );
  const modelMetricsRows = Object.entries(evaluation?.class_metrics ?? {});
  const confusionMatrix = evaluation?.confusion_matrix ?? [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const matrixLabels = evaluation?.confusion_matrix_labels ?? [
    "Low",
    "Medium",
    "High",
  ];
  const evaluationReady =
    !!analysis &&
    !!evaluation &&
    !!analysis.ml_prediction &&
    !!analysis.ml_prediction.probabilities;

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
            <h1>RISK CLASSIFICATION</h1>
            <p>
              NARCIS is reviewing the verified case using the active model output,
              explainability, and evaluation metrics.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Notifications"
            >
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
            <strong>Risk Classification</strong>
          </div>

          <section className={styles.verificationHero}>
            <div>
              <span className={styles.verificationHeroLabel}>CASE DOCUMENT</span>
              <h2>Risk Classification</h2>
              <p>
                The current verified case is being reviewed against the active
                prediction, probability distribution, and saved model evaluation.
              </p>
            </div>

            <div className={styles.verificationStatus}>
              <div className={styles.verificationStatusIcon}>✓</div>
              <div>
                <strong>VERIFIED CASE READY</strong>
                <small>
                  {loading
                    ? "LOADING CLASSIFICATION DATA..."
                    : error
                      ? "CLASSIFICATION DATA UNAVAILABLE"
                      : "CASE CLASSIFICATION COMPLETE"}
                </small>
              </div>
            </div>
          </section>

          <div className={styles.verificationGrid}>
            <div className={styles.verificationCard}>
              <div className={styles.verificationCardHeader}>
                <div>
                  <span className={styles.verificationHeroLabel}>CASE CLASSIFICATION</span>
                  <h2>Case Risk Classification</h2>
                </div>
                <span className={styles.caseIdBadge}>{caseId}</span>
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultCardMeta}>Predicted Priority</div>

                <div className={styles.classificationBadgeRow}>
                  <span className={styles.classificationBadge}>{classificationBadge}</span>
                </div>

                <div className={styles.predictionValue}>{predictedPriority}</div>
              </div>

              <div className={styles.resultSectionHeader}>
                <h3>Class Probability Distribution</h3>
              </div>

              <div className={styles.probabilityList}>
                {probabilityEntries.length > 0 ? (
                  probabilityEntries.map(([label, value]) => {
                    const numericValue = Number(value ?? 0) * 100;
                    const isSelected =
                      label.toLowerCase() === predictedPriority.toLowerCase();

                    return (
                      <div key={label} className={styles.probabilityRow}>
                        <div className={styles.probabilityLabelRow}>
                          <span>{label.toUpperCase()}</span>
                          <strong>{formatPercentage(value)}</strong>
                        </div>

                        <div className={styles.barTrack}>
                          <span
                            className={
                              isSelected ? styles.selectedBar : styles.standardBar
                            }
                            style={{ width: `${Math.max(numericValue, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyState}>
                    No model probabilities were returned for the current case.
                  </div>
                )}
              </div>

              <div className={styles.resultSectionHeader}>
                <h3>Classification Interpretation</h3>
              </div>

              <div className={styles.evaluationNotes}>
                <div className={styles.infoRow}>
                  <span>Predicted Priority</span>
                  <strong>{predictedPriority}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Model</span>
                  <strong>Random Forest Classifier</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Input</span>
                  <strong>Officer-verified case data</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Explainability</span>
                  <strong>SHAP TreeExplainer</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Historical Intelligence</span>
                  <strong>RAG retrieval</strong>
                </div>
              </div>

              <div className={styles.resultSectionHeader}>
                <h3>Model Evaluation Metrics</h3>
              </div>

              <div className={styles.metricSummary}>
                <div>
                  <span className={styles.metricSummaryLabel}>
                    MODEL PERFORMANCE ON TEST DATA
                  </span>
                  <h4>Accuracy</h4>
                </div>
                <strong>
                  {evaluation?.accuracy != null ? evaluation.accuracy.toFixed(4) : "—"}
                </strong>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.metricsTable}>
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1-score</th>
                      <th>Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelMetricsRows.length > 0 ? (
                      modelMetricsRows.map(([className, metrics]) => (
                        <tr key={className}>
                          <td>{className}</td>
                          <td>{metrics.precision.toFixed(4)}</td>
                          <td>{metrics.recall.toFixed(4)}</td>
                          <td>{metrics.f1_score.toFixed(4)}</td>
                          <td>{metrics.support}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className={styles.emptyState}>
                          No evaluation metrics are available from the existing model output.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles.resultSectionHeader}>
                <h3>Classification Report</h3>
              </div>

              <div className={styles.noteText}>
                These metrics describe the trained model's performance on the saved
                evaluation dataset. They do not describe the confidence of the
                current case.
              </div>

              <div className={styles.resultSectionHeader}>
                <h3>Confusion Matrix</h3>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.matrixTable}>
                  <thead>
                    <tr>
                      <th></th>
                      {matrixLabels.map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixLabels.map((label, rowIndex) => (
                      <tr key={label}>
                        <th>{label}</th>
                        {confusionMatrix[rowIndex]?.map((value, columnIndex) => (
                          <td key={`${label}-${matrixLabels[columnIndex]}`}>
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.resultSectionHeader}>
                <h3>What These Metrics Mean</h3>
              </div>

              <div className={styles.meaningGrid}>
                <div className={styles.meaningItem}>
                  <strong>Accuracy</strong>
                  <span>Overall proportion of test predictions classified correctly.</span>
                </div>
                <div className={styles.meaningItem}>
                  <strong>Precision</strong>
                  <span>How often predictions for a class were correct.</span>
                </div>
                <div className={styles.meaningItem}>
                  <strong>Recall</strong>
                  <span>How much of the actual class was identified.</span>
                </div>
                <div className={styles.meaningItem}>
                  <strong>F1-score</strong>
                  <span>Balance between precision and recall.</span>
                </div>
                <div className={styles.meaningItem}>
                  <strong>Confusion Matrix</strong>
                  <span>Shows correct and incorrect classifications by class.</span>
                </div>
              </div>

              <div className={styles.resultSectionHeader}>
                <h3>Current Case vs Model Performance</h3>
              </div>

              <div className={styles.noteText}>
                Current case output measures the verified case's predicted priority
                and probability distribution. Model performance metrics measure the
                trained model on saved test data and remain separate from the case-level
                score.
              </div>

              <div className={styles.buttonRow}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => router.push("/ai-analysis")}
                >
                  BACK TO AI ANALYSIS
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  disabled={!evaluationReady}
                  onClick={() => router.push("/decision-support-report")}
                >
                  CONTINUE TO DECISION-SUPPORT REPORT
                </button>
              </div>
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
                          <span
                            className={`${styles.workflowBadge} ${styles.workflowCompleteBadge}`}
                          >
                            COMPLETE
                          </span>
                        ) : step.state === "current" ? (
                          <span
                            className={`${styles.workflowBadge} ${styles.workflowCurrentBadge}`}
                          >
                            CURRENT
                          </span>
                        ) : (
                          <span
                            className={`${styles.workflowBadge} ${styles.workflowPendingBadge}`}
                          >
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
