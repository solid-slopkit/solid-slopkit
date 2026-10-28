import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { claimLinksAsCurrent } from '../../../../test/link-claims';
import { ActionIcon, type ActionIconVariant } from './action-icon';

const Icon = () => <svg aria-hidden="true" data-testid="icon" viewBox="0 0 24 24" />;

describe('<ActionIcon />', () => {
  test('a square ghost button, md, named by label, with the icon inside', () => {
    const { getByRole, getByTestId } = render(() => (
      <ActionIcon label="Edit">
        <Icon />
      </ActionIcon>
    ));
    const button = getByRole('button', { name: 'Edit' });

    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('slp-action-icon', 'slp-button');
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-shape', 'square');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).not.toHaveAttribute('label');
    expect(button).toContainElement(getByTestId('icon'));
  });

  test('variant, color, size, shape and other props pass through; class is merged', () => {
    const { getByRole } = render(() => (
      <ActionIcon label="Delete" variant="solid" color="error" size="lg" shape="circle" id="d" class="mine">
        <Icon />
      </ActionIcon>
    ));
    const button = getByRole('button', { name: 'Delete' });

    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-color', 'error');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(button).toHaveAttribute('data-shape', 'circle');
    expect(button).toHaveAttribute('id', 'd');
    expect(button).toHaveClass('slp-action-icon', 'slp-button', 'mine');
  });

  test('active, loading and disabled work as on Button', () => {
    const { getByRole } = render(() => (
      <>
        <ActionIcon label="Bold" active aria-pressed="true">
          <Icon />
        </ActionIcon>
        <ActionIcon label="Saving" loading>
          <Icon />
        </ActionIcon>
        <ActionIcon label="Locked" disabled>
          <Icon />
        </ActionIcon>
      </>
    ));

    expect(getByRole('button', { name: 'Bold', pressed: true })).toHaveAttribute('data-pressed', '');
    expect(getByRole('button', { name: 'Saving' })).toHaveAttribute('aria-busy', 'true');
    expect(getByRole('button', { name: 'Saving' })).toBeDisabled();
    expect(getByRole('button', { name: 'Locked' })).toBeDisabled();
  });

  test('a click calls onClick; a disabled one ignores it', () => {
    const onClick = vi.fn();
    const onLockedClick = vi.fn();
    const { getByRole } = render(() => (
      <>
        <ActionIcon label="Edit" onClick={onClick}>
          <Icon />
        </ActionIcon>
        <ActionIcon label="Locked" disabled onClick={onLockedClick}>
          <Icon />
        </ActionIcon>
      </>
    ));

    fireEvent.click(getByRole('button', { name: 'Edit' }));
    fireEvent.click(getByRole('button', { name: 'Locked' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLockedClick).not.toHaveBeenCalled();
  });

  test('as="a" with href renders a link named by label', () => {
    const { getByRole } = render(() => (
      <ActionIcon as="a" href="/settings" label="Settings">
        <Icon />
      </ActionIcon>
    ));
    const link = getByRole('link', { name: 'Settings' });

    expect(link).toHaveAttribute('href', '/settings');
    expect(link).toHaveClass('slp-action-icon');
    expect(link).not.toHaveAttribute('as');
  });

  test('as a link, it keeps its own pressed state when a router marks every link to this page', () => {
    claimLinksAsCurrent();
    const [active, setActive] = createSignal(false);
    const { getByRole } = render(() => (
      <ActionIcon as="a" href="/settings" label="Settings" active={active()}>
        <Icon />
      </ActionIcon>
    ));
    flush();
    const link = getByRole('link', { name: 'Settings' });

    expect(link).toHaveAttribute('data-active', '');
    expect(link).not.toHaveAttribute('data-pressed');
    setActive(true);
    flush();
    expect(link).toHaveAttribute('data-pressed', '');
  });

  test('label is required', () => {
    // @ts-expect-error -- an icon alone has no accessible name
    render(() => <ActionIcon>{<Icon />}</ActionIcon>);
  });

  test('toggling active updates the attribute without diagnostics or waste', async () => {
    const [on, setOn] = createSignal(false, { name: 'on' });
    const { getByRole } = render(() => (
      <ActionIcon label="Bold" active={on()} aria-pressed={on() ? 'true' : 'false'}>
        <Icon />
      </ActionIcon>
    ));
    flush();
    const button = getByRole('button');

    const { artifact } = await captureArtifact(() => setOn(true), { scenario: 'action-icon-active' });

    expect(button).toHaveAttribute('data-pressed', '');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('has no axe violations', async () => {
    const variants: ActionIconVariant[] = ['solid', 'soft', 'outline', 'dash', 'ghost'];
    const { container } = render(() => (
      <>
        <For each={variants}>
          {(variant) => (
            <ActionIcon label={`Edit (${variant})`} variant={variant} color="primary">
              <Icon />
            </ActionIcon>
          )}
        </For>
        <ActionIcon label="Saving" loading>
          <Icon />
        </ActionIcon>
        <ActionIcon label="Locked" disabled>
          <Icon />
        </ActionIcon>
        <ActionIcon as="a" href="/settings" label="Settings" shape="circle">
          <Icon />
        </ActionIcon>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./action-icon.fixtures.tsx', 'actionIcons');
  });
});
