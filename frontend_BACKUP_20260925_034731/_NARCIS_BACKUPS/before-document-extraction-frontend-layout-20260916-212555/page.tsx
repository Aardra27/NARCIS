"use client";

import styles from "./document-extraction.module.css";

const workflow = [
  {
    number: "01",
    title: "Upload Document",
    description: "Upload investigation document",
    status: "complete",
  },
  {
    number: "02",
    title: "Document Extraction",
    description: "Extract case information from uploaded document",
    status: "current",
  },
  {
    number: "03",
    title: "Officer Verification",
    description: "Officer verifies and enriches extracted information",
    status: "next",
  },
  {
    number: "04",
    title: "AI Analysis",
    description: "ML analysis + SHAP explainability + RAG intelligence",
    status: "next",
  },
  {
    number: "05",
    title: "Decision-Support Report",
    description: "Evidence package and LLM investigation report",
    status: "next",
  },
  {
    number: "06",
    title: "Officer Review",
    description: "Final officer review and case disposition",
    status: "next",
  },
];

const caseInformation = [
  ["CASE ID", "NARCIS-025"],
  ["INVESTIGATION YEAR", "2023"],
  ["AGENCY", "NCB"],
  ["ZONAL UNIT", "Chandigarh Zonal Unit"],
];

const drugInformation = [
  ["DRUG TYPE", "Heroin"],
  ["QUANTITY", "20.326 Kg Heroin"],
  ["QUANTITY CATEGORY", "Commercial"],
];

const investigationInformation = [
  ["PERSONS ARRESTED", "20"],
  ["SOURCE TYPE", "Secret Information"],
  ["OPERATION TYPE", "International trafficking syndicate investigation and seizure"],
];

const routeInformation = [
  ["ORIGIN STATE", "Gujarat"],
  ["DESTINATION STATE", "Punjab"],
  ["TRANSPORT MODE", "Road"],
  ["ROUTE TYPE", "Interstate"],
  ["INTERSTATE TRAVEL", "Yes"],
];

const legalInformation = [
  ["APPLICABLE NDPS SECTIONS", "8(c), 21, 27A, 29"],
  ["VEHICLE TYPE", "Unknown"],
];

