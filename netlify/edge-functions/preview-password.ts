// Förhandsvisningar använder en vanlig HTML-inloggning som fungerar även i
// mobilers inbyggda webbläsare. Produktion påverkas inte. Saknat lösenord nekar
// åtkomst. Befintliga HTTP Basic-klienter kan fortsätta använda samma lösenord.

type DeployContext = { deploy?: { context?: string }; next?: () => Promise<Response> };
declare const Netlify: { env: { get(name: string): string | undefined } };

export const PROTECTED_CONTEXTS = new Set(["deploy-preview", "branch-deploy"]);
const LOGIN_PATH = "/__preview-login";
const COOKIE_NAME = "__Host-hoa_preview";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const encoder = new TextEncoder();

function sameText(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return diff === 0;
}

export function previewAccess(deployContext: string | undefined, password: string | undefined, authorization: string | null): "pass" | "allow" | "deny" {
  if (!deployContext || !PROTECTED_CONTEXTS.has(deployContext)) return "pass";
  if (!password) return "deny";
  const match = authorization?.match(/^Basic\s+(.+)$/i);
  if (!match) return "deny";
  let decoded: string;
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(match[1].trim()), (char) => char.charCodeAt(0)));
  } catch {
    return "deny";
  }
  const separator = decoded.indexOf(":");
  if (separator < 0) return "deny";
  return sameText(decoded.slice(separator + 1), password) ? "allow" : "deny";
}

function safeReturnPath(value: string | null, origin: string): string {
  if (!value || value.length > 2048 || !value.startsWith("/") || value.startsWith("//")) return "/behovsanalys";
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return "/behovsanalys";
    const target = new URL(value, origin);
    if (target.origin !== origin || target.pathname === LOGIN_PATH) return "/behovsanalys";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/behovsanalys";
  }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]!);

function loginPage(returnTo: string, error = "", status = 401): Response {
  return new Response(`<!doctype html><html lang="sv"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Förhandsvisning | House of Awesome</title>
<style>*{box-sizing:border-box}body{margin:0;background:#171715;color:#f6f2e8;font-family:system-ui,sans-serif;min-height:100svh;display:grid;place-items:center;padding:24px}main{width:100%;max-width:440px;background:#24241f;border:1px solid #4c473a;border-radius:24px;padding:32px}header{font-weight:700;letter-spacing:.08em;color:#d8bb83;font-size:13px}h1{font-size:30px;line-height:1.15;letter-spacing:-.03em;margin:24px 0 16px}p{line-height:1.6;color:#d2d0c8}label{display:block;margin:24px 0 8px;font-weight:600}input,button{width:100%;min-height:52px;border-radius:10px;font:inherit}input{background:#f6f2e8;color:#171715;border:1px solid #b9b3a7;padding:12px}input:focus-visible,button:focus-visible{outline:3px solid #f6f2e8;outline-offset:4px}button{background:#d8bb83;border:0;color:#171715;font-weight:700;padding:14px;margin-top:20px;cursor:pointer}.error{color:#ffb9a6}.note{font-size:13px;margin-bottom:0}@media(max-width:380px){main{padding:24px}}</style>
</head><body><main><header>HOUSE OF AWESOME</header><h1>Se förhandsvisningen</h1>
<p>Ange lösenordet du fått för att se behovsanalysen.</p>
${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ""}
<form method="post" action="${LOGIN_PATH}"><input type="hidden" name="returnTo" value="${escapeHtml(returnTo)}">
<label for="password">Lösenord</label><input id="password" name="password" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required maxlength="256">
<button type="submit">Öppna förhandsvisningen</button></form>
<p class="note">Du hålls inloggad på den här enheten i sju dagar.</p></main></body></html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Vary": "Cookie, Authorization",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function sessionKey(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function createSession(password: string, hostname: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const signature = await crypto.subtle.sign("HMAC", await sessionKey(password), encoder.encode(`hoa-preview-v1\n${hostname}\n${expires}`));
  const hex = Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
  return `${expires}.${hex}`;
}

async function validSession(request: Request, password: string): Promise<boolean> {
  const cookie = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`));
  const token = cookie?.slice(COOKIE_NAME.length + 1);
  if (!token || !/^\d{10}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, signature] = token.split(".");
  const now = Math.floor(Date.now() / 1000);
  if (Number(expires) <= now || Number(expires) > now + SESSION_SECONDS) return false;
  const bytes = Uint8Array.from(signature.match(/../g)!, byte => parseInt(byte, 16));
  return crypto.subtle.verify("HMAC", await sessionKey(password), bytes, encoder.encode(`hoa-preview-v1\n${new URL(request.url).hostname}\n${expires}`));
}

async function readLoginBody(request: Request): Promise<string | null> {
  if (Number(request.headers.get("content-length")) > 4096) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const combined = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(combined);
}

export default async function previewPassword(request: Request, context: DeployContext) {
  if (!context.deploy?.context || !PROTECTED_CONTEXTS.has(context.deploy.context)) return;
  const url = new URL(request.url);
  // Explicitly public, read-only assessment review requested by Christian.
  // This deploy-only flag never opens other preview hosts.
  if (url.origin === "https://behovsanalys-review--house-of-awesome.netlify.app" && Netlify.env.get("HOA_PUBLIC_ASSESSMENT_REVIEW") === "true") {
    const response = await context.next?.();
    if (!response) return;
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  const password = Netlify.env.get("PREVIEW_PASSWORD");
  const returnTo = safeReturnPath(url.pathname + url.search, url.origin);
  if (!password) return loginPage(returnTo, "Förhandsvisningen är inte tillgänglig just nu.");

  if (url.pathname === LOGIN_PATH && request.method === "POST") {
    if (request.headers.get("origin") !== url.origin) return loginPage("/behovsanalys", "Öppna länken igen och försök på nytt.", 403);
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/x-www-form-urlencoded")) {
      return loginPage("/behovsanalys", "Inloggningen kunde inte läsas.", 400);
    }
    const body = await readLoginBody(request);
    if (body === null) return loginPage("/behovsanalys", "Inloggningen kunde inte läsas.", 400);
    const fields = new URLSearchParams(body);
    const target = safeReturnPath(fields.get("returnTo"), url.origin);
    const candidate = fields.get("password") ?? "";
    if (candidate.length > 256 || !sameText(candidate, password)) return loginPage(target, "Fel lösenord. Försök igen.");
    const token = await createSession(password, url.hostname);
    return new Response(null, {
      status: 303,
      headers: {
        "Location": target,
        "Set-Cookie": `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  if (previewAccess(context.deploy.context, password, request.headers.get("authorization")) === "allow") return;
  if (await validSession(request, password)) return;
  return loginPage(returnTo);
}

export const config = { path: "/*" };
