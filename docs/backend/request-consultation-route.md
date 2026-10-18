# Förfrågan till Rebecca: ändring i LIA:s request-consultation

HOA skickar `route: "rebecca"` i förfrågan från `/boka/forfragan/rebecca`.
Dagens funktion i LIA (`supabase/functions/request-consultation/index.ts`) ignorerar okända fält
(zod tar bort dem), så förfrågan går än så länge till `info@lifeisawesome.se` som alla andra.

För att Rebecca ska få mejlet direkt behövs en vitlista på servern (adressen ska aldrig komma från webbläsaren):

```ts
const ROUTE_RECIPIENTS: Record<string, string> = { rebecca: "annieorebecca@gmail.com" };
// i BodySchema:
route: z.enum(["rebecca"]).optional().nullable(),
// vid internmejlet:
to: [data.route ? ROUTE_RECIPIENTS[data.route] : INTERNAL_TO],
// gärna även bcc: [INTERNAL_TO] så att huset ser förfrågan
```
