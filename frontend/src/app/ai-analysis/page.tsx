"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ai-analysis.module.css";

type CaseRecord = Record<string, unknown>;

type TopFactor = {
  feature?: string;
  value?: unknown;
  shap_impact?: number;
  direction?: string;
};

type KnowledgeEntry = {
  status?: string;
  summary?: string;
  sources?: unknown[];
  details?: unknown;
  [key: string]: unknown;
};

type HistoricalCaseEntry = {
  file?: string;
  rank?: number;
  final_score?: number;
  semantic_score?: number;
  structured_score?: number;
  quantity_similarity?: number | null;
  matching_fields?: unknown[];
  case?: Record<string, unknown>;
  [key: string]: unknown;
};

type AnalysisResult = {
  success?: boolean;
  analysis_status?: string;
  case?: CaseRecord;
  ml_prediction?: {
    prediction?: string;
    probabilities?: Record<string, number>;
    feature_vector?: Record<string, number>;
  };
  local_explainability?: {
    predicted_class?: string;
    top_factors?: TopFactor[];
  };
  similar_historical_cases?: HistoricalCaseEntry[];
  knowledge?: Record<string, KnowledgeEntry>;
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
    state: "current",
  },
  {
    number: "05",
    title: "Decision-Support Report",
    description: "Evidence package and investigation report",
    state: "pending",
  },
  {
    number: "06",
    title: "Officer Review",
    description: "Final review and investigation action",
    state: "pending",
  },
];

function normalizeValue(value: unknown): string {
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
  return normalizeValue(raw).toUpperCase();
}

