import { Group, TableOfContents, type TableOfContentsHeading } from '@solid-slopkit/components';

const headings: TableOfContentsHeading[] = [
  { id: 'import', label: 'Import', depth: 2 },
  { id: 'usage', label: 'Usage', depth: 2 },
  { id: 'headings', label: 'Given headings', depth: 3 },
  { id: 'active', label: 'The active heading', depth: 3 },
  { id: 'props', label: 'Props', depth: 2 },
];

export default function Headings() {
  return (
    <Group align="start" grow>
      <TableOfContents headings={headings} aria-label="Line variant" />
      <TableOfContents headings={headings} aria-label="Soft variant" variant="soft" color="secondary" />
    </Group>
  );
}
