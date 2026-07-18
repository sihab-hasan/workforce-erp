import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { fallbackWebRoute, webRoutes } from "@/app/config/routes.config.ts"
import { MarketingLayout } from "@/shell/MarketingLayout"

const FallbackPage = fallbackWebRoute.component

const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      ...webRoutes.map((route) => {
        const Page = route.component

        return {
          path: route.path,
          element: <Page />,
        }
      }),
      {
        path: fallbackWebRoute.path,
        element: <FallbackPage />,
      },
      {
        path: "*",
        element: <FallbackPage />,
      },
    ],
  },
])

export function WebRouter() {
  return <RouterProvider router={router} />
}
