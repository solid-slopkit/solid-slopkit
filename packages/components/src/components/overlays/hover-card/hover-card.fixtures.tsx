// SSR scenarios for hover-card.test.tsx.
import { HoverCard } from '.';

export const closed = () => (
  <HoverCard>
    <HoverCard.Target>
      {(target) => (
        <a href="#ada" {...target}>
          @ada
        </a>
      )}
    </HoverCard.Target>
    <HoverCard.Dropdown>Not rendered</HoverCard.Dropdown>
  </HoverCard>
);

export const open = () => (
  <HoverCard opened withArrow position="top-start" transition="pop">
    <HoverCard.Target>
      {(target) => (
        <a href="#ada" {...target}>
          @ada
        </a>
      )}
    </HoverCard.Target>
    <HoverCard.Dropdown class="mine">
      <p>Rendered on the server, shown once hydrated.</p>
    </HoverCard.Dropdown>
  </HoverCard>
);
