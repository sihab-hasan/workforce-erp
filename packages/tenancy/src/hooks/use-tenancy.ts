import { useContext } from "react";
import { TenancyContext } from "../providers/TenancyContext";

export function useTenancy() {
  const value = useContext(TenancyContext);

  if (value === null) {
    throw new Error("useTenancy must be used within a TenancyProvider");
  }

  return value;
}
