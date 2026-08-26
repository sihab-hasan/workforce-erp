import { useSession } from "./use-session";

export function useAuth() {
  return useSession();
}
