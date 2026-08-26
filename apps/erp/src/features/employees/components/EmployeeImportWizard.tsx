export interface EmployeeImportWizardProps {
  className?: string;
}

export function EmployeeImportWizard({ className }: EmployeeImportWizardProps) {
  return <section className={className} data-component="EmployeeImportWizard" />;
}
