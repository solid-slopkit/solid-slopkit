// The threejs sidebar. Order here is the order shown; add a page by adding its route file under
// src/routes/threejs and an entry here.
import type { NavSection } from './types';

export const threejs: NavSection[] = [
  {
    title: 'three.js',
    items: [
      { title: 'Overview', href: '/threejs/overview' },
      { title: 'Scene components', href: '/threejs/scene-components' },
      { title: 'Animation', href: '/threejs/animation' },
      { title: 'Cameras and controls', href: '/threejs/cameras' },
      { title: 'Pointer events', href: '/threejs/pointer-events' },
      { title: 'Assets', href: '/threejs/assets' },
    ],
  },
];
