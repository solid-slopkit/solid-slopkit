import { render } from '@solidjs/testing-library';
import { For } from 'solid-js';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { TableOfContents } from './table-of-contents';

const frames = async (count = 2) => {
  for (let index = 0; index < count; index++) await new Promise((resolve) => requestAnimationFrame(resolve));
};

function setup(props: { offset?: number; scrollMargin?: string; shortLast?: boolean } = {}) {
  const onActiveChange = vi.fn();
  const result = render(() => (
    <>
      <TableOfContents selector="article h2, article h3" offset={props.offset} onActiveChange={onActiveChange} />
      <article>
        <div style={{ height: '200px' }} />
        {/* With shortLast, the last section is too short for its heading to reach the top. */}
        <For each={['one', 'two', 'three', 'four']}>
          {(id) => (
            <section style={{ height: props.shortLast && id === 'four' ? '100px' : '800px' }}>
              <h2 id={id} style={{ margin: '0', 'scroll-margin-top': props.scrollMargin ?? '0px' }}>
                {id}
              </h2>
            </section>
          )}
        </For>
      </article>
    </>
  ));
  // The one active link's text; fails when several are active.
  const active = () => {
    const links = [...result.container.querySelectorAll('[aria-current="location"]')].map((link) => link.textContent);
    expect(links.length).toBeLessThan(2);
    return links[0] ?? null;
  };
  return { ...result, active, onActiveChange };
}

describe('<TableOfContents /> in a browser', () => {
  afterEach(() => window.scrollTo(0, 0));

  test('marks the last heading scrolled to the top, and none before the first', async () => {
    const { active, onActiveChange } = setup();
    await frames();
    expect(active()).toBe(null);

    document.getElementById('two')!.scrollIntoView();
    await frames();
    expect(active()).toBe('two');
    expect(onActiveChange).toHaveBeenLastCalledWith('two');

    window.scrollBy(0, 300);
    await frames();
    expect(active()).toBe('two');

    window.scrollBy(0, 600);
    await frames();
    expect(active()).toBe('three');
  });

  test('a heading counts as reached at its scroll-margin-top, or at offset', async () => {
    const withMargin = setup({ scrollMargin: '100px' });
    document.getElementById('two')!.scrollIntoView();
    await frames();
    expect(withMargin.active()).toBe('two');
    withMargin.unmount();
    window.scrollTo(0, 0);

    const withOffset = setup({ offset: 300 });
    window.scrollTo(0, document.getElementById('two')!.getBoundingClientRect().top + window.scrollY - 250);
    await frames();
    expect(withOffset.active()).toBe('two');
  });

  test('at the bottom of the page, the last heading', async () => {
    const { active } = setup({ shortLast: true });
    window.scrollTo(0, document.documentElement.scrollHeight);
    await frames();
    expect(document.getElementById('four')!.getBoundingClientRect().top).toBeGreaterThan(1);
    expect(active()).toBe('four');
  });

  test('the line variant colors the line beside the active link', async () => {
    const { container } = setup();
    document.getElementById('one')!.scrollIntoView();
    await frames();
    const link = container.querySelector<HTMLElement>('[data-current]')!;
    const other = container.querySelector<HTMLElement>('[data-slot="table-of-contents-link"]:not([data-current])')!;

    expect(getComputedStyle(link).borderLeftWidth).toBe('2px');
    expect(getComputedStyle(link).borderLeftColor).not.toBe(getComputedStyle(other).borderLeftColor);
  });
});
