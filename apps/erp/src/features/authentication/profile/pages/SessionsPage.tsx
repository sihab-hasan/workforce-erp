import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AUTH_PATHS } from "#features/authentication/navigation";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import {
  profileSecurityApi,
  type AuthSessionRecord,
} from "#features/authentication/profile/api/profile.api";

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sessions, setSessions] = useState<AuthSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <main className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            These are active browser sessions for your account.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={isLoading || busyId !== null}
          >
            <RefreshCw className={isLoading ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button variant="destructive" onClick={() => void logoutAll()} disabled={busyId !== null}>
            {busyId === "all" ? <Loader2 className="animate-spin" /> : <LogOut />}
            Log out all
          </Button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void load()}
            disabled={isLoading || busyId !== null}
          >
            <RefreshCw className={isLoading ? "animate-spin" : ""} /> Retry
          </Button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" /> Loading sessions…
          </div>
        ) : error ? (
          <p className="p-5 text-sm text-muted-foreground">Session data could not be loaded.</p>
        ) : sessions.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No active sessions found.</p>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {session.name}{" "}
                    {session.current ? (
                      <span className="text-xs text-primary">(current)</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active {formatDate(session.last_used_at)}
                    {session.ip_address ? ` · ${session.ip_address}` : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void revoke(session)}
                  disabled={busyId !== null}
                >
                  {busyId === session.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  {session.current ? "Sign out" : "Revoke"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
