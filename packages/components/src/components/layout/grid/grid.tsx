import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './grid.module.css';
import {
  GRID_COL_STYLE_PROPS,
  GRID_STYLE_PROPS,
  createStyleClasses,
  joinClass,
  type GridColStyleProps,
  type GridStyleProps,
  type StyleGroup,
} from '../../../style-props';
import type { ElementProps } from '../../../utils';

export type GridProps = ElementProps<
  JSX.HTMLAttributes<HTMLDivElement>,
  GridStyleProps & {
    /** Columns in a row that is not full grow to fill it. */
    grow?: boolean;
  }
>;

export type GridColProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, GridColStyleProps>;

const GRID_GROUPS: StyleGroup[] = ['grid'];
const GRID_COL_GROUPS: StyleGroup[] = ['gridCol'];

/** A column of a Grid. It reads the gutter and column count from the nearest Grid. */
export function GridCol(props: GridColProps) {
  const others = omit(props, 'class', ...GRID_COL_STYLE_PROPS);
  const styleClasses = createStyleClasses(props, GRID_COL_GROUPS, 'Grid.Col');

  return <div class={joinClass(['slp-grid-col', style.col, styleClasses()], props.class)} {...others} />;
}

/** A 12-column flex grid with a gutter of 4. Lay it out with `Grid.Col` children. */
export function Grid(props: GridProps) {
  const others = omit(props, 'class', 'grow', ...GRID_STYLE_PROPS);
  const styleClasses = createStyleClasses(props, GRID_GROUPS, 'Grid');

  return (
    <div
      class={joinClass(['slp-grid', style.grid, styleClasses()], props.class)}
      data-grow={props.grow ? '' : undefined}
      {...others}
    />
  );
}

Grid.Col = GridCol;
