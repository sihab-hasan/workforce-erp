export interface NotificationItemProps {
  className?: string;
}

export function NotificationItem({ className }: NotificationItemProps) {
  return <section className={className} data-component="NotificationItem" />;
}
