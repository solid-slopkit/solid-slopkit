import { Anchor, Avatar, Button, Group, HoverCard, Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    // The dropdown is a div, which a paragraph can't hold: the sentence is a div too.
    <Text as="div">
      Reviewed by{' '}
      <HoverCard withArrow openDelay={200}>
        <HoverCard.Target>
          {(target) => (
            <Anchor {...target} href="#ada">
              @ada
            </Anchor>
          )}
        </HoverCard.Target>
        <HoverCard.Dropdown aria-label="Ada Lovelace's profile" style={{ width: '18rem' }}>
          <Stack gap={3}>
            <Group wrap="nowrap">
              <Avatar name="Ada Lovelace" color="primary" />
              <div>
                <Text weight="semibold">Ada Lovelace</Text>
                <Text size="sm" dimmed>
                  @ada · London
                </Text>
              </div>
            </Group>
            <Text size="sm">Writes about analytical engines, and the notes on them that run longer than the paper.</Text>
            <Button size="sm" variant="outline">
              Follow
            </Button>
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>{' '}
      yesterday.
    </Text>
  );
}
