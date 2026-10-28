// SSR scenarios for scroll-area.test.tsx.
import { For } from 'solid-js';
import { ScrollArea } from '.';

const lines = Array.from({ length: 30 }, (_, index) => `Line ${index + 1}`);

export const scrollAreas = () => (
  <div>
    <ScrollArea style={{ height: '120px' }} class="mine">
      <For each={lines}>{(line) => <p>{line}</p>}</For>
    </ScrollArea>
    <ScrollArea type="always" scrollbars="x" scrollbarSize={6} offsetScrollbars style={{ 'max-height': '80px' }}>
      <p style={{ width: '1200px' }}>A wide line</p>
    </ScrollArea>
    <ScrollArea type="never" scrollbars="y">
      <p>Short</p>
    </ScrollArea>
  </div>
);
