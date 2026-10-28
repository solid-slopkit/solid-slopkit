import { hash } from '../utils';

export const BREAKPOINTS = { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '88em' } as const;
export type Breakpoint = keyof typeof BREAKPOINTS;

/** A value for every width, or per breakpoint. Mobile-first: each breakpoint applies from its min-width up. */
export type ResponsiveValue<T> = T | Partial<Record<'base' | Breakpoint, T>>;

/** Spacing units: `4` is `calc(var(--slp-spacing) * 4)`, 1rem with the default 0.25rem unit. */
export type SpacingValue = number;

/** Spacing units, negative to pull, or `auto`. */
export type MarginValue = number | 'auto';

export interface BoxPaddingProps {
  p?: ResponsiveValue<SpacingValue>;
  px?: ResponsiveValue<SpacingValue>;
  py?: ResponsiveValue<SpacingValue>;
  pt?: ResponsiveValue<SpacingValue>;
  pr?: ResponsiveValue<SpacingValue>;
  pb?: ResponsiveValue<SpacingValue>;
  pl?: ResponsiveValue<SpacingValue>;
}

export interface BoxMarginProps {
  m?: ResponsiveValue<MarginValue>;
  mx?: ResponsiveValue<MarginValue>;
  my?: ResponsiveValue<MarginValue>;
  mt?: ResponsiveValue<MarginValue>;
  mr?: ResponsiveValue<MarginValue>;
  mb?: ResponsiveValue<MarginValue>;
  ml?: ResponsiveValue<MarginValue>;
}

/** Spacing units, or any CSS length such as `'100%'` or `'auto'`. */
export type SizeValue = number | (string & {});

export interface BoxSizeProps {
  w?: ResponsiveValue<SizeValue>;
  h?: ResponsiveValue<SizeValue>;
  miw?: ResponsiveValue<SizeValue>;
  maw?: ResponsiveValue<SizeValue>;
  mih?: ResponsiveValue<SizeValue>;
  mah?: ResponsiveValue<SizeValue>;
}

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexAlign =
  | 'normal'
  | 'stretch'
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'baseline'
  | (string & {});
export type FlexJustify =
  | 'normal'
  | 'start'
  | 'end'
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | (string & {});

/** Display values for Box. Flex layouts belong to `Flex`, so `flex` and `inline-flex` are not among them. */
export type BoxDisplayValue = 'none' | 'block' | 'inline' | 'inline-block' | 'grid' | 'inline-grid' | 'contents';

/** Display values for Flex: inline or hidden, e.g. `display={{ base: 'none', md: 'flex' }}`. */
export type FlexDisplayValue = 'flex' | 'inline-flex' | 'none';

export interface BoxDisplayProps {
  display?: ResponsiveValue<BoxDisplayValue>;
}

export interface FlexDisplayProps {
  /** Overrides Flex's `display: flex`. */
  display?: ResponsiveValue<FlexDisplayValue>;
}

/** Flex container props, for `Flex`. */
export interface FlexContainerProps {
  direction?: ResponsiveValue<FlexDirection>;
  wrap?: ResponsiveValue<FlexWrap>;
  /** `align-items`. */
  align?: ResponsiveValue<FlexAlign>;
  /** `justify-content`. */
  justify?: ResponsiveValue<FlexJustify>;
  gap?: ResponsiveValue<SpacingValue>;
  rowGap?: ResponsiveValue<SpacingValue>;
  columnGap?: ResponsiveValue<SpacingValue>;
}

/** Grid props, for `SimpleGrid`. */
export interface SimpleGridContainerProps {
  /** Number of equal-width columns. */
  cols?: ResponsiveValue<number>;
  /** Space between columns, and between rows unless `verticalSpacing` is set. */
  spacing?: ResponsiveValue<SpacingValue>;
  /** Space between rows. */
  verticalSpacing?: ResponsiveValue<SpacingValue>;
}

/** Grid container props, for `Grid`. Only `gutter` is responsive. */
export interface GridContainerProps {
  /** Space between columns and rows. */
  gutter?: ResponsiveValue<SpacingValue>;
  /** Number of columns a row is divided into. */
  columns?: number;
  /** `justify-content`. */
  justify?: FlexJustify;
  /** `align-items`. */
  align?: FlexAlign;
}

