import { AngleSlider } from '@solid-slopkit/components';

const points = ['North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west'];
const short = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export default function Compass() {
  return (
    <AngleSlider
      label="Wind from"
      step={45}
      largeStep={90}
      marks={[0, 90, 180, 270]}
      color="info"
      valueText={(angle) => points[angle / 45]}
      valueLabel={(angle) => short[angle / 45]}
    />
  );
}
