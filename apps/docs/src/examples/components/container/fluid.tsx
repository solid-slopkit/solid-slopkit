import { Container } from '@solid-slopkit/components';

const content = { background: 'var(--slp-color-base-300)', padding: '0.5rem' };

export default function Fluid() {
  return (
    <div style={{ width: '100%', background: 'var(--slp-color-base-200)', 'padding-block': '0.5rem' }}>
      <Container fluid>
        <div style={content}>fluid: full width, padding kept</div>
      </Container>
    </div>
  );
}
