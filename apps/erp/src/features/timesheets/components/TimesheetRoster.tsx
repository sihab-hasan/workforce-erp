export interface TimesheetRosterProps {
  className?: string;
}

export function TimesheetRoster({ className }: TimesheetRosterProps) {
  return <section className={className} data-component="TimesheetRoster" />;
}
