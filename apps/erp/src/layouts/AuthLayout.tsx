import { Outlet } from "react-router-dom";
import { RouteMetadata } from "#components/metadata/RouteMetadata";

/** Authentication pages provide their own full-page AuthCard shell. */
export function AuthLayout() {
  return (
    <>
      <RouteMetadata />
      <Outlet />
    </>
  );
}
