import { RouterProvider } from "react-router-dom";
import { AppProviders } from "#app/providers";
import { router } from "#routes/index";
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
