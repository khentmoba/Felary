# Felary

Khent's personal portfolio, project index, and Windows app downloads.

Repository: https://github.com/khentmoba/Felary

## Run locally

Requires Node.js 22 or later. No third-party npm dependencies.

```sh
npm ci
npm run dev
```

Open http://localhost:4321. Restart the server after editing source files.

```sh
npm test
npm run build
```

The production site is written to `dist/`. Serve that folder, not the repository root. No server, database, API key, or browser JavaScript is needed in production.

## Deploy to Cloudflare Pages

1. In Cloudflare, create a **Pages** project and connect the GitHub repository **khentmoba/Felary**.
2. Select the production branch **main**.
3. Framework preset: **None**.
4. Build command: `npm run build`.
5. Build output directory: `dist`.
6. If needed, set the build environment variable `NODE_VERSION` to `22`.
7. Deploy. Cloudflare assigns a `pages.dev` address; use the address it actually returns.

Subsequent pushes to main rebuild the site when Git integration is enabled. This is designed for static hosting without paid compute. Select the free plan and review current provider limits; a purchased custom domain is optional and may cost money. Installers stay on GitHub Releases, not Cloudflare.

Cloudflare has not been connected or deployed by this repository setup. No paid services or accounts were provisioned.

## Update content

- **Projects and downloads:** edit `src/projects.json`. Entries retain their display order.
- **Name, introduction, About text and metadata:** edit `src/index.html`.
- **Design:** edit `src/style.css`.
- **Browser security headers:** `src/_headers` (applied by Cloudflare Pages).

A project needs `name`, `repo` (repository name under khentmoba), `description`, `category` and `language`. For Windows downloads also supply `version`, `tag` and the exact GitHub release asset filename as `installer`. Omit all three download fields for a source-only project.

Downloads deliberately link to explicit versions. When publishing a newer release, update its tag, version and asset filename together, then rebuild. The separate latest-release links always lead to GitHub's newest release. Site builds do not automatically import new repositories or releases, and require no GitHub API requests.

Project descriptions and release filenames were checked against public GitHub metadata during setup. LUNA EXPRESS and SLSS have no supplied description; their entries use neutral source links rather than invented claims. No project screenshots, testimonials, employment history or contact details have been fabricated.

## Checks

GitHub Actions runs tests and a production build on pushes and pull requests. Tests cover project validation, escaped content, installer link generation, and production output. Desktop (1280px) and mobile (390px) were inspected locally with no horizontal overflow or missing section anchors.

Fonts load from Google Fonts with local system fallbacks. Core content and navigation remain available if font loading fails. No analytics, tracking scripts, forms or CMS are included.
