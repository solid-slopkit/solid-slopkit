import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Overlay } from './overlay';

describe('<Overlay />', () => {
  test('a div with the root class and its defaults', () => {
    const { getByTestId } = render(() => <Overlay data-testid="overlay" />);
    const overlay = getByTestId('overlay');

    expect(overlay.tagName).toBe('DIV');
    expect(overlay).toHaveClass('slp-overlay');
    expect(overlay.style.getPropertyValue('--_overlay-opacity')).toBe('60%');
    expect(overlay.style.getPropertyValue('--_overlay-blur')).toBe('');
    for (const attribute of ['data-color', 'data-blur', 'data-fixed', 'data-center']) {
      expect(overlay).not.toHaveAttribute(attribute);
    }
  });

  test('reflects its props, keeps the style, and passes the rest to the div', () => {
    const { getByRole } = render(() => (
      <Overlay
        color="primary"
        backgroundOpacity={0.25}
        blur={3}
        fixed
        center
        class="mine"
        style={{ 'z-index': '2' }}
        role="status"
        aria-label="Saving"
      >
        <span>Saving…</span>
      </Overlay>
    ));
    const overlay = getByRole('status', { name: 'Saving' });

    expect(overlay).toHaveClass('slp-overlay', 'mine');
    expect(overlay).toHaveAttribute('data-color', 'primary');
    expect(overlay).toHaveAttribute('data-blur', '');
    expect(overlay).toHaveAttribute('data-fixed', '');
    expect(overlay).toHaveAttribute('data-center', '');
    expect(overlay.style.getPropertyValue('--_overlay-opacity')).toBe('25%');
    expect(overlay.style.getPropertyValue('--_overlay-blur')).toBe('3px');
    expect(overlay.style.zIndex).toBe('2');
    expect(overlay).toHaveTextContent('Saving…');
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <div style={{ position: 'relative' }}>
        <p>Behind</p>
        <Overlay center>
          <p>On top</p>
        </Overlay>
      </div>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('changing the opacity updates only its style, without diagnostics', async () => {
    const [opacity, setOpacity] = createSignal(0.6, { name: 'opacity' });
    const { getByTestId } = render(() => <Overlay data-testid="overlay" backgroundOpacity={opacity()} />);
    flush();

    const { artifact } = await captureArtifact(
      () => {
        setOpacity(0.2);
        flush();
      },
      { scenario: 'overlay-opacity' },
    );

    expect(getByTestId('overlay').style.getPropertyValue('--_overlay-opacity')).toBe('20%');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /Overlay\.style/ });
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./overlay.fixtures.tsx', 'overlays');
  });
});
