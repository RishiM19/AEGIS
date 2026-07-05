/**
 * Learning Plane: Outcome Evaluation, Attribution, Evidence Feedback
 * (SPEC-013).
 *
 * Evaluates what actually happened, determines what is responsible,
 * and writes the immutable evidence items SPEC-003's Competence Engine
 * consumes -- without ever letting a raw outcome masquerade as a
 * competence signal.
 *
 * Enforced invariants:
 *  - LRN-INV-001  outcome is not competence: attribution is mandatory
 *  - LRN-INV-002  the named factors are separated explicitly
 *  - LRN-INV-003  UNKNOWN outcomes produce no evidence item
 *  - LRN-INV-004  evidence is immutable once written
 *  - LRN-INV-006  intervention/recovery outcomes attribute to those
 *                 components, not the originating agent
 *  - LRN-INV-007  attribution is reproducible
 *  - LRN-INV-008  evidence source independence is recorded
 */

import type { Clock, IdSource } from "../kernel/clock.js";
import type { EventLedger } from "../ledger/event-ledger.js";
import type { CompetenceEvidenceInput } from "../assessment/competence.js";

const COMPONENT = "learning-plane";
const VERSIONS = { learningPlane: "1.0.0" };

export type OutcomeClassification = "SUCCESS" | "FAILURE" | "PARTIAL" | "UNKNOWN";

export type AttributionFactor =
  | "AGENT_DECISION_QUALITY"
  | "TOOL_EXECUTION_QUALITY"
  | "ENVIRONMENTAL_FAILURE"
  | "HUMAN_INTERVENTION"
  | "DOWNSTREAM_SYSTEM_FAILURE"
  | "RUNTIME_SENTINEL_INTERVENTION"
  | "RECOVERY_ENGINE_ACTION";

export interface ObservationInput {
  subjectType: "EXECUTION_ATTEMPT" | "RECOVERY_PLAN" | "APPROVAL_DECISION";
  subjectId: string;
  tenantId: string;
  agentId: string;
  agentVersionId: string;
  actionRegion: string;
  /** From the gateway's reconciliation (SPEC-008). */
  executionOutcome: "SUCCEEDED" | "FAILED" | "UNKNOWN";
  /** Environmental/tool context for attribution (SS6). */
  providerFailure: boolean;
  humanModifiedAction: boolean;
  sentinelIntervened: boolean;
  recoveryRan: boolean;
  fromSimulation: boolean;
  /** Independent source tracking (LRN-INV-008). */
  observationSourceId: string;
  observationSourceIndependent: boolean;
}

export interface AttributionRecord {
  attributionRecordId: string;
  subjectId: string;
  outcomeClassification: OutcomeClassification;
  weights: Partial<Record<AttributionFactor, number>>;
  computedAt: string;
}

export class LearningPlane {
  private evidence: CompetenceEvidenceInput[] = [];
  private attributions: AttributionRecord[] = [];

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
    private readonly ledger: EventLedger,
  ) {}

  /**
   * The single entry point: observation -> outcome -> attribution ->
   * (maybe) evidence. Returns null evidence when the outcome is
   * UNKNOWN (LRN-INV-003) or attribution assigns the agent no weight.
   */
  process(observation: ObservationInput): { attribution: AttributionRecord; evidence: CompetenceEvidenceInput | null } {
    const outcome = this.evaluateOutcome(observation);
    this.emit(observation, "OUTCOME_EVALUATED", { outcome });

    const weights = this.attribute(observation, outcome);
    const attribution: AttributionRecord = {
      attributionRecordId: this.ids.next("attr"),
      subjectId: observation.subjectId,
      outcomeClassification: outcome,
      weights,
      computedAt: this.clock.now(),
    };
    this.attributions.push(attribution);
    this.emit(observation, "ATTRIBUTION_COMPLETED", { weights: { ...weights } });

    if (outcome === "UNKNOWN") {
      this.emit(observation, "OUTCOME_UNRESOLVED_ESCALATED", {});
      return { attribution, evidence: null }; // LRN-INV-003
    }

    const agentWeight = weights.AGENT_DECISION_QUALITY ?? 0;
    if (agentWeight <= 0) return { attribution, evidence: null };

    const item: CompetenceEvidenceInput = Object.freeze({
      evidenceItemId: this.ids.next("ce"),
      agentVersionId: observation.agentVersionId,
      actionRegion: observation.actionRegion,
      outcomeScore: outcome === "SUCCESS" ? 1 : outcome === "PARTIAL" ? 0.5 : 0,
      evidenceWeight: agentWeight,
      fromSimulation: observation.fromSimulation,
      // Standing discount for non-independent sources (GAME-INV-003
      // hook; SPEC-016 refines this with pattern detection).
      integrityScore: observation.observationSourceIndependent ? 1 : 0.5,
      recordedAt: this.clock.now(),
    });
    this.evidence.push(item);
    this.emit(observation, "COMPETENCE_EVIDENCE_ITEM_WRITTEN", { evidenceItemId: item.evidenceItemId });
    return { attribution, evidence: item };
  }

  /** All written evidence, for the Competence Engine and SPEC-016. */
  allEvidence(): readonly CompetenceEvidenceInput[] {
    return this.evidence;
  }

  allAttributions(): readonly AttributionRecord[] {
    return this.attributions;
  }

  private evaluateOutcome(observation: ObservationInput): OutcomeClassification {
    switch (observation.executionOutcome) {
      case "SUCCEEDED":
        return "SUCCESS";
      case "FAILED":
        return "FAILURE";
      case "UNKNOWN":
        return "UNKNOWN";
    }
  }

  /**
   * Deterministic attribution rules (SPEC-013 SS6). Weights are
   * apportioned across factors and the agent's share reflects only what
   * the agent's own decision actually determined.
   */
  private attribute(observation: ObservationInput, outcome: OutcomeClassification): Partial<Record<AttributionFactor, number>> {
    const weights: Partial<Record<AttributionFactor, number>> = {};

    if (observation.providerFailure) {
      // Provider outage: near-zero agent weight, not negative (SS6).
      weights.ENVIRONMENTAL_FAILURE = 0.9;
      weights.AGENT_DECISION_QUALITY = 0.1;
      return weights;
    }

    if (observation.sentinelIntervened) {
      // The intervention, not the agent's decision, determined the
      // final state (LRN-INV-006).
      weights.RUNTIME_SENTINEL_INTERVENTION = 0.7;
      weights.AGENT_DECISION_QUALITY = 0.3;
      return weights;
    }

    if (observation.humanModifiedAction) {
      // The executed action differs from the agent's proposal: the
      // outcome does not evidence the agent's own decision (SS6).
      weights.HUMAN_INTERVENTION = 0.8;
      weights.AGENT_DECISION_QUALITY = 0.2;
      return weights;
    }

    if (observation.recoveryRan) {
      // Recovery success is the Recovery Engine's evidence trail, kept
      // separate from the originating agent (RCV-INV-011/LRN-INV-006).
      weights.RECOVERY_ENGINE_ACTION = 0.5;
      weights.AGENT_DECISION_QUALITY = 0.5;
      return weights;
    }

    void outcome; // outcome affects the score, not the weights
    weights.AGENT_DECISION_QUALITY = 1;
    return weights;
  }

  private emit(observation: ObservationInput, eventType: string, payload: Record<string, unknown>): void {
    this.ledger.append({
      eventType,
      owningSpec: "SPEC-013",
      subjectIds: [observation.subjectId, observation.agentId],
      payload,
      tenantId: observation.tenantId,
      versionsInEffect: VERSIONS,
      sourceComponent: COMPONENT,
    });
  }
}
