// The theme builder's model: a preset is a handful of choices, and buildTokens() turns it into the --slp-* tokens
// of a theme that supports both color schemes. Colors are generated in OKLCH, mapped into the sRGB gamut, and each
// solid color gets whichever content color, near-black or white, reads better on it.

export interface Option {
  value: string;
  label: string;
}

export interface Preset {
  base: string;
  primary: string;
  secondary: string;
  font: string;
  headings: string;
  density: string;
  depth: string;
}

// Surface tints: a hue and how much of it the surfaces carry.
const BASES: Record<string, { label: string; hue: number; chroma: number }> = {
  neutral: { label: 'Neutral', hue: 0, chroma: 0 },
  stone: { label: 'Stone', hue: 60, chroma: 0.008 },
  zinc: { label: 'Zinc', hue: 285, chroma: 0.008 },
  slate: { label: 'Slate', hue: 255, chroma: 0.022 },
  mauve: { label: 'Mauve', hue: 320, chroma: 0.016 },
  olive: { label: 'Olive', hue: 115, chroma: 0.014 },
  mist: { label: 'Mist', hue: 210, chroma: 0.012 },
  taupe: { label: 'Taupe', hue: 45, chroma: 0.014 },
};

// Accent hues. `light` marks the hues that only look like themselves as pale colors (yellows), which then take
// dark content in both schemes.
const HUES: Record<string, { label: string; hue: number; chroma: number; light?: boolean }> = {
  red: { label: 'Red', hue: 25, chroma: 0.22 },
  orange: { label: 'Orange', hue: 45, chroma: 0.19 },
  amber: { label: 'Amber', hue: 75, chroma: 0.17, light: true },
  yellow: { label: 'Yellow', hue: 95, chroma: 0.17, light: true },
  lime: { label: 'Lime', hue: 130, chroma: 0.2, light: true },
  green: { label: 'Green', hue: 148, chroma: 0.18 },
  emerald: { label: 'Emerald', hue: 162, chroma: 0.15 },
  teal: { label: 'Teal', hue: 182, chroma: 0.12 },
  cyan: { label: 'Cyan', hue: 215, chroma: 0.13 },
  sky: { label: 'Sky', hue: 237, chroma: 0.15 },
  blue: { label: 'Blue', hue: 260, chroma: 0.2 },
  indigo: { label: 'Indigo', hue: 277, chroma: 0.2 },
  violet: { label: 'Violet', hue: 293, chroma: 0.22 },
  purple: { label: 'Purple', hue: 305, chroma: 0.22 },
  fuchsia: { label: 'Fuchsia', hue: 322, chroma: 0.24 },
  pink: { label: 'Pink', hue: 354, chroma: 0.2 },
  rose: { label: 'Rose', hue: 12, chroma: 0.21 },
};

