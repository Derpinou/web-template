import { readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Multi-page site: every .html file at the project root is built as a page,
// so adding a page never requires touching this config.
const pages = Object.fromEntries(
	readdirSync(import.meta.dirname)
		.filter((file) => file.endsWith('.html'))
		.map((file) => [basename(file, '.html'), resolve(import.meta.dirname, file)])
);

export default defineConfig({
	// 'mpa' disables the SPA fallback: unknown URLs 404 in dev like they do once deployed
	appType: 'mpa',
	plugins: [tailwindcss()],
	build: {
		rolldownOptions: { input: pages }
	}
});
