import { Anchor, Breadcrumbs, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Breadcrumbs>
      <Anchor href="#home" underline="hover">
        Home
      </Anchor>
      <Anchor href="#docs" underline="hover">
        Docs
      </Anchor>
      <Text as="span" aria-current="page">
        Breadcrumbs
      </Text>
    </Breadcrumbs>
  );
}
