# Kate Nobush Shop

A static shop page published free with GitHub Pages, edited through an admin panel
that only ever runs on your own machine.

## How the split works

GitHub Pages serves static files — there is no server, so anything shipped to a
visitor's browser is readable by anyone. The admin features therefore aren't hidden
behind a password; they're simply **not built into the published page**.

| Folder | What it is | Published? |
| --- | --- | --- |
| `admin/` | The editor: pin/unpin, ad links, images, add/delete/reorder | No |
| `src/` | Content (`data.json`), page template, stylesheet | No |
| `docs/` | The built public site — plain HTML and CSS | **Yes** |

`build.mjs` renders `src/` into `docs/`. It never reads `admin/`, so no editing UI
can reach the live site. Products marked *hidden* are dropped during the build and
never appear in the published HTML at all.

## Editing the shop

```bash
npm run dev        # starts a local server on http://localhost:8080
```

Then open **http://localhost:8080/admin/**.

1. Edit the shop name, tagline, accent color, social links, and products.
2. Toggle **Pinned** to move an item into the Featured row; **Hidden** to keep it
   off the site entirely.
3. Click **Download data.json** and save the file over `src/data.json`.
4. Rebuild and publish:

```bash
npm run build
git add -A
git commit -m "Update shop content"
git push
```

The live page updates within a minute or so.

Your edits autosave to the browser's local storage as you type, so closing the tab
won't lose them. **Download data.json** is what makes them real — nothing is
published until you save that file and rebuild.

> Open the admin through `npm run dev`, not by double-clicking the HTML file.
> Browsers block `fetch()` on `file://` URLs, so it can't read `src/data.json`
> otherwise. (If you do open it directly, use **Load file…** to pick `data.json`
> by hand.)

## Turning on GitHub Pages

In the repository: **Settings → Pages → Build and deployment**

- Source: **Deploy from a branch**
- Branch: `claude/push-index-github-pc3x7z`, folder: **`/docs`**
- Save.

The URL will be `https://zyga5030.github.io/kate-nobush-shop/`. First publish takes
a couple of minutes.

## Product fields

| Field | Notes |
| --- | --- |
| `title` | Card heading |
| `description` | Short blurb under the title |
| `image` | Full image URL. Leave empty for a lettered color tile. |
| `price` | Free text — `$24`, `From $12`, or blank |
| `url` | Ad / affiliate link. Rendered with `rel="sponsored noopener"`. |
| `badge` | Small corner label such as `Bestseller`. Blank for none. |
| `pinned` | Shows in the Featured row |
| `hidden` | Excluded from the build entirely |

Only `http(s)` links are accepted for `url` and `image`; anything else is dropped at
build time.
