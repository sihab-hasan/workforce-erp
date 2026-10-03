import { MapPin, Building } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import type { BranchItem } from "../types/organizations.types";

export interface BranchListCardProps {
  branches?: BranchItem[] | undefined;
}

export function BranchListCard({ branches = [] }: BranchListCardProps) {
  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-amber-500" />
            <CardTitle className="text-base font-bold">Office Branches & Locations</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {branches.length} {branches.length === 1 ? "Location" : "Locations"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Physical facilities, regional hubs, and operational branch offices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center">
            <Building className="mx-auto size-8 text-muted-foreground/60" />
            <p className="mt-2 text-xs font-medium text-foreground">
              No branch locations registered
            </p>
            <p className="text-[11px] text-muted-foreground">
              Offices added by the organization administrator will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="flex flex-col justify-between rounded-lg border border-border/60 bg-background/50 p-3.5 transition-colors hover:border-border"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-foreground">{branch.name}</h4>
                    {branch.is_active !== false ? (
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
                  {branch.code ? (
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Code: {branch.code}
                    </p>
                  ) : null}
                  {branch.address ? (
                    <p className="mt-1.5 text-xs text-muted-foreground">{branch.address}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
