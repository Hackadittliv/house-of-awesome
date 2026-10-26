// Porträtt fotade av Lucas Eliasson (Picture Perfect), oktober 2026.
// Originalen ligger utanför repot. Webbversionerna finns i public/images/team.

import type { CardImage } from "@/components/v2/ui";

export const PORTRAITS = {
  patrik: { src: "/images/team/patrik-nilsson.webp", alt: "Porträtt av Patrik Nilsson, medgrundare av House of Awesome" },
  lucas: { src: "/images/team/lucas-eliasson.webp", alt: "Porträtt av Lucas Eliasson, coach i House of Awesome" },
  rebecca: { src: "/images/team/rebecca-gustafsson.webp", alt: "Porträtt av Rebecca Gustafsson, healingterapeut i House of Awesome" },
} satisfies Record<string, CardImage>;
