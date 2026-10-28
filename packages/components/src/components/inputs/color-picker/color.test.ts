import { describe, expect, test } from 'vitest';
import { formatColor, hsvToRgb, parseColor, rgbToHsv, sameColor } from './color';

describe('color', () => {
  test('parses hex in its four lengths', () => {
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('#0f08')).toEqual({ r: 0, g: 255, b: 0, a: 0.533 });
    expect(parseColor('#1971C2')).toEqual({ r: 25, g: 113, b: 194, a: 1 });
    expect(parseColor('#00000080')).toEqual({ r: 0, g: 0, b: 0, a: 0.502 });
  });

  test('parses rgb and hsl, with commas or spaces, and alpha', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(parseColor('rgba(10 20 30 / 50%)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    expect(parseColor('hsl(120, 100%, 50%)')).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(parseColor('hsla(240 100% 50% / 0.25)')).toEqual({ r: 0, g: 0, b: 255, a: 0.25 });
  });

  test('anything else is not a color', () => {
    for (const text of ['', 'red', '#12', '#ggg', 'rgb(1, 2)', 'rgb(a, b, c)', 'hsl()']) expect(parseColor(text)).toBeUndefined();
  });

  test('rgb to hsv and back', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 100, v: 100, a: 1 });
    expect(rgbToHsv({ r: 0, g: 0, b: 255, a: 0.5 })).toEqual({ h: 240, s: 100, v: 100, a: 0.5 });
    expect(rgbToHsv({ r: 128, g: 128, b: 128, a: 1 }).s).toBe(0);
    for (const color of [
      { r: 25, g: 113, b: 194, a: 1 },
      { r: 12, g: 155, b: 78, a: 1 },
      { r: 250, g: 250, b: 10, a: 1 },
    ]) {
      expect(hsvToRgb(rgbToHsv(color))).toEqual(color);
    }
  });

  test('formats in each format', () => {
    const color = { r: 25, g: 113, b: 194, a: 0.5 };
    expect(formatColor(color, 'hex')).toBe('#1971c2');
    expect(formatColor(color, 'hexa')).toBe('#1971c280');
    expect(formatColor(color, 'rgb')).toBe('rgb(25, 113, 194)');
    expect(formatColor(color, 'rgba')).toBe('rgba(25, 113, 194, 0.5)');
    expect(formatColor(color, 'hsl')).toBe('hsl(209, 77%, 43%)');
    expect(formatColor(color, 'hsla')).toBe('hsla(209, 77%, 43%, 0.5)');
  });

  test('sameColor ignores alpha rounding', () => {
    expect(sameColor({ r: 1, g: 2, b: 3, a: 0.5 }, { r: 1, g: 2, b: 3, a: 0.502 })).toBe(true);
    expect(sameColor({ r: 1, g: 2, b: 3, a: 1 }, { r: 1, g: 2, b: 4, a: 1 })).toBe(false);
  });
});
