import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Title } from './title';

describe('<Title /> in a browser', () => {
  test('each level reads the heading scale, with the heading weight and no margin', () => {
    const { getByText } = render(() => (
      <>
        <Title>One</Title>
        <Title order={4}>Four</Title>
        <Title order={6}>Six</Title>
      </>
    ));
    const css = (label: string) => getComputedStyle(getByText(label));

    expect([css('One').fontSize, css('One').lineHeight]).toEqual(['34px', '40px']);
    expect([css('Four').fontSize, css('Four').lineHeight]).toEqual(['18px', '28px']);
    expect([css('Six').fontSize, css('Six').lineHeight]).toEqual(['14px', '20px']);
    expect(css('One').fontWeight).toBe('700');
    expect(css('One').marginTop).toBe('0px');
  });

  test('size overrides the look, and weight and color apply', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Title order={1} size="h3" weight="normal" color="error">
          Smaller one
        </Title>
        <span data-testid="token" style={{ color: 'var(--slp-color-error)' }} />
      </>
    ));
    const css = getComputedStyle(getByText('Smaller one'));

    expect(css.fontSize).toBe('22px');
    expect(css.fontWeight).toBe('400');
    expect(css.color).toBe(getComputedStyle(getByTestId('token')).color);
  });

  test('dimmed takes the muted content color', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Title dimmed>Quiet</Title>
        <span data-testid="muted" style={{ color: 'var(--slp-color-muted-content)' }} />
      </>
    ));

    expect(getComputedStyle(getByText('Quiet')).color).toBe(getComputedStyle(getByTestId('muted')).color);
  });
});
