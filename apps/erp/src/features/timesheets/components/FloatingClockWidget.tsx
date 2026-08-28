import { useState, useEffect, useCallback } from "react";
import { Timer, ChevronRight, Coffee } from "lucide-react";
import { useAuth } from "@workforce-erp/auth";
import { useTodayTimesheet } from "../hooks/use-timesheets";
import { TimesheetOverlay } from "./TimesheetOverlay";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcElapsed(clockInIso: string | null | undefined, now: Date): string {
  if (!clockInIso) return "00:00:00";
  try {
    const diff = Math.max(0, now.getTime() - new Date(clockInIso).getTime());
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${p(h)}:${p(m)}:${p(s)}`;
  } catch {
    return "00:00:00";
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FloatingClockWidget() {
  const { session } = useAuth();
  const employeeId = session?.user?.id;

  const {
    data: todayData,
    isPending: isTodayPending,
    refetch: refetchToday,
  } = useTodayTimesheet(undefined);

  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Live second tick
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleClose = useCallback(() => setOverlayOpen(false), []);
  const handleToggleBreak = useCallback(() => setIsOnBreak((prev) => !prev), []);

  const todayStatus = todayData?.data;
  const isClockedIn = Boolean(todayStatus?.is_clocked_in);
  const activeTimesheet = todayStatus?.active_timesheet;
  const elapsed = calcElapsed(activeTimesheet?.clock_in, currentTime);

  // Auto-hide when loading or not clocked in
  if (isTodayPending || !isClockedIn) return null;

  return (
    <>
      {/* Floating pill / badge */}
      <div
        role="complementary"
        aria-label="Active work session"
        className="fixed right-5 bottom-24 z-40 md:bottom-6"
      >
        {/* Subtle ambient glow behind badge */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 scale-125 rounded-2xl blur-xl transition-colors duration-500 ${
            isOnBreak ? "bg-amber-500/20" : "bg-emerald-500/20"
          }`}
        />

        <button
          type="button"
          id="floating-clock-widget-btn"
          aria-label="Open active session panel"
          aria-haspopup="dialog"
          aria-expanded={overlayOpen}
          onClick={() => setOverlayOpen(true)}
          className={[
            "group flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-xl",
            "border transition-all duration-200",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            "active:scale-[0.98] hover:scale-[1.03]",
            isOnBreak
              ? "border-amber-500/40 bg-zinc-900/90 text-white hover:border-amber-400/60 hover:shadow-amber-500/20 focus-visible:ring-amber-500/60"
              : "border-emerald-500/30 bg-zinc-900/90 text-white hover:border-emerald-400/50 hover:shadow-emerald-500/20 focus-visible:ring-emerald-500/60",
          ].join(" ")}
        >
          {/* Status dot */}
          <div className="relative flex size-2.5 shrink-0">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${
                isOnBreak ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex size-2.5 rounded-full ${
                isOnBreak ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </div>

          {/* Icon */}
          <div
            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
              isOnBreak ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {isOnBreak ? (
              <Coffee className="size-4" aria-hidden />
            ) : (
              <Timer className="size-4" aria-hidden />
            )}
          </div>

          {/* Timer text */}
          <div className="flex min-w-0 flex-col text-left">
            <span
              className={`text-[10px] font-semibold tracking-widest uppercase ${
                isOnBreak ? "text-amber-400/90" : "text-emerald-400/90"
              }`}
            >
              {isOnBreak ? "🟡 On Break" : "🟢 Working"}
            </span>
            <span
              id="floating-widget-elapsed"
              className="font-mono text-base font-bold leading-none tracking-tight text-white tabular-nums"
            >
              {elapsed}
            </span>
          </div>

          {/* Expand caret */}
          <ChevronRight
            className="size-4 shrink-0 text-white/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/70"
            aria-hidden
          />
        </button>
      </div>

      {/* ── Full session overlay ─────────────────────────────────────────── */}
      <TimesheetOverlay
        open={overlayOpen}
        onClose={handleClose}
        employeeId={employeeId}
        todayStatus={todayStatus}
        isTodayPending={isTodayPending}
        currentTime={currentTime}
        onRefetch={() => void refetchToday()}
        isOnBreak={isOnBreak}
        onToggleBreak={handleToggleBreak}
      />
    </>
  );
}
