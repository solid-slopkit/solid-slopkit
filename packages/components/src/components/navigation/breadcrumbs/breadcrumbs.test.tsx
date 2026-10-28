import { render } from '@solidjs/testing-library';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { Anchor } from '../../typography/anchor';
import { Breadcrumbs } from './breadcrumbs';

describe('<Breadcrumbs />', () => {
  test('a nav named Breadcrumb with each child in an ordered list, separated', () => {
    const { getByRole, getAllByRole, container } = render(() => (
      <Breadcrumbs class="mine">
        <Anchor href="/">Home</Anchor>
        <Anchor href="/docs">Docs</Anchor>
        <span aria-current="page">Breadcrumbs</span>
      </Breadcrumbs>
    ));

    expect(getByRole('navigation', { name: 'Breadcrumb' })).toHaveClass('slp-breadcrumbs', 'mine');
    expect(container.querySelector('ol')).not.toBeNull();
    expect(getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Home', '/Docs', '/Breadcrumbs']);
    const separators = container.querySelectorAll('[data-slot="breadcrumbs-separator"]');
    expect(separators).toHaveLength(2);
    expect(separators[0]).toHaveAttribute('aria-hidden', 'true');
    expect(getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/', '/docs']);
  });

  test('a custom separator, one per gap', () => {
    const { getAllByTestId } = render(() => (
      <Breadcrumbs separator={<svg data-testid="chevron" />}>
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </Breadcrumbs>
    ));
    expect(getAllByTestId('chevron')).toHaveLength(2);
  });

  test('children that change are listed as they come', () => {
    const [path, setPath] = createSignal(['Home', 'Docs']);
    const { getAllByRole } = render(() => (
      <Breadcrumbs>
        <For each={path()}>{(part) => <span>{part}</span>}</For>
      </Breadcrumbs>
    ));

    expect(getAllByRole('listitem')).toHaveLength(2);
    setPath(['Home', 'Docs', 'Inputs']);
    flush();
    expect(getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Home', '/Docs', '/Inputs']);
  });

  test('aria-label renames it', () => {
    const { getByRole } = render(() => (
      <Breadcrumbs aria-label="You are here">
        <span>A</span>
      </Breadcrumbs>
    ));
    expect(getByRole('navigation', { name: 'You are here' })).toBeDefined();
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <Breadcrumbs>
        <Anchor href="/">Home</Anchor>
        <Anchor href="/docs" aria-current="page">
          Docs
        </Anchor>
      </Breadcrumbs>
    ));
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./breadcrumbs.fixtures.tsx', 'breadcrumbs');
  });
});
