import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Tabs, type TabsProps } from './tabs';

function setup(props: Partial<TabsProps> = {}) {
  return render(() => (
    <div style={{ padding: '20px', width: '400px' }}>
      <button type="button">Before</button>
      <Tabs defaultValue="one" {...props}>
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="one">One</Tabs.Tab>
          <Tabs.Tab value="two">Two</Tabs.Tab>
          <Tabs.Tab value="three">Three</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="one">First panel</Tabs.Panel>
        <Tabs.Panel value="two">
          Second panel <a href="#x">A link</a>
        </Tabs.Panel>
        <Tabs.Panel value="three">Third panel</Tabs.Panel>
      </Tabs>
    </div>
  ));
}

describe('<Tabs /> in a browser', () => {
  test('Tab reaches the selected tab, then the panel; the arrows switch tabs', async () => {
    const { getByRole, getByText } = setup();

    await userEvent.click(getByText('Before'));
    await userEvent.tab();
    expect(getByRole('tab', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(getByRole('tab', { name: 'Two' })).toHaveFocus();
    expect(getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.tab();
    expect(getByRole('tabpanel', { name: 'Two' })).toHaveFocus();
    await userEvent.tab();
    expect(getByText('A link')).toHaveFocus();
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    expect(getByRole('tab', { name: 'Two' })).toHaveFocus();
  });

  test('a click on a tab selects it', async () => {
    const { getByRole, getByText } = setup();

    await userEvent.click(getByRole('tab', { name: 'Three' }));
    expect(getByText('Third panel')).toBeVisible();
    expect(getByRole('tab', { name: 'Three' })).toHaveFocus();
  });

  test('underline: the selected tab is in the color, with a bar under it', () => {
    const { getByRole } = setup();
    const selected = getComputedStyle(getByRole('tab', { name: 'One' }));
    const other = getComputedStyle(getByRole('tab', { name: 'Two' }));

    expect(selected.boxShadow).toContain('inset');
    expect(other.boxShadow).toBe('none');
    expect(selected.color).not.toBe(other.color);
  });

  test('pills: the selected tab is filled; vertical tabs stack beside the panel', () => {
    const { getByRole } = setup({ variant: 'pills', orientation: 'vertical' });
    const one = getByRole('tab', { name: 'One' });
    const two = getByRole('tab', { name: 'Two' });

    expect(getComputedStyle(one).backgroundColor).not.toBe(getComputedStyle(two).backgroundColor);
    expect(two.getBoundingClientRect().top).toBeGreaterThan(one.getBoundingClientRect().top);
    expect(getByRole('tabpanel').getBoundingClientRect().left).toBeGreaterThan(one.getBoundingClientRect().right - 1);
  });

  test('soft: the selected tab is tinted, lighter than a pill, with its text in the color', () => {
    const soft = setup({ variant: 'soft' });
    const one = getComputedStyle(soft.getByRole('tab', { name: 'One' }));
    const two = getComputedStyle(soft.getByRole('tab', { name: 'Two' }));
    const tint = one.backgroundColor;
    const softText = one.color;
    soft.unmount();
    const pill = getComputedStyle(setup({ variant: 'pills' }).getByRole('tab', { name: 'One' }));

    expect(tint).not.toBe(two.backgroundColor);
    expect(tint).not.toBe(pill.backgroundColor);
    expect(softText).not.toBe(pill.color);
    expect(one.borderTopLeftRadius).not.toBe('0px');
  });

  test('grow shares the list between the tabs', () => {
    const { getByRole } = render(() => (
      <div style={{ width: '300px' }}>
        <Tabs defaultValue="a">
          <Tabs.List grow>
            <Tabs.Tab value="a">A</Tabs.Tab>
            <Tabs.Tab value="b">Bigger label</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>
    ));

    expect(Math.round(getByRole('tablist').getBoundingClientRect().width)).toBe(300);
    const widths = getByRole('tablist')
      .querySelectorAll('[role="tab"]')
      .values()
      .map((tab) => tab.getBoundingClientRect().width)
      .toArray();
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(300, 0);
  });
});
