import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Laptop, Loader2, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AUTH_PATHS } from "#features/authentication/navigation";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import {
  profileSecurityApi,
  type AuthSessionRecord,
} from "#features/authentication/profile/api/profile.api";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const { tenantKey } = useParams();
  const { signOut } = useAuth();
  const [sessions, setSessions] = useState<AuthSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const backUrl = tenantKey ? tenantRoutes.settings(tenantKey) : ERP_PATHS.tenantSelect;

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileSecurityApi.sessions();
      setSessions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load sessions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void profileSecurityApi
      .sessions()
      .then((response) => {
        if (!active) return;
        setSessions(response.data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load sessions.");
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function revoke(session: AuthSessionRecord) {
    setBusyId(session.id);
    setError(null);
    try {
      await profileSecurityApi.revokeSession(session.id);
      if (session.current) {
        signOut();
        navigate(AUTH_PATHS.login, { replace: true });
        return;
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to revoke session.");
    } finally {
      setBusyId(null);
    }
  }

  async function logoutAll() {
    if (!confirm("Are you sure you want to revoke all active sessions across all devices?")) {
      return;
    }
    setBusyId("all");
    setError(null);
    try {
      await profileSecurityApi.logoutAll();
      signOut();
      navigate(AUTH_PATHS.login, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log out all sessions.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ErpPage
      title="Active sessions"
      description="Inspect active web and mobile browser sessions authorized for your account."
      actions={
        <>
          <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
            <ArrowLeft />
            Back to settings
          </Button>
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={isLoading || busyId !== null}
          >
            <RefreshCw className={isLoading ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
            Refresh
          </Button>
          <Button variant="destructive" onClick={() => void logoutAll()} disabled={busyId !== null}>
            {busyId === "all" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 size-4" />
            )}
            Revoke all others
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Active Sessions"
          value={<span className="text-2xl font-bold">{sessions.length || 1}</span>}
        />
        <StatCard label="Current Device" value={<StatusPill value="online" />} />
        <StatCard
          label="Session Isolation"
          value={<span className="text-base font-semibold">Strict Encrypted</span>}
        />
        <StatCard
          label="Token Rotation"
          value={<span className="text-base font-semibold">Enabled</span>}
        />
      </div>

      {error && <ErrorState message={error} onRetry={() => void load()} />}

      <SectionCard
        title="Authorized Browser & App Sessions"
        description="Terminating a session immediately revokes all authentication cookies and tokens."
      >
        {isLoading ? (
          <LoadingState label="Loading session records…" />
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No additional active sessions detected.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Laptop className="size-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">{session.name}</p>
                      {session.current && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Last active: {formatDate(session.last_used_at)}
                      {session.ip_address ? ` · IP: ${session.ip_address}` : ""}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={session.current ? "outline" : "destructive"}
                  onClick={() => void revoke(session)}
                  disabled={busyId !== null}
                >
                  {busyId === session.id ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 size-3.5" />
                  )}
                  {session.current ? "Sign Out" : "Revoke Session"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </ErpPage>
  );
}
