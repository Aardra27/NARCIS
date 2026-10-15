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

const initialGroups: VerificationGroup[] = [
  {
    title: "CASE IDENTIFICATION",
    fields: [
      { key: "case_number", label: "CASE NUMBER", value: "", status: "MISSING" },
      { key: "fir_number", label: "FIR NUMBER", value: "", status: "MISSING" },
      { key: "police_station", label: "POLICE STATION", value: "", status: "MISSING" },
      { key: "district", label: "DISTRICT", value: "", status: "MISSING" },
    ],
  },
  {
    title: "PERSON DETAILS",
    fields: [
      { key: "name", label: "NAME", value: "", status: "MISSING" },
      { key: "age", label: "AGE", value: "", status: "MISSING" },
      { key: "gender", label: "GENDER", value: "", status: "MISSING" },
      { key: "address", label: "ADDRESS", value: "", status: "MISSING" },
    ],
  },
  {
    title: "SEIZURE DETAILS",
    fields: [
      { key: "substance", label: "SUBSTANCE", value: "", status: "MISSING" },
      { key: "quantity", label: "QUANTITY", value: "", status: "MISSING" },
      { key: "unit", label: "UNIT", value: "", status: "MISSING" },
      { key: "seizure_date", label: "SEIZURE DATE", value: "", status: "MISSING" },
      { key: "seizure_location", label: "SEIZURE LOCATION", value: "", status: "MISSING" },
    ],
  },
  {
    title: "OFFICER DETAILS",
    fields: [
      { key: "officer_name", label: "OFFICER NAME", value: "", status: "MISSING" },
      { key: "officer_id", label: "OFFICER ID", value: "", status: "MISSING" },
      { key: "designation", label: "DESIGNATION", value: "", status: "MISSING" },
      { key: "department", label: "DEPARTMENT", value: "", status: "MISSING" },
    ],
  },
];

