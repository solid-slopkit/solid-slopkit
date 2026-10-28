import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Accordion, type AccordionProps } from './accordion';

function setup(props: Partial<AccordionProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <Accordion onChange={onChange} {...(props as AccordionProps)}>
      <Accordion.Item value="shipping">
        <Accordion.Control icon={<span>*</span>}>Shipping</Accordion.Control>
        <Accordion.Panel>
          Shipping content <button type="button">Track</button>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Control>Returns</Accordion.Control>
        <Accordion.Panel>Returns content</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="warranty">
        <Accordion.Control disabled>Warranty</Accordion.Control>
        <Accordion.Panel>Warranty content</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="contact">
        <Accordion.Control>Contact</Accordion.Control>
        <Accordion.Panel>Contact content</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  ));
  flush();
  const control = (name: string) => result.getByRole('button', { name });
  const click = (name: string) => {
    fireEvent.click(control(name));
    flush();
  };
  const key = (name: string, key: string) => {
    fireEvent.keyDown(control(name), { key });
    flush();
  };
  const expanded = () =>
    result
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-expanded') === 'true')
      .map((button) => button.querySelector('[data-slot="accordion-label"]')!.textContent);
  return { ...result, control, click, key, expanded, onChange };
}

describe('<Accordion />', () => {
  test('controls are buttons in headings, each controlling its labelled region', () => {
    const { control, getByRole, container } = setup({ class: 'mine' });

    expect(container.querySelector('.slp-accordion')).toHaveClass('mine');
    expect(control('Shipping').parentElement!.tagName).toBe('H3');
    expect(getByRole('heading', { level: 3, name: 'Shipping' })).toBeDefined();
    expect(control('Shipping')).toHaveAttribute('aria-expanded', 'false');

    const panel = document.getElementById(control('Shipping').getAttribute('aria-controls')!)!;
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-labelledby', control('Shipping').id);
    expect(panel).not.toHaveAttribute('data-opened');
    expect(panel).toHaveTextContent('Shipping content');
  });

  test('order sets the heading level', () => {
    const { control } = setup({ order: 2 });
    expect(control('Shipping').parentElement!.tagName).toBe('H2');
  });

  test('a click opens an item and closes the one that was open', () => {
    const { click, expanded, onChange, getByText } = setup();

    click('Shipping');
    expect(expanded()).toEqual(['Shipping']);
    expect(onChange).toHaveBeenLastCalledWith('shipping');
    expect(getByText('Shipping content').closest('[role="region"]')).toHaveAttribute('data-opened');

    click('Returns');
    expect(expanded()).toEqual(['Returns']);
    expect(onChange).toHaveBeenLastCalledWith('returns');

    click('Returns');
    expect(expanded()).toEqual([]);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test('multiple: several open at once', () => {
    const { click, expanded, onChange } = setup({ multiple: true, defaultValue: ['contact'] });

    expect(expanded()).toEqual(['Contact']);
    click('Shipping');
    expect(expanded()).toEqual(['Shipping', 'Contact']);
    expect(onChange).toHaveBeenLastCalledWith(['contact', 'shipping']);
    click('Contact');
    expect(onChange).toHaveBeenLastCalledWith(['shipping']);
  });

  test('a disabled control does nothing', () => {
    const { control, expanded } = setup();

    expect(control('Warranty')).toBeDisabled();
    fireEvent.click(control('Warranty'));
    flush();
    expect(expanded()).toEqual([]);
  });

  test('Up and Down move between the controls, skipping disabled ones and looping; Home and End', () => {
    const { control, key } = setup();
    control('Shipping').focus();

    key('Shipping', 'ArrowDown');
    expect(control('Returns')).toHaveFocus();
    key('Returns', 'ArrowDown');
    expect(control('Contact')).toHaveFocus();
    key('Contact', 'ArrowDown');
    expect(control('Shipping')).toHaveFocus();
    key('Shipping', 'ArrowUp');
    expect(control('Contact')).toHaveFocus();
    key('Contact', 'Home');
    expect(control('Shipping')).toHaveFocus();
    key('Shipping', 'End');
    expect(control('Contact')).toHaveFocus();
  });

  test('keys in a panel do nothing to the controls', () => {
    const { getByRole, click } = setup();
    click('Shipping');
    const track = getByRole('button', { name: 'Track' });
    track.focus();

    fireEvent.keyDown(track, { key: 'ArrowDown' });
    flush();
    expect(track).toHaveFocus();
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal<string | null>('returns');
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Accordion value={value()} onChange={onChange}>
        <Accordion.Item value="shipping">
          <Accordion.Control>Shipping</Accordion.Control>
          <Accordion.Panel>…</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="returns">
          <Accordion.Control>Returns</Accordion.Control>
          <Accordion.Panel>…</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    ));
    flush();

    fireEvent.click(getByRole('button', { name: 'Shipping' }));
    flush();
    expect(onChange).toHaveBeenCalledWith('shipping');
    expect(getByRole('button', { name: 'Returns' })).toHaveAttribute('aria-expanded', 'true');

    setValue('shipping');
    flush();
    expect(getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('button', { name: 'Returns' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('a custom chevron in each control, on the left; rotation can be turned off', () => {
    const { container } = render(() => (
      <Accordion chevron={<svg data-testid="mine" />} chevronPosition="left" disableChevronRotation>
        <Accordion.Item value="a">
          <Accordion.Control>A</Accordion.Control>
          <Accordion.Panel>…</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Control>B</Accordion.Control>
          <Accordion.Panel>…</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    ));
    const controls = container.querySelectorAll('[data-slot="accordion-control"]');

    expect(container.querySelectorAll('[data-testid="mine"]')).toHaveLength(2);
    expect(controls[0]).toHaveAttribute('data-chevron-position', 'left');
    expect(controls[0]).not.toHaveAttribute('data-rotate');
  });

  test('the chevron and the icon add nothing to the name', () => {
    const { getByRole } = setup();
    expect(getByRole('button', { name: 'Shipping' })).toBeDefined();
  });

  test('ids are safe for values with spaces and punctuation', () => {
    const { getByRole } = render(() => (
      <Accordion defaultValue="a b/c">
        <Accordion.Item value="a b/c">
          <Accordion.Control>Odd</Accordion.Control>
          <Accordion.Panel>Odd content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    ));
    flush();

    expect(getByRole('button').id).not.toMatch(/[\s/]/);
    expect(getByRole('region', { name: 'Odd' })).toBeDefined();
  });

  test('the parts throw outside Accordion and Accordion.Item', () => {
    expect(() => render(() => <Accordion.Item value="a" />)).toThrow('<Accordion.Item> must be rendered inside <Accordion>.');
    expect(() =>
      render(() => (
        <Accordion>
          <Accordion.Control>A</Accordion.Control>
        </Accordion>
      )),
    ).toThrow('<Accordion.Control> must be rendered inside <Accordion.Item>.');
  });

  test('has no axe violations, closed and open', async () => {
    const { container, click } = setup({ variant: 'bordered' });
    expect((await axe.run(container)).violations).toEqual([]);
    click('Returns');
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('opening and moving have no diagnostics or waste', async () => {
    const { click, key, control } = setup();
    control('Shipping').focus();

    const { artifact } = await captureArtifact(
      () => {
        click('Shipping');
        click('Returns');
        key('Returns', 'ArrowDown');
      },
      { scenario: 'accordion-toggle' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./accordion.fixtures.tsx', 'accordions');
  });
});
