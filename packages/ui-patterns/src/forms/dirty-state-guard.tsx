import * as React from "react";

export type DirtyStateGuardProps = {
  enabled: boolean;
  message?: string;
};

export function DirtyStateGuard({
  enabled,
  message = "You have unsaved changes. Are you sure you want to leave this page?",
}: DirtyStateGuardProps) {
  React.useEffect(() => {
    if (!enabled) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, message]);

  return null;
}
