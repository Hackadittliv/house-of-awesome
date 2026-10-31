import { headingParts } from "@/lib/heading";

/**
 * Rubriktext där ord med bindestreck eller snedstreck (Scalar-fält, 24/7-klinik) hålls ihop
 * på en rad. Texten ändras inte, så sökmotorer, skärmläsare och språkkontrollen ser samma ord.
 */
export function HeadingText({ text }: { text: string }) {
  return (
    <>
      {headingParts(text).map((part, i) =>
        part.keep ? (
          <span key={i} className="whitespace-nowrap">
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
