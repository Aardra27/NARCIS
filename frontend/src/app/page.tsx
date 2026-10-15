"use client";



import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [cinematicStage, setCinematicStage] = useState(0);


  const voiceUnlocked = useRef(false);
  const voiceStarted = useRef(false);
  const femaleVoice = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      const googleUKFemale = voices.find(
        (voice) => voice.name === "Google UK English Female"
      );

      if (googleUKFemale) {
        femaleVoice.current = googleUKFemale;
      }
    };

    loadVoice();

    window.speechSynthesis.addEventListener("voiceschanged", loadVoice);

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoice
      );
    };
  }, []);

  const speakIntro = () => {
    if (voiceStarted.current) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const voices = window.speechSynthesis.getVoices();

    const voice =
      femaleVoice.current ||
      voices.find(
        (item) => item.name === "Google UK English Female"
      );

    if (!voice) {
      return;
    }

    voiceStarted.current = true;
    femaleVoice.current = voice;

    window.speechSynthesis.cancel();

    const a = new SpeechSynthesisUtterance(
      "Introducing Narcis."
    );

    a.voice = voice;
    a.rate = 0.8;
    a.pitch = 0.9;
    a.volume = 1;

    const b = new SpeechSynthesisUtterance(
      "Your AI-powered intelligence and investigation support system."
    );

    b.voice = voice;
    b.rate = 0.8;
    b.pitch = 0.9;
    b.volume = 1;

    const c = new SpeechSynthesisUtterance(
      "Narcotics Analysis, Risk Classification and Intelligent Support System."
    );

    c.voice = voice;
    c.rate = 0.78;
    c.pitch = 0.88;
    c.volume = 1;

    window.speechSynthesis.speak(a);
    window.speechSynthesis.speak(b);

    c.onend = () => {
      const root = document.querySelector(".narcis-root");

      if (root) {
        root.classList.add("liquid-transitioning");
      }

      const transition = document.createElement("div");
      transition.className = "narcis-liquid-transition active";

      const wave = document.createElement("div");
      wave.className = "narcis-liquid-wave";

      const refraction = document.createElement("div");
      refraction.className = "liquid-refraction";

      transition.appendChild(wave);
      transition.appendChild(refraction);
      document.body.appendChild(transition);

      window.setTimeout(() => {
        window.location.href = "/login";
      }, 1950);
    };

    window.speechSynthesis.speak(c);
  };

  useEffect(() => {
    if (cinematicStage !== 6) {
      return;
    }

    if (!voiceUnlocked.current) {
      return;
    }

    speakIntro();
  }, [cinematicStage]);

  const handleUserInteraction = () => {
    if (voiceUnlocked.current) {
      return;
    }

    voiceUnlocked.current = true;

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      const unlockUtterance = new SpeechSynthesisUtterance("");
      unlockUtterance.volume = 0;

      window.speechSynthesis.speak(unlockUtterance);
    }

    if (cinematicStage === 6) {
      speakIntro();
    }
  };
  useEffect(() => {
    const stages = [
      { time: 0, stage: 0 },
      { time: 1200, stage: 1 },
      { time: 2600, stage: 2 },
      { time: 4000, stage: 3 },
      { time: 5400, stage: 4 },
      { time: 6800, stage: 5 },
      { time: 8200, stage: 6 },
      { time: 9600, stage: 7 }
    ];

    const timers = stages.map(({ time, stage }) =>
      window.setTimeout(() => {
        setCinematicStage(stage);
      }, time)
    );
return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);
return (
    <main
      className={`narcis-root cinematic-stage-${cinematicStage}`}
      onPointerDown={handleUserInteraction}
    >

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
        {/* Animated intelligence data layer */}
        <div className="intelligence-data">
          <span className="data-node" />
          <span className="data-node" />
          <span className="data-node" />
          <span className="data-node" />

          <span className="data-bar" />
          <span className="data-bar" />
          <span className="data-bar" />
          <span className="data-bar" />

          <span className="risk-node" />
          <span className="risk-node" />
        </div>


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