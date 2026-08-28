import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workforce-erp/ui/components/empty";

export function RouteNotFound({
  homeTo,
  label = "Back to workspace",
}: {
  homeTo: string;
  label?: string;
}) {
  return (
    <Empty className="min-h-72 rounded-2xl border border-dashed bg-muted/15 px-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Home className="size-5" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>
          The address is valid for this application, but no page is registered at this route.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center">
        <Button nativeButton={false} render={<Link to={homeTo} />}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {label}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
