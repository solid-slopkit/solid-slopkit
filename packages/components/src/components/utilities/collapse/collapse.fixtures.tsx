// SSR scenarios for collapse.test.tsx.
import { Collapse } from '.';

export const collapses = () => (
  <div>
    <Collapse defaultOpened icon="arrow" class="mine">
      <Collapse.Title>Opened</Collapse.Title>
      <Collapse.Content>
        <p>Shown</p>
      </Collapse.Content>
    </Collapse>
    <Collapse icon="plus">
      <Collapse.Title>Closed</Collapse.Title>
      <Collapse.Content>
        <p>Hidden</p>
      </Collapse.Content>
    </Collapse>
    <Collapse opened>
      <Collapse.Title>Controlled</Collapse.Title>
      <Collapse.Content>
        <p>Controlled content</p>
      </Collapse.Content>
    </Collapse>
  </div>
);
