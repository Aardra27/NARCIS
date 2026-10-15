"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./case-verification.module.css";

type VerificationField = {
  key: string;
  label: string;
  value: string;
  status: "EXTRACTED" | "MISSING" | "ADDED";
};

type VerificationGroup = {
  title: string;
  fields: VerificationField[];
};

/*
 * These are UI fallbacks only.
 * Backend/extraction data is loaded when available.
 */
const initialGroups: VerificationGroup[] = [
  {
    title: "CASE INFORMATION",
    fields: [
      {
        key: "case_id",
        label: "CASE ID",
        value: "",
        status: "MISSING",
      },
      {
        key: "investigation_year",
        label: "INVESTIGATION YEAR",
        value: "",
        status: "MISSING",
      },
      {
        key: "agency",
        label: "AGENCY",
        value: "",
        status: "MISSING",
      },
      {
        key: "zonal_unit",
        label: "ZONAL UNIT",
        value: "",
        status: "MISSING",
      },
    ],
  },
  {
    title: "DRUG INFORMATION",
    fields: [
      {
        key: "drug_type",
        label: "DRUG TYPE",
        value: "",
        status: "MISSING",
      },
      {
        key: "quantity",
        label: "QUANTITY",
        value: "",
        status: "MISSING",
      },
      {
        key: "quantity_category",
        label: "QUANTITY CATEGORY",
        value: "",
        status: "MISSING",
      },
      {
        key: "persons_arrested",
        label: "PERSONS ARRESTED",
        value: "",
        status: "MISSING",
      },
    ],
  },
  {
    title: "INVESTIGATION INFORMATION",
    fields: [
      {
        key: "source_type",
        label: "SOURCE TYPE",
        value: "",
        status: "MISSING",
      },
      {
        key: "operation_type",
        label: "OPERATION TYPE",
        value: "",
        status: "MISSING",
      },
      {
        key: "vehicle_type",
        label: "VEHICLE TYPE",
        value: "",
        status: "MISSING",
      },
      {
        key: "seizure_date",
        label: "SEIZURE DATE",
        value: "",
        status: "MISSING",
      },
    ],
  },
  {
    title: "ROUTE INFORMATION",
    fields: [
      {
        key: "origin_state",
        label: "ORIGIN STATE",
        value: "",
        status: "MISSING",
      },
      {
        key: "destination_state",
        label: "DESTINATION STATE",
        value: "",
        status: "MISSING",
      },
      {
        key: "transport_mode",
        label: "TRANSPORT MODE",
        value: "",
        status: "MISSING",
      },
      {
        key: "route_type",
        label: "ROUTE TYPE",
        value: "",
        status: "MISSING",
      },
      {
        key: "interstate_travel",
        label: "INTERSTATE TRAVEL",
        value: "",
        status: "MISSING",
      },
    ],
  },
  {
    title: "LEGAL INFORMATION",
    fields: [
      {
        key: "applicable_ndps_sections",
        label: "APPLICABLE NDPS SECTIONS",
        value: "",
        status: "MISSING",
      },
      {
        key: "legal_status",
        label: "LEGAL STATUS",
        value: "",
        status: "MISSING",
      },
    ],
  },
];

/* ============================================================
   SAME ICON SYSTEM FAMILY AS NEW CASE
   ============================================================ */

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

  const paths: Record<string, React.ReactNode> = {

    dashboard: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    cases: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </>
    ),

    intelligence: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </>
    ),

    reports: (
      <>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </>
    ),

    history: (
      <>
        <path d="M4 12a8 8 0 1 0 2-5" />
        <path d="M4 5v5h5" />
        <path d="M12 8v5l3 2" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.3 3h-4.6l-.4 2.6a7 7 0 0 0-2 1.2L5 5.9l-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4.6l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
      </>
    ),

    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.6 2.6 0 1 1 4.6 1.7c-.9 1-2.1 1.2-2.1 3" />
        <path d="M12 17h.01" />
      </>
    ),

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

  return (
    <svg {...common}>
      {paths[type] ?? paths.info}
    </svg>
  );
}

