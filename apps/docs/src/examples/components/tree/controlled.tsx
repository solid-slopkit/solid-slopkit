import { createSignal } from 'solid-js';
import { Button, Group, Stack, Text, Tree, type TreeNodeData } from '@solid-slopkit/components';
import { files } from './data';

const branches = (nodes: readonly TreeNodeData[]): string[] =>
  nodes.flatMap((node) => (node.children?.length ? [node.value, ...branches(node.children)] : []));

export default function Controlled() {
  const [expanded, setExpanded] = createSignal<string[]>([]);
  const [selected, setSelected] = createSignal<string[]>([]);

  return (
    <Stack>
      <Group>
        <Button size="sm" variant="soft" onClick={() => setExpanded(branches(files))}>
          Expand all
        </Button>
        <Button size="sm" variant="soft" onClick={() => setExpanded([])}>
          Collapse all
        </Button>
      </Group>
      <Tree
        data={files}
        aria-label="Pick files"
        multiple
        expanded={expanded()}
        onExpandedChange={setExpanded}
        selected={selected()}
        onSelectedChange={setSelected}
      />
      <Text size="sm" dimmed>
        Selected: {selected().join(', ') || 'none'}
      </Text>
    </Stack>
  );
}
