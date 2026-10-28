// The default theme's contrast rule (M8.02): every role reaches 4.5:1 against its content color, and as text on
// base-100, in both color schemes. Warning as text is the one exception the theme's comment names.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'default-theme.css'), 'utf8');

/** A token's value in each scheme: both arguments of `light-dark()`, or the one value twice. */
function token(name: string): { light: string; dark: string } {
  const value = css.match(new RegExp(`--slp-${name}:\\s*([^;]+);`))?.[1].trim();
  if (!value) throw new Error(`--slp-${name} is not set`);
  const pair = value.match(/^light-dark\((.+?\)|[^,]+),\s*(.+)\)$/);
  return pair ? { light: pair[1].trim(), dark: pair[2].trim() } : { light: value, dark: value };
}

/** Linear sRGB channels of a `#rrggbb` or `oklch(L% C H)` color, clipped to the sRGB gamut. */
function linearRgb(color: string): number[] {
  if (color.startsWith('#')) {
    const channels = [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16) / 255);
    return channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  }
  const parts = color.match(/^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/);
  if (!parts) throw new Error(`cannot read ${color}`);
  const [L, C, H] = [Number(parts[1]) / 100, Number(parts[2]), (Number(parts[3]) * Math.PI) / 180];
  const [a, b] = [C * Math.cos(H), C * Math.sin(H)];
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.min(1, Math.max(0, c)));
}

function luminance(color: string): number {
  const [r, g, b] = linearRgb(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

const ROLES = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'];
const SCHEMES = ['light', 'dark'] as const;

describe('default theme contrast', () => {
  test.each(SCHEMES.flatMap((scheme) => ROLES.map((role) => [scheme, role] as const)))(
    '%s %s reaches 4.5:1 against its content color',
    (scheme, role) => {
      expect(contrast(token(`color-${role}`)[scheme], token(`color-${role}-content`)[scheme])).toBeGreaterThanOrEqual(4.5);
    },
  );

  test.each(SCHEMES.flatMap((scheme) => ROLES.filter((role) => role !== 'warning').map((role) => [scheme, role] as const)))(
    '%s %s reaches 4.5:1 as text on base-100',
    (scheme, role) => {
      expect(contrast(token(`color-${role}`)[scheme], token('color-base-100')[scheme])).toBeGreaterThanOrEqual(4.5);
    },
  );

  test('warning reaches 4.5:1 as text on base-100 in dark', () => {
    expect(contrast(token('color-warning').dark, token('color-base-100').dark)).toBeGreaterThanOrEqual(4.5);
  });

  test.each(SCHEMES.flatMap((scheme) => ['base-100', 'base-200', 'base-300', 'muted'].map((base) => [scheme, base] as const)))(
    '%s muted-content reaches 4.5:1 on %s',
    (scheme, base) => {
      expect(contrast(token('color-muted-content')[scheme], token(`color-${base}`)[scheme])).toBeGreaterThanOrEqual(4.5);
    },
  );

  test.each(SCHEMES.flatMap((scheme) => ['base-100', 'base-200', 'base-300', 'muted'].map((base) => [scheme, base] as const)))(
    '%s base-content reaches 4.5:1 on %s',
    (scheme, base) => {
      expect(contrast(token('color-base-content')[scheme], token(`color-${base}`)[scheme])).toBeGreaterThanOrEqual(4.5);
    },
  );
});
