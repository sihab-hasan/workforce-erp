import { Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import type { DepartmentItem } from "../types/organizations.types";

export interface DepartmentListCardProps {
  departments?: DepartmentItem[] | undefined;
}

export function DepartmentListCard({ departments = [] }: DepartmentListCardProps) {
  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-purple-500" />
            <CardTitle className="text-base font-bold">Business Departments</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {departments.length} {departments.length === 1 ? "Division" : "Divisions"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Functional teams, corporate departments, and organizational units.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center">
            <Layers className="mx-auto size-8 text-muted-foreground/60" />
            <p className="mt-2 text-xs font-medium text-foreground">No departments registered</p>
            <p className="text-[11px] text-muted-foreground">
              Organizational units configured by the enterprise will show here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="flex flex-col justify-between rounded-lg border border-border/60 bg-background/50 p-3.5 transition-colors hover:border-border"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-foreground">{dept.name}</h4>
                    {dept.is_active !== false ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {dept.code ? <span className="font-mono">Code: {dept.code}</span> : null}
                    {dept.branch?.name ? (
                      <span>
                        &bull; Branch:{" "}
                        <strong className="text-foreground">{dept.branch.name}</strong>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
