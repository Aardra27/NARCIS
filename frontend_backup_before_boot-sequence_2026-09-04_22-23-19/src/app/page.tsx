"use client";

export default function Home() {
  return (
    <main className="narcis-root">

      {/* Background intelligence network */}
      <div className="network-field">

        <span className="network-line line-1" />
        <span className="network-line line-2" />
        <span className="network-line line-3" />
        <span className="network-line line-4" />
        <span className="network-line line-5" />
        <span className="network-line line-6" />

        <span className="network-node node-1" />
        <span className="network-node node-2" />
        <span className="network-node node-3" />
        <span className="network-node node-4" />
        <span className="network-node node-5" />
        <span className="network-node node-6" />
        <span className="network-node node-7" />
        <span className="network-node node-8" />

      </div>

      {/* Hexagonal intelligence field */}
      <div className="hex-field">
        <span className="hex hex-1" />
        <span className="hex hex-2" />
        <span className="hex hex-3" />
        <span className="hex hex-4" />
        <span className="hex hex-5" />
        <span className="hex hex-6" />
        <span className="hex hex-7" />
        <span className="hex hex-8" />
        <span className="hex hex-9" />
        <span className="hex hex-10" />
      </div>

      {/* Existing perspective grid */}
      <div className="narcis-grid" />

      {/* Ambient particles */}
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
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle red" />
      </div>

      {/* Top system identifier */}
      <div className="system-label">
        NARCIS INTELLIGENCE SYSTEM
      </div>

      {/* Central intelligence interface */}
      <section className="intro-center">

        {/* Scanning rings behind logo */}
        <div className="logo-interface">

          <div className="scan-ring scan-ring-outer" />
          <div className="scan-ring scan-ring-middle" />
          <div className="scan-ring scan-ring-inner" />

          <div className="scan-beam" />

          <div className="logo-symbol">
            <div className="logo-white-aura" />

            <img
              src="/narcis-logo.png"
              alt="NARCIS"
              className="narcis-logo-image"
            />
          </div>

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

      {/* Bottom intelligence signal */}
      <div className="bottom-interface">

        <span className="signal-dot signal-dot-left" />
        <span className="signal-dot signal-dot-center" />
        <span className="signal-dot signal-dot-right" />

        <div className="bottom-glow" />

      </div>

    </main>
  );
}