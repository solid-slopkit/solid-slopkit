import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Burger } from './burger';

describe('<Burger />', () => {
  test('a closed ghost ActionIcon named "Navigation", with hidden lines', () => {
    const { getByRole } = render(() => <Burger />);
    const button = getByRole('button', { name: 'Navigation', expanded: false });
    const lines = button.querySelector('[data-slot="burger-lines"]');

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('slp-burger', 'slp-action-icon', 'slp-button');
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).not.toHaveAttribute('data-opened');
    expect(lines).toHaveAttribute('aria-hidden', 'true');
  });

  test('uncontrolled: a press toggles it and calls onChange; defaultOpened starts it open', () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(() => (
      <>
        <Burger onChange={onChange} />
        <Burger defaultOpened label="Menu" />
      </>
    ));
    const [burger, opened] = getAllByRole('button');

    expect(opened).toHaveAttribute('aria-expanded', 'true');
    expect(opened).toHaveAttribute('data-opened', '');

    fireEvent.click(burger);
    flush();
    expect(burger).toHaveAttribute('aria-expanded', 'true');
    expect(burger).toHaveAttribute('data-opened', '');
    expect(onChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(burger);
    flush();
    expect(burger).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  test('controlled: it follows opened, and a press only asks for the change', () => {
    const [opened, setOpened] = createSignal(false);
    const onChange = vi.fn();
    const { getByRole } = render(() => <Burger opened={opened()} onChange={onChange} />);
    const button = getByRole('button');

    fireEvent.click(button);
    flush();
    expect(onChange).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute('aria-expanded', 'false');

    setOpened(true);
    flush();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  test('label, color, size and other props pass through; onClick can prevent the toggle', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Burger
        label="Menu"
        color="primary"
        size="lg"
        aria-controls="nav"
        class="mine"
        onChange={onChange}
        onClick={(event) => event.preventDefault()}
      />
    ));
    const button = getByRole('button', { name: 'Menu' });

    expect(button).toHaveAttribute('data-color', 'primary');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(button).toHaveAttribute('aria-controls', 'nav');
    expect(button).toHaveClass('slp-burger', 'mine');

    fireEvent.click(button);
    flush();
    expect(onChange).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('disabled does not toggle', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => <Burger disabled onChange={onChange} />);

    fireEvent.click(getByRole('button'));
    flush();

    expect(onChange).not.toHaveBeenCalled();
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  test('toggling updates the button without diagnostics or waste', async () => {
    const { getByRole } = render(() => <Burger />);
    flush();
    const button = getByRole('button');

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(button);
        flush();
      },
      { scenario: 'burger-toggle' },
    );

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations, closed and open', async () => {
    const { container } = render(() => (
      <>
        <nav id="nav" aria-label="Main">
          <a href="/">Home</a>
        </nav>
        <Burger aria-controls="nav" />
        <Burger defaultOpened variant="soft" color="primary" label="Menu" />
        <Burger disabled />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./burger.fixtures.tsx', 'burgers');
  });
});
