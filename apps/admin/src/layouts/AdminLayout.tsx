import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@workforce-erp/ui/components/sidebar";
import { AdminHeader } from "#components/shell/AdminHeader";
import { AdminSidebar } from "#components/shell/AdminSidebar";
import { RouteMetadata } from "#components/metadata/RouteMetadata";

export function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <RouteMetadata />
      <AdminSidebar />
      <SidebarInset className="min-h-screen overflow-x-hidden bg-background">
        <AdminHeader />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-7 lg:px-8">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
