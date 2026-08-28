import type { RouteObject } from "react-router-dom";
import SignInPage from "#pages/auth/sign-in/SignInPage";
export const authRoutes: RouteObject[] = [{ path: "sign-in", element: <SignInPage /> }];
