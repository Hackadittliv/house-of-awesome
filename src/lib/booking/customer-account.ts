import { liaSupabaseAnonKey, liaSupabaseUrl } from "@/lib/booking/config";

export type CustomerAccount = { userId: string; email: string; accessToken: string; expiresAt: number };

export function isCustomerAccountDocument(): boolean {
  return typeof window !== "undefined" && (window as Window & { __hoaCustomerAccountDocument?: boolean }).__hoaCustomerAccountDocument === true;
}

export async function signInCustomer(email: string, password: string): Promise<CustomerAccount> {
  const response = await fetch(liaSupabaseUrl + "/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { apikey: liaSupabaseAnonKey, "Content-Type": "application/json" },
    cache: "no-store",
    referrerPolicy: "no-referrer",
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (!response.ok) throw new Error("Inloggningen misslyckades.");
  const data = await response.json();
  const user = data?.user;
  if (typeof user?.id !== "string" || !user.email_confirmed_at || user.is_anonymous === true ||
      typeof user.email !== "string" || !user.email.trim() || typeof data.access_token !== "string" || !data.access_token ||
      !Number.isFinite(data.expires_in) || data.expires_in <= 0) throw new Error("Kontot behöver en bekräftad e-postadress.");
  return { userId: user.id, email: user.email.trim(), accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
}

export function customerToken(account: CustomerAccount | null | undefined, buyerEmail: string): string | undefined {
  if (!account) return undefined;
  if (!account.accessToken || account.expiresAt <= Date.now() || account.email.toLowerCase() !== buyerEmail.trim().toLowerCase()) {
    throw new Error("Logga in på ditt konto igen.");
  }
  return account.accessToken;
}
