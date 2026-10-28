import { CopyButton, Group } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <Group>
      <CopyButton value="https://example.com/invite/7f3a" label="Copy link" copiedLabel="Link copied" />
      <CopyButton value="https://example.com/invite/7f3a" label="Copy link" variant="soft" color="primary" />
      <CopyButton value="https://example.com/invite/7f3a" label="Copy link" variant="outline" shape="circle" />
      <CopyButton value="https://example.com/invite/7f3a" label="Copy link" variant="solid" color="primary" size="lg" />
    </Group>
  );
}
