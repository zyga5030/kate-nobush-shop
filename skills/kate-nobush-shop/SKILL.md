---
name: kate-nobush-shop
description: Manage and publish Kate Nobush's Amazon affiliate link-in-bio shop. Adds products from Amazon URLs, adds TikTok videos, and rebuilds the public static site at docs/index.html for hosting. Trigger on "add this product", "add these products", "publish", "push the site live", "update the shop", "add this video", or any Amazon/TikTok link pasted with intent to add it to the shop.
---

# Kate Nobush Shop

Two-file system. Never confuse them.

| File | Purpose | Has admin UI |
|---|---|---|
| `Kate Nobush Shop.dc.html` | Kate's private working copy | Yes |
| `docs/index.html` | The public site that gets hosted | **No — never add admin UI here** |

Products live in the admin file's `localStorage` (`kn_products_v1`). The public site has them baked in as static HTML. They do not sync automatically — publishing is the sync step.

## Adding a product from an Amazon link

1. Fetch the page through a CORS proxy. Try in order until one returns >400 chars:
   - `https://api.allorigins.win/raw?url=<encoded>`
   - `https://corsproxy.io/?<encoded>`
   - `https://r.jina.ai/<url>`
2. Extract fields with these patterns, **in this order** (order matters — Amazon pages are full of recommended-product images that will otherwise be scraped by mistake):

   **Image** — main product slot only:
   ```
   id=["']landingImage["'][^>]*\sdata-old-hires=["']([^"']+)
   id=["']landingImage["'][^>]*\ssrc=["'](https://m\.media-amazon\.com/images/I/[^"']+)
   "colorImages"[\s\S]{0,600}?"hiRes"\s*:\s*"(https:[^"]+)"
   "colorImages"[\s\S]{0,600}?"large"\s*:\s*"(https:[^"]+)"
   <meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)
   ```
   Then: reject anything matching `/images/G/|sprite|grey-pixel|transparent-pixel|nav-sprite`, and normalize size with `.replace(/\._[A-Z0-9,_]+_\.jpg/i, '._AC_SL1000_.jpg')`.

   **Title** — `og:title`, then `id="productTitle"`. Clean it: strip trailing `at Amazon…`, strip trailing size parentheticals like `(Small, Navy)`, cap at ~90 chars.

   **Price** — `class="a-price"` span, then `"priceAmount":`, then a bare `$00.00`.

3. Assign a category from the title (Dresses, Tops, Bottoms, Activewear, Intimates, Outerwear, Shoes, Accessories).
4. Confirm the extracted title/price/image with Kate before saving — scrapes silently go wrong.

If the fetch is blocked, say so plainly and ask for the title/price rather than inventing values.

## Adding a TikTok video

Only individual video URLs work. `https://www.tiktok.com/oembed?url=<encoded>` returns the real thumbnail.

**A TikTok profile page returns no video list to any fetch** — it is rendered client-side inside TikTok's app. Auto-pulling "recent videos" is impossible. Never fake it with placeholder cards; ask for individual video links.

TikTok thumbnail URLs are signed and expire in ~24h, so the public site re-fetches them at runtime via oembed rather than hardcoding. The profile photo is the exception — it is downloaded and saved as `docs/avatar.jpg`, because oembed does not serve profile pictures.

## Publishing

When Kate says "publish" / "make it live":

1. Read current products from her browser: `localStorage.getItem('kn_products_v1')` and `kn_reels_v2`.
2. Regenerate `docs/index.html` with every product baked in as static markup.
3. **Strip all admin affordances** — no Add link, no + Video, no Pin/Unpin, no IMG button, no delete ×, no admin gate, no `localStorage` writes.
4. Keep: search, category chips, Featured section, product grid, video row, follow buttons, affiliate disclosure.
5. Offer the `docs` folder for download.

Kate uploads it herself — GitHub access here is read-only.

**Repo:** `zyga5030/kate-nobush-shop` → upload the three files in `docs/` to the repo root, then Settings → Pages → branch `main` / root. Lands at `zyga5030.github.io/kate-nobush-shop`.

**Faster alternative:** drag the `docs` folder onto https://app.netlify.com/drop.

## Design rules

Modernist design system: flat, Archivo, zero border-radius, 2px rules, single red accent (`#ec3013`) used sparingly. Product photos are **full color** with `object-fit: contain` on white — the system's `.grayscale` treatment is for editorial imagery only, never for products (Kate sells clothes; the color is the product).

Mobile-first, 680px max shell, 2-column product grid, 5-across video row.

## Honesty rules

Amazon and TikTok both actively block scraping. When something can't be fetched:
- Say so directly and explain why.
- Never fill the gap with invented titles, prices, or placeholder cards that look real.
- Offer the manual path (paste the image URL, type the price).

Verify claims before making them. Don't say a fetch worked without checking the returned value.
