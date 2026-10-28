import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { List } from './list';

const top = (el: Element) => Math.round(el.getBoundingClientRect().top);

describe('<List /> in a browser', () => {
  test('plain items keep their markers, indented; no margin', () => {
    const { getByRole, getAllByRole } = render(() => (
      <List ordered>
        <List.Item>One</List.Item>
        <List.Item>Two</List.Item>
      </List>
    ));
    const css = getComputedStyle(getByRole('list'));

    expect(css.marginTop).toBe('0px');
    expect(parseFloat(css.paddingLeft)).toBeGreaterThan(0);
    expect(getComputedStyle(getAllByRole('listitem')[0]).display).toBe('list-item');
    expect(css.listStyleType).toBe('decimal');
  });

  test('spacing sets the gap between items', () => {
    const { getAllByRole } = render(() => (
      <List spacing="lg" style={{ 'line-height': '20px' }}>
        <List.Item>One</List.Item>
        <List.Item>Two</List.Item>
      </List>
    ));
    const [one, two] = getAllByRole('listitem');

    expect(top(two) - top(one)).toBe(36);
  });

  test('size sets font size and line height from the type scale; without it, they are inherited', () => {
    const { getAllByRole } = render(() => (
      <div style={{ 'font-size': '30px' }}>
        <List size="sm">
          <List.Item>Small</List.Item>
        </List>
        <List>
          <List.Item>Inherited</List.Item>
        </List>
      </div>
    ));
    const [small, inherited] = getAllByRole('listitem');

    expect(getComputedStyle(small).fontSize).toBe('14px');
    expect(getComputedStyle(small).lineHeight).toBe('20px');
    expect(getComputedStyle(inherited).fontSize).toBe('30px');
  });

  test('with icons: no markers, no indent, the icon beside the content and centered on its first line', () => {
    const { getByRole, getAllByRole } = render(() => (
      <List icon={<svg viewBox="0 0 10 10" />} style={{ width: '120px', 'font-size': '16px', 'line-height': '24px' }}>
        <List.Item>A long item that wraps onto several lines</List.Item>
      </List>
    ));
    const list = getByRole('list');
    const [item] = getAllByRole('listitem');
    const icon = item.querySelector('[data-slot="list-item-icon"]')!;
    const svg = icon.querySelector('svg')!.getBoundingClientRect();
    const content = item.querySelector('[data-slot="list-item-content"]')!.getBoundingClientRect();

    expect(getComputedStyle(list).paddingLeft).toBe('0px');
    expect(getComputedStyle(item).listStyleType).toBe('none');
    expect(Math.round(svg.width)).toBe(16);
    expect(svg.right).toBeLessThanOrEqual(content.left);
    expect(Math.round(svg.top - content.top)).toBe(4);
    expect(content.height).toBeGreaterThan(24);
  });

  test('a list with some plain items keeps the indent for their markers', () => {
    const { getByRole } = render(() => (
      <List icon={<svg viewBox="0 0 10 10" />}>
        <List.Item>Icon</List.Item>
        <List.Item icon={null}>Marker</List.Item>
      </List>
    ));

    expect(parseFloat(getComputedStyle(getByRole('list')).paddingLeft)).toBeGreaterThan(0);
  });
});
