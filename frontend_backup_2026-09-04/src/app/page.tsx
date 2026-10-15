"use client";

import { useEffect, useState } from "react";

const stages = [
  {
    number: "01",
    title: "DATA INITIATION",
    caption: "The system awakens. Data points appear.",
  },
  {
    number: "02",
    title: "CONNECTIONS FORM",
    caption: "Intelligence networks connect across jurisdictions.",
  },
  {
    number: "03",
    title: "STRUCTURE BUILDS",
    caption: "Patterns emerge. Structure takes shape.",
  },
  {
    number: "04",
    title: "ANALYSIS ACTIVATES",
    caption: "Advanced analysis engine activates.",
  },
  {
    number: "05",
    title: "RISK DETECTION",
    caption: "Risk indicators identified. Threat level calculated.",
  },
  {
    number: "06",
    title: "INTELLIGENCE ASSEMBLED",
    caption: "Intelligence assembled. Insight achieved.",
  },
  {
    number: "07",
    title: "NARCIS REVEALS",
    caption: "",
  },
  {
    number: "08",
    title: "INTRODUCING NARCIS",
    caption: "",
  },
  {
    number: "09",
    title: "TRANSITION TO LOGIN",
    caption: "",
  },
];

function NarcisSymbol({ large = false }: { large?: boolean }) {
  return (
    <svg
      className={`narcis-symbol ${large ? "symbol-large" : ""}`}
      viewBox="0 0 240 240"
      aria-label="NARCIS symbol"
      role="img"
    >
      <g fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 24 L181 60 L181 132 L120 168 L59 132 L59 60 Z" />
        <path d="M120 52 L156 73 L156 116 L120 137 L84 116 L84 73 Z" />
        <path d="M59 60 L28 42 L28 92 L59 110" />
        <path d="M181 60 L212 42 L212 92 L181 110" />
        <path d="M59 132 L30 149 L30 198 L77 171" />
        <path d="M181 132 L210 149 L210 198 L163 171" />
        <path d="M84 73 L54 56" />
        <path d="M156 73 L186 56" />
        <path d="M84 116 L54 133" />
        <path d="M156 116 L186 133" />
      </g>

      <g fill="currentColor">
        <rect x="20" y="35" width="16" height="16" rx="4" />
        <rect x="204" y="35" width="16" height="16" rx="4" />
        <rect x="22" y="190" width="16" height="16" rx="4" />
        <rect x="202" y="190" width="16" height="16" rx="4" />
        <rect x="112" y="16" width="16" height="16" rx="4" />
        <rect x="112" y="160" width="16" height="16" rx="4" />
      </g>

      <polygon
        points="120,78 143,91 143,117 120,130 97,117 97,91"
        fill="#C6283D"
        stroke="#FFFFFF"
        strokeWidth="5"
      />
    </svg>
  );
}

