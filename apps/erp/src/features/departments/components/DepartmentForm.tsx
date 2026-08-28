import { useState, type FormEvent } from "react";
import { AlertCircle, Building2, Hash, Loader2, Shield } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workforce-erp/ui/components/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import type { DepartmentFormData } from "../types/departments.types";

export interface DepartmentFormProps {
  initialValues?: Partial<DepartmentFormData>;
  branches?: Array<{ id: string; name: string }>;
  managers?: Array<{ id: string; name: string }>;
  isPending?: boolean;
  serverError?: string | null;
  onSubmit?: (values: DepartmentFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
}

export function DepartmentForm({
  initialValues,
  branches = [],
  managers = [],
  isPending = false,
  serverError,
  onSubmit,
  onCancel,
  submitLabel = "Save Department",
  className,
}: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: initialValues?.name ?? "",
    code: initialValues?.code ?? "",
    branch_id: initialValues?.branch_id ?? "",
    head_of_department: initialValues?.head_of_department ?? "",
    status: initialValues?.status ?? "active",
    description: initialValues?.description ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof DepartmentFormData>(key: K, value: DepartmentFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Department name is required.";
    if (!formData.code.trim()) errs.code = "Department code is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || isPending) return;
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
          <CardDescription>
            Configure organizational unit, cost center code, and department leadership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dept-name">Department Name *</Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dept-name"
                  placeholder="e.g. Engineering & Technology"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="pl-8"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.name)}
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept-code">Department Code *</Label>
              <div className="relative">
                <Hash className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dept-code"
                  placeholder="e.g. ENG"
                  value={formData.code}
                  onChange={(e) => update("code", e.target.value.toUpperCase())}
                  className="pl-8 uppercase font-mono"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.code)}
                />
              </div>
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => update("status", val as "active" | "inactive")}
                disabled={isPending}
              >
                <SelectTrigger id="dept-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Unit</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept-branch">Location / Branch</Label>
              {branches.length > 0 ? (
                <Select
                  value={formData.branch_id}
                  onValueChange={(val) => {
                    if (val) update("branch_id", val);
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger id="dept-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="dept-branch"
                  placeholder="e.g. Dhaka Headquarters"
                  value={formData.branch_id}
                  onChange={(e) => update("branch_id", e.target.value)}
                  disabled={isPending}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept-head">Head of Department</Label>
              {managers.length > 0 ? (
                <Select
                  value={formData.head_of_department}
                  onValueChange={(val) => {
                    if (val) update("head_of_department", val);
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger id="dept-head">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="relative">
                  <Shield className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dept-head"
                    placeholder="e.g. Alex Johnson"
                    value={formData.head_of_department}
                    onChange={(e) => update("head_of_department", e.target.value)}
                    className="pl-8"
                    disabled={isPending}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dept-desc">Description / Scope</Label>
              <Textarea
                id="dept-desc"
                placeholder="Optional department description and operational scope…"
                rows={3}
                value={formData.description}
                onChange={(e) => update("description", e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
