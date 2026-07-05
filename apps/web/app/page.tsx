import { runBenchmarkSuite, type ScenarioTrace } from "@/lib/run-benchmark";
import type { CeilingBreakdown } from "@aegis/core";

export const dynamic = "force-dynamic";

function formatMinor(minor: number): string {
  return `₹${(minor / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function levelPill(level: number, name: string) {
  return (
    <span className={`pill level-${level}`}>
      <span className="dot" />
      {name.replace(/^L\d_/, "").replaceAll("_", " ")}
    </span>
  );
}

function boolPill(ok: boolean, trueLabel: string, falseLabel: string) {
  return (
    <span className={`pill ${ok ? "ok" : "bad"}`}>
      <span className="dot" />
      {ok ? trueLabel : falseLabel}
    </span>
  );
}

function CeilingCell({ label, value, limiting }: { label: string; value: number; limiting: boolean }) {
  return (
    <div className={`ceiling-cell${limiting ? " limiting" : ""}`}>
      <div className="k">{label}</div>
      <div className="v">L{value}</div>
    </div>
  );
}

function limitingKeys(ceilings: CeilingBreakdown): Set<string> {
  const min = Math.min(...Object.values(ceilings));
  return new Set(Object.entries(ceilings).filter(([, v]) => v === min).map(([k]) => k));
}

function Scenario({ trace }: { trace: ScenarioTrace }) {
  const limiting = limitingKeys(trace.ceilings);
  return (
    <div className="scenario">
      <div className="scenario-top">
        <div>
          <div className="scenario-desc">{trace.scenario.description}</div>
          <div className="scenario-id">
            {trace.scenario.scenarioId} · {formatMinor(trace.scenario.amountMinor)} · ground truth {trace.scenario.groundTruthVersion}
          </div>
        </div>
        <div className="badges">
          {levelPill(trace.level, trace.levelName)}
          {boolPill(trace.matchesGroundTruth, "matches ground truth", "diverges from ground truth")}
        </div>
      </div>

      <div className="ceilings">
        <CeilingCell label="Authority" value={trace.ceilings.authority} limiting={limiting.has("authority")} />
        <CeilingCell label="Competence" value={trace.ceilings.competence} limiting={limiting.has("competence")} />
        <CeilingCell label="Novelty" value={trace.ceilings.novelty} limiting={limiting.has("novelty")} />
        <CeilingCell label="Epistemic" value={trace.ceilings.epistemic} limiting={limiting.has("epistemic")} />
        <CeilingCell label="Consequence" value={trace.ceilings.consequence} limiting={limiting.has("consequence")} />
        <CeilingCell label="Policy" value={trace.ceilings.policy} limiting={limiting.has("policy")} />
      </div>

      <div className="detail-row">
        <span>Competence: <b>{trace.competenceStatus === "UNKNOWN_NO_EVIDENCE" ? "no evidence" : trace.competenceEstimate.toFixed(2)}</b></span>
        <span>Novelty: <b>{trace.noveltyScore.toFixed(2)}</b></span>
        <span>Uncertainty: <b>{trace.uncertaintyLevel}</b></span>
        <span>Severity: <b>{trace.consequenceSeverity}</b></span>
        <span>Reversibility: <b>{trace.reversibility}</b></span>
      </div>

      <div className="detail-row">
        <span>Grant: <b>{trace.grantId ?? "none issued"}</b></span>
        <span>Execution: <b>{trace.executionOutcome}</b></span>
        <span>Ledger reconstruction: <b>{trace.reconstructionComplete ? "complete" : "gaps detected"}</b></span>
      </div>

      {trace.hardBlockers.length > 0 && (
        <div className="blockers">
          <div className="scenario-id">hard blockers</div>
          <ul>
            {trace.hardBlockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const result = runBenchmarkSuite();
  const m = result.metrics;

  return (
    <main className="shell">
      <div className="header">
        <div className="brand">
          <h1>AEGIS</h1>
          <span className="subtitle">Adaptive Autonomy Infrastructure — live governance trace</span>
        </div>
        <div className="run-meta">
          run {result.runAt}
          <br />
          {result.totalLedgerEvents} ledger events
        </div>
      </div>

      <p className="lede">
        Every scenario below runs through the full governed pipeline — identity, the four assessment engines,
        the autonomy decision, execution gateway, and the learning plane — against one shared, append-only
        Event Ledger, computed fresh on every request. Nothing here is mocked.
      </p>

      <div className="section-title">Suite metrics</div>
      <div className="metrics-bar">
        <div className="metric">
          <div className="value">{m.usefulWorkCompleted}</div>
          <div className="label">Useful work completed</div>
        </div>
        <div className="metric">
          <div className="value">{(m.policyViolationRate * 100).toFixed(0)}%</div>
          <div className="label">Policy violation rate</div>
        </div>
        <div className="metric">
          <div className="value">{(m.runtimeIncidentRate * 100).toFixed(0)}%</div>
          <div className="label">Runtime incident rate</div>
        </div>
        <div className="metric">
          <div className="value">{formatMinor(m.realizedExposureMinor)}</div>
          <div className="label">Realized exposure</div>
        </div>
        <div className="metric">
          <div className="value unavailable">{m.preventedExposureMinor}</div>
          <div className="label">Prevented exposure</div>
        </div>
      </div>

      <div className="section-title">Flagship refund benchmark — scenario traces</div>
      <div className="scenario-list">
        {result.scenarios.map((s) => (
          <Scenario key={s.scenario.scenarioId} trace={s} />
        ))}
      </div>

      <p className="footer-note">
        Autonomy ceiling is the strict minimum across authority, competence, novelty, epistemic, and
        consequence assessments (<code>SPEC-007</code>) — the cell(s) highlighted in red are what actually
        capped this decision. <code>Prevented exposure</code> reports <code>UNAVAILABLE</code> rather than
        zero because the counterfactual-harm model is an explicitly open research question
        (<code>RSCH-INV-006</code>), not a solved one. Full specification set:{" "}
        <a href="https://github.com/RishiM19/AEGIS/tree/main/handbook" style={{ color: "var(--accent)" }}>
          github.com/RishiM19/AEGIS/handbook
        </a>
        .
      </p>
    </main>
  );
}
