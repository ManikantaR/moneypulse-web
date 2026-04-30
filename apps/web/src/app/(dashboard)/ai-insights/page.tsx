'use client';

import { Brain, Activity, Shield, Zap, Tag, Server, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useAiMetrics } from '@/lib/queries/use-ai-metrics';
import { cn } from '@/lib/utils';

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: 'primary' | 'green' | 'amber' | 'red';
}) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    green: 'text-emerald-500 bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    red: 'text-rose-500 bg-rose-500/10',
  };
  const cls = colorMap[accent ?? 'primary'];
  return (
    <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cls)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function HealthBadge({ status, totalRuns }: { status: 'ok' | 'degraded' | 'unavailable'; totalRuns: number }) {
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
      </span>
    );
  }
  if (status === 'degraded') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
        <AlertTriangle className="h-3.5 w-3.5" /> Degraded
      </span>
    );
  }
  // totalRuns === 0 means AI simply hasn't been used in the window — neutral, not an error
  if (totalRuns === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        <XCircle className="h-3.5 w-3.5" /> No Activity
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600">
      <XCircle className="h-3.5 w-3.5" /> Unavailable
    </span>
  );
}

export default function AiInsightsPage() {
  const { data: metrics, isLoading } = useAiMetrics();

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aggregate model health and categorization stats — no raw data stored in cloud.
          </p>
        </div>
        {metrics && <HealthBadge status={metrics.healthStatus} totalRuns={metrics.totalRuns} />}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && !metrics && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Brain className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">No AI metrics synced yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Run a Backfill from the Cloud Sync page in the local MoneyPulse app to push AI aggregate stats.
          </p>
        </div>
      )}

      {!isLoading && metrics && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label="Total AI Runs"
              value={metrics.totalRuns.toLocaleString()}
              sub={`Last ${metrics.windowDays} days`}
              icon={Activity}
              accent="primary"
            />
            <MetricCard
              label="Avg Latency"
              value={
                metrics.avgLatencyMs != null
                  ? `${(metrics.avgLatencyMs / 1000).toFixed(1)}s`
                  : '—'
              }
              sub="Per batch"
              icon={Zap}
              accent={
                metrics.avgLatencyMs == null ? 'primary'
                : metrics.avgLatencyMs < 5000 ? 'green'
                : metrics.avgLatencyMs < 10000 ? 'amber'
                : 'red'
              }
            />
            <MetricCard
              label="Avg Confidence"
              value={
                metrics.avgConfidence != null
                  ? `${Math.round(metrics.avgConfidence * 100)}%`
                  : '—'
              }
              sub="Category assignment"
              icon={Brain}
              accent={
                metrics.avgConfidence == null ? 'primary'
                : metrics.avgConfidence >= 0.85 ? 'green'
                : metrics.avgConfidence >= 0.7 ? 'amber'
                : 'red'
              }
            />
            <MetricCard
              label="Categories Assigned"
              value={metrics.categoriesAssignedTotal.toLocaleString()}
              sub={`Last ${metrics.windowDays} days`}
              icon={Tag}
              accent="green"
            />
            <MetricCard
              label="PII Detections"
              value={metrics.piiDetectionCount.toLocaleString()}
              sub={`${(metrics.piiDetectionRate * 100).toFixed(1)}% of runs`}
              icon={Shield}
              accent={metrics.piiDetectionCount === 0 ? 'green' : 'amber'}
            />
            <MetricCard
              label="Model"
              value={metrics.model ?? 'Unknown'}
              sub="Active inference model"
              icon={Server}
              accent="primary"
            />
          </div>

          {metrics.totalRuns === 0 && (
            <p className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              No AI categorization runs found in the last {metrics.windowDays} days. Use AI-assisted
              categorization in the local MoneyPulse app to populate these metrics.
            </p>
          )}

          <p className="mt-4 text-right text-xs text-muted-foreground">
            Stats generated {new Date(metrics.generatedAt).toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
}
