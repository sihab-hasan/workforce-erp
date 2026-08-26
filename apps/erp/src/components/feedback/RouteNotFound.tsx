import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { EmptyState } from "@workforce-erp/ui-patterns/feedback";

export function RouteNotFound({
  homeTo,
  label = "Back to workspace",
}: {
  homeTo: string;
  label?: string;
}) {
  return (
    <EmptyState
      title="Page not found"
      description="The address is valid for this application, but no page is registered at this route."
      icon={<Home className="size-5" aria-hidden="true" />}
      primaryAction={
        <Button nativeButton={false} render={<Link to={homeTo} />}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {label}
        </Button>
      }
    />
  );
}
