// The flow sidebar. Order here is the order shown; add a page by adding its route file under
// src/routes/flow and an entry here.
import type { NavSection } from './types';

export const flow: NavSection[] = [
  {
    title: 'flow',
    items: [
      { title: 'Overview', href: '/flow/overview' },
      { title: 'Flow and Viewport', href: '/flow/viewport' },
      { title: 'Nodes', href: '/flow/nodes' },
      { title: 'Ports and Edges', href: '/flow/edges' },
      { title: 'Connections', href: '/flow/connections' },
      { title: 'Selection and editing', href: '/flow/editing' },
      { title: 'Accessibility', href: '/flow/accessibility' },
      { title: 'Built-in UI', href: '/flow/built-in-ui' },
      { title: 'Layout', href: '/flow/layout' },
      { title: 'Large Flows', href: '/flow/large-flows' },
      { title: 'Server rendering', href: '/flow/server-rendering' },
      { title: '3D dataflow', href: '/flow/dataflow-3d' },
    ],
  },
];
