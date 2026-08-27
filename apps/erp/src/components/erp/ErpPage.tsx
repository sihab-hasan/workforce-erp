import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Button } from "@workforce-erp/ui/components/button";

export function ErpPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </main>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <div>
          <p className="font-medium">Unable to load this page</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EmptyPanel({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
        <div>
          <p className="font-medium">{title}</p>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pt-0 text-xs text-muted-foreground">{hint}</CardContent>
      ) : null}
    </Card>
  );
}

export function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function StatusPill({ value }: { value?: string | null }) {
  const normalized = (value ?? "unknown").toLowerCase();
  const tone =
    normalized.includes("approved") ||
    normalized === "active" ||
    normalized === "present" ||
    normalized === "read"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : normalized.includes("pending") ||
          normalized.includes("probation") ||
          normalized.includes("invited")
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : normalized.includes("reject") ||
            normalized.includes("inactive") ||
            normalized.includes("suspend") ||
            normalized.includes("terminated")
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tone}`}>
      {(value ?? "unknown").replaceAll("-", " ")}
    </span>
  );
}

export function DataTable({
  columns,
  rows,
  rowKeys,
}: {
  columns: string[];
  rows: ReactNode[][];
  rowKeys?: readonly (string | number)[];
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border/70">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {rows.map((cells, index) => (
            <tr key={rowKeys?.[index] ?? index} className="transition-colors hover:bg-muted/25">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
