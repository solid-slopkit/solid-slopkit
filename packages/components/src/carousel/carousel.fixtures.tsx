// SSR scenarios for carousel.test.tsx.
import { Carousel } from '.';

export const carousels = () => (
  <div>
    <Carousel aria-label="Featured" slideSize="50%" slideGap={4} withIndicators class="mine">
      <Carousel.Slide>One</Carousel.Slide>
      <Carousel.Slide>Two</Carousel.Slide>
      <Carousel.Slide>Three</Carousel.Slide>
    </Carousel>
    <Carousel aria-label="Looping" loop initialSlide={1} withControls={false}>
      <Carousel.Slide>One</Carousel.Slide>
      <Carousel.Slide>Two</Carousel.Slide>
    </Carousel>
    <Carousel aria-label="Vertical" orientation="vertical" style={{ height: '200px' }}>
      <Carousel.Slide>One</Carousel.Slide>
      <Carousel.Slide>Two</Carousel.Slide>
    </Carousel>
  </div>
);
