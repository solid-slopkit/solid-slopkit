import { DateTimePicker, createDay } from '@solid-slopkit/components/dates';

export default function Time() {
  return (
    <DateTimePicker
      label="Departure"
      description="Every 15 minutes, 6:00 to 22:00"
      minDate={createDay(2026, 9, 5)}
      timePickerProps={{ format: '24h', minutesStep: 15, minTime: '06:00', maxTime: '22:00', withDropdown: true }}
      valueFormat={{ dateStyle: 'full', timeStyle: 'short' }}
      name="departure"
      style={{ 'max-width': '22rem' }}
    />
  );
}
