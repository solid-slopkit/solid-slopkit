import { createMemo, createSignal, For, Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Title } from '@solidjs/meta';
import { Check, Code as CodeIcon, RotateCcw, Shuffle, SlidersHorizontal } from '@lucide/solid';
import { Box, Button, ColorSwatch, Flex, Group, Menu, Modal, SimpleGrid, Stack } from '@solid-slopkit/components';
import { CodeBlock } from '../../components/CodeBlock';
import { ColorSchemeToggle } from '../../layout/ColorSchemeToggle';
// Before the pages, so the cards' own styles come after the shared ones.
import '../../create/create.css';
import { PageOne } from '../../create/PageOne';
import { PageTwo } from '../../create/PageTwo';
import {
  buildTokens,
  DEFAULT_PRESET,
  OPTIONS,
  shufflePreset,
  STARTERS,
  swatch,
  toCss,
  type Option,
  type Preset,
} from '../../create/presets';
import { withBase } from '../../base';

type Control = { key: keyof Preset; label: string; icon: (value: string) => JSX.Element };

const colorIcon = (control: 'base' | 'primary' | 'secondary') => (value: string) => (
  <ColorSwatch size="xs" value={swatch(control, value)} />
);
const textIcon = (text: string) => () => <span class="create-rail-glyph">{text}</span>;

// The rail's pickers, in groups like the theme's parts: colors, type, shape.
const GROUPS: Control[][] = [
  [
    { key: 'base', label: 'Base Color', icon: colorIcon('base') },
    { key: 'primary', label: 'Primary', icon: colorIcon('primary') },
    { key: 'secondary', label: 'Secondary', icon: colorIcon('secondary') },
  ],
  [
    { key: 'headings', label: 'Headings', icon: textIcon('Aa') },
    { key: 'font', label: 'Font', icon: textIcon('Aa') },
  ],
  [
    { key: 'density', label: 'Density', icon: textIcon('↕') },
    { key: 'depth', label: 'Depth', icon: textIcon('◐') },
  ],
];

const label = (options: Option[], value: string | null) => options.find((o) => o.value === value)?.label ?? 'Custom';

// One rail row: a small label over the current choice, an icon at the end, and a menu of the choices.
function Picker(props: {
  label: string;
  options: Option[];
  value: string | null;
  icon?: JSX.Element;
  onChange: (value: string) => void;
}) {
  return (
    <Menu position="right-start" offset={8}>
      <Menu.Target>
        {(target) => (
          <button {...target} type="button" class="create-rail-row">
            <span class="create-rail-text">
              <span class="create-rail-label">{props.label}</span>
              <span class="create-rail-value">{label(props.options, props.value)}</span>
            </span>
            {props.icon}
          </button>
        )}
      </Menu.Target>
      <Menu.Dropdown class="create-rail-menu">
        <For each={props.options}>
          {(option) => (
            <Menu.Item
              rightSection={option.value === props.value ? <Check aria-hidden="true" /> : undefined}
              onClick={() => props.onChange(option.value)}
            >
              {option.label}
            </Menu.Item>
          )}
        </For>
      </Menu.Dropdown>
    </Menu>
  );
}