function NetworkBackground({ stage }: { stage: number }) {
  const nodes = [
    [8, 20], [16, 48], [25, 15], [34, 31], [43, 13],
    [53, 27], [62, 10], [72, 34], [82, 17], [94, 29],
    [12, 76], [23, 62], [36, 82], [48, 65], [61, 78],
    [74, 61], [87, 75], [96, 57],
  ];

  return (
    <div className={`network-background stage-${stage}`}>
      <div className="world-grid" />

      <svg className="network-svg" viewBox="0 0 1000 700" preserveAspectRatio="none">
        {nodes.map(([x, y], index) => {
          const next = nodes[(index + 1) % nodes.length];

          return (
            <line
              key={`line-${index}`}
              x1={`${x}%`}
              y1={`${y}%`}
              x2={`${next[0]}%`}
              y2={`${next[1]}%`}
              className={index % 5 === 0 ? "network-line red-line" : "network-line"}
            />
          );
        })}

        {nodes.map(([x, y], index) => (
          <circle
            key={`node-${index}`}
            cx={`${x}%`}
            cy={`${y}%`}
            r={index % 4 === 0 ? 3.5 : 2.2}
            className={index % 7 === 0 ? "network-node red-node" : "network-node"}
          />
        ))}
      </svg>

      <div className="particle-field">
        {Array.from({ length: 55 }).map((_, index) => (
          <span
            key={index}
            className="particle"
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 61) % 100}%`,
              animationDelay: `${(index % 9) * 0.23}s`,
              animationDuration: `${3 + (index % 5) * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="blue-orb orb-one" />
      <div className="blue-orb orb-two" />
      <div className="red-orb" />
    </div>
  );
}

function AnalysisHud({ stage }: { stage: number }) {
  if (stage < 3) return null;

  return (
    <div className={`analysis-hud hud-stage-${stage}`}>
      <div className="hud-ring ring-one" />
      <div className="hud-ring ring-two" />
      <div className="hud-ring ring-three" />

      <div className="hud-corner top-left" />
      <div className="hud-corner top-right" />
      <div className="hud-corner bottom-left" />
      <div className="hud-corner bottom-right" />

      {stage >= 4 && (
        <>
          <div className="hud-data data-left">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="hud-data data-right">
            <span />
            <span />
            <span />
            <span />
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStage((current) => (current < stages.length - 1 ? current + 1 : current));
    }, 2200);

    return () => window.clearInterval(interval);
  }, []);

  const current = stages[stage];

  return (
    <main className="narcis-intro">
      <NetworkBackground stage={stage} />
      <AnalysisHud stage={stage} />

      <div className="intro-vignette" />

      <div className="stage-label">
        <span className="stage-number">{current.number}</span>
        <span>{current.title}</span>
      </div>

      <div className={`intro-content stage-content-${stage}`}>

        {stage <= 2 && (
          <div className="data-visual">
            {stage === 0 && (
              <div className="data-particles-large">
                {Array.from({ length: 35 }).map((_, index) => (
                  <i
                    key={index}
                    style={{
                      left: `${(index * 31) % 90}%`,
                      top: `${(index * 47) % 75}%`,
                      animationDelay: `${index * 0.06}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {stage === 1 && (
              <div className="connection-map">
                <span className="map-node n1" />
                <span className="map-node n2" />
                <span className="map-node n3" />
                <span className="map-node n4" />
                <span className="map-node n5" />
                <span className="map-node n6" />
                <span className="map-node n7" />
                <span className="map-line l1" />
                <span className="map-line l2" />
                <span className="map-line l3" />
                <span className="map-line l4" />
                <span className="map-line l5" />
                <span className="map-line l6" />
              </div>
            )}

            {stage === 2 && (
              <div className="hex-structure">
                <div className="hex hex-a" />
                <div className="hex hex-b" />
                <div className="hex hex-c" />
                <div className="hex hex-d" />
                <div className="hex hex-e" />
                <div className="hex hex-f" />
              </div>
            )}
          </div>
        )}

        {stage === 3 && (
          <div className="symbol-stage blue-analysis">
            <NarcisSymbol large />
          </div>
        )}

        {stage === 4 && (
          <div className="symbol-stage red-analysis">
            <NarcisSymbol large />
            <div className="risk-display">
              <small>RISK LEVEL</small>
              <strong>HIGH</strong>
            </div>
          </div>
        )}

        {stage === 5 && (
          <div className="symbol-stage assembled">
            <NarcisSymbol large />
          </div>
        )}

        {stage === 6 && (
          <div className="brand-reveal">
            <NarcisSymbol large />
            <div className="brand-word">NARCIS</div>
            <div className="brand-subtitle">
              Narcotics Analysis, Risk Classification and
              <br />
              Intelligent Support System
            </div>
          </div>
        )}

        {stage === 7 && (
          <div className="introduction">
            <div className="intro-brand">
              <NarcisSymbol />
              <span>NARCIS</span>
            </div>

            <h1>
              INTRODUCING <em>NARCIS</em>
            </h1>

            <h2>
              Your AI-powered intelligence and
              <br />
              investigation support system
            </h2>

            <p>
              Narcotics Analysis, Risk Classification
              <br />
              and Intelligent Support System
            </p>
          </div>
        )}

        {stage === 8 && (
          <div className="login-transition">
            <div className="transition-brand">
              <NarcisSymbol />
              <span>NARCIS</span>
            </div>

            <div className="transition-card">
              <span>SECURE OFFICER ACCESS</span>
              <div className="transition-input" />
              <div className="transition-input" />
              <div className="transition-button" />
            </div>
          </div>
        )}

      </div>

      {stage < 6 && (
        <div className="stage-caption">
          {current.caption}
        </div>
      )}

      <div className="intro-progress">
        {stages.map((item, index) => (
          <span
            key={item.number}
            className={index <= stage ? "active" : ""}
          />
        ))}
      </div>

      <div className="system-name">
        NARCIS INTELLIGENCE SYSTEM
      </div>

      <div className="system-status">
        <span className="status-dot" />
        AI INTELLIGENCE ENGINE INITIALIZING
      </div>
    </main>
  );
}
