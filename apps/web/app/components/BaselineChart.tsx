import type { BaselineMetrics } from "@/lib/run-baselines";

function BarRow({ metric }: { metric: BaselineMetrics }) {
  const isFull = metric.baseline === "AEGIS_FULL";
  const accuracyPct = Math.round(metric.decisionAccuracy * 100);
  return (
    <div className={`baseline-row${isFull ? " baseline-row-full" : ""}`}>
      <div className="baseline-label">
        {metric.label}
        {isFull && <span className="baseline-full-tag">treatment</span>}
      </div>
      <div className="baseline-bar-track">
        <div className="baseline-bar-fill" style={{ width: `${accuracyPct}%` }} />
        <span className="baseline-bar-text">{accuracyPct}% ground-truth accuracy</span>
      </div>
      <div className="baseline-stats">
        <span>useful work {metric.usefulWorkCompleted}/{metric.totalScenarios}</span>
        <span className={metric.overGrantedCount > 0 ? "baseline-stat-risk" : "baseline-stat-ok"}>
          over-granted {metric.overGrantedCount}/{metric.totalScenarios}
        </span>
      </div>
    </div>
  );
}

export function BaselineChart({ results }: { results: BaselineMetrics[] }) {
  return (
    <div className="baseline-chart">
      {results.map((r) => (
        <BarRow key={r.baseline} metric={r} />
      ))}
      <p className="baseline-note">
        Each configuration is a restricted view of the same decision engine and the same four scenarios
        (RSCH-INV-002) — not a separate reimplementation. &ldquo;Over-granted&rdquo; counts decisions
        that authorized more autonomy than the scenario&rsquo;s ground truth permits: the concrete harm a
        weaker governance model would actually cause, not just a lower accuracy score.
      </p>
    </div>
  );
}
