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

          <div className="logo-ring" />
          <div className="logo-ring-inner" />

          <svg
            className="narcis-logo"
            viewBox="0 0 220 220"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="NARCIS logo"
          >

            {/* Outer network structure */}

            <g
              fill="none"
              stroke="var(--logo-main)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              {/* Left vertical network */}
              <path d="M48 64 L48 156" />
              <path d="M48 64 L78 46" />
              <path d="M48 156 L78 174" />

              {/* Right vertical network */}
              <path d="M172 64 L172 156" />
              <path d="M172 64 L142 46" />
              <path d="M172 156 L142 174" />

              {/* Upper outer connections */}
              <path d="M78 46 L110 28 L142 46" />

              {/* Lower outer connections */}
              <path d="M78 174 L110 192 L142 174" />

              {/* Left upper/lower connectors */}
              <path d="M48 64 L78 82" />
              <path d="M48 156 L78 138" />

              {/* Right upper/lower connectors */}
              <path d="M172 64 L142 82" />
              <path d="M172 156 L142 138" />

              {/* Main outer hexagonal frame */}
              <path d="M78 46 L110 64 L142 46" />
              <path d="M142 46 L142 82 L172 100" />
              <path d="M172 100 L172 156 L142 138" />
              <path d="M142 174 L110 156 L78 174" />
              <path d="M78 174 L78 138 L48 120" />
              <path d="M48 120 L48 64 L78 82" />

              {/* Inner network */}
              <path d="M78 82 L110 64 L142 82" />
              <path d="M142 82 L142 118 L110 138" />
              <path d="M110 138 L78 118 L78 82" />

              {/* Central hexagon frame */}
              <path d="M92 88 L110 77 L128 88 L128 111 L110 122 L92 111 Z" />

              {/* Inner connecting lines */}
              <path d="M78 82 L92 88" />
              <path d="M142 82 L128 88" />
              <path d="M78 118 L92 111" />
              <path d="M142 118 L128 111" />

            </g>

            {/* Blue structural layer */}

            <g
              fill="none"
              stroke="var(--logo-blue)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <path d="M64 70 L92 54 L110 64" />
              <path d="M156 70 L128 54 L110 64" />

              <path d="M64 150 L92 166 L110 156" />
              <path d="M156 150 L128 166 L110 156" />

              <path d="M92 88 L110 99 L128 88" />
              <path d="M92 111 L110 99 L128 111" />

              <path d="M110 64 L110 77" />
              <path d="M110 122 L110 138" />

            </g>

            {/* Network nodes */}

            <g fill="var(--logo-main)">

              <circle cx="48" cy="64" r="9" />
              <circle cx="48" cy="156" r="9" />

              <circle cx="78" cy="46" r="9" />
              <circle cx="78" cy="174" r="9" />

              <circle cx="110" cy="28" r="9" />
              <circle cx="110" cy="192" r="9" />

              <circle cx="142" cy="46" r="9" />
              <circle cx="142" cy="174" r="9" />

              <circle cx="172" cy="64" r="9" />
              <circle cx="172" cy="156" r="9" />

            </g>

            {/* Red analytical core */}

            <polygon
              points="100,91 120,91 130,100 120,109 100,109 90,100"
              fill="var(--logo-red)"
            />

            {/* Small central highlight */}

            <polygon
              points="104,95 116,95 122,100 116,105 104,105 98,100"
              fill="var(--logo-red-bright)"
              opacity="0.9"
            />

          </svg>

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