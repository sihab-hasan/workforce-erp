export interface LeaveRequestWidgetProps {
  className?: string;
}

export function LeaveRequestWidget({ className }: LeaveRequestWidgetProps) {
  return <section className={className} data-component="LeaveRequestWidget" />;
}
