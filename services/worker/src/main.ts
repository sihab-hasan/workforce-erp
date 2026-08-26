import { workerRequest } from "./api";
import { workerConfig } from "./config";
import { generateReport, type ReportJob } from "./jobs/generate-report";
import { sendNotification, type NotificationJob } from "./jobs/send-notification";

type WorkerJob =
  ({ type: "generate-report" } & ReportJob) | ({ type: "send-notification" } & NotificationJob);

async function runOnce(): Promise<void> {
  const payload = await workerRequest<{ data?: WorkerJob[] }>(workerConfig.jobsPath);
  for (const job of payload.data ?? []) {
    if (job.type === "generate-report") await generateReport(job);
    if (job.type === "send-notification") await sendNotification(job);
  }
}

async function main(): Promise<void> {
  if (!workerConfig.enabled) {
    console.info(
      "Worker disabled. Set WORKER_ENABLED=true and WORKER_JOBS_PATH when a jobs endpoint is available.",
    );
    return;
  }

  for (;;) {
    try {
      await runOnce();
    } catch (error) {
      console.error("Worker iteration failed", error);
    }
    await new Promise((resolve) => setTimeout(resolve, workerConfig.pollIntervalMs));
  }
}

void main();
