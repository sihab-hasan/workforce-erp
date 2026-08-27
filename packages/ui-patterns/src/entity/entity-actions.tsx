import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";

export type EntityAction = {
  id: string;
  label: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
};

export type EntityActionsProps = {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  actions?: EntityAction[];
  menuLabel?: string;
};

export function EntityActions({
  primary,
  secondary,
  actions = [],
  menuLabel = "More",
}: EntityActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {secondary}
      {actions.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            {menuLabel}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map((action) => (
              <React.Fragment key={action.id}>
                {action.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  disabled={action.disabled}
                  onClick={action.onSelect}
                  className={
                    action.destructive ? "text-destructive focus:text-destructive" : undefined
                  }
                >
                  {action.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {primary}
    </div>
  );
}
