import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { describe, expect, test, vi } from 'vitest';
import { createPresence, type Presence } from './create-presence';

describe('createPresence without the Web Animations API', () => {
  test('closes before the next frame, and opens on the next frame', async () => {
    const [present, setPresent] = createSignal(true);
    const onExited = vi.fn();
    let presence!: Presence;
    render(() => {
      let el: HTMLDivElement | undefined;
      presence = createPresence({ present, element: () => el, onExited });
      return <div ref={(node) => (el = node)} data-status={presence.status()} />;
    });
    expect(presence.status()).toBe('open');

    setPresent(false);
    flush();
    expect(presence.status()).toBe('ending');
    for (let i = 0; i < 10; i++) await Promise.resolve();
    expect(presence.status()).toBe('closed');
    expect(presence.mounted()).toBe(false);
    expect(onExited).toHaveBeenCalledTimes(1);

    setPresent(true);
    flush();
    expect(presence.status()).toBe('starting');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(presence.status()).toBe('open');
  });
});
