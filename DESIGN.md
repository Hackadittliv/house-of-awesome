# House of Awesome — design tokens

LIA Dark Gold. Professionell klinik/showroom, inte spa-sage.

Tokens lever i CSS-variabler (`src/app/globals.css`) och mappas till Tailwind via `@theme inline`.

## Color

| Token | CSS | Value | Use |
| --- | --- | --- | --- |
| Background | `--hoa-bg` | `#0B0B0B` | Page canvas |
| Elevated | `--hoa-bg-elevated` | `#14110C` | Cards, footer, header panels |
| Muted surface | `--hoa-bg-muted` | `#1B1711` | Bands / secondary sections |
| Gold | `--hoa-gold` | `#D4AF5F` | Accent, links, CTA fill |
| Gold hover | `--hoa-gold-hover` | `#E4C77A` | Hover on gold |
| Gold dim | `--hoa-gold-dim` | `#8A7038` | Disabled / secondary gold |
| Ink | `--hoa-ink` | `#F4EFE4` | Primary text |
| Ink muted | `--hoa-ink-muted` | `#B8AE9A` | Body / meta |
| Line | `--hoa-line` | `#2A261C` | Borders |
| Danger | `--hoa-danger` | `#C45C4A` | Errors (reserved) |

Tailwind: `bg-hoa-bg`, `text-hoa-gold`, `border-hoa-line`, osv.

## Typography

| Role | Family | Notes |
| --- | --- | --- |
| Body | Geist (`--font-geist-sans`) | UI, brödtext |
| Display | Cormorant Garamond (`--font-display`) | H1 / sektionstitlar |

Svenska som enda UI-språk i fas 1 (`lang="sv"`).

## Layout

- Max width `72rem` (`max-w-6xl`)
- Horizontal padding `1rem` / `1.5rem`
- Sticky header (`top-0`, blur, near-black)
- Footer always at the bottom of the viewport (`flex` column on `body`)
- Cards: 1px `--hoa-line`, gold border on hover
- Buttons: compact, square-ish (`rounded-sm`), gold fill or gold outline

## Motion / chrome

- Minimal. Color transitions on links and cards only.
- Focus: 2px gold outline, 3px offset.
- No sage greens, no spa gradients, no stock wellness photography in fas 1.

## Imagery

Leverantörslogotyper och produktbilder kommer via content-fält (`logo`, `images`). Fas 1 visar initialer i en guld-ram när `logo` är `null`.
