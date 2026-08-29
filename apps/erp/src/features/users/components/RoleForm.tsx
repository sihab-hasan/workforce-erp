import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Checkbox } from "@workforce-erp/ui/components/checkbox";
import { Field, Input, Textarea } from "#components/erp/FormControls";
import {
  getPermissionPresentation,
  MODULE_DEFINITIONS,
  type PermissionOption,
  type RolePayload,
  type RoleRecord,
} from "./role-form.constants";


export interface RoleFormProps {
  initial?: RoleRecord | null;
  permissions: PermissionOption[];
  submitting: boolean;
  onCancel?: () => void;
  onSubmit: (payload: RolePayload) => void;
}

export function RoleForm({
  initial,
  permissions,
  submitting,
  onCancel,
  onSubmit,
}: RoleFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [selected, setSelected] = useState<string[]>(initial?.permissions ?? []);
  const [search, setSearch] = useState("");

  const toggle = (p: string) =>
    setSelected((c) => (c.includes(p) ? c.filter((v) => v !== p) : [...c, p]));

  const groupedPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    const items = permissions.map((p) => {
      const meta = getPermissionPresentation(p.name, p.description);
      return {
        id: p.id,
        rawName: p.name,
        label: meta.label,
        description: meta.description,
        module: meta.module,
      };
    });

    const filtered = query
      ? items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (MODULE_DEFINITIONS[item.module]?.title.toLowerCase() ?? "").includes(query),
        )
      : items;

    const groups: Record<
      string,
      {
        moduleKey: string;
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        items: typeof items;
      }
    > = {};

    for (const item of filtered) {
      const modKey = item.module;
      if (!groups[modKey]) {
        const modDef = MODULE_DEFINITIONS[modKey] ?? MODULE_DEFINITIONS["other"];
        if (!modDef) continue;
        groups[modKey] = {
          moduleKey: modKey,
          title: modDef.title,
          description: modDef.description,
          icon: modDef.icon,
          items: [],
        };
      }
      groups[modKey]?.items.push(item);
    }

    return Object.values(groups);
  }, [permissions, search]);

  const selectAllInModule = (moduleItems: Array<{ rawName: string }>) => {
    const names = moduleItems.map((i) => i.rawName);
    const allSelected = names.every((n) => selected.includes(n));
    if (allSelected) {
      setSelected((prev) => prev.filter((n) => !names.includes(n)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...names])));
    }
  };

  const selectAll = () => {
    setSelected(permissions.map((p) => p.name));
  };

  const clearAll = () => {
    setSelected([]);
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, description, permissions: selected });
      }}
    >
      {/* Role Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role Name">
          <Input
            required
            placeholder="e.g. HR Manager, Finance Lead, Team Member"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Description">
          <Textarea
            rows={2}
            placeholder="Brief explanation of what this role does and who it is assigned to…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>

      {/* Permissions Header & Actions */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Permissions & Access Rights</h3>
            <p className="text-xs text-muted-foreground">
              Select the functional capabilities enabled for this role.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2.5 py-1 text-xs font-semibold">
              {selected.length} of {permissions.length} selected
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearAll}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search permissions by capability or feature (e.g. leave, approve, payroll)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grouped Permission Cards */}
      <div className="space-y-6 pb-2">
        {groupedPermissions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No permissions matched &quot;{search}&quot;
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => setSearch("")}
            >
              Reset Search
            </Button>
          </div>
        ) : (
          groupedPermissions.map((group) => {
            const Icon = group.icon;
            const moduleNames = group.items.map((i) => i.rawName);
            const selectedCount = moduleNames.filter((n) => selected.includes(n)).length;
            const isAllModuleSelected =
              moduleNames.length > 0 && selectedCount === moduleNames.length;

            return (
              <div
                key={group.moduleKey}
                className="rounded-xl border bg-card/40 p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-8 place-content-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground leading-tight">
                        {group.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{group.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => selectAllInModule(group.items)}
                    className="text-xs font-medium text-primary hover:underline px-2 py-1 rounded transition-colors"
                  >
                    {isAllModuleSelected
                      ? "Deselect category"
                      : `Select category (${selectedCount}/${moduleNames.length})`}
                  </button>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                  {group.items.map((item) => {
                    const isChecked = selected.includes(item.rawName);

                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-150 select-none ${
                          isChecked
                            ? "border-primary/50 bg-primary/5 shadow-xs"
                            : "border-border/60 bg-background/50 hover:bg-muted/40 hover:border-border"
                        }`}
                      >
                        <div className="pt-0.5">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggle(item.rawName)}
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p
                            className={`text-xs font-semibold leading-snug ${
                              isChecked ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-xs text-muted-foreground font-medium">
          {selected.length} {selected.length === 1 ? "capability" : "capabilities"} selected
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Saving Role…" : initial ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </div>
    </form>
  );
}
