// Color parsing, conversion and formatting for ColorPicker. Pure functions; internal.

/** Red, green and blue from 0 to 255; alpha from 0 to 1. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Hue from 0 to 360; saturation and value (brightness) from 0 to 100; alpha from 0 to 1. */
export interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

export type ColorFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, places = 0) => Number(value.toFixed(places));

/** Whether a format carries alpha. */
export const hasAlpha = (format: ColorFormat) => format === 'hexa' || format === 'rgba' || format === 'hsla';

function channel(text: string, max: number): number {
  const value = text.trim();
  if (value.endsWith('%')) return (parseFloat(value) / 100) * max;
  return parseFloat(value);
}

function alpha(text: string | undefined): number {
  if (text === undefined) return 1;
  const value = text.trim();
  return clamp(value.endsWith('%') ? parseFloat(value) / 100 : parseFloat(value), 0, 1);
}

/**
 * Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`/`rgba()` and `hsl()`/`hsla()` (with commas or spaces, and
 * `/ alpha`). Returns `undefined` for anything else.
 */
export function parseColor(text: string): Rgba | undefined {
  const value = text.trim().toLowerCase();
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(value);
  if (hex) {
    let digits = hex[1];
    if (digits.length <= 4) digits = [...digits].map((digit) => digit + digit).join('');
    const parts = digits.match(/../g)!.map((pair) => parseInt(pair, 16));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : round(parts[3] / 255, 3) };
  }
  const fn = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(value);
  if (!fn) return undefined;
  const args = fn[2].split(/[\s,/]+/).filter(Boolean);
  if (args.length < 3 || args.length > 4 || args.some((arg) => Number.isNaN(parseFloat(arg)))) return undefined;
  if (fn[1].startsWith('rgb')) {
    return {
      r: clamp(round(channel(args[0], 255)), 0, 255),
      g: clamp(round(channel(args[1], 255)), 0, 255),
      b: clamp(round(channel(args[2], 255)), 0, 255),
      a: alpha(args[3]),
    };
  }
  const rgb = hslToRgb(parseFloat(args[0]), clamp(parseFloat(args[1]), 0, 100), clamp(parseFloat(args[2]), 0, 100));
  return { ...rgb, a: alpha(args[3]) };
}

export function rgbToHsv({ r, g, b, a }: Rgba): Hsva {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);
  let h = 0;
  if (delta) {
    if (max === red) h = ((green - blue) / delta) % 6;
    else if (max === green) h = (blue - red) / delta + 2;
    else h = (red - green) / delta + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? (delta / max) * 100 : 0, v: max * 100, a };
}

export function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const saturation = s / 100;
  const value = v / 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => value - value * saturation * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  return { r: round(f(5) * 255), g: round(f(3) * 255), b: round(f(1) * 255), a };
}

export function hslToRgb(h: number, s: number, l: number): Omit<Rgba, 'a'> {
  const saturation = s / 100;
  const lightness = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const amount = saturation * Math.min(lightness, 1 - lightness);
  const f = (n: number) => lightness - amount * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: round(f(0) * 255), g: round(f(8) * 255), b: round(f(4) * 255) };
}

export function rgbToHsl({ r, g, b }: Rgba): { h: number; s: number; l: number } {
  const { h } = rgbToHsv({ r, g, b, a: 1 });
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

const hex2 = (value: number) => Math.round(value).toString(16).padStart(2, '0');

/** The color as text in a format. Without alpha in the format, alpha is dropped. */
export function formatColor(color: Rgba, format: ColorFormat): string {
  const { r, g, b, a } = color;
  switch (format) {
    case 'hex':
      return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
    case 'hexa':
      return `#${hex2(r)}${hex2(g)}${hex2(b)}${hex2(a * 255)}`;
    case 'rgb':
      return `rgb(${r}, ${g}, ${b})`;
    case 'rgba':
      return `rgba(${r}, ${g}, ${b}, ${round(a, 2)})`;
    case 'hsl':
    case 'hsla': {
      const hsl = rgbToHsl(color);
      const text = `${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%`;
      return format === 'hsl' ? `hsl(${text})` : `hsla(${text}, ${round(a, 2)})`;
    }
  }
}

/** Whether two colors are the same once drawn: same channels and alpha. */
export const sameColor = (one: Rgba, two: Rgba) =>
  one.r === two.r && one.g === two.g && one.b === two.b && Math.abs(one.a - two.a) < 0.005;
