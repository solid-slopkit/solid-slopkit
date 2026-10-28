// The signal-forms sidebar. Order here is the order shown; add a page by adding its route file under
// src/routes/signal-forms and an entry here.
import type { NavSection } from './types';

export const signalForms: NavSection[] = [
  {
    title: 'Signal forms',
    items: [
      { title: 'Overview', href: '/signal-forms/overview' },
      { title: 'Binding', href: '/signal-forms/binding' },
      { title: 'Validation', href: '/signal-forms/validation' },
      { title: 'Conditions and combinators', href: '/signal-forms/conditions' },
      { title: 'Submit and async', href: '/signal-forms/submit' },
      { title: 'Metadata', href: '/signal-forms/metadata' },
    ],
  },
];
