import { Link, Navigate, type RouteObject } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workforce-erp/ui/components/empty";
import { PublicLayout } from "#layouts/PublicLayout";
import HomePage from "#pages/home/HomePage";
import FeaturesPage from "#pages/features/FeaturesPage";
import AboutPage from "#pages/about/AboutPage";
import ContactPage from "#pages/contact/ContactPage";
import { WEB_PATHS } from "#routes/paths";

function PublicNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-5 py-16">
      <Empty className="min-h-72 rounded-2xl border border-dashed bg-muted/15 px-6">
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you requested is not part of this minimized website.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row flex-wrap justify-center">
          <Button nativeButton={false} render={<Link to={WEB_PATHS.home} />}>
            Return home
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "features", element: <FeaturesPage /> },
      { path: "features/:slug", element: <Navigate to={WEB_PATHS.features} replace /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },

      // Compatibility aliases retained for links inherited from the big site.
      { path: "request-demo", element: <Navigate to={WEB_PATHS.contact} replace /> },
      { path: "integrations", element: <Navigate to={WEB_PATHS.features} replace /> },
      { path: "integrations/:slug", element: <Navigate to={WEB_PATHS.features} replace /> },
      { path: "solutions", element: <Navigate to={WEB_PATHS.features} replace /> },
      { path: "solutions/:slug", element: <Navigate to={WEB_PATHS.features} replace /> },
      { path: "industries", element: <Navigate to={WEB_PATHS.features} replace /> },
      { path: "industries/:slug", element: <Navigate to={WEB_PATHS.features} replace /> },
      { path: "pricing", element: <Navigate to={WEB_PATHS.features} replace /> },
      { path: "careers", element: <Navigate to={WEB_PATHS.about} replace /> },
      { path: "partners", element: <Navigate to={WEB_PATHS.about} replace /> },
      { path: "*", element: <PublicNotFound /> },
    ],
  },
];
