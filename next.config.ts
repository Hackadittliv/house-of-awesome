import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/sessioner", destination: "/tjanster", permanent: true },
      { source: "/behandlingar", destination: "/tjanster", permanent: true },
      { source: "/upplevelsen", destination: "/om", permanent: true },
      { source: "/kontakt", destination: "/besok", permanent: true },
      { source: "/showroom/:path*", destination: "/om#showroom", permanent: true },
      { source: "/boka", destination: "https://lifeisawesome.se/boka?utm_source=houseofawesome&utm_medium=referral&utm_campaign=hoa_site&utm_content=redirect", permanent: false },
      { source: "/boka/:slug", destination: "https://lifeisawesome.se/boka/:slug?utm_source=houseofawesome&utm_medium=referral&utm_campaign=hoa_site&utm_content=redirect", permanent: false },
    ];
  },
};

export default nextConfig;