export default function AiAnalysisPage() {
  const router = useRouter();
  const hasLoadedAnalysis = useRef(false);
  const [verifiedCase, setVerifiedCase] = useState<CaseRecord>({});
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [caseIdLabel, setCaseIdLabel] = useState("Unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasLoadedAnalysis.current) {
      return;
    }

    hasLoadedAnalysis.current = true;

    const loadVerifiedCaseAndAnalyze = async () => {
      try {
        const savedCaseEntry = sessionStorage.getItem("narcis_extraction_result");
        const savedCaseMeta = savedCaseEntry ? JSON.parse(savedCaseEntry) : null;
        const savedCaseId =
          savedCaseMeta?.saved_case_id ||
          sessionStorage.getItem("narcis_verified_case_id") ||
          null;

        const caseResponse = await fetch(
          "http://127.0.0.1:8000/api/cases/verified/latest"
        );

        if (!caseResponse.ok) {
          const payload = await caseResponse.json().catch(() => ({}));
          throw new Error(
            payload.detail || "No verified case is available in the case library."
          );
        }

        const casePayload = await caseResponse.json();
        const caseData = casePayload.case || {};

        setVerifiedCase(caseData);
        setCaseIdLabel(
          normalizeValue(
            savedCaseId || casePayload.case_id || caseData.Case_ID || "Unknown"
          )
        );

        const analysisResponse = await fetch(
          "http://127.0.0.1:8000/api/cases/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ case: caseData }),
          }
        );

        if (!analysisResponse.ok) {
          const payload = await analysisResponse.json().catch(() => ({}));
          throw new Error(
            payload.detail || "AI analysis failed on the saved verified case."
          );
        }

        const analysisPayload: AnalysisResult = await analysisResponse.json();
        setAnalysis(analysisPayload);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load the verified case for AI analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadVerifiedCaseAndAnalyze();
  }, []);

  const caseId = caseIdLabel !== "Unknown" ? caseIdLabel : getCaseId(verifiedCase);

  const verificationStatus =
    (verifiedCase?._verification as { verified?: boolean } | undefined)?.verified ===
    true
      ? "Verified"
      : "Pending Verification";

  const analysisReady =
    !!analysis &&
    analysis.success === true &&
    !!analysis.ml_prediction &&
    !!analysis.local_explainability &&
    !!analysis.knowledge;

  const pipelineDetails = [
    {
      label: "01 Verified Case Loaded",
      state:
        Object.keys(verifiedCase).length > 0 ? "complete" : "pending",
      info: "Saved verified case retrieved from the case library",
    },
    {
      label: "02 ML Priority Prediction",
      state: analysis?.ml_prediction ? "complete" : "pending",
      info: "Random Forest priority model executed",
    },
    {
      label: "03 SHAP Explanation",
      state: analysis?.local_explainability ? "complete" : "pending",
      info: "Top feature impact generated with SHAP",
    },
    {
      label: "04 Historical Case Retrieval",
      state: analysis?.similar_historical_cases?.length ? "complete" : "pending",
      info: "RAG retrieval from historical case library",
    },
    {
      label: "05 Domain Knowledge Retrieval",
      state: analysis?.knowledge ? "complete" : "pending",
      info: "Drug profile and legal/operational knowledge retrieved",
    },
    {
      label: "06 Evidence Package",
      state: analysisReady ? "complete" : "pending",
      info: "Evidence package assembled for officer review",
    },
  ];

  const verifiedFields = [
    { label: "Case ID", value: caseId },
    {
      label: "Investigation Year",
      value: normalizeValue(verifiedCase.Investigation_Year),
    },
    { label: "Agency", value: normalizeValue(verifiedCase.Agency) },
    { label: "Drug Type", value: normalizeValue(verifiedCase.Drug_Type) },
    { label: "Quantity", value: normalizeValue(verifiedCase.Quantity) },
    {
      label: "Quantity Category",
      value: normalizeValue(verifiedCase.Quantity_Category),
    },
    { label: "Route Type", value: normalizeValue(verifiedCase.Route_Type) },
    {
      label: "Interstate Travel",
      value: normalizeValue(verifiedCase.Interstate_Travel),
    },
    {
      label: "Verification Status",
      value: verificationStatus,
    },
  ];

  const predictionText = analysis?.ml_prediction?.prediction || "Unavailable";
  const probabilityEntries = Object.entries(
    analysis?.ml_prediction?.probabilities ?? {}
  );
  const shapFactors = analysis?.local_explainability?.top_factors ?? [];
  const historicalCases = analysis?.similar_historical_cases ?? [];
  const globalShapImageUrl = "http://127.0.0.1:8000/api/cases/shap/summary";
  const localShapImageUrl = "http://127.0.0.1:8000/api/cases/shap/local";
  const knowledgeEntries = [
    {
      key: "drug_profile",
      label: "Drug Profile",
      value: analysis?.knowledge?.drug_profile,
    },
    {
      key: "ndps_sections",
      label: "NDPS Sections",
      value: analysis?.knowledge?.ndps_sections,
    },
    {
      key: "quantity_information",
      label: "Quantity Information",
      value: analysis?.knowledge?.quantity_information,
    },
    {
      key: "sop",
      label: "SOP",
      value: analysis?.knowledge?.sop,
    },
    {
      key: "trafficking_patterns",
      label: "Trafficking Patterns",
      value: analysis?.knowledge?.trafficking_patterns,
    },
  ] as const;

  const getKnowledgeText = (entry: KnowledgeEntry | undefined) => {
    if (!entry) {
      return "Status unavailable";
    }

    if (typeof entry.status === "string") {
      return entry.status;
    }

    if (typeof entry.summary === "string") {
      return entry.summary;
    }

    if (Array.isArray(entry.sources) && entry.sources.length > 0) {
      return `${entry.sources.length} source(s)`;
    }

    return "Found";
  };

  const getHistoricalCaseSummary = (item: HistoricalCaseEntry) => {
    const caseRecord = item.case ?? {};
    const caseId = normalizeValue(
      caseRecord.Case_ID ?? caseRecord.case_id ?? item.file ?? "Unknown"
    );
    const drugType = normalizeValue(caseRecord.Drug_Type);
    const quantity = normalizeValue(caseRecord.Quantity);
    const route = normalizeValue(caseRecord.Route_Type);
    const finalScore =
      typeof item.final_score === "number" ? `${item.final_score.toFixed(2)}%` : "N/A";

    return {
      caseId,
      drugType,
      quantity,
      route,
      finalScore,
    };
  };

  const formatFeatureValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "Unknown";
    }

    const text = String(value).trim();
    return text !== "" ? text : "Unknown";
  };

  const joinList = (items: string[]) => {
    if (items.length === 0) {
      return "no strong feature contributors";
    }

    if (items.length === 1) {
      return items[0];
    }

    if (items.length === 2) {
      return `${items[0]} and ${items[1]}`;
    }

    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  };

  const numericShapFactors = (shapFactors ?? [])
    .map((factor) => ({
      ...factor,
      impact:
        typeof factor.shap_impact === "number"
          ? factor.shap_impact
          : Number(factor.shap_impact ?? 0),
    }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const positiveShapFactors = numericShapFactors.filter((factor) => factor.impact > 0);
  const negativeShapFactors = numericShapFactors.filter((factor) => factor.impact < 0);

  const positiveFactorNames = positiveShapFactors
    .slice(0, 3)
    .map((factor) => factor.feature || "an unlabelled feature");
  const negativeFactorNames = negativeShapFactors
    .slice(0, 3)
    .map((factor) => factor.feature || "an unlabelled feature");

  const shapPredictionSummary = `The model classified this case as ${predictionText}. The prediction was influenced most strongly by ${joinList(positiveFactorNames)}. These factors pushed the model toward a higher priority classification. ${negativeFactorNames.length > 0 ? `${joinList(negativeFactorNames)} contributed in the opposite direction.` : "No strong negative contributors were identified in the current SHAP output."}`;

  const buildFeatureInterpretation = (
    featureName: string | undefined,
    observedValue: unknown,
    impact: number
  ) => {
    const safeFeatureName = featureName || "This feature";
    const observedText = formatFeatureValue(observedValue);
    const isUnknown = observedText.toLowerCase() === "unknown";

    if (isUnknown) {
      return `The model assigned a SHAP contribution to the encoded "Unknown" value for ${safeFeatureName}. This reflects model behavior and should not be interpreted as evidence that the subject has or lacks this attribute.`;
    }

    if (impact > 0) {
      return `${safeFeatureName} had a value of ${observedText}, and the model interpreted that value as increasing the priority score for this case.`;
    }

    if (impact < 0) {
      return `${safeFeatureName} had a value of ${observedText}, and the model interpreted that value as reducing the priority score for this case.`;
    }

    return `${safeFeatureName} had a value of ${observedText}, and the contribution was near zero for this prediction.`;
  };

  const evidencePackageStatus =
    analysis?.success === true || analysis?.analysis_status === "complete"
      ? "Complete"
      : "Pending";

  return (
    <main className={styles.page}>
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
            <h1>AI CASE ANALYSIS</h1>
            <p>
              NARCIS is analyzing the verified case using machine learning,
              explainable AI, and historical intelligence.
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

            <button
              className={styles.iconButton}
              type="button"
              aria-label="Help"
            >
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
            <strong>AI Analysis</strong>
          </div>

          <section className={styles.verificationHero}>
            <div>
              <span className={styles.verificationHeroLabel}>CASE DOCUMENT</span>
              <h2>AI Case Analysis</h2>
              <p>
                NARCIS is analyzing the verified case using machine learning,
                explainable AI, and historical intelligence.
              </p>
            </div>

            <div className={styles.verificationStatus}>
              <div className={styles.verificationStatusIcon}>✓</div>
              <div>
                <strong>VERIFIED CASE READY</strong>
                <small>
                  {loading
                    ? "ANALYZING VERIFIED CASE..."
                    : error
                      ? "AI ANALYSIS FAILED"
                      : "CASE ANALYSIS COMPLETE"}
                </small>
              </div>
            </div>
          </section>

          <div className={styles.verificationGrid}>
            <section className={styles.verificationCard}>
              <div className={styles.verificationCardHeader}>
                <div>
                  <span className={styles.verificationHeroLabel}>VERIFIED CASE</span>
                  <h2>Saved Verified Case</h2>
                  <p>
                    Retrieved from the existing case-library workflow after officer
                    verification.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className={styles.fieldSection}>Loading verified case...</div>
              ) : error ? (
                <div className={styles.fieldSection}>{error}</div>
              ) : (
                <>
                  <div className={styles.fieldSection}>
                    <div className={styles.fieldSectionTitle}>
                      <h3>VERIFIED CASE VALUES</h3>
                    </div>

                    <div className={styles.fieldsGrid}>
                      {verifiedFields.map((field) => (
                        <div className={styles.field} key={field.label}>
                          <div className={styles.fieldLabelRow}>
                            <label className={styles.fieldLabel}>{field.label}</label>
                          </div>
                          <input
                            className={styles.fieldInput}
                            value={field.value}
                            readOnly
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.fieldSection}>
                    <div className={styles.fieldSectionTitle}>
                      <h3>NARCIS INTELLIGENCE ENGINE</h3>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {[
                        "ML PRIORITY MODEL",
                        "SHAP EXPLAINABILITY",
                        "HISTORICAL CASE INTELLIGENCE",
                        "DOMAIN KNOWLEDGE",
                      ].map((label) => (
                        <div
                          key={label}
                          style={{
                            border: "1px solid rgba(6, 80, 100, 0.25)",
                            borderRadius: "12px",
                            padding: "16px",
                            background: "rgba(7, 14, 20, 0.92)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              letterSpacing: "0.18em",
                              color: "#90d6ef",
                              marginBottom: "8px",
                            }}
                          >
                            ENGINE
                          </div>
                          <div
                            style={{
                              fontSize: "18px",
                              lineHeight: 1.4,
                              color: "#eaf7ff",
                              fontWeight: 700,
                            }}
                          >
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.fieldSection}>
                    <div className={styles.fieldSectionTitle}>
                      <h3>ANALYSIS ENGINE</h3>
                    </div>

                    <div className={styles.fieldsGrid}>
                      <div className={styles.field}>
                        <div className={styles.fieldLabelRow}>
                          <label className={styles.fieldLabel}>Engine Status</label>
                        </div>
                        <input
                          className={styles.fieldInput}
                          value={analysisReady ? "Active" : "Processing"}
                          readOnly
                        />
                      </div>

                      <div className={styles.field}>
                        <div className={styles.fieldLabelRow}>
                          <label className={styles.fieldLabel}>Model</label>
                        </div>
                        <input
                          className={styles.fieldInput}
                          value="Random Forest Classifier"
                          readOnly
                        />
                      </div>

                      <div className={styles.field}>
                        <div className={styles.fieldLabelRow}>
                          <label className={styles.fieldLabel}>Explainability</label>
                        </div>
                        <input
                          className={styles.fieldInput}
                          value="SHAP TreeExplainer"
                          readOnly
                        />
                      </div>

                      <div className={styles.field}>
                        <div className={styles.fieldLabelRow}>
                          <label className={styles.fieldLabel}>Historical Intelligence</label>
                        </div>
                        <input
                          className={styles.fieldInput}
                          value="RAG Retrieval"
                          readOnly
                        />
                      </div>

                      <div className={styles.field}>
                        <div className={styles.fieldLabelRow}>
                          <label className={styles.fieldLabel}>Knowledge Sources</label>
                        </div>
                        <input
                          className={styles.fieldInput}
                          value="Drug Profile, NDPS Sections, SOP, Trafficking Patterns"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.fieldSection}>
                    <div className={styles.fieldSectionTitle}>
                      <h3>ANALYSIS PIPELINE</h3>
                    </div>

                    <div style={{ display: "grid", gap: "12px" }}>
                      {pipelineDetails.map((step) => {
                        const isComplete = step.state === "complete";
                        const isPending = step.state === "pending";

                        return (
                          <div
                            key={step.label}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "12px",
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border: "1px solid rgba(6, 80, 100, 0.2)",
                              background: isComplete
                                ? "rgba(12, 98, 77, 0.18)"
                                : isPending
                                  ? "rgba(18, 24, 34, 0.75)"
                                  : "rgba(3, 78, 95, 0.18)",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  color: "#eaf7ff",
                                  fontWeight: 700,
                                  marginBottom: 2,
                                }}
                              >
                                {step.label}
                              </div>
                              <div
                                style={{
                                  color: "#9bb7ce",
                                  fontSize: "12px",
                                }}
                              >
                                {step.info}
                              </div>
                            </div>

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: "999px",
                                padding: "6px 10px",
                                fontSize: "10px",
                                letterSpacing: "0.12em",
                                fontWeight: 700,
                                border: "1px solid rgba(255,255,255,0.12)",
                                color: isComplete ? "#d2ffe6" : isPending ? "#d6e7f2" : "#dff6ff",
                                background: isComplete
                                  ? "rgba(18, 142, 92, 0.18)"
                                  : isPending
                                    ? "rgba(61, 79, 96, 0.4)"
                                    : "rgba(25, 118, 157, 0.18)",
                              }}
                            >
                              {isComplete ? "COMPLETE" : isPending ? "PENDING" : "ACTIVE"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {!loading && !error && analysis && (
                    <>
                      <div className={styles.resultSectionHeader}>
                        <h3>MODEL PREDICTION</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.resultCardMeta}>MODEL OUTPUT</div>
                        <div className={styles.resultMainLabel}>Prediction:</div>
                        <div className={styles.predictionValue}>{predictionText}</div>

                        {probabilityEntries.length > 0 && (
                          <div className={styles.probabilityList}>
                            {probabilityEntries.map(([label, value]) => {
                              const probabilityPercent = value * 100;

                              return (
                                <div className={styles.probabilityRow} key={label}>
                                  <span className={styles.probabilityLabel}>{label}</span>
                                  <span className={styles.probabilityBarTrack}>
                                    <span
                                      className={styles.probabilityBarFill}
                                      style={{ width: `${Math.max(8, probabilityPercent)}%` }}
                                    />
                                  </span>
                                  <span className={styles.probabilityValue}>
                                    {probabilityPercent.toFixed(1)}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>SHAP EXPLAINABLE AI</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.resultCardMeta}>EXPLAINABILITY</div>
                        <p className={styles.resultParagraph}>
                          SHAP (SHapley Additive exPlanations) explains how individual
                          input features contribute to a machine-learning prediction.
                          Positive SHAP values indicate that a feature pushed the model
                          toward a higher-priority prediction, while negative values
                          indicate that it pushed the model toward a lower-priority
                          prediction.
                        </p>
                        <div className={styles.resultNoteBlock}>
                          <strong>IMPORTANT INTERPRETATION</strong>
                          <p>
                            SHAP explains model behavior. It does not establish criminal
                            activity, guilt, or legal responsibility.
                          </p>
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>SHAP VISUAL EXPLANATIONS</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.resultCardMeta}>GLOBAL SHAP</div>
                        <h4 className={styles.imageSectionTitle}>Global SHAP Feature Importance</h4>
                        <p className={styles.resultParagraph}>
                          Global SHAP summary showing how features influence model output across the model.
                        </p>
                        <div className={styles.shapImageWrapper}>
                          <img
                            src={globalShapImageUrl}
                            alt="Global SHAP summary feature importance"
                            className={styles.shapImage}
                          />
                        </div>
                      </div>

                      <div className={styles.resultCard} style={{ marginTop: "16px" }}>
                        <div className={styles.resultCardMeta}>LOCAL SHAP</div>
                        <h4 className={styles.imageSectionTitle}>Local SHAP Explanation</h4>
                        <p className={styles.resultParagraph}>
                          Local SHAP explanation showing how individual features contributed to the prediction for the current verified case.
                        </p>
                        <div className={styles.shapImageWrapper}>
                          <img
                            src={localShapImageUrl}
                            alt="Local SHAP explanation for the current case"
                            className={styles.shapImage}
                          />
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>SHAP FEATURE CONTRIBUTIONS</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.shapGraphList}>
                          {shapFactors.length > 0 ? (
                            shapFactors.map((factor) => {
                              const featureName = factor.feature || "Unknown";
                              const impactValue =
                                typeof factor.shap_impact === "number"
                                  ? factor.shap_impact
                                  : Number(factor.shap_impact ?? 0);
                              const absoluteImpact = Math.abs(impactValue);
                              const safeWidth = Math.max(
                                8,
                                Math.min(100, (absoluteImpact / Math.max(1, absoluteImpact || 1)) * 100)
                              );

                              return (
                                <div className={styles.shapRow} key={featureName}>
                                  <div className={styles.shapRowHeader}>
                                    <span>{featureName}</span>
                                    <strong
                                      className={
                                        impactValue >= 0 ? styles.positiveValue : styles.negativeValue
                                      }
                                    >
                                      {impactValue >= 0 ? "+" : ""}
                                      {impactValue.toFixed(4)}
                                    </strong>
                                  </div>
                                  <div className={styles.shapBarTrack}>
                                    <span
                                      className={
                                        impactValue >= 0 ? styles.shapBarPositive : styles.shapBarNegative
                                      }
                                      style={{
                                        width: `${Math.min(100, safeWidth)}%`,
                                        minWidth: "8%",
                                      }}
                                    />
                                  </div>
                                  <div className={styles.shapDirectionRow}>
                                    <span>{impactValue >= 0 ? "Positive" : "Negative"}</span>
                                    <span>{factor.direction || "N/A"}</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className={styles.emptyState}>No SHAP values returned.</div>
                          )}
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>SHAP-BASED PREDICTION EXPLANATION</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.resultCardMeta}>MODEL REASONING</div>
                        <p className={styles.resultParagraph}>{shapPredictionSummary}</p>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>WHY THE MODEL PREDICTED {predictionText.toUpperCase()}</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.explanationGrid}>
                          {numericShapFactors.length > 0 ? (
                            numericShapFactors.slice(0, 6).map((factor) => (
                              <div className={styles.explanationFactCard} key={factor.feature || "factor"}>
                                <div className={styles.factorHeaderRow}>
                                  <span>Feature:</span>
                                  <strong>{factor.feature || "Unknown"}</strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>Observed value:</span>
                                  <strong>{formatFeatureValue(factor.value)}</strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>SHAP contribution:</span>
                                  <strong
                                    className={
                                      factor.impact >= 0 ? styles.positiveValue : styles.negativeValue
                                    }
                                  >
                                    {factor.impact >= 0 ? "+" : ""}
                                    {factor.impact.toFixed(4)}
                                  </strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>Direction:</span>
                                  <strong>
                                    {factor.impact >= 0
                                      ? "Pushes prediction higher"
                                      : "Pushes prediction lower"}
                                  </strong>
                                </div>
                                <p className={styles.explanationInterpretation}>
                                  {buildFeatureInterpretation(
                                    factor.feature,
                                    factor.value,
                                    factor.impact
                                  )}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className={styles.emptyState}>No SHAP feature data is available for this case.</div>
                          )}
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>FACTORS PUSHING THE MODEL TOWARD HIGHER PRIORITY</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.factorList}>
                          {positiveShapFactors.length > 0 ? (
                            positiveShapFactors.slice(0, 5).map((factor) => (
                              <div className={styles.factorRow} key={factor.feature || "positive-factor"}>
                                <div className={styles.factorHeaderRow}>
                                  <span>Feature:</span>
                                  <strong>{factor.feature || "Unknown"}</strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>Observed value:</span>
                                  <strong>{formatFeatureValue(factor.value)}</strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>SHAP contribution:</span>
                                  <strong className={styles.positiveValue}>+{factor.impact.toFixed(4)}</strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>Direction:</span>
                                  <strong>Pushes model toward higher priority</strong>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={styles.emptyState}>No positive SHAP contributors were identified.</div>
                          )}
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>FACTORS PUSHING THE MODEL TOWARD LOWER PRIORITY</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.factorList}>
                          {negativeShapFactors.length > 0 ? (
                            negativeShapFactors.slice(0, 5).map((factor) => (
                              <div className={styles.factorRow} key={factor.feature || "negative-factor"}>
                                <div className={styles.factorHeaderRow}>
                                  <span>Feature:</span>
                                  <strong>{factor.feature || "Unknown"}</strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>Observed value:</span>
                                  <strong>{formatFeatureValue(factor.value)}</strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>SHAP contribution:</span>
                                  <strong className={styles.negativeValue}>{factor.impact.toFixed(4)}</strong>
                                </div>
                                <div className={styles.factorHeaderRow}>
                                  <span>Direction:</span>
                                  <strong>Pushes model toward lower priority</strong>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={styles.emptyState}>No negative SHAP contributors were identified.</div>
                          )}
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>OVERALL MODEL INTERPRETATION</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <p className={styles.resultParagraph}>
                          The model&apos;s prediction reflects the combined contribution of multiple case features. Positive and negative SHAP contributions pull the model in different directions. The final classification represents the model&apos;s output from these combined inputs and should be interpreted alongside the underlying case evidence and officer verification.
                        </p>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>TOP MODEL CONTRIBUTIONS</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.factorList}>
                          {shapFactors.length > 0 ? (
                            shapFactors.slice(0, 5).map((factor) => {
                              const impactValue =
                                typeof factor.shap_impact === "number"
                                  ? factor.shap_impact
                                  : Number(factor.shap_impact ?? 0);

                              return (
                                <div className={styles.factorRow} key={factor.feature || "factor"}>
                                  <div className={styles.factorHeaderRow}>
                                    <span>Feature:</span>
                                    <strong>{factor.feature || "Unknown"}</strong>
                                  </div>
                                  <div className={styles.factorHeaderRow}>
                                    <span>Feature value if available:</span>
                                    <strong>{normalizeValue(factor.value)}</strong>
                                  </div>
                                  <div className={styles.factorHeaderRow}>
                                    <span>SHAP contribution:</span>
                                    <strong
                                      className={
                                        impactValue >= 0 ? styles.positiveValue : styles.negativeValue
                                      }
                                    >
                                      {impactValue >= 0 ? "+" : ""}
                                      {impactValue.toFixed(4)}
                                    </strong>
                                  </div>
                                  <div className={styles.factorHeaderRow}>
                                    <span>Direction:</span>
                                    <strong>
                                      {impactValue >= 0
                                        ? "Pushes the model toward higher priority."
                                        : "Pushes the model toward lower priority."}
                                    </strong>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className={styles.emptyState}>No top factors available.</div>
                          )}
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>HOW TO READ THIS GRAPH</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.readingGrid}>
                          <div>
                            <strong>Positive SHAP:</strong>
                            <p>Pushes the model prediction toward higher priority.</p>
                          </div>
                          <div>
                            <strong>Negative SHAP:</strong>
                            <p>Pushes the model prediction toward lower priority.</p>
                          </div>
                          <div>
                            <strong>Larger absolute SHAP value:</strong>
                            <p>Stronger influence on this individual prediction.</p>
                          </div>
                          <div>
                            <strong>Important:</strong>
                            <p>SHAP describes model behavior and is not independent evidence.</p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>HISTORICAL CASE INTELLIGENCE</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.resultCardMeta}>
                          {historicalCases.length} similar cases retrieved
                        </div>
                        {historicalCases.length > 0 ? (
                          <div className={styles.historyList}>
                            {historicalCases.map((item, index) => {
                              const summary = getHistoricalCaseSummary(item);

                              return (
                                <div className={styles.historyCard} key={`${summary.caseId}-${index}`}>
                                  <div className={styles.historyHeader}>
                                    <strong>Case {summary.caseId}</strong>
                                    <span>{typeof item.final_score === "number" ? `Score ${item.final_score.toFixed(2)}` : "Score N/A"}</span>
                                  </div>
                                  <div className={styles.historyDetailGrid}>
                                    {summary.drugType !== "Unknown" && (
                                      <div>
                                        <label>Drug Type</label>
                                        <span>{summary.drugType}</span>
                                      </div>
                                    )}
                                    {summary.quantity !== "Unknown" && (
                                      <div>
                                        <label>Quantity</label>
                                        <span>{summary.quantity}</span>
                                      </div>
                                    )}
                                    {summary.route !== "Unknown" && (
                                      <div>
                                        <label>Route</label>
                                        <span>{summary.route}</span>
                                      </div>
                                    )}
                                    {typeof item.final_score === "number" && (
                                      <div>
                                        <label>Similarity/Relevance Score</label>
                                        <span>{summary.finalScore}</span>
                                      </div>
                                    )}
                                  </div>
                                  {item.matching_fields && Array.isArray(item.matching_fields) && item.matching_fields.length > 0 && (
                                    <div className={styles.historyDetails}>
                                      <label>Relevant details</label>
                                      <ul>
                                        {item.matching_fields.map((field, fieldIndex) => (
                                          <li key={`${fieldIndex}-${String(field)}`}>
                                            {String(field)}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className={styles.emptyState}>No historical cases returned.</div>
                        )}
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>DOMAIN KNOWLEDGE RETRIEVED</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.knowledgeGrid}>
                          {knowledgeEntries.map((entry) => (
                            <div className={styles.knowledgeCard} key={entry.key}>
                              <div className={styles.knowledgeHeader}>
                                <strong>{entry.label}</strong>
                                <span>{getKnowledgeText(entry.value)}</span>
                              </div>
                              {entry.value && typeof entry.value === "object" && "sources" in entry.value ? (
                                <ul className={styles.knowledgeList}>
                                  {Array.isArray((entry.value as KnowledgeEntry).sources)
                                    ? (entry.value as KnowledgeEntry).sources!.map((source, idx) => (
                                        <li key={`${entry.key}-${idx}`}>{String(source)}</li>
                                      ))
                                    : null}
                                </ul>
                              ) : (
                                <p className={styles.emptyStateSmall}>
                                  {getKnowledgeText(entry.value)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={styles.resultSectionHeader}>
                        <h3>EVIDENCE PACKAGE</h3>
                      </div>

                      <div className={styles.resultCard}>
                        <div className={styles.resultCardMeta}>STATUS</div>
                        <div className={styles.evidenceStatusRow}>
                          <span className={styles.evidenceStatusLabel}>Status:</span>
                          <strong>{evidencePackageStatus}</strong>
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.workflowActions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => router.push("/case-verification")}
                    >
                      BACK TO VERIFICATION
                    </button>

                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => {
                        if (analysisReady) {
                          router.push("/risk-classification");
                        }
                      }}
                      disabled={!analysisReady}
                      style={{
                        opacity: analysisReady ? 1 : 0.5,
                        cursor: analysisReady ? "pointer" : "not-allowed",
                      }}
                    >
                      CONTINUE TO RISK CLASSIFICATION
                    </button>
                  </div>
                </>
              )}
            </section>

            <aside className={styles.workflowCard}>
              <div className={styles.workflowHeader}>
                <span className={styles.workflowHeaderLabel}>CASE WORKFLOW</span>
                <h2>NARCIS CASE WORKFLOW</h2>
                <p>Case processing stages</p>
              </div>

              <div className={styles.workflow}>
                {workflowSteps.map((step) => (
                  <div className={styles.workflowStep} key={step.number}>
                    <div
                      className={`${styles.workflowCircle} ${
                        step.state === "complete"
                          ? styles.workflowComplete
                          : step.state === "current"
                            ? styles.workflowCurrent
                            : ""
                      }`}
                    >
                      {step.number}
                    </div>

                    <div className={styles.workflowStepBody}>
                      <h3>
                        {step.title}
                        {step.state === "complete" && (
                          <span
                            className={`${styles.workflowBadge} ${styles.workflowCompleteBadge}`}
                          >
                            COMPLETE
                          </span>
                        )}
                        {step.state === "current" && (
                          <span
                            className={`${styles.workflowBadge} ${styles.workflowCurrentBadge}`}
                          >
                            CURRENT
                          </span>
                        )}
                      </h3>

                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(13, 78, 104, 0.35)",
                  marginTop: "18px",
                  paddingTop: "18px",
                  color: "#dfeef6",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#8dc9e9",
                    marginBottom: "8px",
                  }}
                >
                  NARCIS IS ANALYZING THE VERIFIED CASE
                </div>
                <div style={{ fontSize: "14px", lineHeight: 1.7 }}>
                  AI provides decision support.
                  <br />
                  Officer retains investigative judgment.
                </div>
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
