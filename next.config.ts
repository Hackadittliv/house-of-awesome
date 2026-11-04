import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
// Netlify lägger in sitt granskningsverktyg som iframe på förhandsversioner, aldrig i produktion.
const isNetlifyPreview = ["deploy-preview", "branch-deploy"].includes(process.env.CONTEXT ?? "");

// Bokningen anropar LIA:s Supabase direkt från webbläsaren och betalningen sker i Stripes inbäddade kassa.
const liaSupabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_LIA_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();
const bookingEnabled = Boolean(liaSupabaseOrigin && process.env.NEXT_PUBLIC_LIA_SUPABASE_ANON_KEY);
const stripeFrames = "https://js.stripe.com https://checkout.stripe.com https://*.stripe.com";

// Ingen tredjepartskod laddas förrän besökaren har samtyckt. CSP:n tillåter bara de
// analysverktyg som ConsentedTrackers kan ladda efter samtycke. Dev behöver 'unsafe-eval'.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com https://connect.facebook.net https://js.stripe.com`,
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://*.stripe.com",
  `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net https://api.stripe.com https://*.stripe.com${liaSupabaseOrigin ? ` ${liaSupabaseOrigin}` : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `frame-src ${stripeFrames}${isNetlifyPreview ? " https://app.netlify.com" : ""}`,
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
  { key: "Permissions-Policy", value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com" "https://checkout.stripe.com")' },
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
      // Manuella behandlingar är dolda sedan oktober 2026.
      { source: "/tjanster/manuella-behandlingar", destination: "/behandlingar-och-samtal", statusCode: 301 },
      { source: "/boka/manuella-behandlingar", destination: "/behandlingar-och-samtal", statusCode: 301 },
      ...(bookingEnabled
        ? []
        : [
            { source: "/boka", destination: `https://lifeisawesome.se/boka?${utm}`, permanent: false },
            { source: "/boka/:slug", destination: `https://lifeisawesome.se/boka/:slug?${utm}`, permanent: false },
          ]),
    ];
  },
};

export default nextConfig;
