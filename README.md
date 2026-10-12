# web-template

A starter for static websites, built with Vite 8, TypeScript and Tailwind CSS 4
The site builds into `dist/`, ready to be deployed on Cloudflare Pages

## Requirements

- [Node.js](https://nodejs.org) 22.18 or newer (24 recommended)
- [pnpm](https://pnpm.io)

## Installation

```bash
git clone https://github.com/Derpinou/web-template.git my-site
cd my-site
rm -rf .git && git init   # optional: start with a fresh git history
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The site is now running at http://localhost:5173.

Then make it yours: update the `name` in `package.json`, the `lang`, `<title>` and meta tags of the HTML pages, `public/favicon.svg`, the `--color-brand` color in `src/style.css` and the `Sitemap` line in `public/robots.txt` (commented out by default).

## Configuration

The site runs without any configuration. If it calls a backend API, copy the example environment file and set the base URL of your API:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of your backend API (optional) |

`VITE_*` variables end up in the public JavaScript: never put secrets in them.

## Deployment

### Node.js

```bash
pnpm install
pnpm build
pnpm start
```

The server listens on port `3000` on all interfaces by default. Set the `PORT` and `HOST` environment variables to change it.
It does not handle TLS or compression: put a reverse proxy or a CDN in front of it.
The build needs the development dependencies, so don't install with `--prod`.

### Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `24` |

Add `NODE_VERSION` in Settings > Environment variables, for both Production and Preview. Without it, Pages builds with its default Node.js version.