const FONTS: Record<string, { label: string; stack?: string }> = {
  // No stack: the base styles' system font stays.
  system: { label: 'System' },
  grotesque: {
    label: 'Grotesque',
    stack: "Inter, Roboto, 'Helvetica Neue', 'Arial Nova', 'Nimbus Sans', Arial, sans-serif",
  },
  humanist: {
    label: 'Humanist',
    stack: "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
  },
  geometric: { label: 'Geometric', stack: "Avenir, Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif" },
  serif: { label: 'Serif', stack: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif" },
  mono: { label: 'Mono', stack: "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace" },
};

const HEADINGS: Record<string, { label: string; weight: string }> = {
  medium: { label: 'Medium', weight: '500' },
  semibold: { label: 'Semibold', weight: '600' },
  bold: { label: 'Bold', weight: '700' },
  heavy: { label: 'Heavy', weight: '800' },
};

// One unit for control heights, small marks and spacing alike.
const DENSITIES: Record<string, { label: string; unit: string }> = {
  compact: { label: 'Compact', unit: '0.22rem' },
  default: { label: 'Default', unit: '0.25rem' },
  comfortable: { label: 'Comfortable', unit: '0.28rem' },
};

const DEPTHS: Record<string, { label: string; depth: string }> = {
  flat: { label: 'Flat', depth: '0' },
  raised: { label: 'Raised', depth: '1' },
};

const options = (record: Record<string, { label: string }>): Option[] =>
  Object.entries(record).map(([value, { label }]) => ({ value, label }));

export const OPTIONS = {
  base: options(BASES),
  primary: [{ value: 'neutral', label: 'Neutral' }, ...options(HUES)],
  secondary: [{ value: 'neutral', label: 'Neutral' }, ...options(HUES)],
  font: options(FONTS),
  headings: options(HEADINGS),
  density: options(DENSITIES),
  depth: options(DEPTHS),
} satisfies Record<keyof Preset, Option[]>;

export const DEFAULT_PRESET: Preset = {
  base: 'neutral',
  primary: 'neutral',
  secondary: 'violet',
  font: 'system',
  headings: 'bold',
  density: 'default',
  depth: 'flat',
};

// Starting points worth trying; the controls tune them from there.
export const STARTERS: { value: string; label: string; preset: Preset }[] = [
  { value: 'default', label: 'Default', preset: DEFAULT_PRESET },
  {
    value: 'monochrome',
    label: 'Monochrome',
    preset: { ...DEFAULT_PRESET, base: 'zinc', primary: 'neutral', secondary: 'neutral', headings: 'semibold' },
  },
  {
    value: 'forest',
    label: 'Forest',
    preset: { ...DEFAULT_PRESET, base: 'olive', primary: 'emerald', secondary: 'amber', font: 'humanist', depth: 'raised' },
  },
  {
    value: 'sunset',
    label: 'Sunset',
    preset: { ...DEFAULT_PRESET, base: 'taupe', primary: 'orange', secondary: 'rose', font: 'geometric', headings: 'heavy' },
  },
  {
    value: 'ocean',
    label: 'Ocean',
    preset: { ...DEFAULT_PRESET, base: 'slate', primary: 'sky', secondary: 'teal', font: 'grotesque', density: 'compact' },
  },
  {
    value: 'editorial',
    label: 'Editorial',
    preset: { ...DEFAULT_PRESET, base: 'stone', primary: 'red', secondary: 'neutral', font: 'serif', density: 'comfortable' },
  },
];

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;

export function shufflePreset(): Preset {
  const hues = OPTIONS.primary.slice(1);
  return {
    base: pick(OPTIONS.base).value,
    // Mostly a hue: a neutral primary is a valid look, but a rare one.
    primary: Math.random() < 0.15 ? 'neutral' : pick(hues).value,
    secondary: pick(OPTIONS.secondary).value,
    font: pick(OPTIONS.font).value,
    headings: pick(OPTIONS.headings).value,
    density: pick(OPTIONS.density).value,
    depth: pick(OPTIONS.depth).value,
  };
}

// --- Color -------------------------------------------------------------------------------------------------------

type Oklch = [l: number, c: number, h: number];

function toLinearSrgb([l, c, h]: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (color: Oklch) => toLinearSrgb(color).every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

// Lowers chroma until the color fits in sRGB, keeping lightness and hue.
function fit([l, c, h]: Oklch): Oklch {
  if (inGamut([l, c, h])) return [l, c, h];
  let low = 0;
  let high = c;
  while (high - low > 0.001) {
    const mid = (low + high) / 2;
    if (inGamut([l, mid, h])) low = mid;
    else high = mid;
  }
  return [l, low, h];
}

function luminance(color: Oklch) {
  const [r, g, b] = toLinearSrgb(color).map((channel) => Math.min(1, Math.max(0, channel)));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: Oklch, b: Oklch) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const round = (n: number, digits: number) => Number(n.toFixed(digits));
const css = ([l, c, h]: Oklch) => `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(c === 0 ? 0 : h, 1)})`;
const lightDark = (light: Oklch, dark: Oklch) => {
  const [a, b] = [css(light), css(dark)];
  return a === b ? a : `light-dark(${a}, ${b})`;
};

const WHITE: Oklch = [1, 0, 0];

// A solid color for one scheme, with its content color.
function solid(spec: { hue: number; chroma: number; light?: boolean }, scheme: 'light' | 'dark'): [Oklch, Oklch] {
  const lightness = spec.light ? (scheme === 'light' ? 0.8 : 0.84) : scheme === 'light' ? 0.55 : 0.7;
  const color = fit([lightness, spec.chroma, spec.hue]);
  const dark = fit([0.2, Math.min(spec.chroma, 0.04), spec.hue]);
  return [color, contrast(color, WHITE) >= contrast(color, dark) ? WHITE : dark];
}

// A neutral solid follows the surfaces' tint: near-black in light, near-white in dark.
function neutralSolid(base: { hue: number; chroma: number }, scheme: 'light' | 'dark'): [Oklch, Oklch] {
  const c = base.chroma * 1.5;
  return scheme === 'light' ? [fit([0.22, c, base.hue]), WHITE] : [fit([0.92, c, base.hue]), fit([0.2, c, base.hue])];
}

function role(name: string, base: { hue: number; chroma: number }): Record<string, string> {
  const spec = HUES[name];
  const [light, lightContent] = spec ? solid(spec, 'light') : neutralSolid(base, 'light');
  const [dark, darkContent] = spec ? solid(spec, 'dark') : neutralSolid(base, 'dark');
  return { color: lightDark(light, dark), content: lightDark(lightContent, darkContent) };
}

// --- Tokens ------------------------------------------------------------------------------------------------------

export function buildTokens(preset: Preset): Record<string, string> {
  const base = BASES[preset.base] ?? BASES.neutral!;
  const { hue, chroma } = base;
  const surface = (l: number, c: number): Oklch => fit([l, c, hue]);

  const primary = role(preset.primary, base);
  const secondary = role(preset.secondary, base);
  const font = FONTS[preset.font]?.stack;
  const unit = (DENSITIES[preset.density] ?? DENSITIES.default!).unit;

  return {
    '--slp-color-base-100': lightDark(surface(1, chroma * 0.2), surface(0.21, chroma)),
    '--slp-color-base-200': lightDark(surface(0.968, chroma), surface(0.255, chroma)),
    '--slp-color-base-300': lightDark(surface(0.922, chroma * 1.2), surface(0.315, chroma * 1.2)),
    '--slp-color-base-content': lightDark(surface(0.21, chroma * 1.5), surface(0.93, chroma)),
    '--slp-color-muted': lightDark(surface(0.968, chroma), surface(0.255, chroma)),
    '--slp-color-muted-content': lightDark(surface(0.5, chroma * 1.5), surface(0.72, chroma)),
    '--slp-color-neutral': lightDark(surface(0.3, chroma * 1.5), surface(0.8, chroma)),
    '--slp-color-neutral-content': lightDark(WHITE, surface(0.2, chroma)),
    '--slp-color-primary': primary.color!,
    '--slp-color-primary-content': primary.content!,
    '--slp-color-secondary': secondary.color!,
    '--slp-color-secondary-content': secondary.content!,
    ...(font ? { '--slp-font-family': font } : {}),
    '--slp-heading-weight': (HEADINGS[preset.headings] ?? HEADINGS.bold!).weight,
    '--slp-size-field': unit,
    '--slp-size-selector': unit,
    '--slp-spacing': unit,
    '--slp-depth': (DEPTHS[preset.depth] ?? DEPTHS.flat!).depth,
  };
}

// The theme as a stylesheet an app can drop in after the default theme.
export function toCss(tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(([name, value]) => `    ${name}: ${value};`);
  return `@layer slopkit.themes {\n  :root {\n${lines.join('\n')}\n  }\n}\n`;
}

// The solid color a swatch shows for an option, in light.
export function swatch(control: 'base' | 'primary' | 'secondary', value: string): string {
  if (control === 'base') {
    const base = BASES[value] ?? BASES.neutral!;
    return css(fit([0.6, base.chroma * 6, base.hue]));
  }
  const spec = HUES[value];
  return css(spec ? solid(spec, 'light')[0] : [0.22, 0, 0]);
}
