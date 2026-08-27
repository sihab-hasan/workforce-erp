import { workerRequest } from "../api";

export interface ReportJob {
  id: string | number;
}

export async function generateReport(job: ReportJob): Promise<void> {
  await workerRequest(`worker/reports/${job.id}/generate`, { method: "POST" });
}
