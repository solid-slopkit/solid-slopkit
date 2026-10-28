import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass, resolveStyleProps } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { Container } from './container';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const containerClass = (size: string | number) => resolveStyleClass({ size }, 'container')!.className;

describe('<Container />', () => {
  test('sizes: presets read the size variables, numbers are spacing units, strings are CSS lengths', () => {
    expect(resolveStyleProps({}, 'container')).toEqual({ base: ['max-width:var(--slp-container-size-md)'] });
    expect(resolveStyleProps({ size: 'xl' }, 'container')).toEqual({ base: ['max-width:var(--slp-container-size-xl)'] });
    expect(resolveStyleProps({ size: 200 }, 'container')).toEqual({ base: ['max-width:calc(var(--slp-spacing) * 200)'] });
    expect(resolveStyleProps({ size: '40rem' }, 'container')).toEqual({ base: ['max-width:40rem'] });
  });

  test('renders a div with the container classes and passes other props through', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Container data-testid="c" size="sm" class="mine" id="c" />
      </SlopkitUi>
    ));
    flush();
    const container = getByTestId('c');

    expect(container).toHaveClass('slp-container', 'mine', containerClass('sm'));
    expect(container).toHaveAttribute('id', 'c');
    expect(container).not.toHaveAttribute('size');
  });

  test('fluid is full width, ignoring size, and updates without diagnostics or waste', async () => {
    const [fluid, setFluid] = createSignal(false, { name: 'fluid' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Container data-testid="c" size="lg" fluid={fluid()} />
      </SlopkitUi>
    ));
    flush();
    const container = getByTestId('c');
    expect(container).toHaveClass(containerClass('lg'));
    expect(container).not.toHaveAttribute('fluid');

    const { artifact } = await captureArtifact(() => setFluid(true), { scenario: 'container-fluid' });

    expect(container).toHaveClass(containerClass('100%'));
    expect(container).not.toHaveClass(containerClass('lg'));
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /Container/ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Container>
          <p>Content</p>
        </Container>
        <Container role="main" size="sm" fluid>
          <h1>Title</h1>
        </Container>
      </SlopkitUi>
    ));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./container.fixtures.tsx', 'sizes');
  });
});
