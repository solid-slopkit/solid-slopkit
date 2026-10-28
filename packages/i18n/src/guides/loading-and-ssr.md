# Loading and SSR

## Chunks

By default each locale of a file is its own chunk: the module you import holds no message text, and a locale's chunk is fetched when that locale becomes active. With the plugin option `mode: 'inline'` every locale is in the module and nothing loads later. The server always inlines.

## The loading boundary

`I18nProvider` renders a `<Loading>` around its children. If a message is read before its chunk arrives, the provider shows its `fallback` (nothing if you give none), then the content. Lazily loaded routes already sit under their own `<Loading>`, so a translation chunk loads together with its route.

```tsx
<I18nProvider initialLocale="en" fallback={<Loader />}>
  <App />
</I18nProvider>
```

## Switching locale

A switch is a transition: the old text stays until the new locale's chunks are ready, then everything changes together. No fallback flashes. To show a switch in flight:

```tsx
const i18n = useContext(I18nContext);
<span>{isPending(() => i18n.locale()) ? 'Switching…' : ''}</span>;
```

A chunk that fails to load reaches the nearest `<Errored>`; the next read tries again. A read made **outside** rendering before its chunk has loaded (an early event handler) throws a not-ready error, so preload what handlers need.

## Preloading

To render with no fallback on first paint, load the first locale before mounting:

```tsx
import { preloadTranslations } from '@solid-slopkit/i18n';
import common from './common.i18n.jsonc';
import app from './app.i18n.jsonc';

await preloadTranslations(locale, common, app);
render(() => <App />, document.getElementById('root')!);
```

It loads the locale of each file you pass, or the file's default locale if it does not have it. Files you do not list load when first read.

## Server rendering

- Every locale is inlined on the server, so nothing is pending and the HTML has the text.
- Give the provider the request's locale: `<I18nProvider locale={requestLocale}>`. Reads during rendering resolve it, also for concurrent requests. Do not read a message at module scope or in a callback on the server: it throws.
- Before `hydrate()` on the client, `await preloadTranslations(locale, ...)` with the same files and locale the server used, so the first client render matches the HTML.
