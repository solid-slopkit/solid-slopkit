import { BackgroundImage, Text } from '@solid-slopkit/components';
import landscape from '../example-landscape.svg';

const box = { width: '10rem', height: '10rem', 'border-radius': '8px', 'background-color': 'var(--slp-color-base-200)' };

export default function Sizing() {
  return (
    <>
      <div>
        <BackgroundImage src={landscape} role="img" aria-label="Hills, cropped to fill" style={box} />
        <Text size="sm">cover (default)</Text>
      </div>
      <div>
        <BackgroundImage src={landscape} role="img" aria-label="Hills, whole" style={{ ...box, 'background-size': 'contain' }} />
        <Text size="sm">background-size: contain</Text>
      </div>
    </>
  );
}
