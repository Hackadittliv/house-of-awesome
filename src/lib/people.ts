// Patrik, Lucas och Rebecca: Lucas Eliasson (Picture Perfect), oktober 2026.
// Alexandra: Lucas Eliasson (Picture Perfect), november 2026.
// Anne: tillhandahållen referensbild, fotograf saknas i underlaget.
// Sandra: webbversion i public/images/team.
// Originalen ligger utanför repot. Annes webbversion ligger privat i src/assets;
// övriga webbversioner finns i public/images/team.

import type { AvatarImage } from "@/components/v2/ui";

export const PORTRAITS = {
  anne: { src: "/portratt/anne-wevers", alt: "Porträtt av Anne Wevers, hälsovetare och PNI-terapeut", unoptimized: true },
  patrik: { src: "/images/team/patrik-nilsson.webp", alt: "Porträtt av Patrik Nilsson, medgrundare av House of Awesome" },
  alexandra: { src: "/images/team/alexandra-schneider.webp", alt: "Porträtt av Alexandra Schneider, medgrundare av House of Awesome" },
  lucas: { src: "/images/team/lucas-eliasson.webp", alt: "Porträtt av Lucas Eliasson, coach i House of Awesome" },
  rebecca: { src: "/images/team/rebecca-gustafsson.webp", alt: "Porträtt av Rebecca Gustafsson, healingterapeut i House of Awesome" },
  sandra: { src: "/images/team/sandra-bengts.webp", alt: "Sandra Bengts, friskvårdsmassör" },
} satisfies Record<string, AvatarImage>;

export const founders = [
  {
    portrait: "alexandra",
    name: "Alexandra Schneider",
    role: "Medgrundare",
    text: "Ansvarar för innehåll och drift. Medförfattare till boken Allt ligger i livsstilen.",
    conversation: "Prata med Alexandra om stress, återhämtning och vanor som får plats i din vardag.",
    action: "Fråga efter en tid med Alexandra",
  },
  {
    portrait: "patrik",
    name: "Patrik Nilsson",
    role: "Medgrundare",
    text: "Certifierad Wim Hof Method-instruktör och trebarnspappa. Byggde tidigare ett åkeri med 200 lastbilar. Leder utveckling och partnerskap.",
    conversation: "Prata med Patrik om andning, kyla och vilka behandlingar du är nyfiken på att prova i huset.",
    action: "Boka samtal med Patrik",
  },
] as const;
