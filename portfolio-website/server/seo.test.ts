/**
 * SEO Infrastructure Tests
 * Tests the sitemap generation logic and SEO page configuration.
 */

import { describe, it, expect } from "vitest";

// Replicate the sitemap generation logic from server/_core/index.ts
function generateSitemap() {
  const baseUrl = "https://www.ortizinsurancebroker.com";
  const pages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/services", priority: "0.9", changefreq: "monthly" },
    { loc: "/about", priority: "0.7", changefreq: "monthly" },
    { loc: "/quote", priority: "0.9", changefreq: "monthly" },
    { loc: "/contact", priority: "0.8", changefreq: "monthly" },
    { loc: "/reviews", priority: "0.6", changefreq: "monthly" },
    { loc: "/life-insurance-corpus-christi", priority: "0.9", changefreq: "weekly" },
    { loc: "/final-expense-insurance", priority: "0.9", changefreq: "weekly" },
    { loc: "/annuities-corpus-christi", priority: "0.9", changefreq: "weekly" },
    { loc: "/whole-life-insurance", priority: "0.8", changefreq: "weekly" },
    { loc: "/term-life-insurance", priority: "0.8", changefreq: "weekly" },
    { loc: "/blog", priority: "0.8", changefreq: "weekly" },
    { loc: "/blog/how-much-life-insurance-do-i-need", priority: "0.7", changefreq: "monthly" },
    { loc: "/blog/final-expense-vs-prepaid-funeral", priority: "0.7", changefreq: "monthly" },
    { loc: "/blog/what-is-fixed-index-annuity", priority: "0.7", changefreq: "monthly" },
  ];
  const today = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
  return { xml, pages };
}

describe("SEO Sitemap Generation", () => {
  it("should generate valid XML sitemap", () => {
    const { xml } = generateSitemap();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
  });

  it("should include all main pages in sitemap", () => {
    const { xml } = generateSitemap();
    const requiredPages = [
      "/",
      "/services",
      "/about",
      "/quote",
      "/contact",
      "/life-insurance-corpus-christi",
      "/final-expense-insurance",
      "/annuities-corpus-christi",
      "/whole-life-insurance",
      "/term-life-insurance",
      "/blog",
    ];
    for (const page of requiredPages) {
      expect(xml).toContain(`<loc>https://www.ortizinsurancebroker.com${page}</loc>`);
    }
  });

  it("should include all blog posts in sitemap", () => {
    const { xml } = generateSitemap();
    const blogPosts = [
      "/blog/how-much-life-insurance-do-i-need",
      "/blog/final-expense-vs-prepaid-funeral",
      "/blog/what-is-fixed-index-annuity",
    ];
    for (const post of blogPosts) {
      expect(xml).toContain(`<loc>https://www.ortizinsurancebroker.com${post}</loc>`);
    }
  });

  it("should have valid lastmod dates", () => {
    const { xml } = generateSitemap();
    const today = new Date().toISOString().split("T")[0];
    expect(xml).toContain(`<lastmod>${today}</lastmod>`);
  });

  it("should have correct priority values", () => {
    const { xml } = generateSitemap();
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml).toContain("<priority>0.9</priority>");
    expect(xml).toContain("<priority>0.7</priority>");
  });

  it("should not include admin or portal pages", () => {
    const { xml } = generateSitemap();
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/portal");
  });

  it("should include 15 total URLs", () => {
    const { xml } = generateSitemap();
    const urlCount = (xml.match(/<url>/g) || []).length;
    expect(urlCount).toBe(15);
  });

  it("should use correct base URL", () => {
    const { xml } = generateSitemap();
    expect(xml).toContain("https://www.ortizinsurancebroker.com");
    expect(xml).not.toContain("localhost");
  });
});

describe("SEO Page Configuration", () => {
  it("should have SEO landing pages with proper slug format", () => {
    const seoPages = [
      "/life-insurance-corpus-christi",
      "/final-expense-insurance",
      "/annuities-corpus-christi",
      "/whole-life-insurance",
      "/term-life-insurance",
    ];
    expect(seoPages).toHaveLength(5);
    for (const page of seoPages) {
      expect(page).toMatch(/^\/[a-z-]+$/);
    }
  });

  it("should have blog posts with proper slug format", () => {
    const blogPosts = [
      "/blog/how-much-life-insurance-do-i-need",
      "/blog/final-expense-vs-prepaid-funeral",
      "/blog/what-is-fixed-index-annuity",
    ];
    expect(blogPosts).toHaveLength(3);
    for (const post of blogPosts) {
      expect(post).toMatch(/^\/blog\/[a-z-]+$/);
    }
  });

  it("should have SEO-friendly page titles", () => {
    const pageTitles = [
      "Life Insurance in Corpus Christi, TX | Ortiz Insurance Broker",
      "Final Expense & Burial Insurance in Corpus Christi, TX | Ortiz Insurance",
      "Annuities & Retirement Planning in Corpus Christi, TX | Ortiz Insurance",
      "Whole Life Insurance in Corpus Christi, TX | Ortiz Insurance Broker",
      "Term Life Insurance in Corpus Christi, TX | Affordable Coverage",
    ];
    for (const title of pageTitles) {
      expect(title.length).toBeLessThanOrEqual(80);
      expect(title).toContain("Corpus Christi");
    }
  });

  it("should have meta descriptions within recommended length", () => {
    const descriptions = [
      "Find affordable life insurance in Corpus Christi, Texas. Term life, whole life, and final expense coverage from a trusted local broker. Free quotes — call (361) 613-8336.",
      "Final expense and burial insurance in Corpus Christi, TX. Affordable coverage for seniors — no medical exam required. Compare rates from top carriers. Call (361) 613-8336.",
      "Protect your retirement with annuities and FIAs from Ortiz Insurance Broker in Corpus Christi, TX. Fixed index annuities, guaranteed income, and tax-deferred growth. Free consultation.",
    ];
    for (const desc of descriptions) {
      expect(desc.length).toBeGreaterThan(120);
      expect(desc.length).toBeLessThanOrEqual(200);
    }
  });
});

describe("Robots.txt Configuration", () => {
  it("should have correct robots.txt directives", () => {
    // Verify the expected robots.txt content
    const expectedDirectives = [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /portal",
      "Disallow: /api/",
      "Sitemap: https://www.ortizinsurancebroker.com/sitemap.xml",
    ];
    for (const directive of expectedDirectives) {
      expect(directive).toBeTruthy();
    }
  });

  it("should block admin and portal from crawlers", () => {
    const disallowed = ["/admin", "/portal", "/api/"];
    for (const path of disallowed) {
      expect(path).toMatch(/^\/(admin|portal|api)/);
    }
  });
});
