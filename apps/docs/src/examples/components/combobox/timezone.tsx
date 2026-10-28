import { Check, ChevronDown, CirclePlus } from '@lucide/solid';
import { createSignal, For, Show } from 'solid-js';
import { Button, Combobox, createCombobox, Divider, Stack, Text, useNotifications } from '@solid-slopkit/components';

const regions = [
  {
    label: 'Americas',
    timezones: [
      { value: 'America/New_York', label: '(GMT-5) New York' },
      { value: 'America/Los_Angeles', label: '(GMT-8) Los Angeles' },
      { value: 'America/Chicago', label: '(GMT-6) Chicago' },
      { value: 'America/Toronto', label: '(GMT-5) Toronto' },
      { value: 'America/Vancouver', label: '(GMT-8) Vancouver' },
      { value: 'America/Sao_Paulo', label: '(GMT-3) São Paulo' },
    ],
  },
  {
    label: 'Europe',
    timezones: [
      { value: 'Europe/London', label: '(GMT+0) London' },
      { value: 'Europe/Paris', label: '(GMT+1) Paris' },
      { value: 'Europe/Berlin', label: '(GMT+1) Berlin' },
      { value: 'Europe/Rome', label: '(GMT+1) Rome' },
      { value: 'Europe/Madrid', label: '(GMT+1) Madrid' },
      { value: 'Europe/Amsterdam', label: '(GMT+1) Amsterdam' },
    ],
  },
  {
    label: 'Asia/Pacific',
    timezones: [
      { value: 'Asia/Tokyo', label: '(GMT+9) Tokyo' },
      { value: 'Asia/Shanghai', label: '(GMT+8) Shanghai' },
      { value: 'Asia/Singapore', label: '(GMT+8) Singapore' },
      { value: 'Asia/Dubai', label: '(GMT+4) Dubai' },
      { value: 'Australia/Sydney', label: '(GMT+11) Sydney' },
      { value: 'Asia/Seoul', label: '(GMT+9) Seoul' },
    ],
  },
];

export default function Timezone() {
  const notifications = useNotifications();
  const [value, setValue] = createSignal('America/New_York');
  const [query, setQuery] = createSignal('');
  const combobox = createCombobox({ onChange: (opened) => opened && setQuery('') });
  // Each region with the timezones that match the search; regions without one are left out.
  const shown = () => {
    const words = query().toLowerCase().trim();
    return regions
      .map((region) => ({ ...region, timezones: region.timezones.filter((tz) => tz.label.toLowerCase().includes(words)) }))
      .filter((region) => region.timezones.length > 0);
  };
  const selectedRegion = () => regions.find((region) => region.timezones.some((tz) => tz.value === value()));
  const selected = () => selectedRegion()?.timezones.find((tz) => tz.value === value());

  return (
    <Combobox store={combobox} onOptionSubmit={setValue} matchTargetWidth={false} position="bottom-start">
      <Combobox.Target>
        {(target) => (
          <Button
            {...target}
            aria-label="Timezone"
            variant="outline"
            rightSection={<ChevronDown />}
            onClick={() => combobox.toggle()}
            style={{ width: '13rem', height: '3rem', 'justify-content': 'space-between' }}
          >
            <Stack gap={0} style={{ 'align-items': 'flex-start' }}>
              <Text size="xs" dimmed>
                {selectedRegion()?.label}
              </Text>
              {selected()?.label}
            </Stack>
          </Button>
        )}
      </Combobox.Target>
      <Combobox.Dropdown style={{ width: '18rem' }}>
        <Combobox.Search
          aria-label="Search timezone"
          placeholder="Search timezone…"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
        <Show when={shown().length === 0}>
          <Combobox.Empty>No timezone found.</Combobox.Empty>
        </Show>
        <Combobox.Options aria-label="Timezones" style={{ 'max-height': '16rem' }}>
          <For each={shown()}>
            {(region) => (
              <Combobox.Group label={region.label}>
                <For each={region.timezones}>
                  {(tz) => (
                    <Combobox.Option
                      value={tz.value}
                      selected={value() === tz.value}
                      style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between' }}
                    >
                      {tz.label}
                      <Show when={value() === tz.value}>
                        <Check size={16} aria-hidden="true" />
                      </Show>
                    </Combobox.Option>
                  )}
                </For>
              </Combobox.Group>
            )}
          </For>
        </Combobox.Options>
        <Divider style={{ margin: '0.25rem 0' }} />
        {/* Outside the listbox, so it stays in view while the timezones scroll. It's a button: Tab reaches it. */}
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          leftSection={<CirclePlus />}
          style={{ 'justify-content': 'flex-start' }}
          onClick={() => {
            combobox.close();
            notifications.show({ message: 'Create a timezone' });
          }}
        >
          Create timezone
        </Button>
      </Combobox.Dropdown>
    </Combobox>
  );
}
