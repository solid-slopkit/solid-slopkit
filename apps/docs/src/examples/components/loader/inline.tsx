import { Loader, Text, Title } from '@solid-slopkit/components';

export default function Inline() {
  return (
    <>
      <Title order={3}>
        Building <Loader variant="dots" label="Building" />
      </Title>
      <Text>
        Saving changes <Loader label="Saving changes" />
      </Text>
      <Text size="sm" color="success">
        Syncing <Loader variant="bars" label="Syncing" />
      </Text>
    </>
  );
}