/** A column's width: a number of the grid's columns, `'auto'` to fill the space left, or `'content'` to fit its content. */
export type GridSpan = number | 'auto' | 'content';

/** Grid column props, for `Grid.Col`. */
export interface GridColItemProps {
  /** Width in columns. Defaults to the full row. */
  span?: ResponsiveValue<GridSpan>;
  /** Columns left empty before this one. */
  offset?: ResponsiveValue<number>;
  /** `order`. */
  order?: ResponsiveValue<number>;
}

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Container props, for `Container`. */
export interface ContainerSizeProps {
  /** Max width: a preset (`--slp-container-size-*`), spacing units, or any CSS length. */
  size?: ContainerSize | SizeValue;
}

/** AspectRatio props, for `AspectRatio`. */
export interface AspectRatioRatioProps {
  /** Width divided by height, e.g. `16 / 9`. */
  ratio?: number;
}

export type BoxStyleProps = BoxPaddingProps & BoxMarginProps & BoxSizeProps & BoxDisplayProps;
export type FlexStyleProps = FlexDisplayProps & FlexContainerProps;
export type SimpleGridStyleProps = SimpleGridContainerProps;
export type GridStyleProps = GridContainerProps;
export type GridColStyleProps = GridColItemProps;
export type ContainerStyleProps = ContainerSizeProps;
export type AspectRatioStyleProps = AspectRatioRatioProps;

/** Every style prop any component reads; each component only declares and passes its own. */
export type AllStyleProps = Omit<BoxStyleProps, 'display'> &
  FlexContainerProps &
  SimpleGridContainerProps &
  Omit<GridContainerProps, 'justify' | 'align'> &
  GridColItemProps &
  ContainerSizeProps &
  AspectRatioRatioProps & { display?: ResponsiveValue<BoxDisplayValue | FlexDisplayValue> };

export const BOX_STYLE_PROPS = [
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'w',
  'h',
  'miw',
  'maw',
  'mih',
  'mah',
  'display',
] as const satisfies (keyof BoxStyleProps)[];

export const FLEX_STYLE_PROPS = [
  'display',
  'direction',
  'wrap',
  'align',
  'justify',
  'gap',
  'rowGap',
  'columnGap',
] as const satisfies (keyof FlexStyleProps)[];

export const SIMPLE_GRID_STYLE_PROPS = ['cols', 'spacing', 'verticalSpacing'] as const satisfies (keyof SimpleGridStyleProps)[];

export const GRID_STYLE_PROPS = ['gutter', 'columns', 'justify', 'align'] as const satisfies (keyof GridStyleProps)[];

export const GRID_COL_STYLE_PROPS = ['span', 'offset', 'order'] as const satisfies (keyof GridColStyleProps)[];

export const ASPECT_RATIO_STYLE_PROPS = ['ratio'] as const satisfies (keyof AspectRatioStyleProps)[];

export const CONTAINER_STYLE_PROPS = ['size'] as const satisfies (keyof ContainerStyleProps)[];

// Each CSS property and the props that set it, most specific first: a side prop wins over its axis, the
// axis over the shorthand. Each group gets its own class and <style>, so the common spacing combinations
// stay shared between boxes that differ only in size.
const STYLE_GROUPS = {
  spacing: {
    'padding-top': ['pt', 'py', 'p'],
    'padding-right': ['pr', 'px', 'p'],
    'padding-bottom': ['pb', 'py', 'p'],
    'padding-left': ['pl', 'px', 'p'],
    'margin-top': ['mt', 'my', 'm'],
    'margin-right': ['mr', 'mx', 'm'],
    'margin-bottom': ['mb', 'my', 'm'],
    'margin-left': ['ml', 'mx', 'm'],
  },
  size: {
    width: ['w'],
    height: ['h'],
    'min-width': ['miw'],
    'max-width': ['maw'],
    'min-height': ['mih'],
    'max-height': ['mah'],
  },
  display: {
    display: ['display'],
  },
  // Flex has its own `display` rather than the `display` group's: in separate classes of equal specificity,
  // which one wins would depend on registration order.
  flex: {
    display: ['display'],
    'flex-direction': ['direction'],
    'flex-wrap': ['wrap'],
    'align-items': ['align'],
    'justify-content': ['justify'],
    'row-gap': ['rowGap', 'gap'],
    'column-gap': ['columnGap', 'gap'],
  },
  simpleGrid: {
    display: [],
    'grid-template-columns': ['cols'],
    'row-gap': ['verticalSpacing', 'spacing'],
    'column-gap': ['spacing'],
  },
  // Grid only sets the variables its columns size themselves from; grid.module.css has the static layout.
  grid: {
    '--_grid-gutter': ['gutter'],
    '--_grid-columns': ['columns'],
    'justify-content': ['justify'],
    'align-items': ['align'],
  },
  gridCol: {
    'flex-basis': ['span'],
    'flex-grow': ['span'],
    'max-width': ['span'],
    'margin-inline-start': ['offset'],
    order: ['order'],
  },
  container: {
    'max-width': ['size'],
  },
  // The ratio is applied to the children by aspect-ratio.module.css.
  aspectRatio: {
    '--_aspect-ratio': ['ratio'],
  },
} as const satisfies Record<string, Record<string, (keyof AllStyleProps)[]>>;

