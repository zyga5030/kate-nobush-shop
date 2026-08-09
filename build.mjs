#!/usr/bin/env node
/**
 * Builds the public site into docs/ (the folder GitHub Pages serves).
 *
 * Everything the public page needs is rendered here, ahead of time. The admin
 * panel in admin/ is never read, copied, or referenced by this script, so no
 * editing UI can reach the published site.
 *
 * Usage: node build.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, 'src');
const OUT = join(root, 'docs');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Only allow link targets that are safe to drop into an href. */
const safeUrl = (value) => {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (/^(https?:|mailto:|\/|\.\/|#)/i.test(url)) return url;
  return '';
};

const initial = (title) => (String(title ?? '').trim()[0] || '?').toUpperCase();

function renderCard(product) {
  const url = safeUrl(product.url);
  const title = escapeHtml(product.title);
  const linkAttrs = url
    ? ` href="${escapeHtml(url)}" target="_blank" rel="noopener sponsored"`
    : '';
  const tag = url ? 'a' : 'div';

  const media = safeUrl(product.image)
    ? `<img src="${escapeHtml(safeUrl(product.image))}" alt="${title}" loading="lazy" decoding="async">`
    : `<div class="placeholder" aria-hidden="true">${escapeHtml(initial(product.title))}</div>`;

  const badge = product.badge
    ? `<span class="badge">${escapeHtml(product.badge)}</span>`
    : '';

  const price = product.price
    ? `<span class="price">${escapeHtml(product.price)}</span>`
    : '<span></span>';

  const cta = url
    ? `<a class="btn"${linkAttrs}>View</a>`
    : '';

  const description = product.description
    ? `<p>${escapeHtml(product.description)}</p>`
    : '';

  const searchKey = escapeHtml(
    [product.title, product.description, product.badge].filter(Boolean).join(' ').toLowerCase()
  );

  return `      <li class="card" data-search="${searchKey}">
        <${tag} class="card-media"${linkAttrs}>${media}${badge}</${tag}>
        <div class="card-body">
          <h3><${tag}${linkAttrs}>${title}</${tag}></h3>
          ${description}
          <div class="card-foot">${price}${cta}</div>
        </div>
      </li>`;
}

function renderSocial(links = []) {
  return links
    .filter((link) => link && link.label && safeUrl(link.url))
    .map(
      (link) =>
        `<a href="${escapeHtml(safeUrl(link.url))}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`
    )
    .join('\n      ');
}

function build() {
  const data = JSON.parse(readFileSync(join(SRC, 'data.json'), 'utf8'));
  const template = readFileSync(join(SRC, 'template.html'), 'utf8');
  const site = data.site ?? {};

  // Hidden products are dropped here, so they never appear in the published HTML.
  const visible = (data.products ?? []).filter((product) => !product.hidden);
  const pinned = visible.filter((product) => product.pinned);
  const rest = visible.filter((product) => !product.pinned);

  const featuredSection = pinned.length
    ? `<div class="toolbar"><h2 class="section-title">Featured</h2></div>
    <ul class="grid featured">
${pinned.map(renderCard).join('\n')}
    </ul>`
    : '';

  const accent = /^#[0-9a-f]{3,8}$/i.test(String(site.accent ?? '')) ? site.accent : '#c2410c';

  const html = template
    .replaceAll('{{socialLinks}}', renderSocial(site.links))
    .replaceAll('{{featuredSection}}', featuredSection)
    .replaceAll('{{allCards}}', rest.map(renderCard).join('\n'))
    .replaceAll('{{accentEncoded}}', encodeURIComponent(accent))
    .replaceAll('{{accent}}', accent)
    .replaceAll('{{name}}', escapeHtml(site.name ?? 'Shop'))
    .replaceAll('{{tagline}}', escapeHtml(site.tagline ?? ''))
    .replaceAll('{{description}}', escapeHtml(site.description ?? ''))
    .replaceAll('{{footerNote}}', escapeHtml(site.footerNote ?? ''))
    .replaceAll('{{year}}', String(new Date().getFullYear()));

  const leftover = html.match(/\{\{[a-zA-Z]+\}\}/g);
  if (leftover) {
    throw new Error(`Unreplaced template tokens: ${[...new Set(leftover)].join(', ')}`);
  }

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'index.html'), html);
  copyFileSync(join(SRC, 'styles.css'), join(OUT, 'styles.css'));
  writeFileSync(join(OUT, '.nojekyll'), '');

  console.log(
    `Built docs/index.html — ${pinned.length} featured, ${rest.length} in grid` +
      `${visible.length !== (data.products ?? []).length ? `, ${(data.products ?? []).length - visible.length} hidden and excluded` : ''}.`
  );
}

build();
