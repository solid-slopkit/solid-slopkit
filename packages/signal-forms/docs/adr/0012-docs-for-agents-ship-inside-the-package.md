# Docs for agents ship inside the package

`@solid-slopkit/signal-forms` contains two sets of docs written for coding agents, versioned with the code:

- `skills/<area>/SKILL.md`: task-oriented guides (`skills/signal-forms/SKILL.md`), following the convention `solid-js` and `@solidjs/diagnostics` use. A consumer's AGENTS.md points at `node_modules/@solid-slopkit/signal-forms/skills/`.
- **LLM references**: handwritten Markdown next to the source, plus an index, `llms.md`, at the source root. There is one guide per topic (`guides/*.md`). The build copies them into `dist/source/` with the code, so the paths in the index work in the installed package. When the API changes, its guide changes in the same commit.

The docs site may stay private, so docs inside the package are often the only ones a consumer's agent can reach, and they always match the installed version.

## Considered Options

- **Generated from the docs pages and the TypeScript types:** rejected as too much machinery: rendering or parsing the docs pages, and extracting props needs a compiler API that TypeScript 7 only offers as unstable. A handwritten file is a third copy of the props after the types and the docs page, so it can drift. Reviewing the reference with every API change, and the docs audit before a release (M8.03), keep it in line.
- **Serving `/llms.txt` from the docs site:** dropped. The files in the package are the ones an agent can reach, and they match the installed version.
- **Docs site only:** rejected, because it is unreachable for agents while the repo is private and isn't versioned with the installed package.
