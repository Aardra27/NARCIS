"use client";

import { useEffect, useState } from "react";

const stages = [
  {
    number: "01",
    title: "DATA INITIATION",
    text: "The system awakens. Data points appear.",
  },
  {
    number: "02",
    title: "INTELLIGENCE CONNECTION",
    text: "Investigation data begins to connect.",
  },
  {
    number: "03",
    title: "STRUCTURE BUILDS",
    text: "Patterns emerge. Structure takes shape.",
  },
  {
    number: "04",
    title: "ANALYSIS ACTIVATES",
    text: "Advanced analysis engine activates.",
  },
  {
    number: "05",
    title: "RISK DETECTION",
    text: "Risk indicators are identified.",
  },
  {
    number: "06",
    title: "INTELLIGENCE ASSEMBLED",
    text: "Intelligence assembled. Insight achieved.",
  },
];

function NetworkSymbol() {
  return (
    <div className="narcis-symbol" aria-label="NARCIS symbol">
      <div className="symbol-ring ring-one" />
      <div className="symbol-ring ring-two" />

      <div className="symbol-node node-top" />
      <div className="symbol-node node-left" />
      <div className="symbol-node node-right" />
      <div className="symbol-node node-bottom" />

      <div className="symbol-line line-one" />
      <div className="symbol-line line-two" />
      <div className="symbol-line line-three" />
      <div className="symbol-line line-four" />

      <div className="symbol-hex">
        <span />
      </div>
    </div>
  );
}

function DataParticles() {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: 34 }).map((_, index) => (
        <span
          key={index}
          className={`particle particle-${index + 1}`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((current) => {
        if (current >= stages.length - 1) {
          window.clearInterval(timer);
          window.setTimeout(() => setComplete(true), 1200);
          return current;
        }

        return current + 1;
      });
    }, 1250);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className={`intro-screen ${complete ? "intro-complete" : ""}`}>
      <DataParticles />

      <div className="grid-background" />
      <div className="network-background" />

      <div className="blue-scan scan-one" />
      <div className="blue-scan scan-two" />
      <div className="red-scan" />

      <header className="intro-header">
        <div className="header-status">
          <span className="status-dot" />
          NARCIS INTELLIGENCE SYSTEM
        </div>

        <div className="header-code">
          AUTHORIZED ENVIRONMENT
        </div>
      </header>

      <section className="intro-content">
        <div className="stage-label">
          <span>{stages[stage].number}</span>
          <i />
          <strong>{stages[stage].title}</strong>
        </div>

        <div className="symbol-wrapper">
          <div className="outer-orbit orbit-a" />
          <div className="outer-orbit orbit-b" />
          <div className="orbit-dot orbit-dot-one" />
          <div className="orbit-dot orbit-dot-two" />
          <NetworkSymbol />
        </div>

        <div className="brand-block">
          <div className="brand-name">
            NARCIS
          </div>

          <div className="brand-divider">
            <span />
          </div>

          <div className="brand-subtitle">
            Narcotics Analysis, Risk Classification and
            <br />
            Intelligent Support System
          </div>

          <div className="analysis-message">
            {stages[stage].text}
          </div>
        </div>
      </section>

      <section className="analysis-flow">
        <div className="flow-item active">
          <span>DATA</span>
        </div>

        <div className="flow-line">
          <span />
        </div>

        <div className="flow-item">
          <span>CONNECTION</span>
        </div>

        <div className="flow-line">
          <span />
        </div>

        <div className="flow-item">
          <span>ANALYSIS</span>
        </div>

        <div className="flow-line">
          <span />
        </div>

        <div className="flow-item">
          <span>RISK</span>
        </div>

        <div className="flow-line">
          <span />
        </div>

        <div className="flow-item">
          <span>INTELLIGENCE</span>
        </div>
      </section>

      <footer className="intro-footer">
        <div>
          <span className="footer-mark">N</span>
          NARCIS
        </div>

        <span>AI-POWERED INVESTIGATION SUPPORT</span>

        <div className="footer-security">
          <span className="status-dot" />
          SECURE
        </div>
      </footer>

      <div className="reveal-screen">
        <div className="reveal-symbol">
          <NetworkSymbol />
        </div>

        <div className="reveal-title">
          INTRODUCING <span>NARCIS</span>
        </div>

        <div className="reveal-description">
          Your AI-powered intelligence and investigation
          <br />
          support system
        </div>

        <div className="reveal-full-name">
          Narcotics Analysis, Risk Classification and Intelligent Support System
        </div>
      </div>
    </main>
  );
}
