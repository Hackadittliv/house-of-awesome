"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useConsent } from "@/components/consent/ConsentProvider";
import { trackers } from "@/lib/consent";

type TrackingWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

export function ConsentedTrackers() {
  const { choice } = useConsent();
  const pathname = usePathname();
  const firstPath = useRef(pathname);

  const loadAnalytics = Boolean(choice?.analytics && trackers.gaMeasurementId);
  const loadMarketing = Boolean(choice?.marketing && trackers.metaPixelId);

  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    const w = window as TrackingWindow;
    if (loadAnalytics) w.gtag?.("event", "page_view", { page_path: pathname });
    if (loadMarketing) w.fbq?.("track", "PageView");
  }, [pathname, loadAnalytics, loadMarketing]);

  return (
    <>
      {loadAnalytics ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${trackers.gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="hoa-ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${trackers.gaMeasurementId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {loadMarketing ? (
        <Script id="hoa-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${trackers.metaPixelId}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
