// Bokningen körs mot Life Is Awesomes bokningsbackend (Supabase Edge Functions).
// Alla tre värden är publika: anon key och publishable key är gjorda för webbläsaren.
// Saknas de vid bygget länkar sajten vidare till lifeisawesome.se/boka som tidigare.

export const liaSupabaseUrl = (process.env.NEXT_PUBLIC_LIA_SUPABASE_URL ?? "").replace(/\/$/, "");
export const liaSupabaseAnonKey = process.env.NEXT_PUBLIC_LIA_SUPABASE_ANON_KEY ?? "";
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export const bookingEnabled = Boolean(liaSupabaseUrl && liaSupabaseAnonKey);

export const BOOKING_SITE = "hoa" as const;

/** Samma version som LIA:s formulär skickar, så att samma informationstext gäller. */
export const PRIVACY_NOTICE_VERSION = "consultation-contact-notice-v1" as const;
