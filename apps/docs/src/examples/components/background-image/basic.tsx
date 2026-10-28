import { BackgroundImage, Text, Title } from '@solid-slopkit/components';
import landscape from '../example-landscape.svg';

export default function Basic() {
  return (
    <BackgroundImage
      src={landscape}
      style={{ width: '100%', 'min-height': '14rem', 'border-radius': '12px', overflow: 'hidden', display: 'flex' }}
    >
      <div
        style={{
          'align-self': 'flex-end',
          width: '100%',
          padding: '1.25rem',
          background: 'linear-gradient(transparent, rgb(0 0 0 / 0.65))',
          color: '#fff',
        }}
      >
        <Title order={3}>Evening in the hills</Title>
        <Text size="sm">The text sits on a gradient, so it stays readable over any part of the image.</Text>
      </div>
    </BackgroundImage>
  );
}
