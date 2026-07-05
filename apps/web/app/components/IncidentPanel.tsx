"use client";

import { useState } from "react";
import type { IncidentRunResult } from "@/lib/run-incident";

const RISK_LABEL: Record<string, string> = {
  R0_NORMAL: "Normal",
  R1_ELEVATED: "Elevated",
  R2_CONCERNING: "Concerning",
  R3_DANGEROUS: "Dangerous",
  R4_CRITICAL: "Critical",
  R_UNKNOWN: "Unknown",
};

const RISK_RANK: Record<string, number> = {
  R0_NORMAL: 0,
  R1_ELEVATED: 1,
  R2_CONCERNING: 2,
  R3_DANGEROUS: 3,
  R4_CRITICAL: 4,
  R_UNKNOWN: 5,
};

export function IncidentPanel() {
  const [result, setResult] = useState<IncidentRunResult | null>(null);
  const [step, setStep] = useState(-1);
  const [loading, setLoading] = useState(false);

  async function advance() {
    setLoading(true);
    const nextStep = step + 1;
    try {
      const res = await fetch(`/api/incident?step=${nextStep}`);
      const data: IncidentRunResult = await res.json();
      setResult(data);
      setStep(nextStep);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setStep(-1);
  }

  const atEnd = result !== null && step >= result.maxStep;

  return (
    <div className="incident-panel">
      <div className="incident-controls">
        <div>
          <div className="scenario-desc">Runaway refund velocity</div>
          <div className="scenario-id">live Runtime Sentinel evaluation — no scripted UI states, every step is a real evaluation</div>
        </div>
        <div className="incident-buttons">
          {result && (
            <button className="btn-secondary" onClick={reset} disabled={loading}>
              Reset
            </button>
          )}
          <button className="btn-primary" onClick={advance} disabled={loading || atEnd}>
            {result === null ? "Start incident" : atEnd ? "Incident complete" : loading ? "Evaluating…" : "Advance signal feed →"}
          </button>
        </div>
      </div>

      {result && (
        <div className="incident-timeline">
          {result.timeline.map((t) => (
            <div key={t.step} className="incident-step">
              <div className="incident-step-head">
                <span className="incident-step-index">t+{t.step}</span>
                <span className={`pill risk-${RISK_RANK[t.riskState]}`}>
                  <span className="dot" />
                  {RISK_LABEL[t.riskState] ?? t.riskState}
                </span>
                <span className="incident-signal">velocity {t.velocity}/min</span>
                <span className="incident-signal">exposure ₹{(t.exposureMinor / 100).toLocaleString("en-IN")}</span>
              </div>
              {t.findingKinds.length > 0 && (
                <div className="incident-findings">{t.findingKinds.join(", ").toLowerCase().replaceAll("_", " ")}</div>
              )}
              {t.intervention && (
                <div className="incident-event intervention">
                  intervention {t.intervention.interventionClass} issued — {t.intervention.reason}
                  {t.grantRevoked && " · grant revoked"}
                </div>
              )}
              {t.containment && (
                <div className={`incident-event containment-${t.containment.result.toLowerCase()}`}>
                  containment check via {t.containment.source}: <b>{t.containment.result}</b>
                  {t.containment.result !== "EFFECTIVE" && " — STOP was requested but not confirmed stopped; escalating"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
