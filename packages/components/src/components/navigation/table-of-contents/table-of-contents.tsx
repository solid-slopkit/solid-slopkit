import { createEffect, createProjection, createSignal, For, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './table-of-contents.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

export interface TableOfContentsHeading {
  /** The heading element's id, which the link points at. */
  id: string;
  /** The link's text. */
  label: string;
  /** The heading level: 2 for an `h2`. The shallowest level present isn't indented. */
  depth: number;
}

/** How the active link is drawn: along a line beside the list (`line`), or tinted (`soft`). */
export type TableOfContentsVariant = 'line' | 'soft';

export interface TableOfContentsOwnProps {
  /** The headings to list. Without it, the headings matching `selector` are found on the page, in the browser. */
  headings?: readonly TableOfContentsHeading[];
  /** Which elements are headings, when `headings` isn't given. Only those with an id are listed. */
  selector?: string;
  /**
   * How far from the top of the viewport, in pixels, a heading counts as reached. Defaults to each heading's
   * `scroll-margin-top`, where following its link puts it.
   */
  offset?: number;
  /** Called with the id of the heading whose section is being read, or `null` before the first. */
  onActiveChange?: (id: string | null) => void;
  /** Defaults to `line`. */
  variant?: TableOfContentsVariant;
  /** The active link's color role. Defaults to `primary`. */
  color?: SlopColor;
}

export type TableOfContentsProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, TableOfContentsOwnProps>;

const DEFAULT_SELECTOR = 'h1, h2, h3, h4, h5, h6';

function depthOf(element: HTMLElement): number {
  const level = /^H([1-6])$/.exec(element.tagName)?.[1] ?? element.getAttribute('aria-level');
  return Number(level) || 1;
}

const sameHeadings = (a: readonly TableOfContentsHeading[], b: readonly TableOfContentsHeading[]) =>
  a.length === b.length &&
  a.every((heading, index) => heading.id === b[index].id && heading.label === b[index].label && heading.depth === b[index].depth);

/**
 * Links to the headings of the page, with the one whose section is being read marked as it scrolls. It finds the
 * headings itself, in the browser, or lists the `headings` it's given, which also render on the server.
 */
export function TableOfContents(props: TableOfContentsProps) {
  const others = omit(props, 'class', 'headings', 'selector', 'offset', 'onActiveChange', 'variant', 'color');

  const [found, setFound] = createSignal<readonly TableOfContentsHeading[]>([], { name: 'TableOfContents.found' });
  const headings = () => props.headings ?? found();
  // What the links show, with the indent below the shallowest heading. Reconciled by id: a heading that stays keeps
  // its record, and its link, and only fields that changed notify.
  const entries = createProjection<{ id: string; label: string; depth: number; indent: number }[]>(
    () => {
      const list = headings();
      const min = Math.min(...list.map((heading) => heading.depth));
      return list.map((heading) => ({ ...heading, indent: heading.depth - min }));
    },
    [],
    { key: 'id', name: 'TableOfContents.entries' },
  );

  const [active, setActive] = createSignal<string | null>(null, { name: 'TableOfContents.active' });
  // The active id as a key: a change re-runs only the two links it moves between.
  const activeSet = createProjection<Record<string, true>>(
    (draft) => {
      const next = active();
      for (const key of Object.keys(draft)) if (key !== next) delete draft[key];
      if (next != null) draft[next] = true;
    },
    {},
    { name: 'TableOfContents.activeSet' },
  );

  createEffect(
    () => ({ given: props.headings, selector: props.selector ?? DEFAULT_SELECTOR, offset: props.offset }),
    ({ given, selector, offset }) => {
      let elements: HTMLElement[] = [];
      let frame = 0;
      let pendingScan = false;

      const scan = () => {
        if (given) {
          elements = given.map((heading) => document.getElementById(heading.id)).filter((element) => element != null);
          return;
        }
        elements = [...document.querySelectorAll<HTMLElement>(selector)].filter((element) => element.id);
        const next = elements.map((element) => ({
          id: element.id,
          label: element.textContent?.trim() ?? '',
          depth: depthOf(element),
        }));
        if (!sameHeadings(next, untrack(found))) setFound(next);
      };

      // The last heading at or above its line. At the bottom of the page, the last heading, which may never reach it.
      const track = () => {
        let current: string | null = null;
        for (const element of elements) {
          const line = offset ?? (parseFloat(getComputedStyle(element).scrollMarginTop) || 0);
          if (element.getBoundingClientRect().top > line + 1) break;
          current = element.id;
        }
        const page = document.scrollingElement;
        if (page && page.scrollHeight > window.innerHeight && window.scrollY + window.innerHeight >= page.scrollHeight - 1) {
          current = elements.at(-1)?.id ?? current;
        }
        if (current !== untrack(active)) {
          setActive(current);
          props.onActiveChange?.(current);
        }
      };

      const schedule = (rescan: boolean) => {
        if (rescan) pendingScan = true;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (pendingScan) scan();
          pendingScan = false;
          track();
        });
      };
      const onScroll = () => schedule(false);
      // Headings come and go with the page's content, e.g. on a client-side navigation.
      const observer = new MutationObserver(() => schedule(true));

      scan();
      track();
      document.addEventListener('scroll', onScroll, { capture: true, passive: true });
      window.addEventListener('resize', onScroll);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['id'],
      });
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        document.removeEventListener('scroll', onScroll, { capture: true });
        window.removeEventListener('resize', onScroll);
      };
    },
    { name: 'TableOfContents.track' },
  );

  return (
    <nav
      aria-label="Table of contents"
      hidden={entries.length === 0}
      data-variant={props.variant ?? 'line'}
      data-color={props.color ?? 'primary'}
      class={joinClass(['slp-table-of-contents', style.tableOfContents], props.class)}
      {...others}
    >
      <ol data-slot="table-of-contents-list" class={style.list}>
        <For each={entries}>
          {(entry) => (
            <li data-slot="table-of-contents-item" class={style.item}>
              {/* Said either way, so a router that marks links to the current page adds nothing. */}
              <a
                href={`#${entry.id}`}
                aria-current={activeSet[entry.id] ? 'location' : 'false'}
                data-current={activeSet[entry.id] ? '' : undefined}
                data-depth={entry.depth}
                data-slot="table-of-contents-link"
                class={style.link}
                style={{ '--_toc-indent': String(entry.indent) }}
              >
                {entry.label}
              </a>
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
}