// The theme builder: pick a preset in the rail, judge it on two pages of real screens, take the CSS. The theme
// applies to the canvas only, as inline tokens, so the frame around it keeps the docs' theme.
export default function Create() {
  const [preset, setPreset] = createSignal<Preset>(DEFAULT_PRESET, { name: 'create.preset' });
  const [page, setPage] = createSignal<1 | 2>(1, { name: 'create.page' });
  const [codeOpened, setCodeOpened] = createSignal(false, { name: 'create.codeOpened' });

  const tokens = createMemo(() => buildTokens(preset()), { name: 'create.tokens' });
  const starter = createMemo(
    () => {
      const current = JSON.stringify(preset());
      return STARTERS.find((s) => JSON.stringify(s.preset) === current)?.value ?? null;
    },
    { name: 'create.starter' },
  );

  return (
    <Stack gap={0} class="create">
      <Title>Create a theme · slopkit</Title>
      <Group justify="space-between" wrap="nowrap" class="create-header" role="banner">
        <Group gap={6} wrap="nowrap">
          <a class="docs-wordmark" href={withBase('/')}>
            slopkit
          </a>
          <Box display={{ base: 'none', sm: 'block' }}>
            <Group gap={4} class="create-header-nav" role="navigation" aria-label="Main">
              <a href={withBase('/')}>Docs</a>
              <a href={withBase('/components/overview')}>Components</a>
              <a href={withBase('/components/theming')}>Theming</a>
              <a href={withBase('/create')} aria-current="page">
                Create
              </a>
            </Group>
          </Box>
        </Group>
        <Group gap={2} wrap="nowrap">
          <ColorSchemeToggle pinned={false} />
          <Button size="sm" color="primary" onClick={() => setCodeOpened(true)}>
            Get CSS
          </Button>
        </Group>
      </Group>

      {/* Narrow, the rail turns into a scrolling row above the canvas. */}
      <Flex direction={{ base: 'column', sm: 'row' }} gap={4} class="create-body">
        <Stack gap={3} class="create-rail" role="complementary" aria-label="Theme options">
          <Flex direction={{ base: 'row', sm: 'column' }} class="create-rail-panel">
            <Box display={{ base: 'none', sm: 'block' }}>
              <Group justify="space-between" wrap="nowrap" class="create-rail-head">
                <h1>Create a theme</h1>
                <SlidersHorizontal aria-hidden="true" />
              </Group>
            </Box>
            <Flex direction={{ base: 'row', sm: 'column' }} gap={1} class="create-rail-group">
              <Picker
                label="Start From"
                options={STARTERS}
                value={starter()}
                onChange={(value) => {
                  const next = STARTERS.find((s) => s.value === value);
                  if (next) setPreset(next.preset);
                }}
              />
            </Flex>
            <For each={GROUPS}>
              {(group) => (
                <Flex direction={{ base: 'row', sm: 'column' }} gap={1} class="create-rail-group">
                  <For each={group}>
                    {(control) => (
                      <Picker
                        label={control.label}
                        options={OPTIONS[control.key]}
                        value={preset()[control.key]}
                        icon={control.icon(preset()[control.key])}
                        onChange={(value) => setPreset((current) => ({ ...current, [control.key]: value }))}
                      />
                    )}
                  </For>
                </Flex>
              )}
            </For>
          </Flex>
          <SimpleGrid cols={{ base: 3, sm: 1 }} spacing={2}>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftSection={<Shuffle aria-hidden="true" />}
              onClick={() => setPreset(shufflePreset())}
            >
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftSection={<RotateCcw aria-hidden="true" />}
              onClick={() => setPreset(DEFAULT_PRESET)}
            >
              Reset
            </Button>
            <Button
              color="primary"
              size="sm"
              fullWidth
              leftSection={<CodeIcon aria-hidden="true" />}
              onClick={() => setCodeOpened(true)}
            >
              Get CSS
            </Button>
          </SimpleGrid>
        </Stack>

        <Box class="create-stage" role="main">
          <div class="create-canvas" style={tokens()}>
            <Show when={page() === 1} fallback={<PageTwo />}>
              <PageOne />
            </Show>
          </div>
          <Group gap={1} class="create-pager" role="group" aria-label="Preview page">
            <For each={[1, 2] as const}>
              {(n) => (
                <button type="button" aria-pressed={page() === n ? 'true' : 'false'} onClick={() => setPage(n)}>
                  {`0${n}`}
                </button>
              )}
            </For>
          </Group>
        </Box>
      </Flex>

      <Modal opened={codeOpened()} onClose={() => setCodeOpened(false)} title="Theme CSS" size="lg">
        <p class="create-modal-lead">
          Import it after <code>default-theme.css</code>. It sets the tokens on <code>:root</code>; use a{' '}
          <code>[data-slp-theme]</code> selector instead to scope it to part of a page.
        </p>
        <CodeBlock code={toCss(tokens())} lang="css" />
      </Modal>
    </Stack>
  );
}
