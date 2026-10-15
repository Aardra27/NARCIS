"use client";

function NarcisLogo() {
  return (
    <svg
      className="narcis-logo-svg"
      viewBox="0 0 260 220"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NARCIS"
      role="img"
    >
      <defs>
        <filter id="whiteGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="redGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* LEFT OUTER NETWORK */}

      <path
        d="M48 35 L27 48 L27 82 L43 92 L43 128 L27 138 L27 172 L48 185"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#whiteGlow)"
      />

      <path
        d="M48 35 L70 48 L70 82 L52 92 L52 128 L70 138 L70 172 L48 185"
        fill="none"
        stroke="#145DA0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* RIGHT OUTER NETWORK */}

      <path
        d="M212 35 L233 48 L233 82 L217 92 L217 128 L233 138 L233 172 L212 185"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#whiteGlow)"
      />

      <path
        d="M212 35 L190 48 L190 82 L208 92 L208 128 L190 138 L190 172 L212 185"
        fill="none"
        stroke="#145DA0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* TOP CONNECTIONS */}

      <path
        d="M48 35 L91 12 L130 35 L169 12 L212 35"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#whiteGlow)"
      />

      <path
        d="M70 48 L91 35 L130 58 L169 35 L190 48"
        fill="none"
        stroke="#145DA0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* BOTTOM CONNECTIONS */}

      <path
        d="M48 185 L91 208 L130 185 L169 208 L212 185"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#whiteGlow)"
      />

      <path
        d="M70 172 L91 185 L130 162 L169 185 L190 172"
        fill="none"
        stroke="#145DA0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* MAIN HEXAGONAL NETWORK */}

      <path
        d="M91 35 L130 12 L169 35 L169 80 L130 103 L91 80 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#whiteGlow)"
      />

      <path
        d="M91 117 L130 94 L169 117 L169 162 L130 185 L91 162 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#whiteGlow)"
      />

      {/* INTERNAL BLUE GEOMETRY */}

      <path
        d="M70 82 L91 69 L130 92 L169 69 L190 82"
        fill="none"
        stroke="#145DA0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M70 138 L91 151 L130 128 L169 151 L190 138"
        fill="none"
        stroke="#145DA0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* CENTRAL WHITE HEXAGON */}

      <polygon
        points="130,58 157,73 157,105 130,120 103,105 103,73"
        fill="#FFFFFF"
        filter="url(#whiteGlow)"
      />

      {/* CENTRAL BLUE HEXAGON */}

      <polygon
        points="130,68 148,78 148,100 130,110 112,100 112,78"
        fill="#145DA0"
      />

      {/* CENTRAL RED CORE */}

      <polygon
        points="130,76 143,83 143,99 130,106 117,99 117,83"
        fill="#C6283D"
        filter="url(#redGlow)"
      />

      {/* OUTER NODES */}

      <g fill="#FFFFFF" filter="url(#whiteGlow)">
        <circle cx="48" cy="35" r="7" />
        <circle cx="91" cy="12" r="7" />
        <circle cx="169" cy="12" r="7" />
        <circle cx="212" cy="35" r="7" />

        <circle cx="27" cy="82" r="6" />
        <circle cx="233" cy="82" r="6" />

        <circle cx="27" cy="138" r="6" />
        <circle cx="233" cy="138" r="6" />

        <circle cx="48" cy="185" r="7" />
        <circle cx="91" cy="208" r="7" />
        <circle cx="169" cy="208" r="7" />
        <circle cx="212" cy="185" r="7" />
      </g>

      {/* BLUE INTERMEDIATE NODES */}

      <g fill="#1688E8">
        <circle cx="70" cy="48" r="4.5" />
        <circle cx="190" cy="48" r="4.5" />
        <circle cx="70" cy="172" r="4.5" />
        <circle cx="190" cy="172" r="4.5" />
      </g>
    </svg>
  );
}

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
          <NarcisLogo />
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