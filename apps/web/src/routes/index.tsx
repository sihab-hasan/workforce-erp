import { createBrowserRouter } from "react-router-dom";
import { publicRoutes } from "#routes/public.routes";
import { authRoutes } from "#routes/auth.routes";

export const router = createBrowserRouter([...publicRoutes, ...authRoutes], {
  basename: import.meta.env.BASE_URL,
});
