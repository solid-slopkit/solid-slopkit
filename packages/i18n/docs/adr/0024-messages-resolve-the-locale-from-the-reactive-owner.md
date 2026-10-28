# Messages resolve the locale lazily from the reactive owner

An imported Translation file is a module-level singleton, but the Active locale lives in `I18nContext`, and on the server one module serves many concurrent requests. So a Message read can't use a module-level locale signal. Each read (`translations.title`) looks up `I18nContext` through the current reactive owner. Reads in JSX, memos and effects work, and they are safe on the server because every request has its own owner tree.

A read with no owner (an event handler, a timer, a promise callback) can't find the context. On the client there is one user, so it falls back to the locale of the most recently mounted `I18nProvider`. On the server it throws a clear error instead of guessing a locale. The one case this gets wrong is two providers with different locales on one page, read from an ownerless callback.

`useTranslations(translations)` is the escape hatch: called in a component's setup, it captures the context once, so its result is correct everywhere, at the cost of one line per component.

## Considered Options

- **A module-level locale signal:** simplest and works everywhere, but one request's locale leaks into another on the server, and two providers can't coexist.
- **Only `useTranslations(translations)`:** always correct, but gives up the plain import this package exists for.

## Consequences

- The docs describe the ownerless fallback and its one limit, and point to `useTranslations` for it.
- Tests cover a read in a handler (client fallback), a read with no owner on the server (error), and two providers with different locales.
