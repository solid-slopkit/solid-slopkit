import { I18nProvider } from '@solid-slopkit/i18n';
import { Button, Paper, Stack, Text, Title } from '@solid-slopkit/components';
import { LocaleSwitch } from './locale-switch';
import translations from './users.i18n.jsonc';

// The file next to this one is imported like any module. `translations.title` is the message in the
// active locale, typed from the file; it follows the locale of the provider above.
function UsersList() {
  return (
    <Paper withBorder>
      <Stack gap={1} align="flex-start">
        <Title order={4}>{translations.title}</Title>
        <Text size="sm">{translations.empty}</Text>
        <Button variant="outline" size="xs">
          {translations.add}
        </Button>
      </Stack>
    </Paper>
  );
}

export default function Usage() {
  return (
    <I18nProvider initialLocale="en">
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <LocaleSwitch />
        <UsersList />
      </Stack>
    </I18nProvider>
  );
}
