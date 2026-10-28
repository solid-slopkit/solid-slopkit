import { Select } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Select
      label="Country"
      placeholder="Pick a country"
      data={['Austria', 'Belgium', 'Croatia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany']}
      style={{ width: '16rem' }}
    />
  );
}
