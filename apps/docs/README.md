## slopkit docs

Documentation site for every `@solid-slopkit` package: header + sidebar + main content, built with SolidJS 2, `@solidjs/router` file-system routes and `vite`.

```bash
pnpm dev
```

In dev and in the tests, every `@solid-slopkit` package resolves to its source through the `@solid-slopkit/source` export condition (see `vite.config.ts`), so edits to any package show up immediately. The production build leaves the condition out and consumes each package's `dist`, so build the packages (`pnpm build` at the root) before `pnpm build` here.

## GitHub Pages

The site is published at https://solid-slopkit.github.io/solid-slopkit/ by `.github/workflows/docs.yml` on every push to `main`. The workflow builds with `DOCS_BASE=/solid-slopkit/` (Vite's `base`), then `pnpm prerender` (`prerender.js`) renders every route file through the built SSR handler into `dist/client/<path>/index.html`, plus `404.html`. The pages hydrate as they do under `server.js`. To check a Pages build locally, build the packages first, then:

```bash
DOCS_BASE=/solid-slopkit/ pnpm build && DOCS_BASE=/solid-slopkit/ pnpm prerender
```

Because the site lives under a base path, internal links go through `withBase()` from `src/base.ts`: `<a href={withBase('/components/button')}>`. The router only handles anchors under its base, so a bare `href="/components/button"` works in dev and breaks on Pages. `navigate()` adds the base itself. Compare the current location to a docs path with `isPath()`, which ignores the trailing slash Pages adds. Example images are imported (`import landscape from '../example-landscape.svg'`) so Vite puts them under the base too.

## Structure

- `src/routes/` — pages, one folder per package: `components/button.tsx` is `/components/button`, `flow/index.tsx` is `/flow`. `index.tsx` is the home page and `[...404].tsx` catches everything else. `prerender.js` builds one static page per route file.
- `src/nav/` — the packages (`index.ts`) and each package's sidebar (`<package>.ts`). Add an entry when you add a page. The sidebar shows the current package's pages, and the search covers every package.
- `src/layout/` — the shell: header, sidebar (a drawer below 768px) with the package picker, and main area.
- `src/components/` — doc building blocks:
  - `Example` renders a live example above its source.
  - `CodeBlock` highlights with shiki, lazy-loaded with only tsx, css and bash.
  - `PropsTable` / `CssVarsTable` render API tables.
  - `H2` is a linkable section heading.
- `src/examples/<package>/` — one file per example (components' are grouped further by component). Pages import each twice: the default export to render it, and `?raw` to show its source, so the code shown is always the code that runs.
- `src/create/` — the components' theme builder, at `/components/create`.

The docs chrome in `src/App.css` only uses the slopkit theme tokens.
