# Felary

Khent's black-and-silver personal portfolio, illustrated application introductions, and Windows app downloads.

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

The production site is written to `dist/`. Serve that folder, not the repository root. No server, database, or API key is needed in production. A small local JavaScript module enhances the app spotlight with keyboard-accessible tabs. Without JavaScript, the introduction, app stories, pictures, source links and downloads remain available through native anchor links.

## App pages

Each featured app has its own site at `/apps/<name>/`: `/apps/felaris/`, `/apps/speakflow/`, `/apps/cinder/` and `/apps/everglow/`. A page has a hero with the app icon, name, summary and download button; a full-width screenshot and key facts; the same scroll-driven feature tour as the homepage; detail sections (feature grids, or tables such as SpeakFlow's engines and Felaris' shortcuts); a download block with requirements, extra assets and release links; and links to the other apps. The homepage spotlight, story titles and download rows link to these pages.

Pages are generated at build time from each project's `page` object in `src/projects.json`: `summary`, `icon` with `iconWidth`/`iconHeight`, `facts` (`label`/`value`), `sections` (each with a unique `id`, a `title`, an optional `intro`, and either `items` of `title`/`text` or a `table` of `columns`/`rows`), `requirements`, optional `extras` (other `.exe` assets from the same release) and an optional `note`. The URL comes from the app name. A `page` requires a `showcase`. The build validates the shape and checks that the icon exists.

## Scroll-driven exhibition

On supporting browsers, app screenshots rise and scale into their plates while thin silver progress lines and readable feature emphasis follow scrolling in both directions. These effects work on narrow previews and phones too. On desktop viewports at least 900px wide and 700px tall, screenshots additionally stay in view while their introductions and features scroll past. A small IntersectionObserver controller switches feature screenshots in the existing JavaScript module; no runtime dependency or paid service is added.

Phones and short viewports keep a compact, unpinned layout with scroll animations. Reduced-motion settings and browsers without CSS view-timeline support keep the static layout. Each of the nine feature statements has a matching screenshot. On the enhanced desktop layout, the sticky plate crossfades to the current feature, highlights its text, and updates its caption/full-image link. On compact or reduced-motion layouts, without JavaScript, or without timeline support, all feature pictures appear inline. Content is never hidden awaiting animation. Supporting browsers retain the exhibition even when JavaScript is disabled. Header links still jump directly to app stories and downloads; the opening tabs remain user-controlled.

Native-browser verification covered all three sticky figures, their release into the next story, reversible scroll progress, visible image transforms in the 539px embedded preview, mobile animations, reduced-motion fallbacks, short viewports, the keyboard-operated spotlight, JavaScript disabled, and native Downloads anchor placement. Checks ran in local Chrome, not Safari/Firefox or physical mobile hardware. Motion styling is in `src/style.css`.

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

- **Projects, app introductions and downloads:** edit `src/projects.json`. Entries retain their display order.
- **Screenshots and artwork:** add files under `src/assets/`. The three app introductions use a `showcase` object with a headline, introduction, feature list, image filename, alt text, caption, pixel dimensions, short label and plate tone. Omit `showcase` for a source-only project. See the existing entries for the shape.
- **Spotlight and feature-gallery behavior:** `src/showcase.js`; arrow keys, Home and End select applications. Feature galleries follow the reading position using IntersectionObserver, not wheel interception. No autoplay.
- **Name, introduction, About text and metadata:** edit `src/index.html`.
- **Design:** edit `src/style.css`.
- **Browser security headers:** `src/_headers` (applied by Cloudflare Pages).

A project needs `name`, `repo` (repository name under khentmoba), `description`, `category` and `language`. For Windows downloads also supply `version`, `tag` and the exact GitHub release asset filename as `installer`. Omit all three download fields for a source-only project. To add scroll-linked feature images, supply `showcase.scenes` in the same order and count as `showcase.features`; each scene uses `image`, `imageAlt`, `imageCaption`, `imageWidth` and `imageHeight`. The build validates the mapping, safe filenames, dimensions and asset presence.

Downloads deliberately link to explicit versions. When publishing a newer release, update its tag, version and asset filename together, then rebuild. The separate latest-release links always lead to GitHub's newest release. Site builds do not automatically import new repositories or releases, and require no GitHub API requests.

Project descriptions and release filenames were checked against public GitHub metadata during setup. LUNA EXPRESS and SLSS have no supplied description; their entries use neutral source links rather than invented claims. SpeakFlow demonstrates its actual listening state, cloud-engine selector and rewritten-result comparison using a mocked backend, not real audio or cloud requests. Cinder shows actual agent filtering, date-range usage and its update dialog with clearly labeled synthetic data. Everglow introduces cinema, anime, books, manga and manhwa using only public-section demo/guest UI. The reading preview shows MangaCelestia, not the separate books section. The former private sign-in image is removed from the current build; Git history has not been rewritten. Image sources, pinned commits, font origins and licenses are recorded in `src/assets/SOURCES.md`. No testimonials, employment history or contact details have been fabricated.

## Checks

GitHub Actions runs tests and a production build on pushes and pull requests. Nine tests cover content validation, escaped text, installer URLs, matched spotlight choices/panels, keyboard-selection logic, feature/frame mapping and reverse selection, public-only Everglow copy, motion enhancement guards, unique anchors, all scene dimensions, local font files, security headers and production output. Native Chrome checks also verified all nine scroll-driven scene changes, captions and original-image links, reverse scrolling, 539px/390px inline layouts, reduced motion, JavaScript disabled, direct download anchors, and a broken-image fallback. Browser checks covered 320px, 390px, 1280px and 1440px without horizontal overflow. App selection and arrow-key focus were checked in the browser. Visual inspection was performed in-thread, not by an independent design reviewer; captured views cover the opening and the SpeakFlow introduction rather than a full-page cross-browser audit.

Fonts and images are served locally, with no runtime CDN or GitHub API dependency. Font licenses are included. No analytics, tracking scripts, forms or CMS are included.

The approved visual direction is documented in `DESIGN.md`, `.impeccable/design.json`, and `.impeccable/surfaces/src-index-html.md`. Deployment settings are unchanged.
