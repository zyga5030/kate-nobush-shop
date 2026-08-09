#!/usr/bin/env node
/**
 * Tiny zero-dependency static server for local work.
 *
 * The admin panel reads src/data.json with fetch(), which browsers block on
 * file:// URLs — so open it through here rather than double-clicking the HTML.
 *
 * Usage: node serve.mjs [port]
 */

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2]) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  // normalize() collapses any ../ before we join, keeping requests inside root.
  let target = join(root, normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));

  try {
    if (statSync(target).isDirectory()) target = join(target, 'index.html');
    const type = TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream';
    response.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('404 Not Found');
  }
}).listen(port, () => {
  console.log(`\n  Admin panel   http://localhost:${port}/admin/`);
  console.log(`  Public site   http://localhost:${port}/docs/\n`);
  console.log('  Ctrl+C to stop.\n');
});
