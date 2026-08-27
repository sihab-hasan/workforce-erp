export interface DocumentPreviewProps {
  className?: string;
}

export function DocumentPreview({ className }: DocumentPreviewProps) {
  return <section className={className} data-component="DocumentPreview" />;
}
