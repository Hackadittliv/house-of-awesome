import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Ingen tredjepartskod laddas förrän besökaren har samtyckt. CSP:n tillåter bara de
// analysverktyg som ConsentedTrackers kan ladda efter samtycke. Dev behöver 'unsafe-eval'.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com https://connect.facebook.net`,
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const utm = "utm_source=houseofawesome&utm_medium=referral&utm_campaign=hoa_site&utm_content=redirect";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/sessioner", destination: "/tjanster", permanent: true },
      { source: "/behandlingar", destination: "/tjanster", permanent: true },
      { source: "/upplevelsen", destination: "/om", permanent: true },
      { source: "/kontakt", destination: "/besok", permanent: true },
      { source: "/showroom/:path*", destination: "/om#showroom", permanent: true },
      { source: "/boka", destination: `https://lifeisawesome.se/boka?${utm}`, permanent: false },
      { source: "/boka/:slug", destination: `https://lifeisawesome.se/boka/:slug?${utm}`, permanent: false },
    ];
  },
};

export default nextConfig;
