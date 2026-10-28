import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { CopyButton } from './copy-button';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<CopyButton /> in a browser', () => {
  test('Tab reaches it; Enter copies the value and confirms it', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const { getByRole } = render(() => <CopyButton value="npm i @solid-slopkit/components" />);

    await userEvent.tab();
    expect(getByRole('button', { name: 'Copy' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await expect.poll(() => getByRole('button').getAttribute('aria-label')).toBe('Copied');
    expect(writeText).toHaveBeenCalledWith('npm i @solid-slopkit/components');
    // The button keeps focus while its icon and name change.
    expect(getByRole('button')).toHaveFocus();
  });

  test('confirmed, it takes the success color', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const { getByRole, getByTestId } = render(() => (
      <>
        <CopyButton value="hello" />
        <span data-testid="success" style={{ color: 'var(--slp-color-success)' }} />
      </>
    ));

    await userEvent.click(getByRole('button'));

    await expect.poll(() => getComputedStyle(getByRole('button')).color).toBe(getComputedStyle(getByTestId('success')).color);
  });
});
