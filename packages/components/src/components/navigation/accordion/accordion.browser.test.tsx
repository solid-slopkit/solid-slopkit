import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Accordion, type AccordionProps } from './accordion';

function setup(props: Partial<AccordionProps> = {}) {
  return render(() => (
    <div style={{ padding: '20px', width: '400px' }}>
      <button type="button">Before</button>
      <Accordion {...(props as AccordionProps)}>
        <Accordion.Item value="one">
          <Accordion.Control>One</Accordion.Control>
          <Accordion.Panel>
            <p style={{ margin: 0, height: '80px' }}>First panel</p>
            <a href="#x">A link</a>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Control>Two</Accordion.Control>
          <Accordion.Panel>Second panel</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <button type="button">After</button>
    </div>
  ));
}

const panelOf = (control: HTMLElement) => document.getElementById(control.getAttribute('aria-controls')!)!;

describe('<Accordion /> in a browser', () => {
  test('closed, a panel takes no height and is out of the tab order', async () => {
    const { getByRole, getByText } = setup();

    expect(panelOf(getByRole('button', { name: 'One' })).getBoundingClientRect().height).toBe(0);
    await userEvent.click(getByText('Before'));
    await userEvent.tab();
    await userEvent.tab();
    expect(getByRole('button', { name: 'Two' })).toHaveFocus();
    await userEvent.tab();
    expect(getByText('After')).toHaveFocus();
  });

  test('a click opens the panel to its height; its content joins the tab order', async () => {
    const { getByRole, getByText } = setup();
    const one = getByRole('button', { name: 'One' });

    await userEvent.click(one);
    await expect.poll(() => panelOf(one).getBoundingClientRect().height).toBeGreaterThan(80);
    expect(getByText('First panel')).toBeVisible();
    await userEvent.tab();
    expect(getByText('A link')).toHaveFocus();
  });

  test('the chevron turns as the item opens', async () => {
    const { getByRole } = setup();
    const one = getByRole('button', { name: 'One' });
    const chevron = one.querySelector<HTMLElement>('[data-slot="accordion-chevron"]')!;

    expect(getComputedStyle(chevron).transform).toBe('none');
    await userEvent.click(one);
    await expect.poll(() => getComputedStyle(chevron).transform).toMatch(/^matrix\(-1/);
  });

  test('the arrows move between the controls', async () => {
    const { getByRole } = setup();

    await userEvent.click(getByRole('button', { name: 'One' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(getByRole('button', { name: 'Two' })).toHaveFocus();
  });

  test('bordered draws one box; separated, cards with a gap', () => {
    const bordered = setup({ variant: 'bordered' });
    const box = bordered.container.querySelector<HTMLElement>('.slp-accordion')!;
    expect(getComputedStyle(box).borderTopWidth).toBe('1px');
    bordered.unmount();

    const separated = setup({ variant: 'separated' });
    const items = separated.container.querySelectorAll<HTMLElement>('.slp-accordion-item');
    expect(items[1].getBoundingClientRect().top).toBeGreaterThan(items[0].getBoundingClientRect().bottom);
  });
});
