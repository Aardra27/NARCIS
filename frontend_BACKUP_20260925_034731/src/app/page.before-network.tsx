"use client";

export default function Home() {
  return (
    <main className="narcis-root">

      <div className="narcis-grid" />

      <div className="particles">
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle red" />
        <span className="particle" />
        <span className="particle red" />
        <span className="particle" />
      </div>

      <div className="system-label">
        NARCIS INTELLIGENCE SYSTEM
      </div>

      <section className="intro-center">

        <div className="logo-symbol">
          <img
            src="/narcis-logo.png"
            alt="NARCIS"
            className="narcis-logo-image"
          />
        </div>

        <h1 className="intro-title">
          INTRODUCING <span>NARCIS</span>
        </h1>

        <p className="intro-subtitle">
          Your AI-powered intelligence and investigation
          <br />
          support system
        </p>

        <p className="intro-description">
          Narcotics Analysis, Risk Classification and Intelligent Support System
        </p>

      </section>

      <div className="bottom-glow" />

    </main>
  );
}