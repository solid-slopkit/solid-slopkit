import { render, fireEvent } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import type { SlopColor, SlopSize } from '../../../core';
import { expectHydration } from '../../../../test/ssr';
import { Button, type ButtonVariant } from './button';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { claimLinksAsCurrent } from '../../../../test/link-claims';

describe('<Button />', () => {
  test('renders a native button with defaults', () => {
    const { getByRole } = render(() => <Button>Save</Button>);
    const button = getByRole('button', { name: 'Save' });

    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveAttribute('data-shape', 'default');
    expect(button).not.toHaveAttribute('data-color');
    expect(button).not.toHaveAttribute('role');
    expect(button).not.toHaveAttribute('tabindex');
  });

  test('reflects style props as data attributes', () => {
    const { getByRole } = render(() => (
      <Button variant="outline" color="primary" size="xs" shape="circle" fullWidth active aria-label="Add" />
    ));
    const button = getByRole('button', { name: 'Add' });

    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-color', 'primary');
    expect(button).toHaveAttribute('data-size', 'xs');
    expect(button).toHaveAttribute('data-shape', 'circle');
    expect(button).toHaveAttribute('data-full-width', '');
    expect(button).toHaveAttribute('data-pressed', '');
  });

  test('as a link, it keeps its own pressed state when a router marks every link to this page', () => {
    claimLinksAsCurrent();
    const [active, setActive] = createSignal(false);
    const { getByRole } = render(() => (
      <Button as="a" href="/docs" active={active()}>
        Docs
      </Button>
    ));
    flush();
    const link = getByRole('link', { name: 'Docs' });

    expect(link).toHaveAttribute('data-active', '');
    expect(link).not.toHaveAttribute('data-pressed');
    setActive(true);
    flush();
    expect(link).toHaveAttribute('data-pressed', '');
  });

  test('as="a" with href stays a link', () => {
    const { getByRole } = render(() => (
      <Button as="a" href="/docs">
        Docs
      </Button>
    ));
    flush();
    const link = getByRole('link', { name: 'Docs' });

    expect(link.tagName).toBe('A');
    expect(link).not.toHaveAttribute('role');
    expect(link).not.toHaveAttribute('type');
    expect(link).not.toHaveAttribute('tabindex');
  });

  test('as="div" gets button semantics', () => {
    const { getByRole } = render(() => <Button as="div">Div</Button>);
    flush();
    const button = getByRole('button', { name: 'Div' });

    expect(button.tagName).toBe('DIV');
    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).not.toHaveAttribute('type');
    expect(button).not.toHaveAttribute('disabled');
  });

  test('disabled blocks clicks', () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <Button disabled onClick={onClick}>
        Save
      </Button>
    ));
    const button = getByRole('button', { name: 'Save' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled', '');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('loading blocks clicks without the disabled look', () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <Button loading onClick={onClick}>
        Save
      </Button>
    ));
    const button = getByRole('button', { name: 'Save' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-loading', '');
    expect(button).not.toHaveAttribute('data-disabled');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('disabled custom element uses aria-disabled and leaves the tab order', () => {
    const { getByRole } = render(() => (
      <Button as="div" disabled>
        Div
      </Button>
    ));
    flush();
    const button = getByRole('button', { name: 'Div' });

    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled', '');
    expect(button).not.toHaveAttribute('tabindex');
  });

  test('a role="button" element clicks on Enter key down and on Space key up', () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const { getByRole } = render(() => (
      <Button as="div" onClick={onClick} onKeyDown={onKeyDown}>
        Div
      </Button>
    ));
    flush();
    const button = getByRole('button', { name: 'Div' });

    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);

    // Space doesn't scroll the page, and clicks when released.
    expect(fireEvent.keyDown(button, { key: ' ' })).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyUp(button, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);

    // A key up without its key down, e.g. after focus moved here, does nothing.
    fireEvent.keyUp(button, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test('a handler that prevents the default keeps the key from clicking', () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <Button as="div" onClick={onClick} onKeyDown={(event) => event.preventDefault()}>
        Div
      </Button>
    ));
    flush();

    fireEvent.keyDown(getByRole('button', { name: 'Div' }), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  test('a disabled or loading role="button" element ignores clicks and keys', () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <>
        <Button as="div" disabled onClick={onClick}>
          Disabled
        </Button>
        <Button as="span" loading onClick={onClick}>
          Loading
        </Button>
      </>
    ));
    flush();

    for (const name of ['Disabled', 'Loading']) {
      const button = getByRole('button', { name });
      fireEvent.click(button);
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyUp(button, { key: ' ' });
    }
    expect(onClick).not.toHaveBeenCalled();
  });

  test('native buttons and links keep their own key handling, and still get onClick', () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <Button as="a" href="#here" onClick={onClick}>
        Link
      </Button>
    ));
    flush();
    const link = getByRole('link', { name: 'Link' });

    // Only the browser turns Enter on a link into a click.
    expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./button.fixtures.tsx', 'variants');
  });

  test('style prop changes update attributes without diagnostics or waste', async () => {
    const [variant, setVariant] = createSignal<ButtonVariant>('solid', { name: 'variant' });
    const [color, setColor] = createSignal<SlopColor>('neutral', { name: 'color' });
    const [size, setSize] = createSignal<SlopSize>('md', { name: 'size' });
    const { getByRole } = render(() => (
      <Button variant={variant()} color={color()} size={size()}>
        Save
      </Button>
    ));
    flush();
    const button = getByRole('button', { name: 'Save' });

    const { artifact } = await captureArtifact(
      () => {
        setVariant('ghost');
        setColor('error');
        setSize('lg');
      },
      { scenario: 'button-style-props' },
    );

    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-color', 'error');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Button>Text</Button>
        <Button color="primary" variant="outline" disabled>
          Disabled
        </Button>
        <Button loading>Loading</Button>
        <Button shape="circle" aria-label="Add">
          <svg viewBox="0 0 24 24" aria-hidden="true" />
        </Button>
        <Button as="a" href="/docs">
          Link
        </Button>
      </>
    ));
    flush();

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
