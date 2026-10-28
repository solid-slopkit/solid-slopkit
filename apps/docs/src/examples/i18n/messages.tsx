import { createSignal } from 'solid-js';
import { I18nProvider } from '@solid-slopkit/i18n';
import { NumberInput, SegmentedControl, Stack, Text } from '@solid-slopkit/components';
import { LocaleSwitch } from './locale-switch';
import messages from './messages.i18n.jsonc';

// A message with arguments is a function of a typed object: `count` must be a number, `role` suggests the
// branches the message lists (any other string takes `other`), `date` is a Date. Numbers and dates are
// formatted for the locale.
const JOINED = new Date(Date.UTC(2026, 9, 6, 12));

export default function Messages() {
  const [count, setCount] = createSignal(5);
  const [role, setRole] = createSignal('admin');
  return (
    <I18nProvider initialLocale="uk">
      <Stack gap={2} style={{ 'max-width': '26rem' }}>
        <LocaleSwitch />
        <NumberInput label="Users" min={0} value={count()} onChange={(value) => setCount(value ?? 0)} />
        <SegmentedControl aria-label="Role" size="xs" data={['admin', 'editor']} value={role()} onChange={setRole} />
        <Text>{messages.users({ count: count() })}</Text>
        <Text>{messages.role({ role: role() })}</Text>
        <Text>{messages.price({ amount: 1234567.5 })}</Text>
        <Text>{messages.share({ ratio: 0.42 })}</Text>
        <Text>{messages.joined({ date: JOINED })}</Text>
      </Stack>
    </I18nProvider>
  );
}
