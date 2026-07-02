import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  ogType?: string;
}

/**
 * Hook to inject page-specific SEO meta tags into the document head.
 * Use this for pages that don't use SEOPageLayout.
 */
export function useSEO({ title, description, canonicalPath, keywords, ogType = "website" }: SEOConfig) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", `https://www.ortizinsurancebroker.com${canonicalPath}`, true);
    setMeta("og:type", ogType, true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://www.ortizinsurancebroker.com${canonicalPath}`;

    return () => {
      document.title = "Ortiz Insurance Broker | Life Insurance & Annuities in Corpus Christi, TX";
    };
  }, [title, description, canonicalPath, keywords, ogType]);
}
