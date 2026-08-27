import type { ReactNode, SelectHTMLAttributes } from "react";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Textarea } from "@workforce-erp/ui/components/textarea";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export { Input, Textarea };

export function NativeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30 ${props.className ?? ""}`}
    />
  );
}
