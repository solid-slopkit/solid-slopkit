---
'@solid-slopkit/components': patch
'@solid-slopkit/flow': patch
'@solid-slopkit/i18n': patch
'@solid-slopkit/signal-forms': patch
'@solid-slopkit/threejs': patch
---

Require the stable Solid 2: `solid-js` and `@solidjs/web` 2.0.3 or newer. The release candidates are no longer accepted.

`@solid-slopkit/threejs`: a Scene component whose `args` or `object` reads an Asset that is still loading, such as `<T.Group object={model().scene} />`, waits for the Loading boundary around it again in development. Solid's development build since 2.0.0-rc.21 reported it as `PENDING_ASYNC_UNTRACKED_READ` and stopped updating.
