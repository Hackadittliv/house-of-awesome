// Patrik, Lucas och Rebecca: Lucas Eliasson (Picture Perfect), oktober 2026.
// Anne: tillhandahållen referensbild, fotograf saknas i underlaget.
// Originalen ligger utanför repot. Webbversionerna finns i public/images/team.

import type { CardImage } from "@/components/v2/ui";

export const PORTRAITS = {
  anne: { src: "/images/team/anne-wevers.webp", alt: "Porträtt av Anne Wevers, hälsovetare och PNI-terapeut" },
  patrik: { src: "/images/team/patrik-nilsson.webp", alt: "Porträtt av Patrik Nilsson, medgrundare av House of Awesome" },
  lucas: { src: "/images/team/lucas-eliasson.webp", alt: "Porträtt av Lucas Eliasson, coach i House of Awesome" },
  rebecca: { src: "/images/team/rebecca-gustafsson.webp", alt: "Porträtt av Rebecca Gustafsson, healingterapeut i House of Awesome" },
} satisfies Record<string, CardImage>;
