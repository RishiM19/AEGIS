/**
 * Event Ledger (SPEC-014).
 *
 * The single append-only sink every AEGIS component writes its declared
 * domain events to, and the source reconstruction queries read from.
 *
 * Enforced invariants:
 *  - LEDGER-INV-001  append-only (no edit/delete API exists at all;
 *                     retention pruning is the only removal path)
 *  - LEDGER-INV-003  every event carries versionsInEffect
 *  - LEDGER-INV-004  reconstruction reports gaps explicitly
 *  - LEDGER-INV-005  SAFETY_CRITICAL retention has a platform floor
 *  - LEDGER-INV-006  tenant-scoped reads
 *  - LEDGER-INV-007  the ledger preserves, never interprets
 */

import type { Clock, IdSource } from "../kernel/clock.js";

export type EventTypeClass = "SAFETY_CRITICAL" | "STANDARD" | "RESEARCH_ONLY";

export interface DomainEvent {
  eventId: string;
  eventType: string;
  owningSpec: string;
  subjectIds: string[];
  payload: Record<string, unknown>;
  occurredAt: string;
  recordedAt: string;
  tenantId: string;
  versionsInEffect: Record<string, string>;
  sourceComponent: string;
}

export interface AppendInput {
  eventType: string;
  owningSpec: string;
  subjectIds: string[];
  payload: Record<string, unknown>;
  tenantId: string;
  versionsInEffect: Record<string, string>;
  sourceComponent: string;
  occurredAt?: string;
}

export interface ReconstructionResult {
  subjectId: string;
  events: DomainEvent[];
  completenessStatus: "COMPLETE" | "PARTIAL_GAPS_DETECTED";
  detectedGaps: string[];
}

/**
 * Ordered causal prerequisites: if the right-hand event type is present
 * for a subject, at least one of the left-hand types must precede it.
 * Used by gap detection (LEDGER-INV-004). Extended by each plane as its
 * events come online.
 */
const CAUSAL_PREREQUISITES: Array<{ requires: string[]; before: string }> = [
  { requires: ["AUTONOMY_DECIDED"], before: "CONTRACT_CREATED" },
  { requires: ["CONTRACT_CREATED"], before: "EXECUTION_STARTED" },
  { requires: ["EXECUTION_STARTED"], before: "SIDE_EFFECT_OBSERVED" },
  { requires: ["INTERVENTION_ISSUED"], before: "CONTAINMENT_VERIFIED" },
  { requires: ["RECOVERY_TRIGGER_RECEIVED"], before: "RECOVERY_VERIFIED" },
  { requires: ["OUTCOME_EVALUATED"], before: "ATTRIBUTION_COMPLETED" },
  { requires: ["ATTRIBUTION_COMPLETED"], before: "COMPETENCE_EVIDENCE_ITEM_WRITTEN" },
];

/** Platform-wide floor: SAFETY_CRITICAL events keep at least this long. */
export const SAFETY_CRITICAL_RETENTION_FLOOR_DAYS = 365;

export interface RetentionPolicy {
  eventTypeClass: EventTypeClass;
  retentionDays: number;
}

export class RetentionFloorViolation extends Error {
  constructor(requested: number) {
    super(
      `SAFETY_CRITICAL retention of ${requested} days is below the platform floor of ${SAFETY_CRITICAL_RETENTION_FLOOR_DAYS} days (LEDGER-INV-005)`,
    );
    this.name = "RetentionFloorViolation";
  }
}

export class EventLedger {
  private events: DomainEvent[] = [];
  private retention = new Map<EventTypeClass, number>([
    ["SAFETY_CRITICAL", SAFETY_CRITICAL_RETENTION_FLOOR_DAYS],
    ["STANDARD", 90],
    ["RESEARCH_ONLY", 30],
  ]);

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
  ) {}

  append(input: AppendInput): DomainEvent {
    if (Object.keys(input.versionsInEffect).length === 0) {
      throw new Error("EventLedger.append: versionsInEffect must not be empty (LEDGER-INV-003)");
    }
    const event: DomainEvent = {
      eventId: this.ids.next("evt"),
      eventType: input.eventType,
      owningSpec: input.owningSpec,
      subjectIds: [...input.subjectIds],
      payload: { ...input.payload },
      occurredAt: input.occurredAt ?? this.clock.now(),
      recordedAt: this.clock.now(),
      tenantId: input.tenantId,
      versionsInEffect: { ...input.versionsInEffect },
      sourceComponent: input.sourceComponent,
    };
    this.events.push(event);
    return Object.freeze(event);
  }

  /** Tenant-scoped read (LEDGER-INV-006). */
  eventsForTenant(tenantId: string): readonly DomainEvent[] {
    return this.events.filter((e) => e.tenantId === tenantId);
  }

  eventsForSubject(tenantId: string, subjectId: string): readonly DomainEvent[] {
    return this.eventsForTenant(tenantId).filter((e) => e.subjectIds.includes(subjectId));
  }

  /**
   * Reconstructs the ordered causal chain for a subject, detecting
   * missing prerequisite links (LEDGER-INV-004). A missing link is
   * reported, never interpolated.
   */
  reconstruct(tenantId: string, subjectId: string): ReconstructionResult {
    const chain = [...this.eventsForSubject(tenantId, subjectId)].sort((a, b) =>
      a.occurredAt.localeCompare(b.occurredAt),
    );
    const present = new Set(chain.map((e) => e.eventType));
    const detectedGaps: string[] = [];

    for (const rule of CAUSAL_PREREQUISITES) {
      if (present.has(rule.before) && !rule.requires.some((r) => present.has(r))) {
        detectedGaps.push(
          `event "${rule.before}" is present but none of its prerequisites [${rule.requires.join(", ")}] were recorded`,
        );
      }
    }

    return {
      subjectId,
      events: chain,
      completenessStatus: detectedGaps.length === 0 ? "COMPLETE" : "PARTIAL_GAPS_DETECTED",
      detectedGaps,
    };
  }

  setRetention(policy: RetentionPolicy): void {
    if (policy.eventTypeClass === "SAFETY_CRITICAL" && policy.retentionDays < SAFETY_CRITICAL_RETENTION_FLOOR_DAYS) {
      throw new RetentionFloorViolation(policy.retentionDays);
    }
    this.retention.set(policy.eventTypeClass, policy.retentionDays);
  }

  retentionDays(cls: EventTypeClass): number {
    return this.retention.get(cls) ?? SAFETY_CRITICAL_RETENTION_FLOOR_DAYS;
  }

  get size(): number {
    return this.events.length;
  }
}
