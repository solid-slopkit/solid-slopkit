import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Collapse, type CollapseProps } from './collapse';

function setup(props: Partial<CollapseProps> = {}) {
  const result = render(() => (
    <Collapse data-testid="collapse" {...props}>
      <Collapse.Title>Shipping</Collapse.Title>
      <Collapse.Content data-testid="content">
        <p>Content</p>
      </Collapse.Content>
    </Collapse>
  ));
  return {
    ...result,
    collapse: () => result.getByTestId('collapse'),
    title: () => result.getByRole('button', { name: 'Shipping' }),
    content: () => result.getByTestId('content'),
  };
}

describe('<Collapse />', () => {
  test('renders a div, a button and the content with their root classes, closed', () => {
    const { collapse, title, content, getByText } = setup({ class: 'mine' });

    expect(collapse().tagName).toBe('DIV');
    expect(collapse()).toHaveClass('slp-collapse', 'mine');
    expect(collapse()).not.toHaveAttribute('data-opened');
    expect(collapse()).not.toHaveAttribute('data-icon');
    expect(title()).toHaveClass('slp-collapse-title');
    expect(title()).toHaveAttribute('type', 'button');
    expect(content()).toHaveClass('slp-collapse-content');
    expect(content()).not.toHaveAttribute('data-opened');
    expect(getByText('Content').parentElement).toHaveAttribute('data-slot', 'collapse-content-body');
  });

  test('the title controls the content: aria-expanded and aria-controls', () => {
    const { title, content } = setup();

    expect(title()).toHaveAttribute('aria-expanded', 'false');
    expect(content().id).not.toBe('');
    expect(title()).toHaveAttribute('aria-controls', content().id);
  });

  test('pressing the title opens and closes it, uncontrolled', () => {
    const onChange = vi.fn();
    const { collapse, title, content } = setup({ onChange });

    fireEvent.click(title());
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(title()).toHaveAttribute('aria-expanded', 'true');
    expect(collapse()).toHaveAttribute('data-opened', '');
    expect(title()).toHaveAttribute('data-opened', '');
    expect(content()).toHaveAttribute('data-opened', '');

    fireEvent.click(title());
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(title()).toHaveAttribute('aria-expanded', 'false');
    expect(content()).not.toHaveAttribute('data-opened');
  });

  test('defaultOpened starts it open', () => {
    const { title, content } = setup({ defaultOpened: true });

    expect(title()).toHaveAttribute('aria-expanded', 'true');
    expect(content()).toHaveAttribute('data-opened', '');
  });

  test('controlled: follows opened, and only asks to change it', () => {
    const [opened, setOpened] = createSignal(false);
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Collapse opened={opened()} onChange={onChange}>
        <Collapse.Title>Shipping</Collapse.Title>
        <Collapse.Content>Content</Collapse.Content>
      </Collapse>
    ));
    const title = getByRole('button', { name: 'Shipping' });

    fireEvent.click(title);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(title).toHaveAttribute('aria-expanded', 'false');

    setOpened(true);
    flush();
    expect(title).toHaveAttribute('aria-expanded', 'true');
  });

  test('icon goes on the root and the title', () => {
    const { collapse, title } = setup({ icon: 'plus' });

    expect(collapse()).toHaveAttribute('data-icon', 'plus');
    expect(title()).toHaveAttribute('data-icon', 'plus');
  });

  test("the title's own onClick runs first, and preventDefault keeps it as it is", () => {
    const { getByRole } = render(() => (
      <Collapse>
        <Collapse.Title onClick={(event) => event.preventDefault()}>Shipping</Collapse.Title>
        <Collapse.Content>Content</Collapse.Content>
      </Collapse>
    ));
    const title = getByRole('button', { name: 'Shipping' });

    fireEvent.click(title);

    expect(title).toHaveAttribute('aria-expanded', 'false');
  });

  test('a disabled title does nothing', () => {
    const { getByRole } = render(() => (
      <Collapse>
        <Collapse.Title disabled>Shipping</Collapse.Title>
        <Collapse.Content>Content</Collapse.Content>
      </Collapse>
    ));
    const title = getByRole('button', { name: 'Shipping' });

    fireEvent.click(title);

    expect(title).toBeDisabled();
    expect(title).toHaveAttribute('aria-expanded', 'false');
  });

  test('the parts throw outside a Collapse', () => {
    expect(() => render(() => <Collapse.Title>Alone</Collapse.Title>)).toThrow(/inside <Collapse>/);
  });

  test('has no axe violations, opened and closed, with each icon', async () => {
    const { container } = render(() => (
      <>
        <Collapse defaultOpened icon="arrow">
          <Collapse.Title>Shown</Collapse.Title>
          <Collapse.Content>Shown content</Collapse.Content>
        </Collapse>
        <Collapse icon="plus">
          <Collapse.Title>Hidden</Collapse.Title>
          <Collapse.Content>Hidden content</Collapse.Content>
        </Collapse>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('opening and closing has no diagnostics or waste', async () => {
    const { title } = setup();
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(title());
        fireEvent.click(title());
      },
      { scenario: 'collapse-toggle' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./collapse.fixtures.tsx', 'collapses');
  });
});
