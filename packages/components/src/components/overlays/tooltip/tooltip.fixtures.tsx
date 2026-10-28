// SSR scenarios for tooltip.test.tsx.
import { Tooltip } from '.';

export const tooltips = () => (
  <div>
    <Tooltip label="Copy link">{(target) => <button {...target}>Copy</button>}</Tooltip>
    <Tooltip label="Shown once hydrated" opened withArrow color="primary" position="bottom-start" class="mine">
      {(target) => <button {...target}>Open</button>}
    </Tooltip>
    <p>
      Inline{' '}
      <Tooltip label="Inside a paragraph">
        {(target) => (
          <a href="#terms" {...target}>
            terms
          </a>
        )}
      </Tooltip>
    </p>
  </div>
);
