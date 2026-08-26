import { Outlet } from "react-router-dom";
import { RouteMetadata } from "#components/metadata/RouteMetadata";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <RouteMetadata />
      <header className="border-b px-6 py-4 text-sm font-medium">Workforce ERP</header>
      <main className="mx-auto w-full max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
