import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Text } from './text';

const LONG = 'A sentence long enough to need several lines in a narrow column of text. '.repeat(4);

describe('<Text /> in a browser', () => {
  test('sizes read the type scale, and paragraphs have no margin', () => {
    const { getByText } = render(() => (
      <>
        <Text size="xs">xs</Text>
        <Text>md</Text>
        <Text size="xl">xl</Text>
      </>
    ));
    const css = (label: string) => getComputedStyle(getByText(label));

    expect([css('xs').fontSize, css('xs').lineHeight]).toEqual(['12px', '16px']);
    expect([css('md').fontSize, css('md').lineHeight]).toEqual(['16px', '24px']);
    expect([css('xl').fontSize, css('xl').lineHeight]).toEqual(['20px', '28px']);
    expect(css('md').marginTop).toBe('0px');
  });

  test('color reads the role token, dimmed takes the muted content color or fades the role, and without color the text inherits', () => {
    const { getByText, getByTestId } = render(() => (
      <div style={{ color: 'rgb(10, 20, 30)' }}>
        <Text>Inherited</Text>
        <Text dimmed>Dimmed</Text>
        <Text color="primary">Primary</Text>
        <Text color="primary" dimmed>
          Primary dimmed
        </Text>
        <span data-testid="token" style={{ color: 'var(--slp-color-primary)' }} />
        <span data-testid="muted" style={{ color: 'var(--slp-color-muted-content)' }} />
      </div>
    ));
    const color = (el: Element) => getComputedStyle(el).color;

    expect(color(getByText('Inherited'))).toBe('rgb(10, 20, 30)');
    expect(color(getByText('Dimmed'))).toBe(color(getByTestId('muted')));
    expect(color(getByText('Primary'))).toBe(color(getByTestId('token')));
    expect(color(getByText('Primary dimmed'))).not.toBe(color(getByText('Primary')));
  });

  test('display sizes read the type scale with tighter tracking', () => {
    const { getByText } = render(() => (
      <>
        <Text size="2xl">2xl</Text>
        <Text size="3xl">3xl</Text>
        <Text size="4xl">4xl</Text>
        <Text size="5xl">5xl</Text>
      </>
    ));
    const css = (label: string) => getComputedStyle(getByText(label));

    expect([css('2xl').fontSize, css('2xl').lineHeight, css('2xl').letterSpacing]).toEqual(['24px', '32px', '-0.24px']);
    expect([css('3xl').fontSize, css('3xl').lineHeight]).toEqual(['30px', '36px']);
    expect([css('4xl').fontSize, css('4xl').lineHeight]).toEqual(['36px', '40px']);
    expect([css('5xl').fontSize, css('5xl').lineHeight, css('5xl').letterSpacing]).toEqual(['48px', '48px', '-0.96px']);
  });

  test('align, tabularNums and transform set the alignment, digits and case', () => {
    const { getByText } = render(() => (
      <div style={{ 'text-align': 'center' }}>
        <Text>Inherited</Text>
        <Text align="end">End</Text>
        <Text tabularNums>1,111</Text>
        <Text transform="uppercase" size="xs">
          Label
        </Text>
        <Text transform="capitalize">word</Text>
      </div>
    ));
    const css = (label: string) => getComputedStyle(getByText(label));

    expect(css('Inherited').textAlign).toBe('center');
    expect(css('End').textAlign).toBe('end');
    expect(css('1,111').fontVariantNumeric).toBe('tabular-nums');
    expect([css('Label').textTransform, css('Label').letterSpacing]).toEqual(['uppercase', '0.6px']);
    expect([css('word').textTransform, css('word').letterSpacing]).toEqual(['capitalize', 'normal']);
  });

  test('weight sets the font weight, and inherit takes size and line height from the parent', () => {
    const { getByText } = render(() => (
      <div style={{ 'font-size': '30px', 'line-height': '40px' }}>
        <Text weight="bold">Bold</Text>
        <Text inherit>Inherited</Text>
      </div>
    ));

    expect(getComputedStyle(getByText('Bold')).fontWeight).toBe('700');
    expect(getComputedStyle(getByText('Inherited')).fontSize).toBe('30px');
    expect(getComputedStyle(getByText('Inherited')).lineHeight).toBe('40px');
  });

  test('truncate keeps one line, and lineClamp keeps that many lines', () => {
    const { getByText } = render(() => (
      <div style={{ width: '200px' }}>
        <Text truncate>{`Truncated ${LONG}`}</Text>
        <Text lineClamp={2}>{`Clamped ${LONG}`}</Text>
        <Text>{`Free ${LONG}`}</Text>
      </div>
    ));
    const height = (prefix: string) => Math.round(getByText(new RegExp(`^${prefix}`)).getBoundingClientRect().height);

    expect(height('Truncated')).toBe(24);
    expect(getComputedStyle(getByText(/^Truncated/)).textOverflow).toBe('ellipsis');
    expect(height('Clamped')).toBe(48);
    expect(height('Free')).toBeGreaterThan(48);
  });
});