function WorkflowCard() {
  return (
    <div className={styles.workflowCard}>
      <div className={styles.cardTitle}>NARCIS CASE WORKFLOW</div>

      <div className={styles.workflow}>
        {workflow.map((step, index) => (
          <div className={styles.workflowItem} key={step.number}>
            <div
              className={`${styles.workflowStep} ${
                step.status === "complete"
                  ? styles.complete
                  : step.status === "current"
                    ? styles.current
                    : ""
              }`}
            >
              <div className={styles.stepNumber}>
                {step.status === "complete" ? "✓" : step.number}
              </div>

              <div className={styles.stepText}>
                <div className={styles.stepTitle}>
                  <span>{step.title}</span>

                  {step.status === "current" && (
                    <span className={styles.currentBadge}>CURRENT</span>
                  )}

                  {step.status === "complete" && (
                    <span className={styles.completeBadge}>COMPLETE</span>
                  )}
                </div>

                <div className={styles.stepDescription}>
                  {step.description}
                </div>
              </div>
            </div>

            {index < workflow.length - 1 && (
              <div
                className={`${styles.workflowLine} ${
                  step.status === "complete" ? styles.completedLine : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InformationSection({
  title,
  items,
}: {
  title: string;
  items: string[][];
}) {
  return (
    <div className={styles.infoSection}>
      <div className={styles.sectionTitle}>{title}</div>

      <div className={styles.infoGrid}>
        {items.map(([label, value]) => (
          <div className={styles.infoCard} key={label}>
            <div className={styles.infoLabel}>{label}</div>
            <div className={styles.infoValue}>{value}</div>
            <div className={styles.extracted}>
              <span className={styles.checkCircle}>✓</span>
              Extracted
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocumentExtractionPage() {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>N</div>
          <div>
            <div className={styles.logoText}>NARCIS</div>
            <div className={styles.logoSub}>
              Narcotics Analysis, Risk Classification
              <br />
              and Intelligent Support System
            </div>
          </div>
        </div>

        <div className={styles.sidebarDivider} />

        <nav className={styles.navigation}>
          <div className={styles.navItem}>
            <span className={styles.navIcon}>▦</span>
            Dashboard
          </div>

          <div className={`${styles.navItem} ${styles.activeNav}`}>
            <span className={styles.navIcon}>＋</span>
            New Case
          </div>

          <div className={styles.navItem}>
            <span className={styles.navIcon}>□</span>
            Cases
          </div>

          <div className={styles.navItem}>
            <span className={styles.navIcon}>⌘</span>
            Intelligence
          </div>

          <div className={styles.navItem}>
            <span className={styles.navIcon}>▤</span>
            Reports
          </div>

          <div className={styles.navItem}>
            <span className={styles.navIcon}>◷</span>
            Case History
          </div>
        </nav>

        <div className={styles.sidebarDivider} />

        <div className={styles.navigation}>
          <div className={styles.navItem}>
            <span className={styles.navIcon}>⚙</span>
            Settings
          </div>

          <div className={styles.navItem}>
            <span className={styles.navIcon}>?</span>
            Help &amp; Support
          </div>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.officerBlock}>
            <div className={styles.officerAvatar}>♟</div>

            <div>
              <div className={styles.officerName}>OFFICER</div>
              <div className={styles.officerRole}>Authorized User</div>
            </div>
          </div>

          <div className={styles.secureSession}>
            <span className={styles.sessionDot} />
            SECURE SESSION
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>DOCUMENT EXTRACTION</h1>
            <p>
              NARCIS is extracting structured case information from the
              uploaded investigation document.
            </p>

            <div className={styles.breadcrumb}>
              <span>Dashboard</span>
              <span>/</span>
              <span>New Case</span>
              <span>/</span>
              <span>Upload Document</span>
              <span>/</span>
              <strong>Extraction</strong>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.notification}>♧<span>3</span></div>
            <div className={styles.help}>?</div>
            <div className={styles.headerDivider} />

            <div className={styles.headerOfficer}>
              <div className={styles.headerAvatar}>●</div>
              <div>
                <div className={styles.headerOfficerName}>Officer</div>
                <div className={styles.headerSession}>
                  <span />
                  SECURE SESSION
                </div>
              </div>
              <b>⌄</b>
            </div>
          </div>
        </header>

        <section className={styles.documentCard}>
          <div className={styles.documentIcon}>PDF</div>

          <div className={styles.documentDetails}>
            <div className={styles.smallHeading}>CASE DOCUMENT</div>
            <div className={styles.fileName}>case_report_2023.pdf</div>
            <div className={styles.fileMeta}>
              PDF Document&nbsp;&nbsp;•&nbsp;&nbsp;4.8 MB
            </div>
          </div>

          <div className={styles.documentDivider} />

          <div className={styles.extractionComplete}>
            <div className={styles.completeIcon}>✓</div>
            <div>
              <strong>EXTRACTION COMPLETE</strong>
              <span>Extracted just now</span>
            </div>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.sourceCard}>
            <div className={styles.cardHeader}>
              <span>SOURCE DOCUMENT</span>

              <div className={styles.documentControls}>
                <button>▧</button>
                <button>⌕</button>
                <button>−</button>
                <button>＋</button>
                <button>Fit</button>
                <button>Page 1 / 4</button>
                <button>↓</button>
              </div>
            </div>

            <div className={styles.documentViewer}>
              <div className={styles.viewerPage}>
                <div className={styles.fakeReportHeader}>
                  <div className={styles.fakeSeal}>◉</div>
                  <div>
                    <strong>NARCOTICS CONTROL BUREAU</strong>
                    <br />
                    <strong>INVESTIGATION REPORT</strong>
                  </div>
                </div>

                <div className={styles.fakeLine} />

                <div className={styles.fakeText}>
                  <strong>Case Reference No.</strong>
                  <span>NCB/CHZ/2023/1987</span>

                  <br /><br />

                  <strong>1. Case Information</strong>
                  <p>Agency : Narcotics Control Bureau (NCB)</p>
                  <p>Zonal Unit : Chandigarh Zonal Unit</p>
                  <p>Investigation Year : 2023</p>
                  <p>Case ID : NCB/CHZ/2023/1987</p>

                  <br />

                  <strong>2. Drug Details</strong>
                  <p>Drug Type : Heroin (Diacetylmorphine)</p>
                  <p>Quantity Seized : 20.326 Kg</p>
                  <p>Quantity Category : Commercial Quantity</p>

                  <br />

                  <strong>3. Investigation Details</strong>
                  <p>Source Type : Secret Information</p>
                  <p>
                    Operation Type : International trafficking syndicate
                  </p>
                  <p>investigation and seizure</p>

                  <br />

                  <strong>4. Persons Arrested</strong>
                  <p>Total Arrested : 20</p>

                  <br />

                  <strong>5. Route Information</strong>
                  <p>Origin State : Gujarat</p>
                  <p>Destination State : Punjab</p>
                  <p>Transport Mode : Road</p>
                  <p>Route Type : Interstate</p>
                  <p>Interstate Travel : Yes</p>
                </div>

                <div className={styles.pageNumber}>Page 1 of 4</div>
              </div>
            </div>
          </section>

          <section className={styles.extractedCard}>
            <div className={styles.extractedHeader}>
              <div>
                <div className={styles.cardTitle}>
                  EXTRACTED CASE INFORMATION
                </div>
                <div className={styles.cardSubtitle}>
                  Information automatically extracted from the uploaded
                  document
                </div>
              </div>

              <div className={styles.fieldsBadge}>
                ✓ 18 Fields Extracted
              </div>
            </div>

            <InformationSection
              title="CASE INFORMATION"
              items={caseInformation}
            />

            <InformationSection
              title="DRUG INFORMATION"
              items={drugInformation}
            />

            <InformationSection
              title="INVESTIGATION INFORMATION"
              items={investigationInformation}
            />

            <InformationSection
              title="ROUTE INFORMATION"
              items={routeInformation}
            />

            <InformationSection
              title="LEGAL INFORMATION"
              items={legalInformation}
            />
          </section>

          <WorkflowCard />
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.verificationCard}>
            <div className={styles.verificationIcon}>i</div>

            <div>
              <strong>OFFICER VERIFICATION REQUIRED</strong>
              <p>
                The information above was extracted from the uploaded
                document. It has not yet been verified.
              </p>
              <p>
                The officer will review, correct, and enrich these fields
                before NARCIS performs AI analysis.
              </p>
            </div>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusTitle}>EXTRACTION STATUS</div>

            <div className={styles.statusRow}>
              <span>Document processed</span>
              <b>Complete</b>
            </div>

            <div className={styles.statusRow}>
              <span>Fields extracted</span>
              <b>18</b>
            </div>

            <div className={styles.statusRow}>
              <span>Fields requiring officer review</span>
              <b>3</b>
            </div>

            <div className={styles.statusRow}>
              <span>Fields not found</span>
              <b>2</b>
            </div>
          </div>
        </div>

        <div className={styles.actionBar}>
          <button className={styles.backButton}>
            ←&nbsp;&nbsp; BACK
          </button>

          <button className={styles.continueButton}>
            CONTINUE TO VERIFICATION&nbsp;&nbsp; →
          </button>
        </div>

        <footer className={styles.footer}>
          <span>♧</span>
          NARCIS - Authorized Investigation Environment
          <i />
          All data is encrypted and access is monitored
          <i />
          Version 1.0.0
        </footer>
      </main>
    </div>
  );
}
