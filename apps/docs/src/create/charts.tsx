import { For, Show } from 'solid-js';
import { Flex, Stack } from '@solid-slopkit/components';

// Small drawings for the theme builder's preview cards. The library has no chart component, so these are plain
// markup colored with the canvas's chart colors (--create-chart-1 … -5, derived from the theme in create.css).
// They're decorative: each is hidden from screen readers, and a card states the numbers in text where they matter.

/** Vertical bars, tallest value full height, with optional labels under them. `gap` is between bars, in spacing units. */
export function Bars(props: {
  values: number[];
  labels?: string[];
  height?: string;
  color?: string;
  gap?: number;
  class?: string;
}) {
  const max = () => Math.max(...props.values);
  return (
    <Stack gap={2} class={props.class} aria-hidden="true">
      <Flex align="flex-end" gap={props.gap ?? 2} style={{ height: props.height ?? '8rem' }}>
        <For each={props.values}>
          {(value) => (
            <span
              class="create-bar"
              style={{ height: `${(value / max()) * 100}%`, background: props.color ?? 'var(--create-chart-1)' }}
            />
          )}
        </For>
      </Flex>
      <Show when={props.labels}>{(labels) => <Labels labels={labels()} gap={props.gap} />}</Show>
    </Stack>
  );
}

function Labels(props: { labels: string[]; gap?: number }) {
  return (
    <Flex gap={props.gap ?? 2} class="create-bars-labels">
      <For each={props.labels}>{(label) => <span>{label}</span>}</For>
    </Flex>
  );
}

/** Pairs (or more) of bars per group, one color per series. */
export function GroupedBars(props: { groups: number[][]; labels?: string[]; height?: string }) {
  const max = () => Math.max(...props.groups.flat());
  return (
    <Stack gap={2} aria-hidden="true">
      <Flex align="flex-end" gap={2} style={{ height: props.height ?? '8rem' }}>
        <For each={props.groups}>
          {(group) => (
            <Flex align="flex-end" gap={0.5} class="create-bar-group">
              <For each={group}>
                {(value, series) => (
                  <span
                    class="create-bar"
                    style={{ height: `${(value / max()) * 100}%`, background: `var(--create-chart-${series() + 1})` }}
                  />
                )}
              </For>
            </Flex>
          )}
        </For>
      </Flex>
      <Show when={props.labels}>{(labels) => <Labels labels={labels()} />}</Show>
    </Stack>
  );
}

/** Bars made of stacked segments, bottom first; each column's total sets its height. */
export function StackedBars(props: { stacks: number[][]; height?: string }) {
  const max = () => Math.max(...props.stacks.map((stack) => stack.reduce((a, b) => a + b, 0)));
  return (
    <Flex align="flex-end" gap={2} aria-hidden="true" style={{ height: props.height ?? '8rem' }}>
      <For each={props.stacks}>
        {(stack) => (
          <Flex
            direction="column-reverse"
            gap={0.5}
            class="create-bar-stack"
            style={{ height: `${(stack.reduce((a, b) => a + b, 0) / max()) * 100}%` }}
          >
            <For each={stack}>
              {(value, series) => <span style={{ flex: `${value} 0 0`, background: `var(--create-chart-${series() + 1})` }} />}
            </For>
          </Flex>
        )}
      </For>
    </Flex>
  );
}

/** Bars inside full-height tracks, like a weekly goal. */
export function TrackBars(props: { values: number[]; labels: string[]; height?: string }) {
  return (
    <Flex gap={1.5} aria-hidden="true">
      <For each={props.values}>
        {(value, index) => (
          <Stack align="center" gap={1.5} class="create-track">
            <span class="create-track-label">{props.labels[index()]}</span>
            <Flex align="flex-end" class="create-track-plot" style={{ height: props.height ?? '4rem' }}>
              <span style={{ height: `${value}%` }} />
            </Flex>
          </Stack>
        )}
      </For>
    </Flex>
  );
}

function path(values: number[], width: number, height: number, smooth: boolean) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values.map((value, i) => [
    (i / (values.length - 1)) * width,
    height - ((value - min) / span) * height * 0.8 - height * 0.1,
  ]);
  if (!smooth) return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x!.toFixed(1)},${y!.toFixed(1)}`).join(' ');
  return points
    .map(([x, y], i) => {
      if (i === 0) return `M${x},${y}`;
      const [px, py] = points[i - 1]!;
      const mid = (px! + x!) / 2;
      return `C${mid.toFixed(1)},${py!.toFixed(1)} ${mid.toFixed(1)},${y!.toFixed(1)} ${x!.toFixed(1)},${y!.toFixed(1)}`;
    })
    .join(' ');
}

/** A filled area under a line; `line` keeps only the stroke's fill faint. */
export function AreaChart(props: { values: number[]; height?: string; smooth?: boolean; class?: string }) {
  const W = 300;
  const H = 100;
  const d = () => path(props.values, W, H, props.smooth ?? false);
  return (
    <svg
      class={['create-area', props.class]}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ height: props.height ?? '8rem' }}
    >
      <path d={`${d()} L${W},${H} L0,${H} Z`} class="create-area-fill" />
      <path d={d()} class="create-area-line" vector-effect="non-scaling-stroke" />
    </svg>
  );
}

/** Many thin bars of a sound wave, louder in the middle. */
export function Waveform(props: { count?: number }) {
  const bars = () => {
    const count = props.count ?? 64;
    return Array.from(
      { length: count },
      (_, i) => 20 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.3)) * 80 * (1 - (i / count) * 0.9),
    );
  };
  return (
    <Flex align="center" gap={0.5} class="create-waveform" aria-hidden="true">
      <For each={bars()}>{(height) => <span style={{ height: `${height}%` }} />}</For>
    </Flex>
  );
}

/** A made-up QR code: a fixed pattern with the three finder squares. Not scannable. */
export function QrCode(props: { size?: string }) {
  const N = 25;
  const finder = (x: number, y: number) =>
    [
      [0, 0],
      [N - 7, 0],
      [0, N - 7],
    ].some(([fx, fy]) => x >= fx! && x < fx! + 7 && y >= fy! && y < fy! + 7);
  const cells: [number, number][] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) if (!finder(x, y) && ((x * 7 + y * 13 + x * y) % 5 < 2 || (x ^ y) % 7 === 0)) cells.push([x, y]);
  const finders = [
    [0, 0],
    [N - 7, 0],
    [0, N - 7],
  ];
  return (
    <svg class="create-qr" viewBox={`-2 -2 ${N + 4} ${N + 4}`} aria-hidden="true" style={{ width: props.size ?? '8rem' }}>
      <rect x="-2" y="-2" width={N + 4} height={N + 4} rx="2" class="create-qr-bg" />
      <For each={cells}>{([x, y]) => <rect x={x} y={y} width="1" height="1" />}</For>
      <For each={finders}>
        {([x, y]) => (
          <>
            <rect x={x! + 0.5} y={y! + 0.5} width="6" height="6" fill="none" class="create-qr-ring" />
            <rect x={x! + 2} y={y! + 2} width="3" height="3" />
          </>
        )}
      </For>
    </svg>
  );
}
