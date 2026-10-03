import { Briefcase } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import type { DesignationItem } from "../types/organizations.types";

export interface DesignationListCardProps {
  designations?: DesignationItem[] | undefined;
}

export function DesignationListCard({ designations = [] }: DesignationListCardProps) {
  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-blue-500" />
            <CardTitle className="text-base font-bold">Job Designations & Titles</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {designations.length} {designations.length === 1 ? "Role" : "Roles"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Role titles, executive levels, and professional ranks within the workforce.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {designations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center">
            <Briefcase className="mx-auto size-8 text-muted-foreground/60" />
            <p className="mt-2 text-xs font-medium text-foreground">No designations registered</p>
            <p className="text-[11px] text-muted-foreground">
              Official job titles defined in the organization will show here.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {designations.map((desig) => (
              <div
                key={desig.id}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                <span>{desig.name}</span>
                {desig.code ? (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ({desig.code})
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
