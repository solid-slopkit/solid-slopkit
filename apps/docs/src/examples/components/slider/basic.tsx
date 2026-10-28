import { createSignal } from 'solid-js';
import { Slider, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [volume, setVolume] = createSignal(40);
  const [saved, setSaved] = createSignal(40);

  return (
    <div style={{ width: '100%', 'max-width': '24rem' }}>
      <Slider label="Volume" value={volume()} onChange={setVolume} onChangeEnd={setSaved} valueLabel={(value) => `${value}%`} />
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Value: {volume()}, saved when you let go: {saved()}
      </Text>
    </div>
  );
}
