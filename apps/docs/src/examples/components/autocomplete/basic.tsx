import { Autocomplete } from '@solid-slopkit/components';

const cities = [
  'Amsterdam',
  'Antwerp',
  'Athens',
  'Barcelona',
  'Berlin',
  'Bern',
  'Bratislava',
  'Brussels',
  'Bucharest',
  'Budapest',
];

export default function Basic() {
  return <Autocomplete label="City" placeholder="Start typing a city" data={cities} style={{ width: '16rem' }} />;
}
