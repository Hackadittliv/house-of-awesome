import { headingParts } from "@/lib/heading";

/**
 * Rubriktext där ord med bindestreck eller snedstreck (Scalar-fält, 24/7-klinik) hålls ihop
 * på en rad så länge de ryms. Spannet är ett inline-block med högst rubrikens bredd: ryms ordet
 * inte ens på en egen rad (kraftigt förstorad text) bryts det vid bindestrecket, eller med
 * rubrikens overflow-wrap, i stället för att svämma över som med whitespace-nowrap.
 * Understrykning ärvs inte in i ett inline-block, därav text-decoration: inherit i titellänkar.
 * Texten ändras inte, så sökmotorer, skärmläsare och språkkontrollen ser samma ord.
 */
export function HeadingText({ text }: { text: string }) {
  return (
    <>
      {headingParts(text).map((part, i) =>
        part.keep ? (
          <span key={i} className="inline-block max-w-full [text-decoration:inherit]">
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
