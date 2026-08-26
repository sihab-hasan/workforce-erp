import { Outlet, ScrollRestoration } from "react-router-dom";

import { ScrollToTopControl } from "#components/shared/navigation";
import { RouteMetadata } from "#components/metadata/RouteMetadata";
import SiteFooter from "#components/footer/SiteFooter";
import { SiteHeader } from "#components/header/SiteHeader";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <RouteMetadata />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollToTopControl />
      <ScrollRestoration />
    </div>
  );
}
