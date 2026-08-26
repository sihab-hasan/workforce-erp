import { workerRequest } from "../api";

export interface NotificationJob {
  id: string | number;
}

export async function sendNotification(job: NotificationJob): Promise<void> {
  await workerRequest(`worker/notifications/${job.id}/send`, { method: "POST" });
}
