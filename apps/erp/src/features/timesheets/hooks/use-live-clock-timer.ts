import { useState, useEffect, useMemo } from "react";

export interface LiveClockTimerResult {
  /** Formatted as HH:MM:SS (e.g. 02:45:12) */
  formattedElapsed: string;
  /** Formatted as 02h 45m 12s */
  formattedDuration: string;
  /** Elapsed whole hours */
  hours: number;
  /** Elapsed whole minutes (0-59) */
  minutes: number;
  /** Elapsed whole seconds (0-59) */
  seconds: number;
  /** Total elapsed seconds */
  totalSeconds: number;
  /** Total elapsed hours as a decimal number (e.g. 2.75) */
  totalHoursDecimal: number;
  /** Current local time */
  currentTime: Date;
  /** Formatted clock-in time in 12-hour format (e.g. 09:30 AM) or "--:--" */
  formattedStartTime: string;
}

/**
 * Calculates time elapsed since a given ISO timestamp relative to a given date.
 */
export function calcElapsedUnits(clockInIso: string | null | undefined, now: Date = new Date()) {
  if (!clockInIso) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      totalHoursDecimal: 0,
      formattedElapsed: "00:00:00",
      formattedDuration: "00h 00m 00s",
    };
  }

  try {
    const startMs = new Date(clockInIso).getTime();
    const diffMs = Math.max(0, now.getTime() - startMs);

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const totalHoursDecimal = Number((totalSeconds / 3600).toFixed(2));

    const p = (n: number) => n.toString().padStart(2, "0");
    const formattedElapsed = `${p(hours)}:${p(minutes)}:${p(seconds)}`;
    const formattedDuration = `${p(hours)}h ${p(minutes)}m ${p(seconds)}s`;

    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
      totalHoursDecimal,
      formattedElapsed,
      formattedDuration,
    };
  } catch {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      totalHoursDecimal: 0,
      formattedElapsed: "00:00:00",
      formattedDuration: "00h 00m 00s",
    };
  }
}

/**
 * Formats an ISO string to a human-readable 12-hour time string (e.g. "09:30 AM")
 */
export function formatClockTime(isoString: string | null | undefined): string {
  if (!isoString) return "--:--";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "--:--";
  }
}

/**
 * Custom hook that provides a live ticking timer synced with a backend clock-in ISO timestamp.
 * Guaranteed to remain accurate across route changes and background tab pauses.
 */
export function useLiveClockTimer(clockInIso?: string | null | undefined): LiveClockTimerResult {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    // Tick every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const elapsedUnits = useMemo(
    () => calcElapsedUnits(clockInIso, currentTime),
    [clockInIso, currentTime],
  );

  const formattedStartTime = useMemo(
    () => formatClockTime(clockInIso),
    [clockInIso],
  );

  return {
    ...elapsedUnits,
    currentTime,
    formattedStartTime,
  };
}
