import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { appConfig } from "#config/app";
import { resolveRouteMetadata } from "#config/metadata";

function upsertMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

export function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = resolveRouteMetadata(pathname);
    document.title = metadata.title;
    upsertMeta("description", metadata.description);
    upsertMeta("robots", metadata.robots);
    upsertMeta("application-name", appConfig.name);
  }, [pathname]);

  return null;
}
