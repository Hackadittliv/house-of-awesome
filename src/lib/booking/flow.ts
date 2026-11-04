import type { BookingInput, getAvailability } from "@/lib/booking/api";
import type { ServiceCopy } from "@/lib/types";

type BookingService = Pick<ServiceCopy, "slug" | "clinic">;

export function getAvailabilityArgs(service: BookingService, fromDate: string, toDate: string): Parameters<typeof getAvailability> {
  return [service.slug, fromDate, toDate, service.clinic];
}

export function getBookingInput(service: BookingService, guest: Omit<BookingInput, "eventTypeSlug" | "clinic">): BookingInput {
  return { ...guest, eventTypeSlug: service.slug, ...(service.clinic ? { clinic: service.clinic } : {}) };
}
