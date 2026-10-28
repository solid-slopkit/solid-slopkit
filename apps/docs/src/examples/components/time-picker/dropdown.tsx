import { TimePicker } from '@solid-slopkit/components/dates';

export default function Dropdown() {
  return (
    <TimePicker
      label="Pickup"
      description="Every 15 minutes, 8:00 to 18:00"
      withDropdown
      minutesStep={15}
      minTime="08:00"
      maxTime="18:00"
      defaultValue="10:15"
      style={{ 'max-width': '14rem' }}
    />
  );
}
