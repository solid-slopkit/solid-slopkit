import { I18nProvider } from '@solid-slopkit/i18n';
import { Button, Group, Paper, Stack, TextInput, Title } from '@solid-slopkit/components';
import common from './common.i18n.jsonc';
import { LocaleSwitch } from './locale-switch';
import profile from './profile.i18n.jsonc';

// `common` is imported by this component and by the next one; each file is loaded once.
function ProfileForm() {
  return (
    <Paper withBorder>
      <Stack gap={2}>
        <Title order={4}>{profile.title}</Title>
        <TextInput label={profile.name} />
        <ConfirmBar />
      </Stack>
    </Paper>
  );
}

function ConfirmBar() {
  return (
    <Group gap={1}>
      <Button size="xs" variant="outline">
        {common.save}
      </Button>
      <Button size="xs" variant="outline">
        {common.cancel}
      </Button>
    </Group>
  );
}

export default function Shared() {
  return (
    <I18nProvider initialLocale="de">
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <LocaleSwitch />
        <ProfileForm />
      </Stack>
    </I18nProvider>
  );
}
