import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import DocumentsPage from "#pages/documents/DocumentsPage";
import DocumentUploadPage from "#pages/documents/DocumentUploadPage";
import DocumentDetailsPage from "#pages/documents/DocumentDetailsPage";

export const documentsRoutes: RouteObject[] = [
  {
    path: "documents",
    element: (
      <AuthorizedRoute capability="document.manage">
        <DocumentsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "documents/upload",
    element: (
      <AuthorizedRoute capability="document.manage">
        <DocumentUploadPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "documents/:documentId",
    element: (
      <AuthorizedRoute capability="document.manage">
        <DocumentDetailsPage />
      </AuthorizedRoute>
    ),
  },
];