export default function CaseVerificationPage() {

  const [groups, setGroups] =
    useState<VerificationGroup[]>(initialGroups);

  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>({
      "CASE INFORMATION": true,
      "DRUG INFORMATION": true,
      "INVESTIGATION INFORMATION": true,
      "ROUTE INFORMATION": true,
      "LEGAL INFORMATION": true,
    });

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  /* ==========================================================
     LOAD EXISTING EXTRACTION RESULT
     ========================================================== */

  useEffect(() => {

    try {

      const raw =
        sessionStorage.getItem(
          "narcis_extraction_result"
        );

      if (!raw) return;

      const result = JSON.parse(raw);

      const source =
        result?.data ??
        result?.case_data ??
        result?.extracted_data ??
        result ??
        {};

      if (
        !source ||
        typeof source !== "object"
      ) {
        return;
      }

      setGroups((current) =>
        current.map((group) => ({
          ...group,

          fields: group.fields.map((field) => {

            const candidates = [
              field.key,
              field.key.toUpperCase(),
              field.label,
              field.label.toLowerCase(),
              field.label.replaceAll(" ", "_").toLowerCase(),
            ];

            let found: unknown;

            for (const key of candidates) {

              if (
                key in
                (source as Record<string, unknown>)
              ) {

                found =
                  (source as Record<string, unknown>)[
                    key
                  ];

                break;
              }
            }

            if (
              found !== undefined &&
              found !== null &&
              String(found).trim() !== ""
            ) {

              return {
                ...field,
                value: String(found),
                status: "EXTRACTED" as const,
              };
            }

            return field;
          }),
        }))
      );

    } catch (error) {

      console.error(
        "Failed to load extraction result:",
        error
      );

    }

  }, []);

  /* ==========================================================
     COUNTERS
     ========================================================== */

  const totalFields = useMemo(
    () =>
      groups.reduce(
        (total, group) =>
          total + group.fields.length,
        0
      ),
    [groups]
  );

  const extractedFields = useMemo(
    () =>
      groups.reduce(
        (total, group) =>
          total +
          group.fields.filter(
            field =>
              field.status === "EXTRACTED"
          ).length,
        0
      ),
    [groups]
  );

  const editedFields = useMemo(
    () =>
      groups.reduce(
        (total, group) =>
          total +
          group.fields.filter(
            field =>
              field.status === "ADDED"
          ).length,
        0
      ),
    [groups]
  );

  const missingFields =
    totalFields -
    extractedFields -
    editedFields;

  /* ==========================================================
     FIELD EDITING
     ========================================================== */

  function updateField(
    groupTitle: string,
    fieldKey: string,
    value: string
  ) {

    setGroups(current =>
      current.map(group => {

        if (group.title !== groupTitle) {
          return group;
        }

        return {
          ...group,

          fields:
            group.fields.map(field => {

              if (
                field.key !== fieldKey
              ) {
                return field;
              }

              let status:
                | "EXTRACTED"
                | "MISSING"
                | "ADDED";

              if (
                value.trim() === ""
              ) {

                status = "MISSING";

              } else if (
                field.status ===
                "EXTRACTED"
              ) {

                status = "EXTRACTED";

              } else {

                status = "ADDED";
              }

              return {
                ...field,
                value,
                status,
              };
            }),
        };
      })
    );

    setSaved(false);
  }

  function toggleGroup(
    title: string
  ) {

    setOpenGroups(current => ({
      ...current,
      [title]:
        !current[title],
    }));
  }

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  function goTo(
    path: string
  ) {

    window.location.href = path;
  }

  function handleBack() {

    goTo(
      "/document-extraction"
    );
  }

  function handleContinue() {

    setSaving(true);

    try {

      const verifiedData:
        Record<string, string> = {};

      groups.forEach(group => {

        group.fields.forEach(field => {

          verifiedData[field.key] =
            field.value;
        });

      });

      sessionStorage.setItem(
        "narcis_verified_case",
        JSON.stringify({
          ...verifiedData,
          verified_at:
            new Date().toISOString(),
        })
      );

      setSaved(true);

      setTimeout(() => {

        goTo(
          "/case-analysis"
        );

      }, 300);

    } catch (error) {

      console.error(
        "Failed to save verification:",
        error
      );

      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ======================================================
          EXACT APPLICATION SHELL FAMILY
          ====================================================== */}

      <aside className={styles.sidebar}>

        <div className={styles.sidebarBrand}>

          <div className={styles.logoArea}>

            <div className={styles.logoMark}>
              N
            </div>

            <span>
              NARCIS
            </span>

          </div>

          <p>
            NARCOTICS ANALYSIS, RISK CLASSIFICATION
            <br />
            AND INTELLIGENT SUPPORT SYSTEM
          </p>

        </div>

        <nav className={styles.navigation}>

          <button
            type="button"
            className={styles.navItem}
            onClick={() =>
              goTo("/dashboard")
            }
          >
            <span className={styles.navIcon}>
              <Icon type="dashboard" />
            </span>
            Dashboard
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${styles.navActive}`}
            onClick={() =>
              goTo("/new-case")
            }
          >
            <span className={styles.navIcon}>
              <Icon type="plus" />
            </span>
            New Case
          </button>

          <button
            type="button"
            className={styles.navItem}
            onClick={() =>
              goTo("/cases")
            }
          >
            <span className={styles.navIcon}>
              <Icon type="cases" />
            </span>
            Cases
          </button>

          <button
            type="button"
            className={styles.navItem}
            onClick={() =>
              goTo("/intelligence")
            }
          >
            <span className={styles.navIcon}>
              <Icon type="intelligence" />
            </span>
            Intelligence
          </button>

          <button
            type="button"
            className={styles.navItem}
            onClick={() =>
              goTo("/reports")
            }
          >
            <span className={styles.navIcon}>
              <Icon type="reports" />
            </span>
            Reports
          </button>

          <button
            type="button"
            className={styles.navItem}
            onClick={() =>
              goTo("/case-history")
            }
          >
            <span className={styles.navIcon}>
              <Icon type="history" />
            </span>
            Case History
          </button>

        </nav>

        <div className={styles.sidebarDivider} />

        <nav className={styles.navigation}>

          <button
            type="button"
            className={styles.navItem}
          >
            <span className={styles.navIcon}>
              <Icon type="settings" />
            </span>
            Settings
          </button>

          <button
            type="button"
            className={styles.navItem}
          >
            <span className={styles.navIcon}>
              <Icon type="help" />
            </span>
            Help & Support
          </button>

        </nav>

        <div className={styles.sidebarOfficer}>

          <div className={styles.officerAvatar}>
            OP
          </div>

          <div>
            <strong>
              OFFICER
            </strong>

            <small>
              AUTHORIZED USER
            </small>
          </div>

        </div>

        <div className={styles.secureSession}>

          <span className={styles.sessionDot} />

          SECURE SESSION

        </div>

      </aside>

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main className={styles.main}>

        <header className={styles.header}>

          <div>

            <h1>
              OFFICER VERIFICATION / ENRICHMENT
            </h1>

            <p>
              Review, verify, correct, and enrich the
              extracted case information before analysis.
            </p>

          </div>

          <div className={styles.headerActions}>

            <button
              type="button"
              className={styles.iconButton}
            >
              <Icon type="help" />
            </button>

            <button
              type="button"
              className={styles.iconButton}
            >
              <Icon type="bell" />

              <span
                className={styles.notificationBadge}
              >
                3
              </span>

            </button>

            <div
              className={styles.headerDivider}
            />

            <div className={styles.userMenu}>

              <div className={styles.userAvatar}>
                <Icon type="user" />
              </div>

              <div>

                <strong>
                  OFFICER
                </strong>

                <small>
                  <span />
                  SECURE SESSION
                </small>

              </div>

              <span
                className={styles.chevron}
              >
                ▾
              </span>

            </div>

          </div>

        </header>

        <div className={styles.breadcrumb}>

          <span>
            DASHBOARD
          </span>

          <b>/</b>

          <span>
            NEW CASE
          </span>

          <b>/</b>

          <span>
            DOCUMENT EXTRACTION
          </span>

          <b>/</b>

          <strong>
            VERIFICATION
          </strong>

        </div>

        <div className={styles.content}>

          {/* ==================================================
              DOCUMENT STATUS
              ================================================== */}

          <section className={styles.documentStatus}>

            <div>

              <span className={styles.cardLabel}>
                CASE DOCUMENT
              </span>

              <h2>
                Extracted Case Information
              </h2>

              <p>
                Review information extracted from the
                uploaded investigation document.
              </p>

            </div>

            <div className={styles.verificationStatus}>

              <span
                className={styles.statusCircle}
              >
                ✓
              </span>

              <div>

                <strong>
                  PENDING OFFICER VERIFICATION
                </strong>

                <span>
                  Extraction complete
                </span>

              </div>

            </div>

          </section>

          {/* ==================================================
              MAIN WORKSPACE
              ================================================== */}

          <div className={styles.verificationGrid}>

            {/* =================================================
                LEFT - VERIFIED CASE INFORMATION
                ================================================= */}

            <section className={styles.verificationCard}>

              <div className={styles.cardHeader}>

                <div>

                  <span className={styles.cardLabel}>
                    VERIFIED CASE INFORMATION
                  </span>

                  <h3>
                    Review & Enrich
                  </h3>

                  <p>
                    Correct inaccurate values and complete
                    missing details.
                  </p>

                </div>

                <div className={styles.legend}>

                  <span>
                    <i
                      className={
                        styles.extractedDot
                      }
                    />
                    Extracted
                  </span>

                  <span>
                    <i
                      className={
                        styles.editedDot
                      }
                    />
                    Added
                  </span>

                  <span>
                    <i
                      className={
                        styles.missingDot
                      }
                    />
                    Missing
                  </span>

                </div>

              </div>

              <div className={styles.groups}>

                {groups.map(group => (

                  <section
                    key={group.title}
                    className={styles.fieldGroup}
                  >

                    <button
                      type="button"
                      className={
                        styles.groupHeader
                      }
                      onClick={() =>
                        toggleGroup(
                          group.title
                        )
                      }
                    >

                      <span>
                        {group.title}
                      </span>

                      <span
                        className={
                          styles.groupArrow
                        }
                      >
                        {openGroups[group.title]
                          ? "−"
                          : "+"}
                      </span>

                    </button>

                    {openGroups[group.title] && (

                      <div
                        className={
                          styles.fieldsGrid
                        }
                      >

                        {group.fields.map(
                          field => (

                            <div
                              key={field.key}
                              className={
                                styles.field
                              }
                            >

                              <div
                                className={
                                  styles.fieldTop
                                }
                              >

                                <label
                                  htmlFor={
                                    field.key
                                  }
                                >
                                  {field.label}
                                </label>

                                <span
                                  className={
                                    field.status ===
                                    "EXTRACTED"
                                      ? styles.statusExtracted
                                      : field.status ===
                                        "ADDED"
                                        ? styles.statusAdded
                                        : styles.statusMissing
                                  }
                                >
                                  {field.status}
                                </span>

                              </div>

                              <input
                                id={field.key}
                                value={field.value}
                                onChange={
                                  event =>
                                    updateField(
                                      group.title,
                                      field.key,
                                      event.target.value
                                    )
                                }
                                placeholder={
                                  field.status ===
                                  "MISSING"
                                    ? "Information not found. Enter value."
                                    : "Enter value"
                                }
                              />

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </section>

                ))}

              </div>

            </section>

            {/* =================================================
                RIGHT - EXACT NEW CASE WORKFLOW FAMILY
                ================================================= */}

            <aside
              className={styles.workflowCard}
            >

              <div
                className={
                  styles.workflowHeader
                }
              >

                <span
                  className={styles.cardLabel}
                >
                  CASE WORKFLOW
                </span>

                <h3>
                  NARCIS CASE WORKFLOW
                </h3>

                <p>
                  Case processing stages
                </p>

              </div>

              <div
                className={styles.workflow}
              >

                {/* 01 */}

                <div
                  className={`${styles.workflowStep} ${styles.completeStep}`}
                >

                  <div
                    className={
                      styles.stepNumber
                    }
                  >
                    ✓
                  </div>

                  <div
                    className={
                      styles.stepText
                    }
                  >

                    <div
                      className={
                        styles.stepTitle
                      }
                    >

                      <strong>
                        Upload Document
                      </strong>

                      <span
                        className={
                          styles.completeBadge
                        }
                      >
                        COMPLETE
                      </span>

                    </div>

                    <span>
                      Source document uploaded
                    </span>

                  </div>

                </div>

                <div
                  className={
                    styles.workflowLine
                  }
                />

                {/* 02 */}

                <div
                  className={`${styles.workflowStep} ${styles.completeStep}`}
                >

                  <div
                    className={
                      styles.stepNumber
                    }
                  >
                    ✓
                  </div>

                  <div
                    className={
                      styles.stepText
                    }
                  >

                    <div
                      className={
                        styles.stepTitle
                      }
                    >

                      <strong>
                        Document Extraction
                      </strong>

                      <span
                        className={
                          styles.completeBadge
                        }
                      >
                        COMPLETE
                      </span>

                    </div>

                    <span>
                      Information extracted from document
                    </span>

                  </div>

                </div>

                <div
                  className={
                    styles.workflowLine
                  }
                />

                {/* 03 */}

                <div
                  className={`${styles.workflowStep} ${styles.currentStep}`}
                >

                  <div
                    className={
                      styles.stepNumber
                    }
                  >
                    03
                  </div>

                  <div
                    className={
                      styles.stepText
                    }
                  >

                    <div
                      className={
                        styles.stepTitle
                      }
                    >

                      <strong>
                        Officer Verification
                      </strong>

                      <span
                        className={
                          styles.currentBadge
                        }
                      >
                        CURRENT
                      </span>

                    </div>

                    <span>
                      Verify and enrich extracted information
                    </span>

                  </div>

                </div>

                <div
                  className={
                    styles.workflowLine
                  }
                />

                {/* 04 */}

                <div
                  className={
                    styles.workflowStep
                  }
                >

                  <div
                    className={
                      styles.stepNumber
                    }
                  >
                    04
                  </div>

                  <div
                    className={
                      styles.stepText
                    }
                  >

                    <div
                      className={
                        styles.stepTitle
                      }
                    >

                      <strong>
                        AI Analysis
                      </strong>

                    </div>

                    <span>
                      ML analysis and intelligence
                    </span>

                  </div>

                </div>

                <div
                  className={
                    styles.workflowLine
                  }
                />

                {/* 05 */}

                <div
                  className={
                    styles.workflowStep
                  }
                >

                  <div
                    className={
                      styles.stepNumber
                    }
                  >
                    05
                  </div>

                  <div
                    className={
                      styles.stepText
                    }
                  >

                    <div
                      className={
                        styles.stepTitle
                      }
                    >

                      <strong>
                        Decision-Support Report
                      </strong>

                    </div>

                    <span>
                      Evidence package and investigation report
                    </span>

                  </div>

                </div>

                <div
                  className={
                    styles.workflowLine
                  }
                />

                {/* 06 */}

                <div
                  className={
                    styles.workflowStep
                  }
                >

                  <div
                    className={
                      styles.stepNumber
                    }
                  >
                    06
                  </div>

                  <div
                    className={
                      styles.stepText
                    }
                  >

                    <div
                      className={
                        styles.stepTitle
                      }
                    >

                      <strong>
                        Officer Review
                      </strong>

                    </div>

                    <span>
                      Final review and case disposition
                    </span>

                  </div>

                </div>

              </div>

            </aside>

          </div>

          {/* ==================================================
              VERIFICATION SUMMARY
              ================================================== */}

          <section
            className={
              styles.verificationNotice
            }
          >

            <div
              className={
                styles.noticeIcon
              }
            >
              <Icon type="shield" />
            </div>

            <div>

              <strong>
                OFFICER VERIFICATION REQUIRED
              </strong>

              <p>
                Review all extracted fields carefully.
                Correct inaccurate information and enrich
                missing details before NARCIS performs AI
                analysis.
              </p>

            </div>

            <div
              className={
                styles.noticeStats
              }
            >

              <span>
                {totalFields}
                <small>
                  TOTAL
                </small>
              </span>

              <span>
                {extractedFields}
                <small>
                  EXTRACTED
                </small>
              </span>

              <span>
                {editedFields}
                <small>
                  ADDED
                </small>
              </span>

              <span>
                {missingFields}
                <small>
                  MISSING
                </small>
              </span>

            </div>

          </section>

          {/* ==================================================
              ACTIONS
              ================================================== */}

          <div
            className={styles.actions}
          >

            <button
              type="button"
              className={
                styles.cancelButton
              }
              onClick={handleBack}
            >
              BACK
            </button>

            <div
              className={
                styles.actionRight
              }
            >

              {saved && (

                <span
                  className={
                    styles.savedMessage
                  }
                >
                  ✓ SAVED
                </span>

              )}

              <button
                type="button"
                className={
                  styles.continueButton
                }
                onClick={
                  handleContinue
                }
                disabled={saving}
              >

                {saving
                  ? "SAVING..."
                  : "CONTINUE TO ANALYSIS"}

                <span>
                  →
                </span>

              </button>

            </div>

          </div>

        </div>

        {/* ====================================================
            EXACT DASHBOARD / NEW CASE FOOTER FAMILY
            ==================================================== */}

        <footer
          className={styles.footer}
        >

          <span>
            <Icon type="shield" />
          </span>

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

    </div>
  );
}
