import { Group, NavLink, Stack } from '@solid-slopkit/components';
import { withBase } from '../../../base';

// Each links to this page, so the router marks them all as current.
const here = withBase('/components/nav-link');

export default function Variants() {
  return (
    <Group align="start">
      <Stack gap={0} style={{ width: '220px' }}>
        <NavLink href={here} label="Soft, primary" />
        <NavLink href={here} label="Soft, success" color="success" />
      </Stack>
      <Stack gap={0} style={{ width: '220px' }}>
        <NavLink href={here} label="Solid, primary" variant="solid" />
        <NavLink href={here} label="Solid, error" variant="solid" color="error" />
      </Stack>
    </Group>
  );
}
