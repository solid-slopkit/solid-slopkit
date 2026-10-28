import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { DocTable } from '../../components/DocTable';
import { H2 } from '../../components/Heading';

const OPTIONS: [string, string, string][] = [
  ['locales', 'required', 'Every locale a file may contain, e.g. ["en", "de"]. A file with another locale is an error.'],
  ['defaultLocale', 'required', 'In locales. Defines the keys of every file and is the fallback for missing messages.'],
  ['suffix', '".i18n.jsonc"', 'Translation file suffix. Must start with a dot and must not end in .json.'],
  ['strict', 'false', 'Report a message missing from a non-default locale as an error instead of a warning. Turn it on in CI.'],
  [
    'mode',
    '"async"',
    '"async": each locale is its own chunk, loaded when it becomes active. "inline": every locale is in the module, so nothing is ever pending. The server always inlines.',
  ],
];

export default function I18nSetup() {
  return (
    <article class="docs-page">
      <Title>Setup · i18n · slopkit</Title>
      <p class="docs-eyebrow">i18n</p>
      <h1>Setup</h1>
      <p class="docs-lead">
        The Vite plugin, the two <code>tsconfig</code> options for the generated types, and the types in tests and CI.
      </p>

      <H2 id="plugin">The plugin</H2>
      <CodeBlock
        code={`// vite.config.ts
import { slopkitI18n } from '@solid-slopkit/i18n/vite';

export default defineConfig({
  plugins: [slopkitI18n({ locales: ['en', 'de'], defaultLocale: 'en' }), solid()],
});`}
      />
      <p>
        The plugin compiles every translation file into a module and writes its types. It validates each file when Vite starts and
        whenever one changes: an error fails the build and shows in the dev overlay, naming the file and the key. The generated
        modules import <code>@solid-slopkit/i18n</code>, so the package must be installed in the project, not only the plugin.
      </p>
      <DocTable
        head={['Option', 'Default', 'Meaning']}
        rows={OPTIONS.map(([option, value, meaning]) => [<code>{option}</code>, <code>{value}</code>, meaning])}
      />

      <H2 id="types">Types</H2>
      <p>
        The plugin writes the types of a translation file under <code>node_modules/.slopkit-i18n/types</code>, mirroring its path
        from the project root, so nothing generated appears in your source tree. TypeScript finds them with two options, set once:
      </p>
      <CodeBlock
        lang="jsonc"
        code={`// tsconfig.json
{
  "compilerOptions": {
    "allowArbitraryExtensions": true,
    "rootDirs": ["src", "node_modules/.slopkit-i18n/types/src"],
  },
}`}
      />
      <p>
        The second entry mirrors the first: list one pair for each source directory that holds translation files. <code>tsc</code>{' '}
        needs the types before it runs, and the plugin only writes them when Vite does. On a fresh clone or in CI, run the command
        first:
      </p>
      <CodeBlock lang="bash" code="slopkit-i18n typegen && tsc --noEmit" />
      <p>
        <code>slopkit-i18n typegen</code> reads the plugin's options from your Vite config (<code>--config</code> picks another
        file, <code>--root</code> another directory), writes the types, prints warnings and exits with 1 when a translation file
        has errors.
      </p>

      <H2 id="tests">Tests</H2>
      <p>
        Vitest runs Vite plugins, so put the plugin in the test config too and a component that imports a translation file works
        under test. Use <code>mode: 'inline'</code> there to have the text at first render, without a loading state.
      </p>
      <CodeBlock
        code={`// vitest.config.ts
export default defineConfig({
  plugins: [slopkitI18n({ locales: ['en', 'de'], defaultLocale: 'en', mode: 'inline' })],
});`}
      />

      <H2 id="notes">Notes</H2>
      <ul>
        <li>
          Translation platforms that expect <code>.json</code> need to be told to read <code>.jsonc</code>, or set{' '}
          <code>suffix</code> to <code>'.i18n'</code> and map that extension to JSON in your editor and formatter.
        </li>
        <li>Editing the messages of a file hot-updates in place; adding or removing a key reloads the page.</li>
        <li>
          If the Vite config imports TypeScript source files (a monorepo), run Vite and Vitest with{' '}
          <code>--configLoader runner</code>.
        </li>
      </ul>
    </article>
  );
}
