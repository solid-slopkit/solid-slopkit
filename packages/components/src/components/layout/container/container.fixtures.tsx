// SSR scenarios for container.test.tsx.
import { Container } from '.';

export const sizes = () => (
  <>
    <Container class="mine">Default</Container>
    <Container size="lg">Preset</Container>
    <Container size="30rem">Length</Container>
    <Container fluid>Fluid</Container>
  </>
);
