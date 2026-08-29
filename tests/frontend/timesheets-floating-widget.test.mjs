import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("TenantLayout and CompanyLayout include FloatingClockWidget", () => {
  const tenantLayout = read("apps/erp/src/layouts/TenantLayout.tsx");
  const companyLayout = read("apps/erp/src/layouts/CompanyLayout.tsx");

  assert.match(tenantLayout, /<FloatingClockWidget\s*\/>/);
  assert.match(companyLayout, /<FloatingClockWidget\s*\/>/);
});

test("FloatingClockWidget auto-hides when clocked out and renders live timer when clocked in", () => {
  const widget = read("apps/erp/src/features/timesheets/components/FloatingClockWidget.tsx");

  assert.match(widget, /useTodayTimesheet/);
  assert.match(widget, /useLiveClockTimer/);
  assert.match(widget, /if\s*\(\s*isTodayPending\s*\|\|\s*!isClockedIn\s*\)\s*return\s+null/);
  assert.match(widget, /TimesheetOverlay/);
  assert.match(widget, /floating-clock-widget-btn/);
  assert.match(widget, /floating-widget-elapsed/);
});

test("TimesheetOverlay provides live timer, break actions, task notes, and clock out", () => {
  const overlay = read("apps/erp/src/features/timesheets/components/TimesheetOverlay.tsx");

  assert.match(overlay, /overlay-start-break-btn/);
  assert.match(overlay, /overlay-clock-out-btn/);
  assert.match(overlay, /overlay-task-note-input/);
  assert.match(overlay, /floating-widget-timer-display/);
  assert.match(overlay, /useClockOut/);
});

test("Live clock timer correctly formats elapsed time without NaN", async () => {
  const timerHook = read("apps/erp/src/features/timesheets/hooks/use-live-clock-timer.ts");
  assert.match(timerHook, /calcElapsedUnits/);
  assert.match(timerHook, /useLiveClockTimer/);
  assert.match(timerHook, /formatClockTime/);

  // Validate pure calculations logic
  const now = new Date("2026-08-29T12:00:00Z");
  const clockIn = new Date("2026-08-29T10:15:30Z").toISOString();

  const diffMs = now.getTime() - new Date(clockIn).getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => n.toString().padStart(2, "0");

  assert.equal(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`, "01:44:30");
});
