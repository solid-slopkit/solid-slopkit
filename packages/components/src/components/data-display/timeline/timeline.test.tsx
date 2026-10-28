import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Timeline } from './timeline';

const slot = (root: Element, name: string) => root.querySelector(`[data-slot="timeline-item-${name}"]`);

describe('<Timeline />', () => {
  test('an ol of li items, primary by default, each with a hidden bullet, a title and a body', () => {
    const { getByRole, getAllByRole } = render(() => (
      <Timeline>
        <Timeline.Item title="Ordered">Monday</Timeline.Item>
        <Timeline.Item title="Shipped">Tuesday</Timeline.Item>
      </Timeline>
    ));
    const list = getByRole('list');
    const [first] = getAllByRole('listitem');

    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('slp-timeline');
    expect(list).toHaveAttribute('data-color', 'primary');
    expect(first).toHaveClass('slp-timeline-item');
    expect(first).not.toHaveAttribute('data-active');
    expect(first).not.toHaveAttribute('data-with-bullet');
    expect(slot(first, 'bullet')).toHaveAttribute('aria-hidden', 'true');
    expect(slot(first, 'title')).toHaveTextContent('Ordered');
    expect(slot(first, 'body')).toHaveTextContent('Monday');
  });

  test('active, bullet and other props on the item; color and other props on the list', () => {
    const { getByRole, getAllByRole } = render(() => (
      <Timeline color="success" id="t" class="mine">
        <Timeline.Item active bullet={<b>1</b>} id="i" class="item">
          No title
        </Timeline.Item>
      </Timeline>
    ));
    const list = getByRole('list');
    const [item] = getAllByRole('listitem');

    expect(list).toHaveAttribute('data-color', 'success');
    expect(list).toHaveAttribute('id', 't');
    expect(list).toHaveClass('slp-timeline', 'mine');
    expect(item).toHaveAttribute('data-active', '');
    expect(item).toHaveAttribute('data-with-bullet', '');
    expect(slot(item, 'bullet')).toHaveTextContent('1');
    expect(slot(item, 'title')).toBeNull();
    expect(item).toHaveAttribute('id', 'i');
    expect(item).toHaveClass('slp-timeline-item', 'item');
    expect(item).not.toHaveAttribute('title');
  });

  test('reaching the next step marks it active without diagnostics or waste', async () => {
    const [step, setStep] = createSignal(1, { name: 'step' });
    const { getAllByRole } = render(() => (
      <Timeline>
        <Timeline.Item active={step() >= 1} title="Ordered" />
        <Timeline.Item active={step() >= 2} title="Shipped" />
        <Timeline.Item active={step() >= 3} title="Delivered" />
      </Timeline>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setStep(2), { scenario: 'timeline-step' });

    expect(getAllByRole('listitem').map((item) => item.hasAttribute('data-active'))).toEqual([true, true, false]);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <Timeline>
        <Timeline.Item active title="Ordered" bullet={<svg aria-hidden="true" />}>
          Monday
        </Timeline.Item>
        <Timeline.Item title="Delivered">Expected Friday</Timeline.Item>
      </Timeline>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./timeline.fixtures.tsx', 'timelines');
  });
});
