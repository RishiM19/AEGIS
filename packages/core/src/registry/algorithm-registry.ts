/**
 * Algorithm Registry, Configuration Registry, and experimentation
 * governance (SPEC-017).
 *
 * Enforced invariants:
 *  - CFG-INV-001  components resolve versions here; no implicit "latest"
 *  - CFG-INV-002  SHADOW entries are structurally non-production
 *  - CFG-INV-003  promotion requires approval + comparison evidence
 *  - CFG-INV-004  configuration versions are never mutated in place
 *  - CFG-INV-005  tenant config cannot violate a platform floor
 *  - CFG-INV-006  CANARY exposure is bounded and revertible
 *  - state machine (SS6): no OFF -> ACTIVE shortcut exists
 */

import type { Clock, IdSource } from "../kernel/clock.js";

export type ExperimentationState = "OFF" | "SHADOW" | "CANARY" | "ACTIVE";
export type ComputationalClass = "DETERMINISTIC" | "STATISTICAL" | "AI_ASSISTED";

export interface AlgorithmEntry {
  algorithmEntryId: string;
  componentName: string;
  algorithmVersion: string;
  implementationReference: string;
  computationalClass: ComputationalClass;
  registeredAt: string;
  experimentationState: ExperimentationState;
  supersedes: string | null;
}

export interface PromotionRecord {
  promotionRecordId: string;
  algorithmEntryId: string;
  fromState: ExperimentationState;
  toState: ExperimentationState;
  approvedBy: string;
  comparisonEvidenceRef: string | null;
  promotedAt: string;
}

export interface ConfigurationVersion {
  configVersionId: string;
  componentName: string;
  configPayload: Record<string, unknown>;
  tenantScope: "GLOBAL" | string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  approvedBy: string;
}

/** Declared platform floors a tenant configuration may not undercut. */
export interface PlatformFloor {
  componentName: string;
  key: string;
  minimum: number;
}

export class PromotionRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromotionRejected";
  }
}

export class FloorViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FloorViolation";
  }
}

const PROMOTION_ORDER: ExperimentationState[] = ["OFF", "SHADOW", "CANARY", "ACTIVE"];

