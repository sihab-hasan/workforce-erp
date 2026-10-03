import type { NotificationRecord } from "#features/erp-core/types";

type BroadcastTransport = "http" | "https";

type BroadcastConfig = {
  key: string;
  host: string;
  port: number;
  scheme: BroadcastTransport;
  cluster: string | null;
};

type BroadcastOptions = {
  broadcaster: "pusher";
  key: string;
  wsHost: string;
  wsPort: number;
  wssPort: number;
  forceTLS: boolean;
  enabledTransports: string[];
  cluster?: string;
};

type NotificationEvent = { notification: NotificationRecord };

type RealtimeChannel = {
  listen(event: string, callback: (payload: NotificationEvent) => unknown): unknown;
};

type RealtimeClient = {
  private(channel: string): RealtimeChannel;
  leave(channel: string): void;
};

function resolvePort(configured: number, scheme: BroadcastTransport): number {
  if (Number.isFinite(configured) && configured > 0) return configured;

  return scheme === "https" ? 443 : 80;
}

/**
 * Reverb and Pusher share one code path because Reverb speaks the Pusher
 * protocol, so the browser only needs a key and a host to connect.
 */
function readBroadcastConfig(): BroadcastConfig | null {
  const source = import.meta.env;
  const key = source.VITE_REVERB_APP_KEY || source.VITE_PUSHER_APP_KEY;
  const host = source.VITE_REVERB_HOST || source.VITE_PUSHER_HOST;
  if (!key || !host) return null;

  const scheme: BroadcastTransport =
    (source.VITE_REVERB_SCHEME || source.VITE_PUSHER_SCHEME || "https") === "http"
      ? "http"
      : "https";

  return {
    key,
    host,
    port: resolvePort(Number(source.VITE_REVERB_PORT || source.VITE_PUSHER_PORT), scheme),
    scheme,
    cluster: source.VITE_PUSHER_APP_CLUSTER || null,
  };
}

function buildOptions(config: BroadcastConfig): BroadcastOptions {
  const options: BroadcastOptions = {
    broadcaster: "pusher",
    key: config.key,
    wsHost: config.host,
    wsPort: config.port,
    wssPort: config.port,
    forceTLS: config.scheme === "https",
    enabledTransports: ["ws", "wss"],
  };

  return config.cluster ? { ...options, cluster: config.cluster } : options;
}

let clientPromise: Promise<RealtimeClient> | null = null;

function getClient(): Promise<RealtimeClient> | null {
  const config = readBroadcastConfig();
  if (!config) return null;

  if (!clientPromise) {
    clientPromise = Promise.all([import("laravel-echo"), import("pusher-js")]).then(
      ([{ default: Echo }, { default: Pusher }]) => {
        // laravel-echo reads the transport off the global in browser builds.
        (window as unknown as { Pusher: unknown }).Pusher = Pusher;
        const connect = Echo as unknown as new (options: BroadcastOptions) => RealtimeClient;

        return new connect(buildOptions(config));
      },
    );
  }

  return clientPromise;
}

/** True when browser websocket credentials exist; the bell polls when false. */
export function isRealtimeEnabled(): boolean {
  return readBroadcastConfig() !== null;
}

/**
 * Subscribes to the private per-user channel authorised in routes/channels.php.
 * Returns an unsubscribe callback so the caller can clean up on unmount.
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: NotificationRecord) => void,
): () => void {
  const client = getClient();
  if (!client || !userId) return () => {};

  const channelName = `App.Models.User.${userId}`;
  let disposed = false;

  void client
    .then((echo) => {
      if (disposed) return;
      echo
        .private(channelName)
        .listen(".notification.created", (event) => onNotification(event.notification));
    })
    .catch(() => {
      // Realtime is an optimization only; polling keeps the count accurate.
    });

  return () => {
    disposed = true;
    void client.then((echo) => echo.leave(channelName)).catch(() => undefined);
  };
}
