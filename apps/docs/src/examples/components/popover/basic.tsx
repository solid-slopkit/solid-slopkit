import { Button, Popover, Stack, TextInput } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Popover withArrow>
      <Popover.Target>{(target) => <Button {...target}>Rename</Button>}</Popover.Target>
      <Popover.Dropdown aria-label="Rename the project">
        <Stack gap={2}>
          <TextInput label="Project name" value="Slopkit" />
          <Button size="sm">Save</Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