export type StyleGroup = keyof typeof STYLE_GROUPS;

// Values a property takes below the first breakpoint when no prop sets one there. A group with fallbacks
// always emits a class, even without props: every Flex is `display: flex` unless `display` says otherwise.
const PROPERTY_FALLBACKS: Partial<Record<StyleGroup, Record<string, SizeValue>>> = {
  flex: { display: 'flex' },
  simpleGrid: { display: 'grid', 'grid-template-columns': 1, 'row-gap': 4, 'column-gap': 4 },
  grid: { '--_grid-gutter': 4, '--_grid-columns': 12 },
  container: { 'max-width': 'md' },
  aspectRatio: { '--_aspect-ratio': 1 },
  gridCol: { 'flex-basis': '100%', 'flex-grow': 'var(--_grid-grow)', 'max-width': '100%' },
};

// `n` columns of the parent Grid and the n - 1 gutters between them.
const spanWidth = (span: number) => `calc((100% + var(--_grid-gutter)) * ${span} / var(--_grid-columns) - var(--_grid-gutter))`;

// Properties whose values are not spacing units. A format returns undefined to leave the value to the default
// handling, which is how the string fallbacks above get through.
const CONTAINER_SIZES = new Set<SizeValue>(['xs', 'sm', 'md', 'lg', 'xl'] satisfies ContainerSize[]);

const VALUE_FORMATS: Partial<Record<StyleGroup, Record<string, (value: SizeValue) => string | undefined>>> = {
  aspectRatio: {
    '--_aspect-ratio': (ratio) => (typeof ratio === 'number' ? String(ratio) : undefined),
  },
  container: {
    'max-width': (size) => (CONTAINER_SIZES.has(size) ? `var(--slp-container-size-${size})` : undefined),
  },
  simpleGrid: {
    'grid-template-columns': (cols) => (typeof cols === 'number' ? `repeat(${cols},minmax(0,1fr))` : undefined),
  },
  grid: {
    // The gutter is used inside calc(), where a unitless 0 is invalid.
    '--_grid-gutter': (gutter) => (gutter === 0 ? '0px' : undefined),
    '--_grid-columns': (columns) => (typeof columns === 'number' ? String(columns) : undefined),
  },
  gridCol: {
    'flex-basis': (span) =>
      span === 'auto' ? '0' : span === 'content' ? 'auto' : typeof span === 'number' ? spanWidth(span) : undefined,
    'flex-grow': (span) =>
      span === 'auto' ? '1' : span === 'content' ? '0' : typeof span === 'number' ? 'var(--_grid-grow)' : undefined,
    // In a growing Grid, `--_grid-grow` is 1 and lifts the cap, so a column can fill a row that is not full.
    'max-width': (span) =>
      span === 'auto' || span === 'content'
        ? '100%'
        : typeof span === 'number'
          ? `max(${spanWidth(span)},var(--_grid-grow) * 100%)`
          : undefined,
    'margin-inline-start': (offset) =>
      typeof offset === 'number'
        ? offset === 0
          ? '0'
          : `calc((100% + var(--_grid-gutter)) * ${offset} / var(--_grid-columns))`
        : undefined,
    order: (order) => (typeof order === 'number' ? String(order) : undefined),
  },
};

// The props each group reads, for the cache key and the early exit.
const GROUP_PROPS = Object.fromEntries(
  Object.entries(STYLE_GROUPS).map(([group, properties]) => [group, [...new Set(Object.values(properties).flat())]]),
) as Record<StyleGroup, (keyof AllStyleProps)[]>;

