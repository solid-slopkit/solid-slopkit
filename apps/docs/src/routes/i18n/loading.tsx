import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { H2 } from '../../components/Heading';

export default function I18nLoading() {
  return (
    <article class="docs-page">
      <Title>Loading · i18n · slopkit</Title>
      <p class="docs-eyebrow">i18n</p>
      <h1>Loading</h1>
      <p class="docs-lead">
        Per-locale chunks, the loading boundary the provider renders, locale switches as transitions, preloading and server
        rendering.
      </p>

      <H2 id="chunks">Chunks</H2>
      <p>
        By default each locale of a file is its own chunk: the module you import holds no message text, and the chunk of a locale
        is fetched when that locale becomes active. A user reads one language, so only that language is downloaded, and adding a
        locale doesn't grow the pages of the others. With <code>mode: 'inline'</code> every locale is in the module and nothing
        loads later.
      </p>

      <H2 id="boundary">The loading boundary</H2>
      <p>
        <code>I18nProvider</code> renders a <code>{`<Loading>`}</code> around its children. If a message is read before its chunk
        has arrived, the provider shows <code>fallback</code> (nothing, if you give none), then the content. Lazily loaded routes
        already sit under their own <code>{`<Loading>`}</code>, so a translation chunk loads together with its route.
      </p>
      <CodeBlock
        code={`<I18nProvider initialLocale="en" fallback={<Loader />}>
  <App />
</I18nProvider>`}
      />

      <H2 id="switching">Switching locale</H2>
      <p>
        Switching is a transition: the old text stays on screen until the new locale's chunks are ready, and then everything
        changes together. There is no flash of fallback. To show that a switch is in flight, ask Solid:
      </p>
      <CodeBlock
        code={`const i18n = useContext(I18nContext);
<span>{isPending(() => i18n.locale()) ? 'Switching…' : ''}</span>;`}
      />
      <p>
        A chunk that fails to load reaches the nearest <code>{`<Errored>`}</code>, and the next read tries again. A read made
        outside rendering before its chunk has loaded (an early event handler) throws a not-ready error, so preload what handlers
        need.
      </p>

      <H2 id="preloading">Preloading</H2>
      <p>To render with no fallback on first paint, load the first locale before mounting the app:</p>
      <CodeBlock
        code={`import { preloadTranslations } from '@solid-slopkit/i18n';

await preloadTranslations(locale, common, app);
render(() => <App />, document.getElementById('root')!);`}
      />
      <p>
        It loads the locale of each file you pass, or the default locale if the file doesn't have it. Files you don't list load
        when first read.
      </p>

      <H2 id="ssr">Server rendering</H2>
      <ul>
        <li>The server always inlines every locale, so nothing is pending while rendering and the HTML has the text.</li>
        <li>
          Give the provider the request's locale: <code>{`<I18nProvider locale={requestLocale}>`}</code>. Every read during
          rendering resolves it, also for concurrent requests. Don't read a message at module scope or in a callback on the
          server: it throws.
        </li>
        <li>
          Before <code>hydrate()</code> on the client, <code>await preloadTranslations(locale, ...)</code> with the same files and
          locale the server used, so the first client render matches the HTML.
        </li>
      </ul>
    </article>
  );
}
