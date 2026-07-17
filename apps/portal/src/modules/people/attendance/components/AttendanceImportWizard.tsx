export interface AttendanceImportWizardProps {
  className?: string
}

export function AttendanceImportWizard({
  className,
}: AttendanceImportWizardProps) {
  return (
    <section className={className} data-component="AttendanceImportWizard" />
  )
}
