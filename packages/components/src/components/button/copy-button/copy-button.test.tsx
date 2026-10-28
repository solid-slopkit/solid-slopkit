import { fireEvent, render, waitFor } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { CopyButton } from './copy-button';

let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;

beforeEach(() => {
  writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
});

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard');
});

const icon = (button: HTMLElement) => button.querySelector('[data-slot="copy-button-icon"] path')!.getAttribute('d');

describe('<CopyButton />', () => {
  test('a ghost ActionIcon named "Copy", with a copy icon', () => {
    const { getByRole } = render(() => <CopyButton value="hello" />);
    const button = getByRole('button', { name: 'Copy' });

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('slp-copy-button', 'slp-action-icon', 'slp-button');
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-shape', 'square');
    expect(button).not.toHaveAttribute('data-copied');
    expect(button).not.toHaveAttribute('value');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  test('a click copies the value, then confirms: check icon, "Copied", success, data-copied', async () => {
    const onCopied = vi.fn();
    const { getByRole } = render(() => <CopyButton value="hello" color="primary" onCopied={onCopied} />);
    const button = getByRole('button');
    const copyIcon = icon(button);

    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveAccessibleName('Copied'));
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(onCopied).toHaveBeenCalledWith('hello');
    expect(button).toHaveAttribute('data-copied', '');
    expect(button).toHaveAttribute('data-color', 'success');
    expect(icon(button)).not.toBe(copyIcon);
  });

  test('the confirmation ends after timeout, and the button goes back to how it was', async () => {
    const { getByRole } = render(() => <CopyButton value="hello" color="primary" timeout={30} />);
    const button = getByRole('button');

    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('data-copied'));
    await waitFor(() => expect(button).not.toHaveAttribute('data-copied'));

    expect(button).toHaveAccessibleName('Copy');
    expect(button).toHaveAttribute('data-color', 'primary');
  });

  test('label and copiedLabel name it; other props pass through', async () => {
    const { getByRole } = render(() => (
      <CopyButton value="https://example.com" label="Copy link" copiedLabel="Link copied" size="sm" id="c" class="mine" />
    ));
    const button = getByRole('button', { name: 'Copy link' });

    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('id', 'c');
    expect(button).toHaveClass('slp-copy-button', 'mine');

    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveAccessibleName('Link copied'));
  });

  test('a refused copy calls onCopyError and confirms nothing', async () => {
    const error = new DOMException('Denied', 'NotAllowedError');
    writeText.mockRejectedValueOnce(error);
    const onCopyError = vi.fn();
    const onCopied = vi.fn();
    const { getByRole } = render(() => <CopyButton value="hello" onCopied={onCopied} onCopyError={onCopyError} />);
    const button = getByRole('button');

    fireEvent.click(button);

    await waitFor(() => expect(onCopyError).toHaveBeenCalledWith(error));
    expect(onCopied).not.toHaveBeenCalled();
    expect(button).not.toHaveAttribute('data-copied');
  });

  test('without the Clipboard API, onCopyError is called', async () => {
    Reflect.deleteProperty(navigator, 'clipboard');
    const onCopyError = vi.fn();
    const { getByRole } = render(() => <CopyButton value="hello" onCopyError={onCopyError} />);

    fireEvent.click(getByRole('button'));

    await waitFor(() => expect(onCopyError).toHaveBeenCalledTimes(1));
  });

  test('onClick runs first, and preventDefault stops the copy; disabled copies nothing', () => {
    const { getByRole } = render(() => (
      <>
        <CopyButton value="a" label="Prevented" onClick={(event) => event.preventDefault()} />
        <CopyButton value="b" label="Disabled" disabled />
      </>
    ));

    fireEvent.click(getByRole('button', { name: 'Prevented' }));
    fireEvent.click(getByRole('button', { name: 'Disabled' }));

    expect(writeText).not.toHaveBeenCalled();
  });

  test('copying updates the button without diagnostics or waste', async () => {
    const { getByRole } = render(() => <CopyButton value="hello" />);
    flush();
    const button = getByRole('button');

    const { artifact } = await captureArtifact(
      async () => {
        fireEvent.click(button);
        await waitFor(() => expect(button).toHaveAttribute('data-copied'));
      },
      { scenario: 'copy-button-copy' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(8);
  });

  test('has no axe violations, before and after a copy', async () => {
    const { container, getAllByRole } = render(() => (
      <>
        <CopyButton value="a" />
        <CopyButton value="b" variant="soft" color="primary" label="Copy link" />
        <CopyButton value="c" disabled />
      </>
    ));

    expect((await axe.run(container)).violations).toEqual([]);

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(getAllByRole('button')[0]).toHaveAttribute('data-copied'));

    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./copy-button.fixtures.tsx', 'copyButtons');
  });
});
