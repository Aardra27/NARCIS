"use client";

import { useEffect, useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 120);

    return () => window.clearTimeout(timer);
  }, []);

  const handleAuthenticate = async () => {
    if (authenticating || authenticated) {
      return;
    }

    setError("");

    const officerInput = document.getElementById(
      "officer-id"
    ) as HTMLInputElement | null;

    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement | null;

    const currentOfficerId = officerInput?.value.trim() || "";
    const currentPassword = passwordInput?.value || "";

    if (!currentOfficerId || !currentPassword) {
      setError("Please enter your Officer ID and password.");
      return;
    }

    setAuthenticating(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            officer_id: currentOfficerId,
            password: currentPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Authentication failed."
        );
      }

      setAuthenticated(true);

      window.setTimeout(() => {
        setTransitioning(true);
      }, 2200);

      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3250);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the NARCIS authentication server."
      );
      setAuthenticating(false);
    }
  };

  return (
    <main className={`${styles.page} ${visible ? styles.visible : ""} ${transitioning ? styles.transitioning : ""}`}>

      <div className={styles.atmosphere} />
      <div className={styles.grid} />
      <div className={styles.gridGlow} />
      <div className={styles.particles} />

      <div className={`${styles.telemetry} ${styles.telemetryLeft}`}>
        <span>NARCIS // SECURE NETWORK</span>
        <span>NODE 07</span>
        <span>ENCRYPTED CHANNEL</span>
          <span>LINK STATUS <b>● ONLINE</b></span>
      </div>

      <div className={`${styles.telemetry} ${styles.telemetryRight}`}>
        <span>SYSTEM STATUS</span>
        <span>CASE DATABASE <b>READY</b></span>
        <span>RISK ENGINE <b>READY</b></span>
        <span>RAG CORE <b>READY</b></span>
      </div>

      <div className={`${styles.corner} ${styles.cornerTL}`} />
      <div className={`${styles.corner} ${styles.cornerTR}`} />
      <div className={`${styles.corner} ${styles.cornerBL}`} />
      <div className={`${styles.corner} ${styles.cornerBR}`} />

      <section className={styles.content}>

        <div className={styles.brand}>

          <div className={styles.logoWrap}>
            <div className={styles.logoGlow} />

            <img
              src="/narcis-logo.png"
              alt="NARCIS"
              className={styles.logo}
            />
          </div>

          <div className={styles.systemName}>
            NARCIS INTELLIGENCE SYSTEM
          </div>

          <div className={styles.systemLine}>
            <span />
            <small>SECURE INVESTIGATION ENVIRONMENT</small>
            <span />
          </div>

        </div>

        <div className={`${styles.panel} ${authenticated ? styles.success : ""}`}>

          <div className={styles.panelTopline} />

          <div className={styles.status}>
            <span className={styles.statusLight} />
            {authenticated ? "ACCESS VERIFIED" : "SECURE ACCESS"}
          </div>

          <h1>
            {authenticated ? "ACCESS VERIFIED" : "OFFICER LOGIN"}
          </h1>

          <p className={styles.intro}>
            {authenticated
              ? "Secure authentication established. Initializing the NARCIS investigation environment."
              : "Authenticate to access the NARCIS investigation intelligence environment."}
          </p>

          {!authenticated && (
            <>
              <div className={styles.field}>
                <label htmlFor="officer-id">
                  OFFICER ID
                </label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputMarker} />

                  <input
                    id="officer-id"
                    type="text"
                    placeholder="Enter officer ID"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password">
                  PASSWORD
                </label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputMarker} />

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}

              <button
                type="button"
                className={`${styles.authenticate} ${
                  authenticating ? styles.authenticating : ""
                }`}
                onClick={handleAuthenticate}
                disabled={authenticating}
              >
                <span>
                  {authenticating
                    ? "AUTHENTICATING..."
                    : "AUTHENTICATE"}
                </span>

                <span className={styles.arrow}>
                  {authenticating ? "•••" : "→"}
                </span>

                <span className={styles.scan} />
              </button>
            </>
          )}

          {authenticated && (
            <div className={styles.confirmation}>
              <div className={styles.confirmationRing}>
                <span>✓</span>
              </div>

              <div>
                <strong>IDENTITY CONFIRMED</strong>
                <small>SECURE SESSION ESTABLISHED</small>
              </div>
            </div>
          )}

          <div className={styles.panelFooter}>
            <span />
            <small>NARCIS SECURE NETWORK</small>
            <span />
          </div>

        </div>

        <div className={styles.footer}>
          <span />
          <small>AUTHORIZED PERSONNEL ONLY</small>
          <span />
        </div>

      </section>
    </main>
  );
}