export default function CaseVerificationPage() {

  const [groups, setGroups] =
    useState<VerificationGroup[]>(initialGroups);

  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>({
      "CASE IDENTIFICATION": true,
      "PERSON DETAILS": true,
      "SEIZURE DETAILS": true,
      "OFFICER DETAILS": true,
    });

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  useEffect(() => {

    try {

      const raw =
        sessionStorage.getItem("narcis_extraction_result");

      if (!raw) return;

      const result = JSON.parse(raw);

      const source =
        result?.data ||
        result?.case_data ||
        result?.extracted_data ||
        result ||
        {};

      setGroups((current) =>
        current.map((group) => ({
          ...group,
          fields: group.fields.map((field) => {

            const candidates = [
              field.key,
              field.key.toUpperCase(),
              field.label,
              field.label.toLowerCase(),
            ];

            let found: unknown = undefined;

            for (const key of candidates) {

              if (
                source &&
                typeof source === "object" &&
                key in source
              ) {
                found = (source as Record<string, unknown>)[key];
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
        "Unable to load extraction result:",
        error
      );

    }

  }, []);

  const totalFields = useMemo(
    () =>
      groups.reduce(
        (sum, group) => sum + group.fields.length,
        0
      ),
    [groups]
  );

  const extractedFields = useMemo(
    () =>
      groups.reduce(
        (sum, group) =>
          sum +
          group.fields.filter(
            (field) => field.status === "EXTRACTED"
          ).length,
        0
      ),
    [groups]
  );

  const missingFields = totalFields - extractedFields;

  function updateField(
    groupTitle: string,
    fieldKey: string,
    value: string
  ) {

    setGroups((current) =>
      current.map((group) => {

        if (group.title !== groupTitle) {
          return group;
        }

        return {
          ...group,
          fields: group.fields.map((field) => {

            if (field.key !== fieldKey) {
              return field;
            }

            return {
              ...field,
              value,
              status:
                value.trim() === ""
                  ? "MISSING"
                  : field.status === "EXTRACTED"
                    ? "EXTRACTED"
                    : "ADDED",
            };
          }),
        };
      })
    );

    setSaved(false);
  }

  function toggleGroup(title: string) {

    setOpenGroups((current) => ({
      ...current,
      [title]: !current[title],
    }));
  }

  function handleBack() {
    window.location.href =
      "/document-extraction";
  }

  function handleContinue() {

    setSaving(true);

    try {

      const verificationData: Record<string, string> = {};

      groups.forEach((group) => {

        group.fields.forEach((field) => {

          verificationData[field.key] =
            field.value;
        });

      });

      sessionStorage.setItem(
        "narcis_verified_case",
        JSON.stringify({
          ...verificationData,
          verified_at:
            new Date().toISOString(),
        })
      );

      setSaved(true);

      setTimeout(() => {

        window.location.href =
          "/case-analysis";

      }, 350);

    } catch (error) {

      console.error(
        "Unable to save verification:",
        error
      );

      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className={styles.sidebar}>

        <div className={styles.sidebarBrand}>

          <div className={styles.logoArea}>

            <div className={styles.logoMark}>
              N
            </div>

            <span>NARCIS</span>

          </div>

          <p>
            NARCOTICS ANALYSIS, RISK CLASSIFICATION
            <br />
            AND INTELLIGENT SUPPORT SYSTEM
          </p>

        </div>

        <nav className={styles.navigation}>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>⌂</span>
            Dashboard
          </button>

          <button
            className={`${styles.navItem} ${styles.navActive}`}
          >
            <span className={styles.navIcon}>▣</span>
            New Case
          </button>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>▤</span>
            Cases
          </button>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>◉</span>
            Analytics
          </button>

          <button className={styles.navItem}>
            <span className={styles.navIcon}>⚙</span>
            Settings
          </button>

        </nav>

        <div className={styles.sidebarDivider} />

        <div className={styles.sidebarOfficer}>

          <div className={styles.officerAvatar}>
            OP
          </div>

          <div>
            <strong>OFFICER PORTAL</strong>
            <small>AUTHENTICATED SESSION</small>
          </div>

        </div>

        <div className={styles.secureSession}>
          <span className={styles.sessionDot} />
          SECURE SESSION ACTIVE
        </div>

      </aside>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className={styles.main}>

        <header className={styles.header}>

          <div>

            <h1>
              CASE VERIFICATION
            </h1>

            <p>
              Review and verify extracted case information
              before continuing to analysis.
            </p>

          </div>

          <div className={styles.headerActions}>

            <button className={styles.iconButton}>
              ♧
            </button>

            <button className={styles.iconButton}>
              ◌
              <span className={styles.notificationBadge}>
                3
              </span>
            </button>

            <div className={styles.headerDivider} />

            <div className={styles.userMenu}>

              <div className={styles.userAvatar}>
                OP
              </div>

              <div>
                <strong>OFFICER</strong>

                <small>
                  <span />
                  ONLINE
                </small>
              </div>

              <span className={styles.chevron}>
                ▾
              </span>

            </div>

          </div>

        </header>

        <div className={styles.breadcrumb}>

          <span>NEW CASE</span>
          <b>/</b>
          <span>DOCUMENT EXTRACTION</span>
          <b>/</b>
          <strong>CASE VERIFICATION</strong>

        </div>

        <div className={styles.pageContent}>

          {/* ==================================================
              TOP AREA
          ================================================== */}

          <section className={styles.topArea}>

            <div className={styles.verificationIntro}>

              <div>

                <span className={styles.eyebrow}>
                  STEP 03
                </span>

                <h2>
                  Verify Extracted Information
                </h2>

                <p>
                  Review the information extracted from
                  the uploaded document. You can edit any
                  field before submitting the case.
                </p>

              </div>

              <div className={styles.summary}>

                <div>
                  <strong>{totalFields}</strong>
                  <span>TOTAL FIELDS</span>
                </div>

                <div>
                  <strong>{extractedFields}</strong>
                  <span>EXTRACTED</span>
                </div>

                <div>
                  <strong>{missingFields}</strong>
                  <span>MISSING</span>
                </div>

              </div>

            </div>

            {/* ==================================================
                TWO COLUMN CONTINUATION
            ================================================== */}

            <div className={styles.twoColumn}>

              {/* LEFT */}
              <div className={styles.formColumn}>

                <section className={styles.formCard}>

                  <div className={styles.cardHeader}>

                    <div>
                      <span className={styles.cardLabel}>
                        CASE DATA
                      </span>

                      <h3>
                        Extracted Case Information
                      </h3>

                      <p>
                        Click any field to edit its value.
                      </p>
                    </div>

                    <div className={styles.legend}>

                      <span>
                        <i className={styles.greenDot} />
                        Extracted
                      </span>

                      <span>
                        <i className={styles.orangeDot} />
                        Missing
                      </span>

                    </div>

                  </div>

                  <div className={styles.groups}>

                    {groups.map((group) => (

                      <div
                        className={styles.fieldGroup}
                        key={group.title}
                      >

                        <button
                          type="button"
                          className={styles.groupHeader}
                          onClick={() =>
                            toggleGroup(group.title)
                          }
                        >

                          <span>
                            {group.title}
                          </span>

                          <span>
                            {openGroups[group.title]
                              ? "−"
                              : "+"}
                          </span>

                        </button>

                        {openGroups[group.title] && (

                          <div className={styles.fieldsGrid}>

                            {group.fields.map((field) => (

                              <div
                                className={styles.field}
                                key={field.key}
                              >

                                <div className={styles.fieldTop}>

                                  <label htmlFor={field.key}>
                                    {field.label}
                                  </label>

                                  <span
                                    className={
                                      field.status === "EXTRACTED"
                                        ? styles.statusExtracted
                                        : field.status === "ADDED"
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
                                  onChange={(event) =>
                                    updateField(
                                      group.title,
                                      field.key,
                                      event.target.value
                                    )
                                  }
                                  placeholder="Enter value"
                                />

                              </div>

                            ))}

                          </div>

                        )}

                      </div>

                    ))}

                  </div>

                </section>

                <section className={styles.guidelineCard}>

                  <div className={styles.guidelineIcon}>
                    i
                  </div>

                  <div>

                    <h3>
                      VERIFICATION GUIDELINE
                    </h3>

                    <p>
                      Check extracted values against the
                      source document. Correct inaccurate
                      values and complete missing information
                      before continuing.
                    </p>

                  </div>

                </section>

              </div>

              {/* RIGHT */}
              <aside className={styles.workflowCard}>

                <div className={styles.workflowHeader}>

                  <span className={styles.cardLabel}>
                    CASE WORKFLOW
                  </span>

                  <h3>
                    NARCIS CASE WORKFLOW
                  </h3>

                  <p>
                    Case processing stages
                  </p>

                </div>

                <div className={styles.workflow}>

                  <div
                    className={`${styles.workflowStep} ${styles.completeStep}`}
                  >

                    <div className={styles.stepNumber}>
                      ✓
                    </div>

                    <div className={styles.stepText}>

                      <div className={styles.stepTitle}>

                        <strong>
                          Document Upload
                        </strong>

                        <span className={styles.completeBadge}>
                          COMPLETE
                        </span>

                      </div>

                      <span>
                        Source document uploaded
                      </span>

                    </div>

                  </div>

                  <div className={styles.workflowLine} />

                  <div
                    className={`${styles.workflowStep} ${styles.completeStep}`}
                  >

                    <div className={styles.stepNumber}>
                      ✓
                    </div>

                    <div className={styles.stepText}>

                      <div className={styles.stepTitle}>

                        <strong>
                          Document Extraction
                        </strong>

                        <span className={styles.completeBadge}>
                          COMPLETE
                        </span>

                      </div>

                      <span>
                        Information extracted from document
                      </span>

                    </div>

                  </div>

                  <div className={styles.workflowLine} />

                  <div
                    className={`${styles.workflowStep} ${styles.currentStep}`}
                  >

                    <div className={styles.stepNumber}>
                      03
                    </div>

                    <div className={styles.stepText}>

                      <div className={styles.stepTitle}>

                        <strong>
                          Case Verification
                        </strong>

                        <span className={styles.currentBadge}>
                          CURRENT
                        </span>

                      </div>

                      <span>
                        Review and verify extracted information
                      </span>

                    </div>

                  </div>

                  <div className={styles.workflowLine} />

                  <div className={styles.workflowStep}>

                    <div className={styles.stepNumber}>
                      04
                    </div>

                    <div className={styles.stepText}>

                      <div className={styles.stepTitle}>
                        <strong>
                          Risk Classification
                        </strong>
                      </div>

                      <span>
                        AI-based case risk assessment
                      </span>

                    </div>

                  </div>

                  <div className={styles.workflowLine} />

                  <div className={styles.workflowStep}>

                    <div className={styles.stepNumber}>
                      05
                    </div>

                    <div className={styles.stepText}>

                      <div className={styles.stepTitle}>
                        <strong>
                          Analysis
                        </strong>
                      </div>

                      <span>
                        Case intelligence and analysis
                      </span>

                    </div>

                  </div>

                  <div className={styles.workflowLine} />

                  <div className={styles.workflowStep}>

                    <div className={styles.stepNumber}>
                      06
                    </div>

                    <div className={styles.stepText}>

                      <div className={styles.stepTitle}>
                        <strong>
                          Case Completion
                        </strong>
                      </div>

                      <span>
                        Finalize case record
                      </span>

                    </div>

                  </div>

                </div>

              </aside>

            </div>

          </section>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className={styles.actions}>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleBack}
            >
              ← BACK TO DOCUMENT EXTRACTION
            </button>

            <div className={styles.actionRight}>

              {saved && (
                <span className={styles.savedMessage}>
                  ✓ Verification saved
                </span>
              )}

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleContinue}
                disabled={saving}
              >
                {saving
                  ? "SAVING..."
                  : "CONTINUE TO ANALYSIS →"}
              </button>

            </div>

          </div>

          <footer className={styles.footer}>

            <strong>NARCIS</strong>

            <i />

            <span>
              Secure Case Processing System
            </span>

            <i />

            <span>
              Verification Stage
            </span>

          </footer>

        </div>

      </main>

    </div>
  );
}
