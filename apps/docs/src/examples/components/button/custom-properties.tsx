import { Button } from '@solid-slopkit/components';

export default function CustomProperties() {
  return (
    <>
      <Button style={{ '--slp-button-color': '#7048e8', '--slp-button-content': '#fff' }}>Brand color</Button>
      <Button variant="outline" style={{ '--slp-button-color': '#7048e8' }}>
        Brand outline
      </Button>
      <Button color="primary" style={{ 'border-radius': '0' }}>
        Square corners
      </Button>
    </>
  );
}
