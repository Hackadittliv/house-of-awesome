# Content v1

Repo-local JSON (CMS field names ready for a later Life Is Awesome extract). No CMS admin in Phase 1.

Longer page copy can move to MDX later; structured catalog stays JSON.

## Supplier

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | URL-segment under `/showroom/[leverantor]` |
| `name` | string | Display name |
| `logo` | string \| null | Asset path or remote URL |
| `blurb` | string | Short supplier text |
| `website` | string \| null | Official site |
| `order` | number | Sort key, ascending |

## Product

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | URL-segment under `/showroom/[leverantor]/[produkt]` |
| `supplier_id` | string | Matches `Supplier.slug` |
| `category` | `hbot` \| `ihht` \| `light` \| `heat` \| `cold` \| `training` \| `other` | |
| `name` | string | |
| `short` | string | Card / list teaser |
| `body` | string | Longer copy (plain or future MDX) |
| `specs` | object | Key/value spec pairs |
| `images` | string[] | Asset paths |
| `showroom` | boolean | Visible in showroom |
| `bookable_session` | boolean | Can map to a session |
| `order` | number | |

## Session

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | |
| `product_id` | string \| null | Optional product link |
| `name` | string | |
| `duration_min` | number \| null | |
| `price_single` | number \| null | SEK — leave null in Phase 1 |
| `price_10pack` | number \| null | SEK — leave null in Phase 1 |
| `book_url` | string | Prefer Life Is Awesome booking |
| `active` | boolean | |

Phase 1 catalog is intentionally empty besides routing stubs. Do not invent krona prices.
