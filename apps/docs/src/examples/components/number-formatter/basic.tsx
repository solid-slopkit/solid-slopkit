import { NumberFormatter, Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Stack gap={1}>
      <Text>
        Population: <NumberFormatter value={8_118_835_999} />
      </Text>
      <Text>
        Price: <NumberFormatter value={1299} options={{ style: 'currency', currency: 'EUR' }} />
      </Text>
      <Text>
        Conversion: <NumberFormatter value={0.0425} options={{ style: 'percent', maximumFractionDigits: 1 }} />
      </Text>
      <Text>
        Downloads: <NumberFormatter value={1_532_000} options={{ notation: 'compact' }} />
      </Text>
      <Text>
        Distance: <NumberFormatter value={42.195} options={{ style: 'unit', unit: 'kilometer' }} />
      </Text>
      <Text>
        Change: <NumberFormatter value={-3.2} options={{ signDisplay: 'always', maximumFractionDigits: 1 }} suffix=" pts" />
      </Text>
    </Stack>
  );
}
