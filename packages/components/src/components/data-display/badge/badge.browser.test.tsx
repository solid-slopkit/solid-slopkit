import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Badge } from './badge';

const rect = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
};

const badgeOf = (label: HTMLElement) => label.parentElement!;

describe('<Badge /> in a browser', () => {
  test('heights follow the size, as multiples of --slp-size-selector', () => {
    const { getByText } = render(() => (
      <div style={{ display: 'flex', 'align-items': 'start' }}>
        <Badge size="xs">xs</Badge>
        <Badge size="sm">sm</Badge>
        <Badge size="md">md</Badge>
        <Badge size="lg">lg</Badge>
        <Badge size="xl">xl</Badge>
      </div>
    ));

    const heights = ['xs', 'sm', 'md', 'lg', 'xl'].map((size) => rect(badgeOf(getByText(size))).height);
    expect(heights).toEqual([16, 18, 20, 24, 28]);
  });

  test('a pill: fully rounded, nowrap, one line', () => {
    const { getByText } = render(() => <Badge>Two words</Badge>);
    const badge = badgeOf(getByText('Two words'));
    const css = getComputedStyle(badge);

    expect(rect(badge).height).toBe(20);
    expect(parseFloat(css.borderTopLeftRadius)).toBeGreaterThanOrEqual(10);
    expect(css.whiteSpace).toBe('nowrap');
  });

  test('circle: round for one digit, a pill for a longer count', () => {
    const { getByText } = render(() => (
      <div style={{ display: 'flex', 'align-items': 'start' }}>
        <Badge circle>3</Badge>
        <Badge circle>99+</Badge>
      </div>
    ));

    expect(rect(badgeOf(getByText('3')))).toEqual({ width: 20, height: 20 });
    const long = rect(badgeOf(getByText('99+')));
    expect(long.height).toBe(20);
    expect(long.width).toBeGreaterThan(20);
  });

  test('in a narrow container the label truncates with an ellipsis', () => {
    const { getByText } = render(() => (
      <div style={{ width: '80px' }}>
        <Badge>A label that is much too long</Badge>
      </div>
    ));
    const label = getByText('A label that is much too long');

    expect(rect(badgeOf(label)).width).toBe(80);
    expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  });

  test('icons in sections are sized to the badge', () => {
    const { getByText } = render(() => (
      <Badge size="lg" leftSection={<svg data-testid="icon" viewBox="0 0 24 24" />}>
        Icon
      </Badge>
    ));
    const icon = badgeOf(getByText('Icon')).querySelector('svg')!;

    expect(rect(icon)).toEqual({ width: 14, height: 14 });
  });

  test('variants color the background, text and border from the role', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Badge color="primary">Solid</Badge>
        <Badge color="primary" variant="soft">
          Soft
        </Badge>
        <Badge color="primary" variant="outline">
          Outline
        </Badge>
        <Badge color="primary" variant="dash">
          Dash
        </Badge>
        <span data-testid="primary" style={{ color: 'var(--slp-color-primary)' }} />
        <span data-testid="content" style={{ color: 'var(--slp-color-primary-content)' }} />
      </>
    ));
    const primary = getComputedStyle(getByTestId('primary')).color;
    const content = getComputedStyle(getByTestId('content')).color;
    const style = (label: string) => getComputedStyle(badgeOf(getByText(label)));

    expect([style('Solid').backgroundColor, style('Solid').color, style('Solid').borderTopColor]).toEqual([
      primary,
      content,
      primary,
    ]);
    expect(style('Soft').color).toBe(primary);
    expect(style('Soft').backgroundColor).toMatch(/\/ 0\.12\)$/);
    expect([style('Outline').backgroundColor, style('Outline').color]).toEqual(['rgba(0, 0, 0, 0)', primary]);
    // The border is half the role.
    expect(style('Outline').borderTopColor).toMatch(/\/ 0\.5\)$/);
    expect(style('Outline').borderTopStyle).toBe('solid');
    expect(style('Dash').borderTopStyle).toBe('dashed');
  });

  test('without a color, the badge uses the base colors', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Badge>Base</Badge>
        <span data-testid="base-200" style={{ color: 'var(--slp-color-base-200)' }} />
        <span data-testid="base-content" style={{ color: 'var(--slp-color-base-content)' }} />
      </>
    ));
    const css = getComputedStyle(badgeOf(getByText('Base')));

    expect(css.backgroundColor).toBe(getComputedStyle(getByTestId('base-200')).color);
    expect(css.color).toBe(getComputedStyle(getByTestId('base-content')).color);
  });

  test('--slp-badge-color and --slp-badge-content override the role', () => {
    const { getByText } = render(() => (
      <>
        <Badge color="primary" style={{ '--slp-badge-color': 'rgb(112, 72, 232)', '--slp-badge-content': 'rgb(1, 2, 3)' }}>
          Custom
        </Badge>
        <Badge variant="outline" style={{ '--slp-badge-color': 'rgb(112, 72, 232)' }}>
          Custom outline
        </Badge>
      </>
    ));
    const solid = getComputedStyle(badgeOf(getByText('Custom')));
    const outline = getComputedStyle(badgeOf(getByText('Custom outline')));

    expect([solid.backgroundColor, solid.color]).toEqual(['rgb(112, 72, 232)', 'rgb(1, 2, 3)']);
    expect(outline.color).toBe('rgb(112, 72, 232)');
    expect(outline.borderTopColor).toMatch(/\/ 0\.5\)$/);
  });
});
