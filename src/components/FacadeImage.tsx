import { getImageProps } from "next/image";
import { preload } from "react-dom";

// Fasaden finns färdig i tre bredder i public/images. <Image> ignorerar srcSet och bygger
// en egen via bildoptimeringen, så getImageProps ger attributen och srcset pekar på filerna.
export const FACADE_WIDTHS = [800, 1440, 2400] as const;
export const FACADE_SRC_SET = FACADE_WIDTHS.map((w) => `/images/house-of-awesome-fasad-${w}.webp ${w}w`).join(", ");
export const FACADE_ALT =
  "Fasaden på House of Awesome i Stora Höga: ett vitt hus med stora fönster i två våningar och skylten House of Awesome högst upp";

const sizes = "100vw";

/** Fasaden i full bredd. Bredd och höjd ger rätt proportioner innan bilden laddats. */
export function FacadeImage({ className = "" }: { className?: string }) {
  const { props } = getImageProps({
    src: "/images/house-of-awesome-fasad-1440.webp",
    alt: FACADE_ALT,
    width: 2400,
    height: 1666,
    unoptimized: true,
    loading: "eager",
    fetchPriority: "high",
  });
  // Samma förladdning som next/image gör med preload, med husets egna storlekar.
  preload(props.src, { as: "image", imageSrcSet: FACADE_SRC_SET, imageSizes: sizes, fetchPriority: "high" });

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={FACADE_ALT} srcSet={FACADE_SRC_SET} sizes={sizes} className={`block h-auto w-full ${className}`} />
  );
}
