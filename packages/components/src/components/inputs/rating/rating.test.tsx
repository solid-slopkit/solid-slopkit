import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Rating } from './rating';

const click = (el: HTMLElement) => {
  fireEvent.click(el);
  flush();
};
const fills = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="rating-star"] svg:last-child')).map((svg) =>
    svg.style.getPropertyValue('--_rating-fill'),
  );

describe('<Rating />', () => {
  test('a radiogroup named by the label, one radio per star, named by its value', () => {
    const { getByRole, getAllByRole, container } = render(() => <Rating label="Your rating" defaultValue={3} class="mine" />);
    const radios = getAllByRole('radio');

    expect(getByRole('radiogroup', { name: 'Your rating' })).toBeInTheDocument();
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveAccessibleName('1 star');
    expect(radios[2]).toHaveAccessibleName('3 stars');
    expect(radios[2]).toBeChecked();
    expect(new Set(radios.map((radio) => radio.getAttribute('name'))).size).toBe(1);
    expect(fills(container)).toEqual(['100%', '100%', '100%', '0%', '0%']);
    expect(container.firstElementChild).toHaveClass('slp-rating', 'mine');
    expect(container.firstElementChild).toHaveAttribute('data-color', 'warning');
  });

  test('choosing a star sets the rating and fills the stars up to it', () => {
    const onChange = vi.fn();
    const { getByRole, container } = render(() => <Rating label="Rating" onChange={onChange} />);

    click(getByRole('radio', { name: '4 stars' }));

    expect(onChange).toHaveBeenCalledWith(4);
    expect(fills(container)).toEqual(['100%', '100%', '100%', '100%', '0%']);
  });

  test('fractions={2}: a radio per half star; a half fills half a star', () => {
    const { getAllByRole, container } = render(() => <Rating label="Rating" fractions={2} defaultValue={2.5} />);
    const radios = getAllByRole('radio');

    expect(radios).toHaveLength(10);
    expect(radios[4]).toHaveAccessibleName('2.5 stars');
    expect(radios[4]).toBeChecked();
    expect(fills(container)).toEqual(['100%', '100%', '50%', '0%', '0%']);
  });

  test('hovering previews a rating; leaving shows the value again', () => {
    const { container } = render(() => <Rating label="Rating" defaultValue={1} />);
    const labels = container.querySelectorAll('label');

    fireEvent.pointerEnter(labels[3]);
    flush();
    expect(fills(container)).toEqual(['100%', '100%', '100%', '100%', '0%']);

    fireEvent.pointerLeave(container.querySelector('[role="radiogroup"]')!);
    flush();
    expect(fills(container)).toEqual(['100%', '0%', '0%', '0%', '0%']);
  });

  test('allowClear: choosing the current rating again sets it to 0', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => <Rating label="Rating" defaultValue={2} allowClear onChange={onChange} />);

    click(getByRole('radio', { name: '2 stars' }));

    expect(onChange).toHaveBeenCalledWith(0);
    expect(getByRole('radio', { name: '2 stars' })).not.toBeChecked();
  });

  test('controlled: a choice the parent ignores is undone', () => {
    const [value, setValue] = createSignal(2);
    const onChange = vi.fn();
    const { getByRole } = render(() => <Rating label="Rating" value={value()} onChange={onChange} />);

    click(getByRole('radio', { name: '5 stars' }));
    expect(onChange).toHaveBeenCalledWith(5);
    expect(getByRole('radio', { name: '2 stars' })).toBeChecked();
    expect(getByRole('radio', { name: '5 stars' })).not.toBeChecked();

    setValue(5);
    flush();
    expect(getByRole('radio', { name: '5 stars' })).toBeChecked();
    expect(untrack(value)).toBe(5);
  });

  test('read-only: one image named by the rating, no radios', () => {
    const { getByRole, queryAllByRole, container } = render(() => <Rating readOnly value={4.3} count={5} />);

    expect(getByRole('img', { name: 'Rated 4.3 out of 5' })).toBeInTheDocument();
    expect(queryAllByRole('radio')).toHaveLength(0);
    expect(fills(container)[4]).toBe('30%');
  });

  test('itemLabel, count, name and disabled', () => {
    const { getAllByRole } = render(() => (
      <Rating label="Score" count={3} name="score" disabled itemLabel={(value) => `${value} of 3`} />
    ));
    const radios = getAllByRole('radio');

    expect(radios).toHaveLength(3);
    expect(radios[1]).toHaveAccessibleName('2 of 3');
    for (const radio of radios) {
      expect(radio).toHaveAttribute('name', 'score');
      expect(radio).toBeDisabled();
    }
  });

  test('choosing updates it without diagnostics or waste', async () => {
    const { getByRole } = render(() => <Rating label="Rating" defaultValue={1} />);
    flush();

    const { artifact } = await captureArtifact(() => click(getByRole('radio', { name: '3 stars' })), {
      scenario: 'rating-choose',
    });

    expect(getByRole('radio', { name: '3 stars' })).toBeChecked();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(10);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Rating label="Your rating" defaultValue={3} />
        <Rating label="Half stars" fractions={2} defaultValue={2.5} />
        <Rating aria-label="Average" readOnly value={4.3} />
        <Rating label="Disabled" disabled />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./rating.fixtures.tsx', 'ratings');
  });
});
