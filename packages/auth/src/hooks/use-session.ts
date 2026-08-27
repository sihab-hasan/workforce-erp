import { useContext } from "react";
import { AuthContext } from "../providers/AuthContext";

export function useSession() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useSession must be used within an AuthProvider");
  }

  return context;
}
