import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const page = '/src/routes/kb/incidents/4471-problems/+page.svx';
const out = resolve(root, 'rendered/4471-problems.html');

const vite = await createServer({
  configFile: resolve(root, 'vite.config.js'),
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { render } = await vite.ssrLoadModule('svelte/server');
  const mod = await vite.ssrLoadModule(page);
  const rendered = render(mod.default);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${rendered.head ?? ''}
</head>
<body>
${rendered.body ?? ''}
</body>
</html>
`;
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, html);
  const counts = [...html.matchAll(/<td>(\d+)<\/td>/g)].map((m) => m[1]);
  console.log('wrote', out);
  console.log('keys', Object.keys(rendered));
  console.log('td numbers', counts.join(','));
  if (!html.includes('desk ref')) {
    console.error('rendered page has no desk ref');
    process.exitCode = 1;
  }
} finally {
  await Promise.race([vite.close(), new Promise((resolve) => setTimeout(resolve, 500))]);
  process.exit(process.exitCode ?? 0);
}
