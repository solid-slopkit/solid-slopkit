import { For } from 'solid-js';
import { Group, Stack, Text, ThemeIcon } from '@solid-slopkit/components';
import { Moon, Server, Zap } from '@lucide/solid';

const features = [
  { icon: Zap, color: 'warning', title: 'Fine-grained updates', text: 'Only what changed re-renders.' },
  { icon: Moon, color: 'secondary', title: 'Light and dark', text: 'Every component follows the color scheme.' },
  { icon: Server, color: 'info', title: 'Server rendering', text: 'Hydrates without a mismatch.' },
] as const;

export default function Features() {
  return (
    <Stack gap={4}>
      <For each={features}>
        {(feature) => (
          <Group gap={3} align="flex-start" wrap="nowrap">
            <ThemeIcon color={feature.color} variant="soft" size="lg">
              <feature.icon aria-hidden="true" />
            </ThemeIcon>
            <Stack gap={0}>
              <Text weight="semibold">{feature.title}</Text>
              <Text size="sm" dimmed>
                {feature.text}
              </Text>
            </Stack>
          </Group>
        )}
      </For>
    </Stack>
  );
}
