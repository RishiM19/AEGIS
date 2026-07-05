/**
 * Postgres-backed persistence for the Event Ledger and Agent Registry
 * (SPEC-014, SPEC-002), via Supabase.
 *
 * Design note: the in-memory EventLedger and AgentRegistry remain the
 * synchronous system of record *within one decision pipeline
 * execution* -- every engine in this package (decision engine,
 * gateway, sentinel, recovery, approval, learning) was built against
 * their synchronous append()/register() APIs, and rewriting every
 * engine's method signatures to async purely to accommodate network
 * I/O would be a large, risky change with no benefit to the actual
 * governance logic, which must stay reproducible and fast (SPEC-000
 * INV-003).
 *
 * This module is instead a durable *mirror*: after a run completes,
 * its accumulated events and agent records are persisted to Postgres
 * so they survive process restarts and serverless cold starts (the
 * concrete gap this closes: "dashboard benchmark runs persist across a
 * Vercel redeploy"). Reads (history, run counts) go through Supabase
 * directly. If SUPABASE_URL / SUPABASE_KEY are not configured, every
 * function here is a safe no-op -- local development and the unit test
 * suite never require a database.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DomainEvent } from "../ledger/event-ledger.js";
import type { Agent, AgentVersion, AgentRuntimeInstance } from "@aegis/contracts";

let cachedClient: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  cachedClient = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cachedClient;
}

export function isPersistenceConfigured(): boolean {
  return getSupabaseClient() !== null;
}

/**
 * Mirrors a batch of ledger events into `domain_events`, namespaced
 * under `runId`. The in-memory ledger resets its id counter every
 * invocation (a fresh serverless request starts SequentialIds at 1
 * again), so `runId` -- not the event's own id -- is what keeps
 * separate runs from colliding/overwriting each other in storage.
 * Never throws.
 */
export async function persistEvents(events: readonly DomainEvent[], runId: string): Promise<{ persisted: number; error: string | null }> {
  const client = getSupabaseClient();
  if (!client || events.length === 0) return { persisted: 0, error: null };

  const rows = events.map((e) => ({
    event_id: `${runId}:${e.eventId}`,
    run_id: runId,
    event_type: e.eventType,
    owning_spec: e.owningSpec,
    subject_ids: e.subjectIds,
    payload: e.payload,
    occurred_at: e.occurredAt,
    recorded_at: e.recordedAt,
    tenant_id: e.tenantId,
    versions_in_effect: e.versionsInEffect,
    source_component: e.sourceComponent,
  }));

  const { error } = await client.from("domain_events").upsert(rows, { onConflict: "event_id" });
  return { persisted: error ? 0 : rows.length, error: error?.message ?? null };
}

export interface PersistedRunSummary {
  runId: string;
  tenantId: string;
  eventCount: number;
  firstEventAt: string;
  lastEventAt: string;
}

/**
 * Reads recent runs back out of the ledger mirror, grouped by the
 * `run_id` every persisted event carries. Used to prove persistence
 * survives a redeploy -- if this returns runs from before the current
 * process started, storage genuinely outlived the process.
 */
export async function recentRuns(limit = 10): Promise<PersistedRunSummary[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("domain_events")
    .select("tenant_id, run_id, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(1000);
  if (error || !data) return [];

  const byRun = new Map<string, PersistedRunSummary>();
  for (const row of data) {
    const runId = row.run_id ?? "unlabeled";
    const existing = byRun.get(runId);
    if (!existing) {
      byRun.set(runId, { runId, tenantId: row.tenant_id, eventCount: 1, firstEventAt: row.occurred_at, lastEventAt: row.occurred_at });
    } else {
      existing.eventCount += 1;
      if (row.occurred_at < existing.firstEventAt) existing.firstEventAt = row.occurred_at;
      if (row.occurred_at > existing.lastEventAt) existing.lastEventAt = row.occurred_at;
    }
  }

  return [...byRun.values()].sort((a, b) => b.lastEventAt.localeCompare(a.lastEventAt)).slice(0, limit);
}

export async function totalPersistedEventCount(): Promise<number | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { count, error } = await client.from("domain_events").select("*", { count: "exact", head: true });
  return error ? null : count;
}

/** Mirrors agent + version + runtime instance records (SPEC-002). */
export async function persistAgent(agent: Agent, version: AgentVersion, instance: AgentRuntimeInstance | null): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  await client.from("agents").upsert(
    {
      agent_id: agent.agentId,
      display_name: agent.displayName,
      owner_principal_id: agent.ownerPrincipalId,
      organization_id: agent.organizationId,
      tenant_id: agent.tenantId,
      declared_capabilities: agent.declaredCapabilities,
      current_version_id: agent.currentVersionId,
      lifecycle_state: agent.lifecycleState,
      registered_at: agent.registeredAt,
      retired_at: agent.retiredAt,
    },
    { onConflict: "agent_id" },
  );

  await client.from("agent_versions").upsert(
    {
      agent_version_id: version.agentVersionId,
      agent_id: version.agentId,
      model_identifier: version.modelIdentifier,
      model_version: version.modelVersion,
      system_prompt_hash: version.systemPromptHash,
      tool_configuration_hash: version.toolConfigurationHash,
      runtime_configuration_hash: version.runtimeConfigurationHash,
      created_at: version.createdAt,
      superseded_at: version.supersededAt,
      competence_transfer_policy: version.competenceTransferPolicy,
    },
    { onConflict: "agent_version_id" },
  );

  if (instance) {
    await client.from("agent_runtime_instances").upsert(
      {
        runtime_instance_id: instance.runtimeInstanceId,
        agent_version_id: instance.agentVersionId,
        started_at: instance.startedAt,
        ended_at: instance.endedAt,
        host_environment_descriptor: instance.hostEnvironmentDescriptor,
        credential_hash: "redacted",
      },
      { onConflict: "runtime_instance_id" },
    );
  }
}

export async function totalPersistedAgentCount(): Promise<number | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { count, error } = await client.from("agents").select("*", { count: "exact", head: true });
  return error ? null : count;
}
