import { rmSync } from "node:fs";
for (const p of ["apps/web/dist", "apps/erp/dist", "apps/admin/dist", "services/worker/dist"])
  rmSync(p, { recursive: true, force: true });
