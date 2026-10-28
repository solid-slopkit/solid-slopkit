import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import type { SlopColor, SlopSize } from '../../../core';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Text } from './text';

describe('<Text />', () => {
  test('renders a paragraph with its defaults', () => {
    const { getByText } = render(() => <Text>Hello</Text>);
    const text = getByText('Hello');

    expect(text.tagName).toBe('P');
    expect(text).toHaveClass('slp-text');
    expect(text).toHaveAttribute('data-size', 'md');
    for (const name of [
      'data-color',
      'data-dimmed',
      'data-weight',
      'data-align',
      'data-tabular-nums',
      'data-transform',
      'data-truncate',
      'data-line-clamp',
      'data-inherit',
    ]) {
      expect(text).not.toHaveAttribute(name);
    }
    expect(text).not.toHaveAttribute('style');
  });

  test('reflects its props as data attributes, and passes the rest to the element', () => {
    const { getByText } = render(() => (
      <Text
        size="sm"
        color="error"
        dimmed
        weight="semibold"
        align="center"
        tabularNums
        transform="uppercase"
        truncate
        id="t"
        class="mine"
        aria-live="polite"
      >
        Hello
      </Text>
    ));
    const text = getByText('Hello');

    expect(text).toHaveClass('slp-text', 'mine');
    expect(text).toHaveAttribute('data-size', 'sm');
    expect(text).toHaveAttribute('data-color', 'error');
    expect(text).toHaveAttribute('data-dimmed', '');
    expect(text).toHaveAttribute('data-weight', 'semibold');
    expect(text).toHaveAttribute('data-align', 'center');
    expect(text).toHaveAttribute('data-tabular-nums', '');
    expect(text).toHaveAttribute('data-transform', 'uppercase');
    expect(text).toHaveAttribute('data-truncate', '');
    expect(text).toHaveAttribute('id', 't');
    expect(text).toHaveAttribute('aria-live', 'polite');
    expect(text).not.toHaveAttribute('size');
    expect(text).not.toHaveAttribute('color');
    expect(text).not.toHaveAttribute('align');
    expect(text).not.toHaveAttribute('transform');
  });

  test('as renders another element, with its own attributes', () => {
    const { getByText } = render(() => (
      <>
        <Text as="span" size="xs">
          Inline
        </Text>
        <Text as="label" for="field">
          Label
        </Text>
      </>
    ));

    expect(getByText('Inline').tagName).toBe('SPAN');
    expect(getByText('Inline')).toHaveAttribute('data-size', 'xs');
    expect(getByText('Inline')).not.toHaveAttribute('as');
    expect(getByText('Label').tagName).toBe('LABEL');
    expect(getByText('Label')).toHaveAttribute('for', 'field');
  });

  test('inherit drops the size', () => {
    const { getByText } = render(() => (
      <Text size="lg" inherit>
        Hello
      </Text>
    ));

    expect(getByText('Hello')).toHaveAttribute('data-inherit', '');
    expect(getByText('Hello')).not.toHaveAttribute('data-size');
  });

  test('lineClamp sets the line count as a custom property, merged with style', () => {
    const { getByText } = render(() => (
      <>
        <Text lineClamp={3} style={{ color: 'red' }}>
          Styled
        </Text>
        <Text as="div" lineClamp={2}>
          Unstyled
        </Text>
      </>
    ));

    const styled = getByText('Styled');
    expect(styled).toHaveAttribute('data-line-clamp', '');
    expect(styled.style.getPropertyValue('--_text-line-clamp')).toBe('3');
    expect(styled.style.color).toBe('red');
    expect(getByText('Unstyled').style.getPropertyValue('--_text-line-clamp')).toBe('2');
  });

  test('prop changes update attributes without diagnostics or waste', async () => {
    const [size, setSize] = createSignal<SlopSize>('md', { name: 'size' });
    const [color, setColor] = createSignal<SlopColor | undefined>(undefined, { name: 'color' });
    const [lines, setLines] = createSignal<number | undefined>(undefined, { name: 'lines' });
    const { getByText } = render(() => (
      <Text size={size()} color={color()} lineClamp={lines()}>
        Hello
      </Text>
    ));
    flush();
    const text = getByText('Hello');

    const { artifact } = await captureArtifact(
      () => {
        setSize('xl');
        setColor('primary');
        setLines(2);
      },
      { scenario: 'text-props' },
    );

    expect(text).toHaveAttribute('data-size', 'xl');
    expect(text).toHaveAttribute('data-color', 'primary');
    expect(text.style.getPropertyValue('--_text-line-clamp')).toBe('2');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Text>Paragraph</Text>
        <Text size="sm" color="primary" weight="bold">
          Colored
        </Text>
        <Text dimmed truncate>
          Dimmed and truncated
        </Text>
        <Text as="label" for="field">
          Label
        </Text>
        <input id="field" />
        <Text as="span" lineClamp={2} inherit>
          Inline
        </Text>
      </>
    ));

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./text.fixtures.tsx', 'variants');
  });
});
