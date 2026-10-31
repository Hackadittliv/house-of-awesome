// Lösenordsskydd för Netlifys förhandsvisningar (deploy-preview och branch-deploy).
// Produktion släpps alltid igenom. Lösenordet läses från miljövariabeln
// PREVIEW_PASSWORD, som bara är satt för förhandsvisningarnas kontexter.
// Saknas variabeln i en förhandsvisning nekas alla, så skyddet faller aldrig öppet.
// Användarnamnet kontrolleras inte; bara lösenordet.

type DeployContext = { deploy?: { context?: string } };
declare const Netlify: { env: { get(name: string): string | undefined } };

export const PROTECTED_CONTEXTS = new Set(["deploy-preview", "branch-deploy"]);

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

export default async function previewPassword(request: Request, context: DeployContext) {
  const access = previewAccess(context.deploy?.context, Netlify.env.get("PREVIEW_PASSWORD"), request.headers.get("authorization"));
  if (access !== "deny") return;
  return new Response("Förhandsvisningen kräver lösenord.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="House of Awesome forhandsvisning", charset="UTF-8"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = { path: "/*" };
