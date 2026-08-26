export interface DocumentUploaderProps {
  className?: string;
}

export function DocumentUploader({ className }: DocumentUploaderProps) {
  return <section className={className} data-component="DocumentUploader" />;
}
