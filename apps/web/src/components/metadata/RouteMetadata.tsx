import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { appConfig } from "#config/app";
import { resolveRouteMetadata } from "#config/metadata";

function upsertMetaByName(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertMetaByProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

export function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = resolveRouteMetadata(pathname);
    document.title = metadata.title;
    upsertMetaByName("description", metadata.description);
    upsertMetaByName("robots", metadata.robots);
    upsertMetaByName("application-name", appConfig.name);
    upsertMetaByName("twitter:card", "summary");
    upsertMetaByName("twitter:title", metadata.title);
    upsertMetaByName("twitter:description", metadata.description);
    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:site_name", appConfig.name);
    upsertMetaByProperty("og:title", metadata.title);
    upsertMetaByProperty("og:description", metadata.description);
    upsertMetaByProperty("og:url", metadata.canonical);
    upsertCanonical(metadata.canonical);
  }, [pathname]);

  return null;
}
