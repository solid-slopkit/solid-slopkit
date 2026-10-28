// The packages the docs cover, in the order the package picker and the home page show them. Each has its pages under
// /<id> (src/routes/<id>) and its own sidebar (src/nav/<id>.ts).
import { components } from './components';
import { flow } from './flow';
import { i18n } from './i18n';
import { signalForms } from './signal-forms';
import { threejs } from './threejs';
import type { NavSection } from './types';

export type { NavGroup, NavItem, NavSection } from './types';

export interface DocsPackage {
  /** The URL segment and the folder name: `/components/button` belongs to `components`. */
  id: string;
  /** The npm package. */
  name: string;
  title: string;
  description: string;
  /** Where the package's docs start. */
  href: string;
  nav: NavSection[];
}

export const packages: DocsPackage[] = [
  {
    id: 'components',
    name: '@solid-slopkit/components',
    title: 'Components',
    description: 'Components for SolidJS 2 apps, styled with plain CSS and theme variables.',
    href: '/components/overview',
    nav: components,
  },
  {
    id: 'signal-forms',
    name: '@solid-slopkit/signal-forms',
    title: 'Signal forms',
    description: 'Schema-driven, signal-based forms.',
    href: '/signal-forms/overview',
    nav: signalForms,
  },
  {
    id: 'i18n',
    name: '@solid-slopkit/i18n',
    title: 'i18n',
    description: 'Co-located, typed translation files.',
    href: '/i18n/overview',
    nav: i18n,
  },
  {
    id: 'flow',
    name: '@solid-slopkit/flow',
    title: 'Flow',
    description: 'Primitives for building node-based editors and interactive diagrams.',
    href: '/flow/overview',
    nav: flow,
  },
  {
    id: 'threejs',
    name: '@solid-slopkit/threejs',
    title: 'three.js',
    description: 'three.js scenes as SolidJS components.',
    href: '/threejs/overview',
    nav: threejs,
  },
];

/** The package whose pages `path` (a docs path, without the site's base) is under, if any. */
export const packageAt = (path: string) => packages.find((pkg) => path === `/${pkg.id}` || path.startsWith(`/${pkg.id}/`));
