/**
 * Time and identifier providers.
 *
 * Every engine takes these via injection instead of calling Date.now()
 * or crypto directly, so that decisions are reproducible under test
 * (SPEC-000 INV-003: Same Decision State, Same Decision).
 */

import { randomUUID } from "node:crypto";

export interface Clock {
  now(): string; // ISO-8601 UTC
}

export const systemClock: Clock = {
  now: () => new Date().toISOString(),
};

/** Fixed/steppable clock for deterministic tests. */
export class ManualClock implements Clock {
  constructor(private current: string = "2026-07-05T00:00:00.000Z") {}
  now(): string {
    return this.current;
  }
  set(iso: string): void {
    this.current = iso;
  }
  advanceMs(ms: number): void {
    this.current = new Date(new Date(this.current).getTime() + ms).toISOString();
  }
}

export interface IdSource {
  next(prefix: string): string;
}

export const randomIds: IdSource = {
  next: (prefix) => `${prefix}_${randomUUID()}`,
};

/** Sequential ids for deterministic tests. */
export class SequentialIds implements IdSource {
  private counters = new Map<string, number>();
  next(prefix: string): string {
    const n = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, n);
    return `${prefix}_${String(n).padStart(4, "0")}`;
  }
}
