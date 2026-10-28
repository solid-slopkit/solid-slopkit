import { render, waitFor } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { claimLinksAsCurrent } from '../../../../test/link-claims';
import { TableOfContents } from './table-of-contents';

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe('<TableOfContents />', () => {
  test('finds the headings with an id on the page and links to them, indented by depth', async () => {
    const { getByRole, getAllByRole, container } = render(() => (
      <>
        <TableOfContents class="mine" />
        <article>
          <h1 id="title">Title</h1>
          <h2 id="usage"> Usage </h2>
          <h3 id="options">Options</h3>
          <h2>Not linked</h2>
          <h2 id="props">Props</h2>
        </article>
      </>
    ));
    flush();

    const nav = getByRole('navigation', { name: 'Table of contents' });
    expect(nav).toHaveClass('slp-table-of-contents', 'mine');
    expect(nav).toHaveAttribute('data-variant', 'line');
    const links = getAllByRole('link');
    expect(links.map((link) => [link.textContent, link.getAttribute('href'), link.dataset.depth])).toEqual([
      ['Title', '#title', '1'],
      ['Usage', '#usage', '2'],
      ['Options', '#options', '3'],
      ['Props', '#props', '2'],
    ]);
    expect(links[2].style.getPropertyValue('--_toc-indent')).toBe('2');
    expect(container.querySelector('ol[data-slot="table-of-contents-list"]')).not.toBeNull();
  });

  test('selector picks the headings', () => {
    const { getAllByRole } = render(() => (
      <>
        <TableOfContents selector="main h2" />
        <h2 id="outside">Outside</h2>
        <main>
          <h2 id="inside">Inside</h2>
          <h3 id="deeper">Deeper</h3>
        </main>
      </>
    ));
    flush();
    expect(getAllByRole('link').map((link) => link.textContent)).toEqual(['Inside']);
    expect(getAllByRole('link')[0].style.getPropertyValue('--_toc-indent')).toBe('0');
  });

  test('follows headings that come and go', async () => {
    const [sections, setSections] = createSignal(['One']);
    const { getAllByRole } = render(() => (
      <>
        <TableOfContents selector="section h2" />
        <section>
          <For each={sections()}>{(title) => <h2 id={title.toLowerCase()}>{title}</h2>}</For>
        </section>
      </>
    ));
    flush();
    expect(getAllByRole('link')).toHaveLength(1);

    setSections(['One', 'Two']);
    flush();
    await waitFor(() => expect(getAllByRole('link').map((link) => link.textContent)).toEqual(['One', 'Two']));
  });

  test('given headings, lists them as they are, without looking at the page', () => {
    const { getAllByRole } = render(() => (
      <>
        <TableOfContents
          headings={[
            { id: 'a', label: 'Alpha', depth: 3 },
            { id: 'b', label: 'Beta', depth: 4 },
          ]}
        />
        <h2 id="elsewhere">Elsewhere</h2>
      </>
    ));
    flush();
    const links = getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Alpha', 'Beta']);
    expect(links[1].style.getPropertyValue('--_toc-indent')).toBe('1');
  });

  test('keeps its own active link when a router marks every link to this page', () => {
    claimLinksAsCurrent();
    const { getAllByRole } = render(() => (
      <>
        <TableOfContents
          headings={[
            { id: 'a', label: 'Alpha', depth: 2 },
            { id: 'b', label: 'Beta', depth: 2 },
          ]}
        />
        <h2 id="a">Alpha</h2>
        <h2 id="b">Beta</h2>
      </>
    ));
    flush();
    // jsdom lays nothing out, so every heading is at the top and the last is active.
    const [alpha, beta] = getAllByRole('link');

    expect(alpha).toHaveAttribute('aria-current', 'false');
    expect(alpha).not.toHaveAttribute('data-current');
    expect(beta).toHaveAttribute('aria-current', 'location');
    expect(beta).toHaveAttribute('data-current', '');
  });

  test('hidden while there are no headings', () => {
    const { container } = render(() => <TableOfContents selector=".nothing" />);
    flush();
    expect(container.querySelector('nav')).toHaveAttribute('hidden');
  });

  test('aria-label renames it; variant and color', () => {
    const { getByRole } = render(() => (
      <TableOfContents aria-label="On this page" variant="soft" color="accent" headings={[{ id: 'a', label: 'A', depth: 2 }]} />
    ));
    const nav = getByRole('navigation', { name: 'On this page' });
    expect(nav).toHaveAttribute('data-variant', 'soft');
    expect(nav).toHaveAttribute('data-color', 'accent');
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <TableOfContents />
        <main>
          <h1 id="title">Title</h1>
          <h2 id="usage">Usage</h2>
        </main>
      </>
    ));
    flush();
    await nextFrame();
    expect(container.querySelector('[aria-current="location"]')).not.toBeNull();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('finding the headings and the active one has no diagnostics or waste', async () => {
    const [sections, setSections] = createSignal(['One', 'Two']);
    const { getAllByRole } = render(() => (
      <>
        <TableOfContents selector="section h2" />
        <section>
          <For each={sections()}>{(title) => <h2 id={title.toLowerCase()}>{title}</h2>}</For>
        </section>
      </>
    ));
    flush();

    const { artifact } = await captureArtifact(
      async () => {
        setSections(['One', 'Two', 'Three']);
        flush();
        await waitFor(() => expect(getAllByRole('link')).toHaveLength(3));
      },
      { scenario: 'table-of-contents-rescan' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./table-of-contents.fixtures.tsx', 'tablesOfContents');
  });
});
