// Locale-aware formatting and parsing for NumberInput. Pure functions; internal.

export interface NumberSeparators {
  decimal: string;
  group: string;
}

/** The locale's decimal and group separators. Digits are always Latin: the formats below ask Intl for them. */
export function numberSeparators(locale: string): NumberSeparators {
  const parts = new Intl.NumberFormat(locale, { numberingSystem: 'latn' }).formatToParts(12345.6);
  return {
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
  };
}

export interface NumberFormatOptions {
  /** Most digits after the decimal separator. Without one, as many as the number has. */
  decimalScale?: number;
  /** Always shows `decimalScale` digits, padding with zeros. */
  fixedDecimalScale?: boolean;
  /** Group separators, e.g. `1,234`. */
  grouping: boolean;
}

/** The number as text in the locale, with Latin digits and an ASCII minus, so it parses back. */
export function formatNumber(value: number, locale: string, options: NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, {
    numberingSystem: 'latn',
    useGrouping: options.grouping,
    maximumFractionDigits: options.decimalScale ?? 20,
    minimumFractionDigits: options.fixedDecimalScale ? (options.decimalScale ?? 0) : 0,
  })
    .format(value)
    .replace(/−/g, '-');
}

const MINUS = /^[-−]/;

/**
 * The number in a text typed in the locale, or `undefined` when it holds none: empty, or only a sign or a
 * separator. Group separators and spaces are ignored; the locale's decimal separator, or a `.`, marks the decimals.
 */
export function parseNumber(text: string, separators: NumberSeparators): number | undefined {
  let normalized = text.trim().replace(MINUS, '-');
  if (separators.group) normalized = normalized.split(separators.group).join('');
  normalized = normalized.replace(/[\s  ']/g, '');
  if (separators.decimal !== '.') normalized = normalized.split(separators.decimal).join('.');
  if (!/^-?\d*\.?\d*$/.test(normalized) || !/\d/.test(normalized)) return undefined;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

export interface SanitizeOptions {
  allowNegative: boolean;
  /** Most digits after the decimal separator; 0 allows no separator. */
  decimalScale?: number;
}

/**
 * Keeps what can be part of a number while typing: digits, one decimal separator (the locale's; a typed `.` becomes
 * it), and a leading minus. Group separators are dropped. Returns the text and how many characters before `caret`
 * were removed, to put the caret back.
 */
export function sanitizeNumberText(
  text: string,
  separators: NumberSeparators,
  options: SanitizeOptions,
  caret: number,
): { text: string; removedBeforeCaret: number } {
  let result = '';
  let removedBeforeCaret = 0;
  let decimals = -1;
  for (let index = 0; index < text.length; index++) {
    let char = text[index];
    if (char === '−') char = '-';
    if (char === '.' && separators.decimal !== '.' && separators.group !== '.') char = separators.decimal;
    let keep = false;
    if (/\d/.test(char)) keep = decimals === -1 || options.decimalScale === undefined || decimals < options.decimalScale;
    else if (char === '-') keep = options.allowNegative && result === '';
    else if (char === separators.decimal) keep = decimals === -1 && options.decimalScale !== 0;
    if (keep) {
      result += char;
      if (char === separators.decimal) decimals = 0;
      else if (decimals >= 0 && char !== '-') decimals++;
    } else if (index < caret) removedBeforeCaret++;
  }
  return { text: result, removedBeforeCaret };
}

/** Digits after the decimal point in a number's shortest form. */
export function decimalPlaces(value: number): number {
  const text = String(value);
  const exponent = /e-(\d+)$/.exec(text);
  if (exponent) return Number(exponent[1]);
  return text.split('.')[1]?.length ?? 0;
}

/** `value` rounded to `places` decimals, without binary noise such as `0.30000000000000004`. */
export function roundTo(value: number, places: number): number {
  return Number(value.toFixed(Math.min(places, 100)));
}