type Key = 'base' | Breakpoint;
const KEYS = ['base', ...(Object.keys(BREAKPOINTS) as Breakpoint[])] as const;

export type StyleDeclarations = Partial<Record<Key, string[]>>;

function toBreakpoints<T>(value: ResponsiveValue<T> | undefined): Partial<Record<Key, T>> {
  if (value === undefined) return {};
  return typeof value === 'object' && value !== null ? (value as Partial<Record<Key, T>>) : { base: value };
}

// The CSS goes into a generated <style>, so a string must not be able to close the rule or the tag.
const UNSAFE_VALUE = /[;{}<>]/;

function cssValue(value: SizeValue): string | undefined {
  if (typeof value === 'string') return UNSAFE_VALUE.test(value) ? undefined : value;
  return value === 0 ? '0' : `calc(var(--slp-spacing) * ${value})`;
}

/**
 * Resolves one group of style props into declarations per breakpoint. Each prop carries its value up through the
 * breakpoints first, then the most specific prop wins at each breakpoint: `p={{ md: 8 }} pl={2}` keeps the
 * left side at 2 everywhere. A declaration is only emitted where the property's value changes, and always
 * in the same order, so props that resolve to the same CSS produce the same declarations.
 */
export function resolveStyleProps(props: AllStyleProps, group: StyleGroup): StyleDeclarations {
  const declarations: StyleDeclarations = {};

  const properties = Object.entries(STYLE_GROUPS[group]) as [string, readonly (keyof AllStyleProps)[]][];

  for (const [property, sourceKeys] of properties) {
    const sources = sourceKeys.map((source) => toBreakpoints<SizeValue>(props[source]));
    const fallback = PROPERTY_FALLBACKS[group]?.[property];
    // Least specific, so any prop value wins over it.
    if (fallback !== undefined) sources.push({ base: fallback });
    const format = VALUE_FORMATS[group]?.[property];
    const current: (SizeValue | undefined)[] = sources.map(() => undefined);
    let previous: string | undefined;

    for (const key of KEYS) {
      sources.forEach((source, index) => {
        if (source[key] !== undefined) current[index] = source[key];
      });

      const value = current.find((value) => value !== undefined);
      const css = value === undefined ? undefined : (format?.(value) ?? cssValue(value));
      if (css === undefined || css === previous) continue;

      (declarations[key] ??= []).push(`${property}:${css}`);
      previous = css;
    }
  }

  return declarations;
}

export interface StyleClass {
  className: string;
  css: string;
}

// Resolved classes by group and prop values. Components with the same values skip resolving, hashing and
// building the CSS. Cleared when full rather than evicted one by one, since it only refills with values
// still in use.
const cache = new Map<string, StyleClass | undefined>();
const CACHE_LIMIT = 1000;

/**
 * The class and CSS for one group of style props, or undefined when none of them are set and the group has no
 * fallbacks. The class name is
 * a hash of the declarations, so it is the same on the server and the client, and props that resolve to the
 * same CSS share it.
 */
export function resolveStyleClass(props: AllStyleProps, group: StyleGroup): StyleClass | undefined {
  const values = GROUP_PROPS[group].map((name) => props[name]);
  if (!PROPERTY_FALLBACKS[group] && values.every((value) => value === undefined)) return undefined;

  const key = group + JSON.stringify(values);
  if (cache.has(key)) return cache.get(key);

  const declarations = resolveStyleProps(props, group);
  let result: StyleClass | undefined;
  if (Object.keys(declarations).length > 0) {
    const className = `slp-s-${hash(JSON.stringify(declarations))}`;
    result = { className, css: styleCss(`.${className}`, declarations) };
  }

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(key, result);
  return result;
}

/** CSS for `selector`, in the components layer so unlayered user CSS still wins. */
export function styleCss(selector: string, declarations: StyleDeclarations): string {
  const rules = KEYS.filter((key) => declarations[key]).map((key) => {
    const rule = `${selector}{${declarations[key]!.join(';')}}`;
    return key === 'base' ? rule : `@media (min-width:${BREAKPOINTS[key]}){${rule}}`;
  });
  return `@layer slopkit.components{${rules.join('')}}`;
}
