import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { LoadingOverlay } from './loading-overlay';

describe('<LoadingOverlay />', () => {
  test('hidden: renders nothing', () => {
    const { container } = render(() => <LoadingOverlay visible={false} />);

    expect(container.querySelector('.slp-overlay')).toBeNull();
  });

  test('shown: a centered Overlay with its root class and a labelled Loader', () => {
    let ref: HTMLDivElement | undefined;
    const { getByRole, container } = render(() => (
      <LoadingOverlay visible label="Saving" loaderVariant="bars" loaderColor="success" class="mine" ref={(el) => (ref = el)} />
    ));
    const overlay = container.querySelector('.slp-overlay') as HTMLElement;

    expect(overlay).toHaveClass('slp-loading-overlay', 'slp-transition', 'mine');
    expect(overlay).toHaveAttribute('data-center', '');
    expect(overlay).toHaveAttribute('data-blur', '');
    expect(overlay).toHaveAttribute('data-transition', 'fade');
    expect(overlay.style.getPropertyValue('--_overlay-opacity')).toBe('70%');
    expect(ref).toBe(overlay);
    const loader = getByRole('status', { name: 'Saving' });
    expect(loader).toHaveAttribute('data-slot', 'loading-overlay-loader');
    expect(loader).toHaveAttribute('data-variant', 'bars');
    expect(loader).toHaveAttribute('data-color', 'success');
    expect(loader).toHaveAttribute('data-size', 'md');
  });

  test('by default, a primary spinner of size md named Loading', () => {
    const { getByRole } = render(() => <LoadingOverlay visible />);
    const loader = getByRole('status', { name: 'Loading' });

    expect(loader).toHaveAttribute('data-variant', 'spinner');
    expect(loader).toHaveAttribute('data-color', 'primary');
    expect(loader).toHaveAttribute('data-size', 'md');
  });

  test('loader replaces the Loader', () => {
    const { getByText, queryByRole } = render(() => <LoadingOverlay visible loader={<strong>Almost there</strong>} />);

    expect(getByText('Almost there')).toBeInTheDocument();
    expect(queryByRole('status')).toBeNull();
  });

  test('showing and hiding mounts and unmounts it', async () => {
    const [visible, setVisible] = createSignal(false);
    const { container } = render(() => <LoadingOverlay visible={visible()} />);

    setVisible(true);
    flush();
    expect(container.querySelector('.slp-overlay')).not.toBeNull();

    setVisible(false);
    flush();
    await expect.poll(() => container.querySelector('.slp-overlay')).toBeNull();
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <div style={{ position: 'relative' }}>
        <p>Content</p>
        <LoadingOverlay visible />
      </div>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./loading-overlay.fixtures.tsx', 'overlays');
  });
});
