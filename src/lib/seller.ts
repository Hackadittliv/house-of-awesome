// Säljaren bakom House of Awesome. Betalningar tas emot av Life Is Awesome AB via deras Stripekonto,
// så samma rader visas i sidfoten, vid betalning och i integritetspolicyn.
import siteData from "../../content/site.json";

const { legalName, orgNr, termsUrl } = siteData.operator;

export const sellerLine = `House of Awesome drivs av ${legalName}, org.nr ${orgNr}.`;
export const paymentReceiverLine = `Betalningen tas emot av ${legalName} och visas som Life Is Awesome på ditt kontoutdrag.`;
export const termsLabel = "Köpvillkor";
export const sellerTermsUrl = termsUrl;
