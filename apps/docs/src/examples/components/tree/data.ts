import type { TreeNodeData } from '@solid-slopkit/components';

export const files: TreeNodeData[] = [
  {
    value: 'src',
    label: 'src',
    children: [
      {
        value: 'src/components',
        label: 'components',
        children: [
          { value: 'src/components/button.tsx', label: 'button.tsx' },
          { value: 'src/components/tree.tsx', label: 'tree.tsx' },
        ],
      },
      { value: 'src/app.tsx', label: 'app.tsx' },
      { value: 'src/index.ts', label: 'index.ts' },
    ],
  },
  {
    value: 'public',
    label: 'public',
    children: [{ value: 'public/favicon.svg', label: 'favicon.svg' }],
  },
  { value: 'package.json', label: 'package.json' },
  { value: 'README.md', label: 'README.md' },
];
