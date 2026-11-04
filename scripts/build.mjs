import { build } from 'esbuild';
import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { personalities, types } from '../src/quiz.mjs';
import { makeArt } from './art.mjs';

let base = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:4174');
const parsed = new URL(base);
if (parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('SITE_URL must be a plain origin without credentials, path, query, or fragment.');
if (process.env.VERCEL && (parsed.protocol !== 'https:' || ['localhost','127.0.0.1'].includes(parsed.hostname) || parsed.hostname.endsWith('.example'))) throw new Error('Set SITE_URL to the real public HTTPS quiz origin before deploying.');
base = parsed.origin;
await makeArt();
await mkdir('dist', {recursive:true});
await cp('public', 'dist', {recursive:true});
await build({entryPoints:['src/app.jsx'],bundle:true,minify:true,outfile:'dist/app.js',external:['/assets/*'],define:{'process.env.NODE_ENV':'"production"'},target:['es2020']});
const template = await readFile('index.html','utf8');
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function html(title, description, path = '/') {
  const fields = {TITLE:title,DESCRIPTION:description,CANONICAL:`${base}${path}`,IMAGE:`${base}/assets/social-preview.png`};
  return template.replace(/__(TITLE|DESCRIPTION|CANONICAL|IMAGE)__/g, (_, key) => escape(fields[key]));
}
await writeFile('dist/index.html', html('What Type of Mover Are You? | GRVO', 'Five questions. Four moving personalities. Are you the planner, the last-minute mover, the sentimental packer, or the chill mover? Take the free GRVO quiz.'));
for (const type of types) {
  await mkdir(`dist/results/${type}`, {recursive:true});
  await writeFile(`dist/results/${type}/index.html`, html(`${personalities[type].title} | GRVO Moving Personality Quiz`, `${personalities[type].line} Discover your own moving personality in the free GRVO quiz.`, `/results/${type}/`));
}
await writeFile('dist/404.html', '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Box not found | GRVO</title><link rel="stylesheet" href="/app.css"><main class="no-script"><h1>This box went to the wrong address.</h1><p>That page could not be found. Your moving personality is still waiting.</p><a class="button primary" href="/">Take the GRVO quiz ↗</a></main></html>');
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/',...types.map(t => `/results/${t}/`)].map(path=>`<url><loc>${escape(base+path)}</loc></url>`).join('')}</urlset>`);
console.log(`Built GRVO quiz and four static result pages. Canonical origin: ${base}`);
