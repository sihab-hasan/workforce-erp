import { useEffect } from "react";

const DEFAULT_MESSAGE = "You have unsaved changes. Are you sure you want to leave this page?";

export function useDirtyStateGuard(enabled: boolean, message = DEFAULT_MESSAGE) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, message]);
}
