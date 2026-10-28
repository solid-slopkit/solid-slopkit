import { Collapse, Paper, Stack, Text } from '@solid-slopkit/components';

export default function Icons() {
  return (
    <Stack>
      <Paper withBorder padding="none">
        <Collapse icon="arrow">
          <Collapse.Title>Arrow</Collapse.Title>
          <Collapse.Content>
            <Text>The chevron turns to point up while it's open.</Text>
          </Collapse.Content>
        </Collapse>
      </Paper>
      <Paper withBorder padding="none">
        <Collapse icon="plus">
          <Collapse.Title>Plus</Collapse.Title>
          <Collapse.Content>
            <Text>The plus becomes a minus while it's open.</Text>
          </Collapse.Content>
        </Collapse>
      </Paper>
      <Paper withBorder padding="none">
        <Collapse defaultOpened>
          <Collapse.Title>No icon, open to start with</Collapse.Title>
          <Collapse.Content>
            <Text>Without an icon, the title is just its text.</Text>
          </Collapse.Content>
        </Collapse>
      </Paper>
    </Stack>
  );
}
