import { createSignal, Show, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { I18nContext, I18nProvider } from '@solid-slopkit/i18n';
import { Alert, SlopkitUi, Stack } from '@solid-slopkit/components';
import { LocaleSwitch } from './locale-switch';
import ui from './ui.i18n.jsonc';

// The two providers do not know each other: SlopkitUi takes the locale (for dates and numbers) as a
// prop, and this component hands it the locale of the I18nProvider above it.
function Bridge(props: { children: JSX.Element }) {
  const i18n = useContext(I18nContext);
  return <SlopkitUi locale={i18n.locale()}>{props.children}</SlopkitUi>;
}

function Inbox() {
  const [open, setOpen] = createSignal(true);
  return (
    <Show when={open()}>
      <Alert title={ui.heading} onClose={() => setOpen(false)} closeButtonLabel={ui.close}>
        {ui.body}
      </Alert>
    </Show>
  );
}

export default function WithSlopkitUi() {
  return (
    <I18nProvider initialLocale="de">
      <Bridge>
        <Stack gap={2} style={{ 'max-width': '22rem' }}>
          <LocaleSwitch />
          <Inbox />
        </Stack>
      </Bridge>
    </I18nProvider>
  );
}
