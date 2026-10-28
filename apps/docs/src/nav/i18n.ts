// The i18n sidebar. Order here is the order shown; add a page by adding its route file under
// src/routes/i18n and an entry here.
import type { NavSection } from './types';

export const i18n: NavSection[] = [
  {
    title: 'i18n',
    items: [
      { title: 'Overview', href: '/i18n/overview' },
      { title: 'Setup', href: '/i18n/setup' },
      { title: 'Messages', href: '/i18n/messages' },
      { title: 'Locale', href: '/i18n/locale' },
      { title: 'Loading', href: '/i18n/loading' },
      { title: 'With slopkit components', href: '/i18n/slopkit-components' },
    ],
  },
];
