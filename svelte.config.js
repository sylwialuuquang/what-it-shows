import { mdsvex } from 'mdsvex';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
const config = {
  extensions: ['.svelte', '.svx'],
  compilerOptions: {
    css: 'injected',
  },
  preprocess: [
    mdsvex({
      extensions: ['.svx'],
      layout: {
        runbook: join(root, 'src/lib/layouts/runbook.svelte'),
      },
      layoutPropForwarding: 'runes',
    }),
  ],
};

export default config;