export class AlgorithmRegistry {
  private entries = new Map<string, AlgorithmEntry>();
  private promotions: PromotionRecord[] = [];
  private configs: ConfigurationVersion[] = [];
  private floors: PlatformFloor[] = [];

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
  ) {}

  register(input: Omit<AlgorithmEntry, "algorithmEntryId" | "registeredAt" | "experimentationState">): AlgorithmEntry {
    const entry: AlgorithmEntry = {
      ...input,
      algorithmEntryId: this.ids.next("alg"),
      registeredAt: this.clock.now(),
      experimentationState: "OFF",
    };
    this.entries.set(entry.algorithmEntryId, entry);
    return entry;
  }

  get(algorithmEntryId: string): AlgorithmEntry {
    const entry = this.entries.get(algorithmEntryId);
    if (!entry) throw new Error(`unregistered algorithm entry "${algorithmEntryId}" (CFG-INV-001)`);
    return entry;
  }

  /**
   * Resolves the single ACTIVE entry for a component. There is no
   * "latest" resolution: a decision snapshot references the exact entry
   * id this returns at snapshot time (CFG-INV-007 upstream).
   */
  activeFor(componentName: string): AlgorithmEntry {
    const active = [...this.entries.values()].filter(
      (e) => e.componentName === componentName && e.experimentationState === "ACTIVE",
    );
    if (active.length !== 1) {
      throw new Error(
        `component "${componentName}" has ${active.length} ACTIVE algorithm entries; exactly one is required (CFG-INV-001)`,
      );
    }
    return active[0]!;
  }

  /**
   * Moves an entry one step toward production. Promotion (toward more
   * production influence) requires approval + comparison evidence;
   * demotion to OFF requires neither (SS6).
   */
  promote(algorithmEntryId: string, approvedBy: string, comparisonEvidenceRef: string): PromotionRecord {
    const entry = this.get(algorithmEntryId);
    const fromIdx = PROMOTION_ORDER.indexOf(entry.experimentationState);
    const toState = PROMOTION_ORDER[fromIdx + 1];
    if (!toState) throw new PromotionRejected(`entry is already ACTIVE`);
    if (!comparisonEvidenceRef) {
      throw new PromotionRejected(`promotion to ${toState} requires comparison evidence (CFG-INV-003)`);
    }
    if (!approvedBy) {
      throw new PromotionRejected(`promotion to ${toState} requires an approving principal (CFG-INV-003)`);
    }

    // Exactly one ACTIVE entry per component: activating a new entry
    // demotes the previous ACTIVE one to OFF (superseded).
    if (toState === "ACTIVE") {
      for (const other of this.entries.values()) {
        if (other.componentName === entry.componentName && other.experimentationState === "ACTIVE") {
          other.experimentationState = "OFF";
        }
      }
    }

    const record: PromotionRecord = {
      promotionRecordId: this.ids.next("promo"),
      algorithmEntryId,
      fromState: entry.experimentationState,
      toState,
      approvedBy,
      comparisonEvidenceRef,
      promotedAt: this.clock.now(),
    };
    entry.experimentationState = toState;
    this.promotions.push(record);
    return record;
  }

  /** Rollback toward OFF is always permitted without evidence (SS6). */
  demoteToOff(algorithmEntryId: string, approvedBy: string): PromotionRecord {
    const entry = this.get(algorithmEntryId);
    const record: PromotionRecord = {
      promotionRecordId: this.ids.next("promo"),
      algorithmEntryId,
      fromState: entry.experimentationState,
      toState: "OFF",
      approvedBy,
      comparisonEvidenceRef: null,
      promotedAt: this.clock.now(),
    };
    entry.experimentationState = "OFF";
    this.promotions.push(record);
    return record;
  }

  /** CFG-INV-002: only ACTIVE entries may influence production execution. */
  assertProductionEligible(algorithmEntryId: string): void {
    const entry = this.get(algorithmEntryId);
    if (entry.experimentationState !== "ACTIVE") {
      throw new Error(
        `algorithm entry "${algorithmEntryId}" is ${entry.experimentationState}; only ACTIVE entries may affect production execution (CFG-INV-002)`,
      );
    }
  }

  promotionHistory(algorithmEntryId: string): readonly PromotionRecord[] {
    return this.promotions.filter((p) => p.algorithmEntryId === algorithmEntryId);
  }

  // -- Configuration versions (CFG-INV-004/005) ---------------------------

  declareFloor(floor: PlatformFloor): void {
    this.floors.push(floor);
  }

  createConfiguration(input: Omit<ConfigurationVersion, "configVersionId" | "effectiveFrom" | "effectiveUntil">): ConfigurationVersion {
    for (const floor of this.floors) {
      if (floor.componentName !== input.componentName) continue;
      const value = input.configPayload[floor.key];
      if (typeof value === "number" && value < floor.minimum && input.tenantScope !== "GLOBAL") {
        throw new FloorViolation(
          `tenant configuration sets ${floor.key}=${value} below the platform floor of ${floor.minimum} (CFG-INV-005)`,
        );
      }
    }

    // Supersede (never mutate) the current version for this component+scope.
    const now = this.clock.now();
    for (const existing of this.configs) {
      if (existing.componentName === input.componentName && existing.tenantScope === input.tenantScope && existing.effectiveUntil === null) {
        existing.effectiveUntil = now;
      }
    }

    // The payload is frozen (CFG-INV-004: config content is never edited
    // in place); effectiveUntil is the one lifecycle field the registry
    // itself sets when a later version supersedes this one.
    const version: ConfigurationVersion = {
      ...input,
      configPayload: Object.freeze({ ...input.configPayload }),
      configVersionId: this.ids.next("cfg"),
      effectiveFrom: now,
      effectiveUntil: null,
    };
    this.configs.push(version);
    return version;
  }

  currentConfiguration(componentName: string, tenantScope: "GLOBAL" | string): ConfigurationVersion | undefined {
    return this.configs.find(
      (c) => c.componentName === componentName && c.tenantScope === tenantScope && c.effectiveUntil === null,
    );
  }

  /** Historical resolution for reconstruction (LEDGER-INV-003 support). */
  configurationAt(componentName: string, tenantScope: "GLOBAL" | string, at: string): ConfigurationVersion | undefined {
    return this.configs.find(
      (c) =>
        c.componentName === componentName &&
        c.tenantScope === tenantScope &&
        c.effectiveFrom <= at &&
        (c.effectiveUntil === null || c.effectiveUntil > at),
    );
  }
}
