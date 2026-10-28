import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './table.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopSize } from '../../../core';

export interface TableOwnProps {
  /** Tints every other body row. */
  striped?: boolean;
  /** Highlights the body row under the pointer. */
  hover?: boolean;
  /** Draws a border around the table and between columns. */
  bordered?: boolean;
  /** Keeps the header row in view while the table scrolls. */
  stickyHeader?: boolean;
  /** Cell padding and font size. Defaults to `md`. */
  size?: SlopSize;
}

export type TableProps = ElementProps<JSX.HTMLAttributes<HTMLTableElement>, TableOwnProps>;
export type TableSectionProps = ElementProps<JSX.HTMLAttributes<HTMLTableSectionElement>>;
export type TableRowProps = ElementProps<JSX.HTMLAttributes<HTMLTableRowElement>>;
export type TableHeaderCellProps = ElementProps<JSX.ThHTMLAttributes<HTMLTableCellElement>>;
export type TableCellProps = ElementProps<JSX.TdHTMLAttributes<HTMLTableCellElement>>;
export type TableCaptionProps = ElementProps<JSX.HTMLAttributes<HTMLTableCaptionElement>>;
export type TableScrollContainerProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/** The header rows: a `thead`. */
export function TableThead(props: TableSectionProps) {
  const others = omit(props, 'class');
  return <thead class={joinClass(['slp-table-thead'], props.class)} {...others} />;
}

/** The body rows: a `tbody`. */
export function TableTbody(props: TableSectionProps) {
  const others = omit(props, 'class');
  return <tbody class={joinClass(['slp-table-tbody'], props.class)} {...others} />;
}

/** The footer rows, such as totals: a `tfoot`. */
export function TableTfoot(props: TableSectionProps) {
  const others = omit(props, 'class');
  return <tfoot class={joinClass(['slp-table-tfoot'], props.class)} {...others} />;
}

/** A row: a `tr`. */
export function TableTr(props: TableRowProps) {
  const others = omit(props, 'class');
  return <tr class={joinClass(['slp-table-tr'], props.class)} {...others} />;
}

/** A header cell: a `th`. In the header row, give it `scope="col"`; at the start of a body row, `scope="row"`. */
export function TableTh(props: TableHeaderCellProps) {
  const others = omit(props, 'class');
  return <th class={joinClass(['slp-table-th'], props.class)} {...others} />;
}

/** A data cell: a `td`. */
export function TableTd(props: TableCellProps) {
  const others = omit(props, 'class');
  return <td class={joinClass(['slp-table-td'], props.class)} {...others} />;
}

/** The table's title: a `caption`, which also names the table for assistive technology. */
export function TableCaption(props: TableCaptionProps) {
  const others = omit(props, 'class');
  return <caption class={joinClass(['slp-table-caption'], props.class)} {...others} />;
}

/**
 * A `div` that scrolls a wide table sideways instead of letting it overflow the page. It takes a tab stop, so the
 * keyboard can scroll it: not every browser in the baseline lets the keyboard reach a scroller on its own.
 */
export function TableScrollContainer(props: TableScrollContainerProps) {
  const mergedProps = mergeDefaultProps({ tabindex: 0 }, props);
  const others = omit(mergedProps, 'class');
  return <div class={joinClass(['slp-table-scroll-container', style.scroll], mergedProps.class)} {...others} />;
}

/**
 * Rows and columns of data: a `table`. Build it from Table.Thead, Table.Tbody, Table.Tr, Table.Th, Table.Td and
 * friends, or from the plain elements; the styles apply to both.
 */
export function Table(props: TableProps) {
  const mergedProps = mergeDefaultProps({ size: 'md' as SlopSize }, props);
  const others = omit(mergedProps, 'class', 'striped', 'hover', 'bordered', 'stickyHeader', 'size');

  return (
    <table
      data-size={mergedProps.size}
      data-striped={mergedProps.striped ? '' : undefined}
      data-hover={mergedProps.hover ? '' : undefined}
      data-bordered={mergedProps.bordered ? '' : undefined}
      data-sticky-header={mergedProps.stickyHeader ? '' : undefined}
      class={joinClass(['slp-table', style.table], mergedProps.class)}
      {...others}
    />
  );
}

Table.Thead = TableThead;
Table.Tbody = TableTbody;
Table.Tfoot = TableTfoot;
Table.Tr = TableTr;
Table.Th = TableTh;
Table.Td = TableTd;
Table.Caption = TableCaption;
Table.ScrollContainer = TableScrollContainer;
