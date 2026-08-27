export interface ReportViewerProps {
  className?: string;
}

export function ReportViewer({ className }: ReportViewerProps) {
  return <section className={className} data-component="ReportViewer" />;
}
