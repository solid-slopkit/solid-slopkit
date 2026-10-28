import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { Switch } from './switch';

const thumb = (control: Element) => control.parentElement!.querySelector('[data-slot="switch-thumb"]')!.getBoundingClientRect();

describe('<Switch /> in a browser', () => {
  test('the thumb sits at the start when off and slides to the end when on, inside the track', async () => {
    const { getByRole } = render(() => <Switch label="Wi-Fi" />);
    const control = getByRole('switch');
    const track = control.getBoundingClientRect();
    const off = thumb(control);

    expect(track.width).toBeGreaterThan(track.height * 1.7);
    expect(off.left - track.left).toBeCloseTo(track.bottom - off.bottom, 0);

    await userEvent.click(control);
    await expect.poll(() => track.right - thumb(control).right).toBeCloseTo(off.left - track.left, 0);
  });

  test('with the label on the left, the text fills the row and the switch sits at its end', () => {
    const { getByRole, getByText, container } = render(() => (
      <div style={{ width: '400px' }}>
        <Switch label="Public statistics" description="Show your stream count" labelPosition="left" />
        <Switch label="Right" />
      </div>
    ));
    const [left, right] = [...container.querySelectorAll('.slp-switch')].map((el) => el.getBoundingClientRect());
    const tracks = getByRole('switch', { name: 'Public statistics' }).getBoundingClientRect();
    const label = getByText('Public statistics').getBoundingClientRect();

    expect(Math.round(left.width)).toBe(400);
    expect(Math.round(tracks.right)).toBe(Math.round(left.right));
    expect(Math.round(label.left)).toBe(Math.round(left.left));
    // The default stays packed at the start: the switch first, then its label.
    expect(Math.round(getByRole('switch', { name: 'Right' }).getBoundingClientRect().left)).toBe(Math.round(right.left));
  });

  test('on, the track takes the role color', async () => {
    const { getByRole, getByTestId } = render(() => (
      <>
        <Switch label="Wi-Fi" color="success" defaultChecked />
        <span data-testid="role" style={{ color: 'var(--slp-color-success)' }} />
      </>
    ));

    expect(getComputedStyle(getByRole('switch')).backgroundColor).toBe(getComputedStyle(getByTestId('role')).color);
  });

  test('Tab focuses it with a ring; Space flips it', async () => {
    const { getByRole } = render(() => <Switch label="Wi-Fi" />);

    await userEvent.tab();
    expect(getByRole('switch')).toHaveFocus();
    expect(getComputedStyle(getByRole('switch')).outlineStyle).toBe('solid');
    await userEvent.keyboard(' ');
    expect(getByRole('switch')).toBeChecked();
  });

  test('the text stays readable in both color schemes', async () => {
    for (const scheme of ['light', 'dark']) {
      const { container, unmount } = render(() => (
        <div
          data-slp-color-scheme={scheme}
          style={{ background: 'var(--slp-color-base-100)', color: 'var(--slp-color-base-content)' }}
        >
          <Switch label="Wi-Fi" description="Join known networks." error="No networks found." />
        </div>
      ));

      const results = await axe.run(container, { runOnly: ['color-contrast'] });
      expect(results.violations.flatMap((v) => v.nodes.map((n) => `${scheme}: ${n.html.slice(0, 60)}`))).toEqual([]);
      unmount();
    }
  });
});
