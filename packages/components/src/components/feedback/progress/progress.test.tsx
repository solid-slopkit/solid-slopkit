import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Progress } from './progress';

const fill = (el: Element) => (el as HTMLElement).style.getPropertyValue('--_progress-value');

describe('<Progress />', () => {
  test('a progressbar named "Progress", with its value and range, and a bar slot', () => {
    const { getByRole } = render(() => <Progress value={40} />);
    const progress = getByRole('progressbar', { name: 'Progress' });

    expect(progress.tagName).toBe('DIV');
    expect(progress).toHaveClass('slp-progress');
    expect(progress).toHaveAttribute('aria-valuenow', '40');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('data-color', 'primary');
    expect(progress).toHaveAttribute('data-size', 'md');
    expect(progress).not.toHaveAttribute('data-indeterminate');
    expect(fill(progress)).toBe('40%');
    expect(progress.firstElementChild).toHaveAttribute('data-slot', 'progress-bar');
  });

  test('max sets the range; the value is clamped to it', () => {
    const { getAllByRole } = render(() => (
      <>
        <Progress value={3} max={5} />
        <Progress value={150} />
        <Progress value={-5} />
      </>
    ));
    const [steps, over, under] = getAllByRole('progressbar');

    expect(steps).toHaveAttribute('aria-valuemax', '5');
    expect(fill(steps)).toBe('60%');
    expect(over).toHaveAttribute('aria-valuenow', '100');
    expect(fill(over)).toBe('100%');
    expect(under).toHaveAttribute('aria-valuenow', '0');
    expect(fill(under)).toBe('0%');
  });

  test('without a value it is indeterminate, with no aria-valuenow', () => {
    const { getByRole } = render(() => <Progress label="Uploading" />);
    const progress = getByRole('progressbar', { name: 'Uploading' });

    expect(progress).toHaveAttribute('data-indeterminate', '');
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(fill(progress)).toBe('');
  });

  test('aria-labelledby replaces the label; animated implies striped; other props pass through', () => {
    const { getByRole } = render(() => (
      <>
        <span id="caption">Disk space</span>
        <Progress
          value={70}
          aria-labelledby="caption"
          aria-valuetext="7 of 10 GB"
          animated
          color="warning"
          size="xl"
          style={{ margin: '1px' }}
          id="p"
          class="mine"
        />
      </>
    ));
    const progress = getByRole('progressbar', { name: 'Disk space' });

    expect(progress).not.toHaveAttribute('aria-label');
    expect(progress).toHaveAttribute('aria-valuetext', '7 of 10 GB');
    expect(progress).toHaveAttribute('data-striped', '');
    expect(progress).toHaveAttribute('data-animated', '');
    expect(progress).toHaveAttribute('data-color', 'warning');
    expect(progress).toHaveAttribute('data-size', 'xl');
    expect((progress as HTMLElement).style.margin).toBe('1px');
    expect(fill(progress)).toBe('70%');
    expect(progress).toHaveAttribute('id', 'p');
    expect(progress).toHaveClass('slp-progress', 'mine');
  });

  test('a new value updates the bar and aria-valuenow without diagnostics or waste', async () => {
    const [value, setValue] = createSignal(10, { name: 'value' });
    const { getByRole } = render(() => <Progress value={value()} />);
    flush();

    const { artifact } = await captureArtifact(() => setValue(55), { scenario: 'progress-value' });

    const progress = getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '55');
    expect(fill(progress)).toBe('55%');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Progress value={40} />
        <Progress value={3} max={5} striped label="Steps done" />
        <Progress label="Uploading" />
        <span id="caption">Disk space</span>
        <Progress value={70} aria-labelledby="caption" animated />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./progress.fixtures.tsx', 'bars');
  });
});
