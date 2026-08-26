import { Alert, AlertDescription, AlertTitle } from "@workforce-erp/ui/components/alert";

export type ValidationIssue = {
  id?: string;
  field?: string;
  message: string;
};

export type ValidationSummaryProps = {
  issues: ValidationIssue[];
  title?: string;
  onIssueClick?: (issue: ValidationIssue) => void;
};

export function ValidationSummary({
  issues,
  title = "Review the highlighted fields",
  onIssueClick,
}: ValidationSummaryProps) {
  if (!issues.length) return null;
  return (
    <Alert variant="destructive" role="alert">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {issues.map((issue, index) => (
            <li key={issue.id ?? `${issue.field ?? "issue"}-${index}`}>
              {onIssueClick ? (
                <button
                  type="button"
                  className="text-left underline underline-offset-2"
                  onClick={() => onIssueClick(issue)}
                >
                  {issue.field ? `${issue.field}: ` : null}
                  {issue.message}
                </button>
              ) : (
                <>
                  {issue.field ? `${issue.field}: ` : null}
                  {issue.message}
                </>
              )}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
