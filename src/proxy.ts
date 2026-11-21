import { NextResponse, type NextRequest } from "next/server";

import { bookingEnabled } from "@/lib/booking/config";
import { fallbackBookingDestination } from "@/lib/booking/fallback";

export function proxy(request: NextRequest) {
  if (bookingEnabled) return NextResponse.next();
  const destination = fallbackBookingDestination(request.nextUrl.pathname, request.nextUrl.searchParams);
  return NextResponse.redirect(destination, { status: 307, headers: { "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" } });
}

export const config = { matcher: ["/boka", "/boka/:slug"] };
