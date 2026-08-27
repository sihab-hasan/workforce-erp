import { useContext } from "react";
import { AuthorizationContext } from "../providers/AuthorizationContext";

export function useAuthorization() {
  const value = useContext(AuthorizationContext);

  if (value === null) {
    throw new Error("useAuthorization must be used within an AuthorizationProvider");
  }

  return value;
}
