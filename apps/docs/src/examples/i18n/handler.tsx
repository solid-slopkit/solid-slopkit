import { createSignal } from 'solid-js';
import { I18nProvider, useTranslations } from '@solid-slopkit/i18n';
import { Button, Stack, Text } from '@solid-slopkit/components';
import { LocaleSwitch } from './locale-switch';
import translations from './handler.i18n.jsonc';

// Reading a message while rendering follows the locale automatically. In an event handler there is no
// reactive owner to ask, so a plain `translations.saved(...)` uses the provider that mounted last.
// `useTranslations` binds the messages to this component's own provider instead, which is also correct
// when one page has several providers with different locales.
function Draft() {
  const t = useTranslations(translations);
  const [status, setStatus] = createSignal('');
  let count = 0;
  return (
    <Stack gap={1} align="flex-start">
      <Button size="xs" variant="outline" onClick={() => setStatus(t.saved({ count: ++count }))}>
        {translations.save}
      </Button>
      <Text size="sm" role="status">
        {status()}
      </Text>
    </Stack>
  );
}

export default function Handler() {
  return (
    <I18nProvider initialLocale="uk">
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <LocaleSwitch />
        <Draft />
      </Stack>
    </I18nProvider>
  );
}
