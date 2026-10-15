"use client";

import { useState } from "react";
import styles from "./document-extraction.module.css";

export default function DocumentExtractionPage() {
  const [pageNumber, setPageNumber] = useState(1);

  const workflow = [
    {
      number: "01",
      title: "Upload Document",
      description: "Upload an investigation document to begin the case workflow",
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

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>N</div>
          <div>
            <div className={styles.brandName}>NARCIS</div>
            <div className={styles.brandSub}>
              INTELLIGENCE SYSTEM
            </div>
          </div>
        </div>

        <div className={styles.sidebarDivider} />

        <nav className={styles.navigation}>
          <a href="/dashboard" className={styles.navItem}>
            <span className={styles.navIcon}>▦</span>
            <span>Dashboard</span>
          </a>

          <a href="/new-case" className={`${styles.navItem} ${styles.active}`}>
            <span className={styles.navIcon}>＋</span>
            <span>New Case</span>
          </a>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>□</span>
            <span>Cases</span>
          </a>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>⌘</span>
            <span>Intelligence</span>
          </a>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>▤</span>
            <span>Reports</span>
          </a>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>◷</span>
            <span>Case History</span>
          </a>
        </nav>

        <div className={styles.sidebarDividerSmall} />

        <nav className={styles.systemNavigation}>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>⚙</span>
            <span>Settings</span>
          </a>

          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>?</span>
            <span>Help &amp; Support</span>
          </a>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.officer}>
            <div className={styles.officerAvatar}>♟</div>
            <div>
              <div className={styles.officerName}>OFFICER</div>
              <div className={styles.officerRole}>Authorized User</div>
            </div>
          </div>

          <div className={styles.secureSession}>
            <span className={styles.secureDot} />
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

          <div className={styles.headerActions}>
            <div className={styles.notification}>♧<span>3</span></div>
            <div className={styles.help}>?</div>
            <div className={styles.headerDivider} />
            <div className={styles.headerAvatar}>●</div>
            <div className={styles.headerOfficer}>
              <strong>Officer</strong>
              <small>
                <span /> SECURE SESSION
              </small>
            </div>
            <div className={styles.headerChevron}>⌄</div>
          </div>
        </header>

        <section className={styles.documentHeader}>
          <div>
            <div className={styles.sectionLabel}>CASE DOCUMENT</div>

            <div className={styles.fileRow}>
              <div className={styles.pdfIcon}>PDF</div>

              <div>
                <div className={styles.fileName}>
                  case_report_2023.pdf
                </div>
                <div className={styles.fileMeta}>
                  PDF Document&nbsp;&nbsp;•&nbsp;&nbsp;4.8 MB
                </div>
              </div>
            </div>
          </div>

          <div className={styles.extractionComplete}>
            <div className={styles.completeIcon}>✓</div>
            <div>
              <strong>EXTRACTION COMPLETE</strong>
              <span>Extracted just now</span>
            </div>
          </div>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.sourceCard}>
              <div className={styles.cardHeader}>
                <strong>SOURCE DOCUMENT</strong>

                <div className={styles.viewerControls}>
                  <button type="button">−</button>
                  <button type="button">+</button>
                  <button type="button">Fit</button>
                  <button type="button">
                    Page {pageNumber} / 4
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPageNumber(Math.min(4, pageNumber + 1))
                    }
                  >
                    ↓
                  </button>
                </div>
              </div>

              <div className={styles.documentViewer}>
                <div className={styles.viewerToolbar}>
                  <span>▱</span>
                  <span>⌕</span>
                  <span>−</span>
                  <span>+</span>
                  <span>Fit</span>
                  <span>Page {pageNumber} / 4</span>
                  <span>↓</span>
                </div>

                <div className={styles.paper}>
                  <div className={styles.paperHeader}>
                    NARCOTICS CONTROL BUREAU
                    <br />
                    INVESTIGATION REPORT
                  </div>

                  <div className={styles.paperLine} />

                  <p>
                    Case Reference No. NCB/CHZ/2023/1987
                  </p>

                  <h4>1. Case Information</h4>
                  <p>Agency : Narcotics Control Bureau (NCB)</p>
                  <p>Zonal Unit : Chandigarh Zonal Unit</p>
                  <p>Investigation Year : 2023</p>
                  <p>Case ID : NCB/CHZ/2023/1987</p>

                  <h4>2. Drug Details</h4>
                  <p>Drug Type : Heroin (Diacetylmorphine)</p>
                  <p>Quantity Seized : 20.326 Kg</p>
                  <p>Quantity Category : Commercial Quantity</p>

                  <h4>3. Investigation Details</h4>
                  <p>Source Type : Secret Information</p>
                  <p>
                    Operation Type : International trafficking
                    syndicate investigation and seizure
                  </p>

                  <h4>4. Persons Arrested</h4>
                  <p>Total Arrested : 20</p>

                  <h4>5. Route Information</h4>
                  <p>Origin State : Gujarat</p>
                  <p>Destination State : Punjab</p>
                  <p>Transport Mode : Road</p>
                  <p>Route Type : Interstate</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.middleColumn}>
            <div className={styles.extractedCard}>
              <div className={styles.extractedHeader}>
                <div>
                  <strong>EXTRACTED CASE INFORMATION</strong>
                  <span>
                    Information automatically extracted from the uploaded
                    document
                  </span>
                </div>

                <div className={styles.fieldsBadge}>
                  ✓ 18 Fields Extracted
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>CASE INFORMATION</h3>

                <div className={styles.infoGridFour}>
                  {caseInformation.map(([label, value]) => (
                    <div className={styles.infoBox} key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>● Extracted</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>DRUG INFORMATION</h3>

                <div className={styles.infoGridThree}>
                  {drugInformation.map(([label, value]) => (
                    <div className={styles.infoBox} key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>● Extracted</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>INVESTIGATION INFORMATION</h3>

                <div className={styles.infoGridThree}>
                  {investigationInformation.map(([label, value]) => (
                    <div className={styles.infoBox} key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>● Extracted</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>ROUTE INFORMATION</h3>

                <div className={styles.infoGridFive}>
                  {routeInformation.map(([label, value]) => (
                    <div className={styles.infoBox} key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>● Extracted</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>LEGAL INFORMATION</h3>

                <div className={styles.infoGridTwo}>
                  <div className={styles.infoBox}>
                    <span>APPLICABLE NDPS SECTIONS</span>
                    <strong>8(c), 21, 27A, 29</strong>
                    <small>● Extracted</small>
                  </div>

                  <div className={styles.infoBox}>
                    <span>VEHICLE TYPE</span>
                    <strong>Unknown</strong>
                    <small>● NOT FOUND IN DOCUMENT</small>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.verificationNotice}>
              <div className={styles.infoCircle}>i</div>

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
          </div>

          <aside className={styles.workflowCard}>
            <h2>NARCIS CASE WORKFLOW</h2>

            <div className={styles.workflow}>
              {workflow.map((step, index) => (
                <div className={styles.workflowStep} key={step.number}>
                  <div
                    className={`${styles.stepNumber} ${
                      step.status === "complete"
                        ? styles.completeStep
                        : step.status === "current"
                        ? styles.currentStep
                        : ""
                    }`}
                  >
                    {step.status === "complete" ? "✓" : step.number}
                  </div>

                  <div className={styles.stepText}>
                    <div className={styles.stepTitle}>
                      <strong>{step.title}</strong>

                      {step.status === "complete" && (
                        <span className={styles.completeBadge}>
                          COMPLETE
                        </span>
                      )}

                      {step.status === "current" && (
                        <span className={styles.currentBadge}>
                          CURRENT
                        </span>
                      )}

                      {step.status === "next" && index === 2 && (
                        <span className={styles.nextBadge}>
                          NEXT
                        </span>
                      )}
                    </div>

                    <p>{step.description}</p>
                  </div>

                  {index < workflow.length - 1 && (
                    <div className={styles.workflowLine} />
                  )}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className={styles.extractionStatus}>
          <div>
            <strong>EXTRACTION STATUS</strong>
            <span>Document processed&nbsp; • &nbsp;Complete</span>
          </div>

          <div>
            <strong>FIELDS EXTRACTED</strong>
            <span>18</span>
          </div>

          <div>
            <strong>FIELDS REQUIRING OFFICER REVIEW</strong>
            <span>3</span>
          </div>

          <div>
            <strong>FIELDS NOT FOUND</strong>
            <span>2</span>
          </div>
        </section>

        <section className={styles.bottomActions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            ← &nbsp; BACK
          </button>

          <button
            type="button"
            className={styles.continueButton}
          >
            CONTINUE TO VERIFICATION &nbsp; →
          </button>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>♧</span>
        <strong>NARCIS - Authorized Investigation Environment</strong>
        <i />
        <span>All data is encrypted and access is monitored</span>
        <i />
        <span>Version 1.0.0</span>
      </footer>
    </div>
  );
}
