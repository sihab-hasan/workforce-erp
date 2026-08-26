import type { MouseEventHandler, ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { cn } from "@workforce-erp/ui/lib/utils";

type NavigationLinkProps = {
  children: ReactNode;
  className?: string;
  end?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  to: string;
};

export function NavigationLink({ children, className, end, onClick, to }: NavigationLinkProps) {
  return (
    <NavLink
      to={to}
      {...(end !== undefined ? { end } : {})}
      {...(onClick ? { onClick } : {})}
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isActive ? "bg-muted text-foreground" : "text-muted-foreground",
          className,
        )
      }
    >
      {children}
    </NavLink>
  );
}
