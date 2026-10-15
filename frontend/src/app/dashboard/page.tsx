"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

const API_BASE = "http://127.0.0.1:8000";

const navigation = [
  { icon: "▦", label: "Dashboard", active: true },
  { icon: "＋", label: "New Case" },
  { icon: "□", label: "Cases" },
  { icon: "⌘", label: "Intelligence" },
  { icon: "▤", label: "Reports" },
  { icon: "◷", label: "Case History" },
];

const services = [
  { icon: "◈", label: "ML Analysis" },
  { icon: "◌", label: "SHAP Explainability" },
  { icon: "▣", label: "Historical Case Intelligence" },
  { icon: "⌕", label: "Legal & SOP Knowledge" },
  { icon: "▤", label: "Report Generation" },
];

type DashboardStats = {
  total_cases: number;
  active_cases: number;
  verified_cases: number;
  pending_verification: number;
  analyzed_cases: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  reports_generated: number;
  analyzed_case_id: string | null;
};

type RecentCase = {
  case_id: string;
  drug_type: string;
  quantity: string;
  quantity_category: string;
  origin_state: string;
  destination_state: string;
  transport_mode: string;
  route_type: string;
  investigation_year: string;
  verification_status: string;
};

type ActivityItem = {
  year: string;
  count: number;
};

