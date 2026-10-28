import { Badge } from '@solid-slopkit/components';

export default function CustomProperties() {
  return (
    <>
      <Badge style={{ '--slp-badge-color': '#7048e8', '--slp-badge-content': '#fff' }}>Brand</Badge>
      <Badge variant="soft" style={{ '--slp-badge-color': '#7048e8' }}>
        Brand soft
      </Badge>
      <Badge color="primary" style={{ 'border-radius': '4px' }}>
        Square corners
      </Badge>
    </>
  );
}
