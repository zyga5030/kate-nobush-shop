# Kate Nobush Shop

Amazon affiliate link-in-bio shop, published free with GitHub Pages.

**Live:** https://zyga5030.github.io/kate-nobush-shop/

## Two files, never confused

| File | Purpose | Admin UI |
| --- | --- | --- |
| `Kate Nobush Shop.dc.html` | Private working copy, kept off GitHub | Yes |
| `docs/index.html` | The public site GitHub Pages serves | **No — never add admin UI here** |

Products live in the working copy's `localStorage` (`kn_products_v1`, `kn_reels_v2`).
The public site has them baked in as static markup. They do not sync on their own —
publishing *is* the sync step.

The published page carries no Add link, no Pin/Unpin, no delete, no admin gate, and
no `localStorage` writes. It keeps only search, category chips, Featured, the product
grid, the video row, follow buttons, and the affiliate disclosure.

## Publishing an update

1. Regenerate `docs/index.html` from the working copy with every product baked in.
2. Drop the three files into `docs/` here: `index.html`, `styles.css`, `avatar.jpg`.
3. Commit and push. The live page updates in about a minute.

## GitHub Pages setting

**Settings → Pages → Deploy from a branch** — branch `claude/push-index-github-pc3x7z`,
folder `/docs`.

`docs/.nojekyll` is required: without it Jekyll strips paths beginning with `_`.

## Notes that cost time to relearn

- TikTok thumbnail URLs are signed and expire in ~24h, so the page re-fetches them at
  runtime through oembed instead of hardcoding them. The profile photo is the
  exception — oembed does not serve profile pictures, so it ships as `docs/avatar.jpg`.
- A TikTok profile page returns no video list to any fetch; it renders client-side.
  Individual video URLs only.
- Amazon and TikTok both block scraping. When a fetch fails, the fix is to paste the
  title, price, and image URL by hand — never to invent them.
- Product photos stay full color with `object-fit: contain` on white. The design
  system's `.grayscale` treatment is for editorial imagery only; the clothes are the
  product, so the color is the point.

The workflow for adding products and videos is documented in
`skills/kate-nobush-shop/SKILL.md`.