type AnalysisData = {
  probabilities: {
    High?: number;
    Medium?: number;
    Low?: number;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState("Last 30 days");

  const [stats, setStats] = useState<DashboardStats>({
  total_cases: 0,
  active_cases: 0,
  verified_cases: 0,
  pending_verification: 0,
  analyzed_cases: 0,
  high_priority: 0,
  medium_priority: 0,
  low_priority: 0,
  reports_generated: 0,
  analyzed_case_id: null,
});

  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [leaving, setLeaving] = useState(false);

  const [analysis, setAnalysis] = useState<AnalysisData>({
    probabilities: {
      High: 0,
      Medium: 0,
      Low: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setApiError("");

        const [statsResponse, casesResponse, activityResponse] =
          await Promise.all([
            fetch(`${API_BASE}/api/dashboard/stats`),
            fetch(`${API_BASE}/api/dashboard/recent-cases`),
            fetch(`${API_BASE}/api/dashboard/activity`),
            fetch(`${API_BASE}/api/dashboard/analysis`),
          ]);

        if (
          !statsResponse.ok ||
          !casesResponse.ok ||
          !activityResponse.ok
        ) {
          throw new Error("Dashboard API request failed");
        }

        const statsData: DashboardStats =
          await statsResponse.json();

        const casesData: RecentCase[] =
          await casesResponse.json();

        const activityData: ActivityItem[] =
          await activityResponse.json();

        const analysisResponse = await fetch(
          `${API_BASE}/api/dashboard/analysis`
        );

        if (!analysisResponse.ok) {
          throw new Error("Analysis API request failed");
        }

        const analysisData: AnalysisData =
          await analysisResponse.json();

        setStats(statsData);
        setRecentCases(casesData);
        setActivities(activityData);
        setAnalysis(analysisData);
      } catch (error) {
        console.error("NARCIS dashboard error:", error);
        setApiError(
          "Unable to load live investigation data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const analyzedPriorityCases = stats.high_priority + stats.medium_priority + stats.low_priority;
  const highPercent = analyzedPriorityCases > 0 ? Math.round((stats.high_priority / analyzedPriorityCases) * 100) : 0;
  const mediumPercent = analyzedPriorityCases > 0 ? Math.round((stats.medium_priority / analyzedPriorityCases) * 100) : 0;
  const lowPercent = analyzedPriorityCases > 0 ? Math.round((stats.low_priority / analyzedPriorityCases) * 100) : 0;

  const navigateWithTransition = (path: string) => {
    if (leaving) return;

    setLeaving(true);

    window.setTimeout(() => {
      router.push(path);
    }, 420);
  };
  return (
    <main className={`${styles.page} ${leaving ? styles.pageLeaving : ""}`}>
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
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`${styles.navItem} ${
                item.active ? styles.navActive : ""
              }`}
              type="button"
              onClick={() =>
                item.label === "New Case"
                  ? navigateWithTransition("/new-case")
                  : undefined
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
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
            <h1>NARCIS COMMAND CENTER</h1>
            <p>
              Investigation intelligence overview and active case monitoring
            </p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconButton} type="button">
              ♧
              <span className={styles.notificationBadge}>3</span>
            </button>

            <button className={styles.iconButton} type="button">
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

              <span className={styles.chevron}>⌄</span>
            </div>
          </div>
        </header>

        <div className={styles.welcomeBar}>
          <div>
            <h2>WELCOME TO NARCIS</h2>
            <p>AI-powered intelligence and investigation support</p>
          </div>

          <button className={styles.newCaseButton}
              type="button"
              onClick={() => navigateWithTransition("/new-case")}>
            <span>＋</span>
            NEW CASE
          </button>
        </div>

        {apiError && (
          <div
            style={{
              margin: "0 0 14px",
              padding: "10px 14px",
              border: "1px solid rgba(198, 40, 61, .35)",
              background: "rgba(198, 40, 61, .08)",
              color: "#d96a78",
              fontSize: "12px",
            }}
          >
            {apiError}
          </div>
        )}

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              □
            </div>

            <div>
              <span>ACTIVE CASES</span>
              <strong>
                {loading ? "—" : stats.total_cases}
              </strong>
              <small>
                Cases in NARCIS case library
              </small>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.redIcon}`}>
              !
            </div>

            <div>
              <span>HIGH PRIORITY</span>
              <strong className={styles.redNumber}>{stats.high_priority}</strong>
              <small>
                Active ML priority cases
              </small>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              ▤
            </div>

            <div>
              <span>PENDING VERIFICATION</span>
              <strong>
                {loading ? "—" : stats.pending_verification}
              </strong>
              <small>
                Officer verification required
              </small>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              ▧
            </div>

            <div>
              <span>VERIFIED CASES</span>
              <strong>
                {loading ? "—" : stats.verified_cases}
              </strong>
              <small>
                Officer-verified case records
              </small>
            </div>
          </article>
        </section>

        <section className={styles.middleGrid}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>INVESTIGATION PRIORITY OVERVIEW</h3>

              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className={styles.periodSelect}
              >
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
              </select>
            </div>

            <div className={styles.priorityContent}>
              <div
          className={styles.donut}
          style={{
            background: `conic-gradient(
              #ef3038 0% ${highPercent}%,
              #216bc5 ${highPercent}% ${highPercent + mediumPercent}%,
              #aeb9ca ${highPercent + mediumPercent}% 100%
            )`,
          }}
        >
                <div className={styles.donutCenter} />
                {highPercent > 0 && <span className={styles.donutHigh}>{highPercent}%</span>}
                {mediumPercent > 0 && <span className={styles.donutMedium}>{mediumPercent}%</span>}
                {lowPercent > 0 && <span className={styles.donutLow}>{lowPercent}%</span>}
              </div>

              <div className={styles.legend}>
                <div>
                  <span
                    className={`${styles.legendDot} ${styles.highDot}`}
                  />
                  <div>
                    <strong>High Priority</strong>
                    <small>ML analysis</small>
                  </div>
                  <b>{highPercent}%</b>
                </div>

                <div>
                  <span
                    className={`${styles.legendDot} ${styles.mediumDot}`}
                  />
                  <div>
                    <strong>Medium Priority</strong>
                    <small>ML analysis</small>
                  </div>
                  <b>{mediumPercent}%</b>
                </div>

                <div>
                  <span
                    className={`${styles.legendDot} ${styles.lowDot}`}
                  />
                  <div>
                    <strong>Low Priority</strong>
                    <small>ML analysis</small>
                  </div>
                  <b>{lowPercent}%</b>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>INVESTIGATION ACTIVITY</h3>
            </div>

            <div className={styles.activityList}>
              {activities.length === 0 && !loading && (
                <div className={styles.activity}>
                  <div className={styles.activityBody}>
                    <p>No activity data available.</p>
                  </div>
                </div>
              )}

              {activities.map((activity, index) => (
                <div
                  className={styles.activity}
                  key={`${activity.year}-${index}`}
                >
                  <div className={styles.activityRail}>
                    <span />
                  </div>

                  <div className={styles.activityBody}>
                    <div className={styles.activityTop}>
                      <span>{activity.year}</span>
                      <strong>
                        {activity.count} case
                        {activity.count === 1 ? "" : "s"}
                      </strong>
                    </div>

                    <p>
                      Investigation records in case library
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.textLink} type="button">
              View all activities →
            </button>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>NARCIS INTELLIGENCE SERVICES</h3>
            </div>

            <div className={styles.services}>
              {services.map((service) => (
                <div className={styles.service} key={service.label}>
                  <span className={styles.serviceIcon}>
                    {service.icon}
                  </span>

                  <strong>{service.label}</strong>

                  <span className={styles.operational}>
                    <i />
                    Operational
                  </span>
                </div>
              ))}
            </div>

            <button className={styles.textLink} type="button">
              View system status →
            </button>
          </article>
        </section>

        <section className={styles.bottomGrid}>
          <article
            className={`${styles.card} ${styles.casesCard}`}
          >
            <div className={styles.cardHeader}>
              <h3>RECENT INVESTIGATIONS</h3>

              <button
                className={styles.textLink}
                type="button"
              >
                View all cases →
              </button>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>CASE ID</th>
                    <th>DRUG</th>
                    <th>QUANTITY</th>
                    <th>ROUTE</th>
                    <th>STATUS</th>
                    <th>VERIFICATION</th>
                    <th>YEAR</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={8}>
                        Loading live investigation records...
                      </td>
                    </tr>
                  )}

                  {!loading && recentCases.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        No investigation records found.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    recentCases.map((item) => (
                      <tr key={item.case_id}>
                        <td>
                          <strong>{item.case_id}</strong>
                        </td>

                        <td>{item.drug_type}</td>

                        <td>{item.quantity}</td>

                        <td>
                          {item.origin_state} →{" "}
                          {item.destination_state}
                        </td>

                        <td>
                          <span className={styles.statusText}>
                            <i />
                            Case Record
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              item.verification_status ===
                              "Verified"
                                ? styles.highBadge
                                : styles.mediumBadge
                            }
                          >
                            {item.verification_status}
                          </span>
                        </td>

                        <td>{item.investigation_year}</td>

                        <td>
                          <button
                            className={styles.viewButton}
                            type="button"
                          >
                            ◉
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <button
              className={styles.tableFooterLink}
              type="button"
            >
              View all investigations →
            </button>
          </article>

          <article
            className={`${styles.card} ${styles.quickCard}`}
          >
            <div className={styles.cardHeader}>
              <h3>QUICK ACTIONS</h3>
            </div>

            <button
              className={styles.quickAction}
              type="button"
            >
              <span className={styles.quickIcon}>▧</span>

              <div>
                <strong>Upload New Case</strong>
                <small>
                  Upload and analyze new investigation
                </small>
              </div>
            </button>

            <button
              className={styles.quickAction}
              type="button"
            >
              <span className={styles.quickIcon}>□</span>

              <div>
                <strong>View Active Cases</strong>
                <small>
                  Monitor and manage investigations
                </small>
              </div>
            </button>

            <button
              className={styles.quickAction}
              type="button"
            >
              <span className={styles.quickIcon}>⌘</span>

              <div>
                <strong>Historical Intelligence</strong>
                <small>
                  Search similar cases and patterns
                </small>
              </div>
            </button>

            <button
              className={styles.quickAction}
              type="button"
            >
              <span className={styles.quickIcon}>▤</span>

              <div>
                <strong>Generate Report</strong>
                <small>
                  Create decision-support reports
                </small>
              </div>
            </button>
          </article>
        </section>
      </section>

      <footer className={styles.footer}>
        <span>♧</span>
        <strong>
          NARCIS - Authorized Investigation Environment
        </strong>
        <i />
        <span>
          All data is encrypted and access is monitored
        </span>
        <i />
        <span>Version 1.0.0</span>
      </footer>
    </main>
  );
}