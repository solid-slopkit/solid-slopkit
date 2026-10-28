import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import type { SlopSize } from '../../../core';
import { List } from './list';

describe('<List />', () => {
  test('a ul of li items, with plain items keeping their markers', () => {
    const { getByRole, getAllByRole } = render(() => (
      <List>
        <List.Item>One</List.Item>
        <List.Item>Two</List.Item>
      </List>
    ));
    const list = getByRole('list');
    const items = getAllByRole('listitem');

    expect(list.tagName).toBe('UL');
    expect(list).toHaveClass('slp-list');
    expect(list).not.toHaveAttribute('data-size');
    expect(list).not.toHaveAttribute('data-spacing');
    expect(items.map((item) => item.textContent)).toEqual(['One', 'Two']);
    expect(items[0]).toHaveClass('slp-list-item');
    expect(items[0]).not.toHaveAttribute('data-with-icon');
    expect(items[0].querySelector('[data-slot]')).toBeNull();
  });

  test('ordered renders an ol; native ol attributes and other props pass through', () => {
    const { getByRole } = render(() => (
      <List ordered start={3} reversed type="a" size="sm" spacing="lg" id="l" class="mine">
        <List.Item>One</List.Item>
      </List>
    ));
    const list = getByRole('list');

    expect(list.tagName).toBe('OL');
    expect(list).toHaveAttribute('start', '3');
    expect(list).toHaveAttribute('reversed');
    expect(list).toHaveAttribute('type', 'a');
    expect(list).toHaveAttribute('data-size', 'sm');
    expect(list).toHaveAttribute('data-spacing', 'lg');
    expect(list).toHaveAttribute('id', 'l');
    expect(list).toHaveClass('slp-list', 'mine');
    expect(list).not.toHaveAttribute('ordered');
  });

  test('the list icon goes to every item, as its own element; an item icon wins, and null removes it', () => {
    const { getAllByRole } = render(() => (
      <List icon={<i>dot</i>}>
        <List.Item>One</List.Item>
        <List.Item>Two</List.Item>
        <List.Item icon={<b>star</b>}>Three</List.Item>
        <List.Item icon={null}>Four</List.Item>
      </List>
    ));
    const items = getAllByRole('listitem');
    const icon = (item: HTMLElement) => item.querySelector('[data-slot="list-item-icon"]');
    const content = (item: HTMLElement) => item.querySelector('[data-slot="list-item-content"]');

    expect(items.map((item) => icon(item)?.textContent ?? null)).toEqual(['dot', 'dot', 'star', null]);
    expect(icon(items[0])!.firstChild).not.toBe(icon(items[1])!.firstChild);
    expect(content(items[0])).toHaveTextContent('One');
    expect(items[0]).toHaveAttribute('data-with-icon', '');
    expect(items[3]).not.toHaveAttribute('data-with-icon');
    expect(items[3].textContent).toBe('Four');
  });

  test('an item icon element is created once', () => {
    let created = 0;
    const Icon = () => {
      created++;
      return <i>icon</i>;
    };
    render(() => (
      <List>
        <List.Item icon={<Icon />}>One</List.Item>
      </List>
    ));

    expect(created).toBe(1);
  });

  test('changing the size updates the attribute without diagnostics or waste', async () => {
    const [size, setSize] = createSignal<SlopSize>('sm', { name: 'size' });
    const { getByRole } = render(() => (
      <List size={size()}>
        <List.Item>One</List.Item>
      </List>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setSize('lg'), { scenario: 'list-size' });

    expect(getByRole('list')).toHaveAttribute('data-size', 'lg');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <List spacing="sm">
          <List.Item>One</List.Item>
          <List.Item>
            Two
            <List ordered>
              <List.Item>Nested</List.Item>
            </List>
          </List.Item>
        </List>
        <List icon={<svg aria-hidden="true" />} size="lg">
          <List.Item>With icon</List.Item>
          <List.Item icon={null}>Without</List.Item>
        </List>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./list.fixtures.tsx', 'lists');
  });
});
