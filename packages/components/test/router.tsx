import { render } from '@solidjs/testing-library';
import { createRouter, memoryHistory } from '@solidjs/router';
import type { JSX } from '@solidjs/web';

/**
 * Renders `children` inside `@solidjs/router` at `path`, with an empty page for each of `paths`, so the router marks
 * the links to the current page (`data-active`, `aria-current="page"`) and clicking a link navigates. `history.get()`
 * is the current path.
 */
export function renderInRouter(path: string, paths: string[], children: () => JSX.Element) {
  const history = memoryHistory(path);
  const Router = createRouter({ routes: paths.map((page) => ({ path: page, component: () => null })), history });
  const result = render(() => (
    <Router>
      {(props) => (
        <>
          {children()}
          {props.children}
        </>
      )}
    </Router>
  ));
  return { ...result, history };
}
