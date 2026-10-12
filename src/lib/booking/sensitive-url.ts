// Avbokningskoden (?avboka=) och Stripe-sessionen (?session_id=) ger tillgång till en
// bokning. Skriptet nedan körs först i <head>, före all annan kod: det flyttar värdena
// till sessionStorage och tar bort dem ur adressfältet, så att varken spårare, referrer
// eller webbläsarhistorik ser dem. Avbokningslänkar på /boka skickas vidare till /avboka.

export const CANCEL_TOKEN_KEY = "hoa-cancel-token";
export const CHECKOUT_SESSION_KEY = "hoa-checkout-session";

/** Sidor där GA och Meta aldrig laddas. */
export const TRACKING_FREE_PATHS = ["/avboka", "/boka/tack"] as const;

export function isTrackingFreePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return TRACKING_FREE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// Fristående skript utan beroenden, eftersom det körs innan Next.js har laddats.
export const scrubSensitiveParamsScript = `(function(){try{
var w=window,l=w.location,u=new URL(l.href),q=u.searchParams,c=q.get("avboka"),s=q.get("session_id");
if(c===null&&s===null)return;
function keep(k,v){try{if(v)w.sessionStorage.setItem(k,v);}catch(e){}}
if(c!==null){keep("${CANCEL_TOKEN_KEY}",c);q.delete("avboka");}
if(s!==null){keep("${CHECKOUT_SESSION_KEY}",s);q.delete("session_id");}
var rest=q.toString(),clean=u.pathname+(rest?"?"+rest:"")+u.hash;
w.history.replaceState(w.history.state,"",clean);
if(c!==null&&(u.pathname==="/boka"||u.pathname==="/boka/"))l.replace("/avboka");
}catch(e){}})();`;

const taken = new Map<string, string | null>();

/**
 * Läser ett värde som skriptet sparat och tar bort det direkt ur sessionStorage.
 * Värdet hålls bara i minnet under sidvisningen, så att React kan läsa det flera gånger.
 */
export function takeStoredValue(key: string): string | null {
  if (taken.has(key)) return taken.get(key) ?? null;
  let value: string | null = null;
  try {
    value = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
  } catch {
    value = null;
  }
  taken.set(key, value);
  return value;
}

/** Glömmer värdet i minnet när det är använt. */
export function forgetStoredValue(key: string): void {
  taken.set(key, null);
}
