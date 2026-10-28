import './two-c.css';

import { CloudUpload, Search } from '@lucide/solid';
import {
  Anchor,
  Badge,
  Button,
  Card,
  Box,
  Checkbox,
  Dropzone,
  Group,
  Kbd,
  RingProgress,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@solid-slopkit/components';
import { For } from 'solid-js';

import { AreaChart, TrackBars, Waveform } from '../charts';

const usage = [
  { label: 'Edge Requests', value: '$1.83K', percent: 62 },
  { label: 'Fast Data Transfer', value: '$952.51', percent: 48 },
  { label: 'Monitoring data points', value: '$901.20', percent: 85 },
  { label: 'Web Analytics Events', value: '$603.71', percent: 34 },
  { label: 'ISR Writes', value: '524.52K / 2M', percent: 26 },
  { label: 'Function Duration', value: '5.11 GB Hrs / 1K GB Hrs', percent: 8 },
];

const shortcuts = [
  { label: 'Search', key: 'K' },
  { label: 'Quick Actions', key: 'J' },
  { label: 'New File', key: 'N' },
  { label: 'Save', key: 'S' },
  { label: 'Toggle Sidebar', key: 'B' },
];

export function Column6() {
  let openPicker = () => {};
  return (
    <>
      <Card>
        <Card.Header>
          <div>
            <Title order={3} size="h5">
              Weekly Fitness Summary
            </Title>
            <Text size="sm" dimmed>
              Calories and workout load by day
            </Text>
          </div>
        </Card.Header>
        <Card.Body>
          <TrackBars values={[75, 45, 65, 55, 80, 40, 55]} labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']} />
        </Card.Body>
        <Card.Footer>
          <Button size="sm" fullWidth>
            View details
          </Button>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <Title order={3} size="h5">
              File Upload
            </Title>
            <Text size="sm" dimmed>
              Drag and drop or browse
            </Text>
          </div>
        </Card.Header>
        <Card.Body>
          <Dropzone class="create-two-c-dropzone" onDrop={() => {}} openOnClick={false} openRef={(open) => (openPicker = open)}>
            <Stack align="center" gap={3.5}>
              <Stack align="center" gap={1.5}>
                <ThemeIcon size="sm" variant="outline">
                  <CloudUpload aria-hidden="true" />
                </ThemeIcon>
                <Text size="sm" weight="semibold">
                  Upload files
                </Text>
                <Text size="xs" dimmed>
                  PNG, JPG, PDF up to 10MB
                </Text>
              </Stack>
              <Button size="sm" onClick={() => openPicker()}>
                Browse Files
              </Button>
            </Stack>
          </Dropzone>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Group class="create-two-c-fill" justify="space-between" align="flex-start" wrap="nowrap" gap={2.5}>
            <div>
              <Title order={3} size="h6">
                Analytics
              </Title>
              <Group gap={1.5} wrap="nowrap">
                <Text size="sm" dimmed>
                  418.2K Visitors
                </Text>
                <Badge size="sm" variant="soft">
                  +10%
                </Badge>
              </Group>
            </div>
            <Button size="xs" variant="outline">
              View Analytics
            </Button>
          </Group>
        </Card.Header>
        <AreaChart values={[52, 78, 64, 22, 58, 60]} height="9rem" />
      </Card>

      <Card>
        <Card.Body>
          <Stack gap={3}>
            <Title order={3} size="h6" class="create-two-c-small-title">
              5 days remaining in cycle
            </Title>
            <Stack role="list" gap={0}>
              <For each={usage}>
                {(row) => (
                  <Group role="listitem" gap={2.5} wrap="nowrap" class="create-two-c-usage">
                    <RingProgress class="create-two-c-ring" value={row.percent} size="xs" label={row.label} />
                    <span class="create-two-c-fill">{row.label}</span>
                    <span class="create-two-c-mono create-muted">{row.value}</span>
                  </Group>
                )}
              </For>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Stack gap={3}>
            <Title order={3} size="h6" class="create-two-c-small-title">
              Shortcuts
            </Title>
            <Stack role="list" gap={0}>
              <For each={shortcuts}>
                {(row) => (
                  <Group role="listitem" justify="space-between" wrap="nowrap" gap={4} class="create-kv">
                    <span class="create-muted">{row.label}</span>
                    <Group gap={1} wrap="nowrap">
                      <Kbd size="xs">⌘</Kbd>
                      <Kbd size="xs">{row.key}</Kbd>
                    </Group>
                  </Group>
                )}
              </For>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>
    </>
  );
}

export function Column7() {
  return (
    <>
      <Card>
        <Card.Body class="create-two-c-center">
          <Stack align="center" gap={4}>
            <Stack align="center" gap={2}>
              <Title order={3} size="h6">
                Get alerted for anomalies
              </Title>
              <Text size="sm" dimmed>
                Automatically monitor your projects for anomalies and get notified.
              </Text>
            </Stack>
            <Button size="sm">Upgrade to Observability Plus</Button>
          </Stack>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <Title order={3} size="h5">
              Live Audio Waveform
            </Title>
            <Text size="sm" dimmed>
              Real-time microphone input visualization with audio reactivity
            </Text>
          </div>
        </Card.Header>
        <Card.Body>
          <Waveform count={80} />
        </Card.Body>
        <Card.Footer>
          <Group class="create-two-c-fill" gap={2.5}>
            <Button size="xs" variant="outline">
              Start Listening
            </Button>
            <Button size="xs" active aria-pressed="true">
              Stop Processing
            </Button>
            <Button size="xs" variant="outline">
              Static
            </Button>
          </Group>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Header>
          <Group class="create-two-c-fill" justify="space-between" align="flex-start" wrap="nowrap" gap={2.5}>
            <div>
              <Title order={3} size="h5">
                Visitors
              </Title>
              <Text size="sm" dimmed>
                Last 6 months
              </Text>
            </div>
            <Badge size="sm" variant="soft">
              +2% vs last month
            </Badge>
          </Group>
        </Card.Header>
        <AreaChart values={[30, 82, 40, 12, 62, 55]} height="12rem" smooth />
      </Card>

      <Card>
        <Card.Header>
          <div>
            <Title order={3} size="h5">
              Contributions &amp; Activity
            </Title>
            <Text size="sm" dimmed>
              Manage your contributions and activity visibility.
            </Text>
          </div>
        </Card.Header>
        <Card.Body>
          <Checkbox
            size="sm"
            label="Make profile private and hide activity"
            description="Enabling this will hide your contributions and activity from your profile and from social features like followers, stars, feeds, leaderboards and releases."
          />
        </Card.Body>
        <Card.Footer>
          <Group class="create-two-c-fill">
            <Button size="sm" variant="outline">
              Save Changes
            </Button>
          </Group>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Body class="create-two-c-center create-two-c-404">
          <Stack align="center" gap={2}>
            <Title order={3} size="h6">
              404 - Not Found
            </Title>
            <Text size="sm" dimmed>
              The page you're looking for doesn't exist. Try searching for what you need below.
            </Text>
            <Box w="100%" maw="14rem" mt={2}>
              <TextInput
                size="sm"
                type="search"
                aria-label="Search pages"
                placeholder="Try searching for pages..."
                leftSection={<Search aria-hidden="true" />}
                rightSection={<Kbd size="xs">/</Kbd>}
              />
            </Box>
            <Anchor href="#" size="sm" underline="hover" color="neutral" weight="medium">
              Go to homepage
            </Anchor>
          </Stack>
        </Card.Body>
      </Card>
    </>
  );
}
