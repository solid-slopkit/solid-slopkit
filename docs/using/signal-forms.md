# Using slopkit signal forms in an app

This guide is for coding agents that add `@solid-slopkit/signal-forms` to a SolidJS 2.x app. It covers how to install it from npm and how to make the docs shipped in the package available to future agent sessions.

Repository: https://github.com/solid-slopkit/solid-slopkit (the package is in `packages/signal-forms`)

Docs site: https://solid-slopkit.github.io/solid-slopkit/signal-forms/. It is built from `main` and can be ahead of the latest release; the docs inside the installed package match the installed version, so prefer those.

## The package

`@solid-slopkit/signal-forms` is schema-driven form state: a Solid store is the model, rules (validation, conditions, metadata) are attached to paths in a schema function, and every field's state is a signal. It depends on no other `@solid-slopkit` package. Its `bind(field)` returns exactly the props a `@solid-slopkit/components` input takes, and `control(field)` binds native elements, so it works with or without the components.

It needs `solid-js` and `@solidjs/web` 2.x, which a Solid 2 app already has. It ships uncompiled JSX under the `solid` export condition, so the app compiles it with its own Solid plugin (`@solidjs/vite-plugin`). This needs no configuration.

## 1. Install

```bash
pnpm add @solid-slopkit/signal-forms
```

## 2. Set it up

No setup: there is no provider and no plugin. The package has an index for agents at `node_modules/@solid-slopkit/signal-forms/dist/source/llms.md`, with links to a guide per topic, and a skill at `node_modules/@solid-slopkit/signal-forms/skills/signal-forms/SKILL.md`. Read the skill before writing the first form.

## 3. Make the package docs available to later sessions

The package ships a skill (a task guide, `skills/<area>/SKILL.md`) and LLM references (the `llms.md` index and the guides it links). Both always match the installed version. Tell future agents about them in the app's agent instructions: add this section to `AGENTS.md`. Create the file if the app has none. If the file has a generated block (the templates' `<!-- BEGIN solid-2.0-primer -->` … `<!-- END solid-2.0-primer -->`), add the section after it, never inside it.

```markdown
## slopkit signal forms

This app uses `@solid-slopkit/signal-forms`, installed from npm. To upgrade, run `pnpm up @solid-slopkit/signal-forms --latest`.

Read the docs inside the installed package, not the web; they match the installed version:

- `node_modules/@solid-slopkit/signal-forms/dist/source/llms.md`: the API and a guide per topic (binding, validation, conditions, submit and async, metadata). Skill: `node_modules/@solid-slopkit/signal-forms/skills/signal-forms/SKILL.md`.

Before writing or changing a form, read the skill first, then the guide for each topic you use.
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
2. `pnpm dev`, open a page with a form, and check that typing updates the field, validation errors show, and the browser console shows no errors.
