import { useState } from "react";
import {
  Clock,
  LogOut,
  Coffee,
  FileText,
  Loader2,
  Timer,
  Calendar,
  CheckCircle2,
  Target,
  X,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { Badge } from "@workforce-erp/ui/components/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workforce-erp/ui/components/sheet";
import { Separator } from "@workforce-erp/ui/components/separator";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import type { TodayTimesheetStatus } from "../types/timesheets.types";
import { useClockOut, useUpdateTimesheet } from "../api/timesheets.mutations";

import { calcElapsedUnits, formatClockTime } from "../hooks/use-live-clock-timer";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimesheetOverlayProps {
  open: boolean;
  onClose: () => void;
  employeeId?: string | undefined;
  todayStatus: TodayTimesheetStatus | undefined;
  isTodayPending: boolean;
  currentTime: Date;
  onRefetch: () => void;
  isOnBreak?: boolean | undefined;
  onToggleBreak?: (() => void) | undefined;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TimesheetOverlay({
  open,
  onClose,
  employeeId,
  todayStatus,
  isTodayPending,
  currentTime,
  onRefetch,
  isOnBreak = false,
  onToggleBreak,
}: TimesheetOverlayProps) {
  const [taskNote, setTaskNote] = useState("");
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  const clockOutMutation = useClockOut();
  const updateTimesheetMutation = useUpdateTimesheet();

  const isClockedIn = Boolean(todayStatus?.is_clocked_in);
  const activeTimesheet = todayStatus?.active_timesheet;
  const scheduledHours = 8;
  const totalTodayHours = Number(
    todayStatus?.total_today_hours ?? activeTimesheet?.total_hours ?? 0,
  );
  const remainingHours = Math.max(0, scheduledHours - totalTodayHours);
  const progressPercent = Math.min(100, Math.round((totalTodayHours / scheduledHours) * 100));

  const elapsed = isClockedIn
    ? calcElapsedUnits(activeTimesheet?.clock_in, currentTime).formattedElapsed
    : "00:00:00";

  const handleBreakToggle = () => {
    if (onToggleBreak) {
      onToggleBreak();
      if (!isOnBreak) {
        toast.info("Break Started", {
          description: "Status changed to On Break. Enjoy your break!",
        });
      } else {
        toast.success("Break Ended", {
          description: "Resumed active working session.",
        });
      }
    }
  };

  const handleClockOut = () => {
    const payload = employeeId ? { employee_id: employeeId } : {};
    clockOutMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Clocked out successfully!", {
          description: `Work session ended at ${formatTime(new Date())}`,
        });
        onRefetch();
        onClose();
      },
      onError: (err: Error) => {
        toast.error("Clock Out Failed", {
          description: err.message || "Please try again.",
        });
      },
    });
  };

  const handleSaveNote = () => {
    if (!taskNote.trim()) return;

    if (activeTimesheet?.id) {
      updateTimesheetMutation.mutate(
        {
          id: activeTimesheet.id,
          payload: {
            notes: activeTimesheet.notes
              ? `${activeTimesheet.notes}\n${taskNote.trim()}`
              : taskNote.trim(),
          },
        },
        {
          onSuccess: () => {
            toast.success("Task note saved to session");
            setTaskNote("");
            setIsNoteExpanded(false);
            onRefetch();
          },
          onError: (err: Error) => {
            toast.error("Failed to save note", {
              description: err.message || "Please try again.",
            });
          },
        },
      );
    } else {
      toast.success("Note saved", {
        description: "Task note recorded for this session.",
      });
      setTaskNote("");
      setIsNoteExpanded(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        id="timesheet-overlay-panel"
        aria-label="Active session panel"
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <SheetHeader className="relative border-b border-border/60 bg-gradient-to-br from-emerald-950/30 via-background to-background px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <SheetTitle className="flex items-center gap-2 text-base">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15">
                  <Clock className="size-4 text-emerald-500" aria-hidden />
                </div>
                Active Work Session
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5 shrink-0" aria-hidden />
                {formatDate(currentTime)}
              </SheetDescription>
            </div>

            <button
              type="button"
              id="timesheet-overlay-close"
              aria-label="Close session panel"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Status badge */}
          <div className="mt-3">
            {isTodayPending ? (
              <Skeleton className="h-6 w-36 rounded-full" />
            ) : isClockedIn ? (
              isOnBreak ? (
                <Badge className="gap-1.5 border-amber-500/30 bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                  </span>
                  <span className="font-semibold">🟡 On Break</span>
                </Badge>
              ) : (
                <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-semibold">🟢 Working — Active Session</span>
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="gap-1.5 border-dashed text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground/50" />
                Clocked Out
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* ── Body (scrollable) ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Live timer hero */}
          <div className="flex flex-col items-center gap-1 bg-gradient-to-b from-muted/30 to-transparent px-6 py-8">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Timer className="size-3.5 text-primary" aria-hidden />
              <span>{isOnBreak ? "Break Active" : "Live Session Duration"}</span>
            </div>
            {isTodayPending ? (
              <Skeleton className="mt-2 h-14 w-48 rounded-xl" />
            ) : (
              <p
                id="floating-widget-timer-display"
                className={`mt-1 font-mono text-5xl font-bold tracking-tight tabular-nums ${
                  isClockedIn
                    ? isOnBreak
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-emerald-600 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {elapsed}
              </p>
            )}
            {!isTodayPending && activeTimesheet?.clock_in && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Started at {formatClockTime(activeTimesheet.clock_in)}
              </p>
            )}
          </div>

          <Separator />

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-px border-y border-border/50 bg-border/50">
            {/* Scheduled */}
            <div className="flex flex-col gap-0.5 bg-background px-4 py-3.5">
              <p className="text-xs text-muted-foreground">Scheduled Target</p>
              {isTodayPending ? (
                <Skeleton className="h-6 w-16 rounded" />
              ) : (
                <p className="font-mono text-lg font-bold text-foreground">
                  {scheduledHours.toFixed(1)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">hrs</span>
                </p>
              )}
            </div>

            {/* Worked today */}
            <div className="flex flex-col gap-0.5 bg-background px-4 py-3.5">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="size-3.5 text-primary" aria-hidden />
                Worked Today
              </p>
              {isTodayPending ? (
                <Skeleton className="h-6 w-16 rounded" />
              ) : (
                <p className="font-mono text-lg font-bold text-foreground">
                  {totalTodayHours.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">hrs</span>
                </p>
              )}
            </div>

            {/* Remaining */}
            <div className="flex flex-col gap-0.5 bg-background px-4 py-3.5">
              <p className="text-xs text-muted-foreground">Remaining</p>
              {isTodayPending ? (
                <Skeleton className="h-6 w-16 rounded" />
              ) : (
                <p className="font-mono text-lg font-bold text-foreground">
                  {remainingHours.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">hrs</span>
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-0.5 bg-background px-4 py-3.5">
              <p className="text-xs text-muted-foreground">Progress</p>
              {isTodayPending ? (
                <Skeleton className="h-6 w-16 rounded" />
              ) : (
                <p className="font-mono text-lg font-bold text-foreground">
                  {progressPercent}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">%</span>
                </p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 py-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="size-3.5 text-primary" />
                Today's Progress
              </span>
              <span className="font-mono font-medium text-foreground">
                {totalTodayHours.toFixed(2)} / {scheduledHours.toFixed(1)} hrs
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  progressPercent >= 100 ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Separator />

          {/* Task note section */}
          <div className="px-6 py-4">
            <button
              type="button"
              id="overlay-add-note-toggle"
              onClick={() => setIsNoteExpanded((v) => !v)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
            >
              <FileText className="size-3.5 shrink-0" aria-hidden />
              <span>{isNoteExpanded ? "Cancel note" : "Add task note for this session…"}</span>
            </button>

            {isNoteExpanded && (
              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  id="overlay-task-note-input"
                  value={taskNote}
                  onChange={(e) => setTaskNote(e.target.value)}
                  placeholder="What are you working on? (e.g. Sprint planning, client review…)"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button
                  id="overlay-save-note-btn"
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={!taskNote.trim() || updateTimesheetMutation.isPending}
                  className="self-end text-xs"
                >
                  {updateTimesheetMutation.isPending ? "Saving..." : "Save Note"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Actions ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5 border-t border-border/60 bg-background/95 px-6 py-4 backdrop-blur">
          {/* Start / End Break */}
          <Button
            id="overlay-start-break-btn"
            variant="outline"
            size="default"
            onClick={handleBreakToggle}
            disabled={!isClockedIn || clockOutMutation.isPending}
            className={`w-full gap-2 ${
              isOnBreak
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
            }`}
          >
            {isOnBreak ? (
              <>
                <Play className="size-4 shrink-0" aria-hidden />
                Resume Work
              </>
            ) : (
              <>
                <Coffee className="size-4 shrink-0" aria-hidden />
                Start Break
              </>
            )}
          </Button>

          {/* Clock Out */}
          <Button
            id="overlay-clock-out-btn"
            variant="destructive"
            size="default"
            onClick={handleClockOut}
            disabled={!isClockedIn || clockOutMutation.isPending}
            className="w-full gap-2 font-semibold"
          >
            {clockOutMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="size-4 shrink-0" aria-hidden />
            )}
            {clockOutMutation.isPending ? "Ending Session…" : "Clock Out"}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            Your session will be saved automatically on clock-out.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
