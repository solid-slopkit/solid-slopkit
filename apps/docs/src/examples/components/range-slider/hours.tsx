import { RangeSlider } from '@solid-slopkit/components';

export default function Hours() {
  return (
    <RangeSlider
      label="Opening hours"
      description="At least one hour apart."
      min={0}
      max={24}
      defaultValue={[9, 17]}
      minRange={1}
      color="success"
      valueLabel={(value) => `${value}:00`}
      thumbLabels={['Opens', 'Closes']}
      marks={[
        { value: 0, label: '0:00' },
        { value: 6 },
        { value: 12, label: '12:00' },
        { value: 18 },
        { value: 24, label: '24:00' },
      ]}
      style={{ width: '100%', 'max-width': '24rem' }}
    />
  );
}
