import { Collapse, Paper, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Paper withBorder padding="none">
      <Collapse icon="arrow">
        <Collapse.Title>Shipping details</Collapse.Title>
        <Collapse.Content>
          <Text>
            Orders placed before 2 p.m. leave the warehouse the same day. Standard delivery takes two to four working days, and
            you get a tracking link by email as soon as the parcel is on its way.
          </Text>
        </Collapse.Content>
      </Collapse>
    </Paper>
  );
}
