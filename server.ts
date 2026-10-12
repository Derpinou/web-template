import { createReadStream, existsSync, type Stats } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream';

const root = resolve(import.meta.dirname, 'dist');
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

const mimeTypes: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'application/xml; charset=utf-8',
	'.webmanifest': 'application/manifest+json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.pdf': 'application/pdf'
};

// Keep in sync with public/_headers (used by Cloudflare Pages)
const securityHeaders = {
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Frame-Options': 'SAMEORIGIN'
};

async function statFile(path: string): Promise<Stats | null> {
	const info = await stat(path).catch(() => null);
	return info?.isFile() ? info : null;
}

// Maps a URL path to a file of dist/. 'directory' means "/blog" was asked and blog/index.html exists.
async function lookup(pathname: string): Promise<{ file: string; info: Stats } | 'directory' | null> {
	const candidates = pathname.endsWith('/') ? [`${pathname}index.html`] : [pathname, `${pathname}.html`];
	for (const candidate of candidates) {
		const file = resolve(root, `.${candidate}`);
		if (!file.startsWith(root + sep)) {
			return null; // never serve anything outside dist/
		}
		const info = await statFile(file);
		if (info) {
			return { file, info };
		}
	}
	if (!pathname.endsWith('/') && await statFile(resolve(root, `.${pathname}`, 'index.html'))) {
		return 'directory';
	}
	return null;
}

function redirect(res: ServerResponse, location: string): void {
	// Collapse leading slashes: a Location starting with "//" would point to another host
	res.writeHead(308, { Location: `/${location.replace(/^\/+/, '')}` }).end();
}

function sendFile(req: IncomingMessage, res: ServerResponse, file: string, info: Stats, status = 200): void {
	const etag = `W/"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}"`;
	const headers = {
		...securityHeaders,
		'Content-Type': mimeTypes[extname(file).toLowerCase()] ?? 'application/octet-stream',
		'ETag': etag,
		// Vite fingerprints everything in assets/, so those files can be cached forever
		'Cache-Control': file.startsWith(resolve(root, 'assets') + sep) ? 'public, max-age=31536000, immutable' : 'no-cache'
	};

	if (status === 200 && req.headers['if-none-match']?.split(',').some((tag) => tag.trim() === etag)) {
		res.writeHead(304, headers).end();
		return;
	}
	res.writeHead(status, { ...headers, 'Content-Length': info.size });
	if (req.method === 'HEAD') {
		res.end();
		return;
	}
	pipeline(createReadStream(file), res, () => undefined);
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		res.writeHead(405, { Allow: 'GET, HEAD' }).end();
		return;
	}

	let url: URL;
	let pathname: string;
	try {
		url = new URL(req.url ?? '/', 'http://localhost');
		pathname = decodeURIComponent(url.pathname);
	} catch {
		res.writeHead(400).end();
		return;
	}

	// Canonical URLs, like Cloudflare Pages: /about.html -> /about and /blog/index.html -> /blog/
	if (url.pathname.endsWith('.html')) {
		const clean = url.pathname.endsWith('/index.html')
			? url.pathname.slice(0, -'index.html'.length)
			: url.pathname.slice(0, -'.html'.length);
		redirect(res, clean + url.search);
		return;
	}

	const found = await lookup(pathname);
	if (found === 'directory') {
		redirect(res, `${url.pathname}/${url.search}`);
	} else if (found) {
		sendFile(req, res, found.file, found.info);
	} else {
		const notFoundPage = resolve(root, '404.html');
		const info = await statFile(notFoundPage);
		if (info) {
			sendFile(req, res, notFoundPage, info, 404);
		} else {
			res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
		}
	}
}

if (!existsSync(root)) {
	console.error('dist/ not found: run `pnpm build` first.');
	process.exit(1);
}

const server = createServer((req, res) => {
	handle(req, res).catch(() => {
		if (res.headersSent) {
			res.destroy();
		} else {
			res.writeHead(500).end();
		}
	});
});

server.listen(port, host, () => {
	console.log(`Serving dist/ on http://${host}:${port}`);
});

// Stop cleanly
for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => server.close(() => process.exit(0)));
}
