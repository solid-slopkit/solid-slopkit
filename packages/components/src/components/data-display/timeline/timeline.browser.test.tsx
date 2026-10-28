import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Timeline } from './timeline';

const slot = (root: Element, name: string) => root.querySelector(`[data-slot="timeline-item-${name}"]`)!;
const box = (el: Element) => el.getBoundingClientRect();

describe('<Timeline /> in a browser', () => {
  test('the line runs from each bullet to the next, centered under it; the last item has none', () => {
    const { getAllByRole } = render(() => (
      <Timeline>
        <Timeline.Item title="One">First</Timeline.Item>
        <Timeline.Item title="Two">Second</Timeline.Item>
        <Timeline.Item title="Three">Third</Timeline.Item>
      </Timeline>
    ));
    const items = getAllByRole('listitem');
    const bullet = box(slot(items[0], 'bullet'));
    const next = box(slot(items[1], 'bullet'));
    const line = getComputedStyle(items[0], '::before');

    expect(Math.round(bullet.width)).toBe(24);
    expect(line.width).toBe('2px');
    expect(Math.round(bullet.left + parseFloat(line.left) + 1)).toBe(Math.round(bullet.left + bullet.width / 2));
    expect(Math.round(box(items[0]).top + parseFloat(line.top))).toBe(Math.round(bullet.bottom));
    expect(Math.round(box(items[0]).bottom)).toBe(Math.round(next.top));
    expect(getComputedStyle(items[2], '::before').content).toBe('none');
  });

  test('the title sits level with the bullet; the body follows it', () => {
    const { getAllByRole } = render(() => (
      <Timeline>
        <Timeline.Item title="Ordered">Monday</Timeline.Item>
      </Timeline>
    ));
    const [item] = getAllByRole('listitem');
    const bullet = box(slot(item, 'bullet'));
    const title = box(slot(item, 'title'));

    expect(Math.round(title.top + title.height / 2)).toBe(Math.round(bullet.top + bullet.height / 2));
    expect(title.left).toBeGreaterThan(bullet.right);
    expect(box(slot(item, 'body')).top).toBeGreaterThanOrEqual(title.bottom);
  });

  test('active bullets and the line between active items take the role; the rest stays muted', () => {
    const { getAllByRole, getByTestId } = render(() => (
      <>
        <Timeline color="success">
          <Timeline.Item active title="One" />
          <Timeline.Item active title="Two" />
          <Timeline.Item title="Three" />
        </Timeline>
        <span data-testid="role" style={{ color: 'var(--slp-color-success)' }} />
      </>
    ));
    const [one, two, three] = getAllByRole('listitem');
    const role = getComputedStyle(getByTestId('role')).color;

    expect(getComputedStyle(slot(one, 'bullet')).backgroundColor).toBe(role);
    expect(getComputedStyle(one, '::before').backgroundColor).toBe(role);
    expect(getComputedStyle(two, '::before').backgroundColor).not.toBe(role);
    expect(getComputedStyle(slot(three, 'bullet')).backgroundColor).not.toBe(role);
  });
});
