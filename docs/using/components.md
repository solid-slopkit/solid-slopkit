# Using slopkit components in an app

This guide is for coding agents that add `@solid-slopkit/components` to a SolidJS 2.x app. It covers how to install it from npm, how to wire it up, and how to make the docs shipped in the package available to future agent sessions.

Repository: https://github.com/solid-slopkit/solid-slopkit (the package is in `packages/components`)

Docs site: https://solid-slopkit.github.io/solid-slopkit/components/. It is built from `main` and can be ahead of the latest release; the docs inside the installed package match the installed version, so prefer those.

## The package

`@solid-slopkit/components` is the components, theming (CSS variables) and the `SlopkitUi` provider: layout, inputs, overlays, data display. It takes `@solid-slopkit/i18n` as a peer dependency, and `<SlopkitUi>` formats with the active locale of the nearest `<I18nProvider>`. Form state (`@solid-slopkit/signal-forms`) and translations (`@solid-slopkit/i18n`) are separate packages that work with it through props: a forms binding fits an input, and i18n messages go into components' text props.

It needs `solid-js` and `@solidjs/web` 2.x, which a Solid 2 app already has. It ships uncompiled JSX under the `solid` export condition, so the app compiles it with its own Solid plugin (`@solidjs/vite-plugin`). This needs no configuration.

## 1. Install

```bash
pnpm add @solid-slopkit/components
```

If the app uses `@solid-slopkit/components/carousel`, also install its peer dependency, `embla-carousel`.

## 2. Set it up

The package has an index for agents at `node_modules/@solid-slopkit/components/dist/source/llms.md`: setup, the API, and links to a reference for every component. Read it. The steps below are only the wiring that has to happen once.

Wrap the app's root component in the provider, and import the two stylesheets there once. In the `pnpm create solid` templates that is `src/App.tsx`, around the `<Router>`. Don't use `src/Document.tsx`: that is the HTML shell, and it ships no client JS.

```tsx
import { SlopkitUi } from '@solid-slopkit/components';
import '@solid-slopkit/components/styles/slopkit.css';
import '@solid-slopkit/components/styles/default-theme.css';

export default function App() {
  return (
    <SlopkitUi>
      <Router>{/* … */}</Router>
    </SlopkitUi>
  );
}
```

- Component rules sit in `@layer slopkit.components`, so any unlayered app CSS overrides them. The template's `src/App.css` styles `body`, `main` and links. Remove what the app doesn't need, or it will fight the theme.
- If the app renders on the server with the Vite dev server (`@solidjs/vite-plugin` in start mode: `solid({ start: true, ssr: true })`), add the package to the plugin's dev CSS crawl in `vite.config.ts`. Without it, every component is unstyled for about a second after each reload in dev. The plugin inlines the CSS it finds in the server module graph into `<head>`, but skips `node_modules` by default, so each component's CSS module (imported from inside the package) only arrives once the client JS has loaded. The two stylesheets above are not affected, because the app imports them itself. The object replaces `start: true` and enables start mode too; everything else in `node_modules` stays excluded. Production builds and client-only apps don't need this.

  ```ts
  solid({
    start: { css: { filter: { include: /@solid-slopkit\/components/ } } },
    ssr: true,
    // …the app's other options
  }),
  ```

- `@solid-slopkit/components` exports a `Title` component, and the templates already import `Title` from `@solidjs/meta` (the document title). Rename one of them on import where both are used: `import { Title as PageTitle } from '@solidjs/meta'`.

## 3. Make the package docs available to later sessions

The package ships skills (task guides, `skills/<area>/SKILL.md`) and LLM references (the `llms.md` index and the pages it links). Both always match the installed version. Tell future agents about them in the app's agent instructions: add this section to `AGENTS.md`. Create the file if the app has none. If the file has a generated block (the templates' `<!-- BEGIN solid-2.0-primer -->` … `<!-- END solid-2.0-primer -->`), add the section after it, never inside it.

```markdown
## slopkit components

This app uses `@solid-slopkit/components`, installed from npm. To upgrade, run `pnpm up @solid-slopkit/components --latest`.

Read the docs inside the installed package, not the web; they match the installed version:

- `node_modules/@solid-slopkit/components/dist/source/llms.md`: one reference per component, the provider, theming. Skills: `node_modules/@solid-slopkit/components/skills/theming/SKILL.md`, `node_modules/@solid-slopkit/components/skills/layout/SKILL.md`.

Before working with a component, read the skill for the task first, then the reference for each component you use.
```

**Claude Code** reads `CLAUDE.md`, not `AGENTS.md`. If the app has no `CLAUDE.md`, create one that contains the line `@AGENTS.md`. To make the skills load on their own when a task matches them, also link each one into `.claude/skills`:

```bash
mkdir -p .claude/skills
for skill in node_modules/@solid-slopkit/*/skills/*/; do
  ln -sfn "../../$skill" ".claude/skills/$(sed -n 's/^name: //p' "$skill/SKILL.md")"
done
```

Commit the links. They are relative and point into `node_modules`, so they resolve after `pnpm install` on any clone and follow upgrades. Run the loop again after an upgrade, to pick up new skills.

## 4. Check it works

1. `pnpm build` succeeds, and `pnpm exec tsc --noEmit` reports no errors.
2. `pnpm dev`, open the app, and check that the components render with the theme applied and the browser console shows no errors.
