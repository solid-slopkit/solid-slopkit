import './one-a.css';
import { createSignal, For } from 'solid-js';
import { Plus, Sun, Thermometer, Timer, Volume2 } from '@lucide/solid';
import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Chip,
  CloseButton,
  Divider,
  Group,
  Loader,
  RingProgress,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  Textarea,
  Tooltip,
} from '@solid-slopkit/components';
import { Bars, QrCode } from '../charts';

const CURRENCIES = [
  { value: 'usd', label: 'USD — United States Dollar' },
  { value: 'eur', label: 'EUR — Euro' },
  { value: 'gbp', label: 'GBP — British Pound' },
  { value: 'jpy', label: 'JPY — Japanese Yen' },
];

const DIVIDENDS = [
  { name: 'Vanguard VIG', shares: 450, bars: [3, 3, 3, 4], amount: '$1,842.10' },
  { name: 'S&P 500 VOO', shares: 112, bars: [2, 3, 4, 3], amount: '$928.40' },
  { name: 'Apple AAPL', shares: 85, bars: [2, 3, 4, 4], amount: '$340.00' },
  { name: 'Realty Income', shares: 320, bars: [3, 3, 3, 4], amount: '$1,139.50' },
];

const LIGHTS = [
  { label: 'Brightness', icon: Sun, value: 90 },
  { label: 'Color Temp', icon: Thermometer, value: 70 },
  { label: 'Volume', icon: Volume2, value: 30 },
  { label: 'Fade', icon: Timer, value: 0 },
];

export function Column1() {
  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>Contribution History</Card.Title>
          <Card.Description>Last 6 months of activity</Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack>
            <Bars values={[48, 66, 57, 82, 45, 88]} labels={['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']} height="9rem" gap={4} />
            <SimpleGrid cols={2} spacing={3}>
              <Stack gap={1.5} class="create-inset">
                <Text size="xs" weight="medium" transform="uppercase" dimmed>
                  Upcoming
                </Text>
                <div>
                  <Text weight="semibold">May 25, 2024</Text>
                  <Text size="xs" dimmed>
                    $1,000 scheduled
                  </Text>
                </div>
              </Stack>
              <Stack gap={1.5} class="create-inset">
                <Text size="xs" weight="medium" transform="uppercase" dimmed>
                  Auto-Save Plan
                </Text>
                <div>
                  <Text weight="semibold">Accelerated</Text>
                  <Text size="xs" dimmed>
                    Recurring weekly
                  </Text>
                </div>
              </Stack>
            </SimpleGrid>
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" color="primary" fullWidth>
            View Full Report
          </Button>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Body class="create-empty">
          <Stack align="center" gap={2}>
            <Box mb={2} aria-hidden="true">
              <Center class="create-one-a-icon-box">
                <Plus />
              </Center>
            </Box>
            <Card.Title size="h6">Distribute Track</Card.Title>
            <Text size="sm" dimmed>
              Upload your first master to start reaching listeners on streaming services, and more.
            </Text>
            <Button size="sm" variant="outline">
              Create Release
            </Button>
          </Stack>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body class="create-empty">
          <Stack align="center" gap={2}>
            <QrCode size="9rem" />
            <Card.Title size="h6">Scan to connect your mobile device</Card.Title>
            <Text size="sm" dimmed>
              Open the Acme mobile app and scan this code to link your device.
            </Text>
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" variant="soft" fullWidth>
            Got it
          </Button>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Q2 Dividend Income</Card.Title>
          <Card.Description>Quarterly dividend payouts across your portfolio holdings.</Card.Description>
          <CloseButton size="sm" />
        </Card.Header>
        <Card.Body>
          <Stack gap={2}>
            <For each={DIVIDENDS}>
              {(row) => (
                <Group justify="space-between" wrap="nowrap" class="create-inset">
                  <div>
                    <Text size="sm" weight="medium">
                      {row.name}
                    </Text>
                    <Text size="xs" dimmed>
                      {row.shares} Shares
                    </Text>
                  </div>
                  <Group gap={3} wrap="nowrap">
                    <Bars
                      values={row.bars}
                      height="1.125rem"
                      gap={0.5}
                      color="var(--create-chart-2)"
                      class="create-one-a-spark"
                    />
                    <Text size="sm" weight="semibold" tabularNums align="end" class="create-one-a-amount">
                      {row.amount}
                    </Text>
                  </Group>
                </Group>
              )}
            </For>
          </Stack>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Dollar-Cost Averaging</Card.Title>
          <Card.Description>A strategy for building wealth over time.</Card.Description>
        </Card.Header>
        <Card.Body>
          <Text size="sm" dimmed>
            <Tooltip label="Usually months or years of regular, fixed contributions">
              {(target) => (
                <button {...target} type="button" class="create-one-a-term">
                  Over time
                </button>
              )}
            </Tooltip>
            , this smooths out the average cost of your investments. When prices drop, your fixed amount buys more shares. When
            prices rise, you buy fewer. The result is a lower average cost per share compared to lump-sum investing during
            volatile periods.
          </Text>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body class="create-empty">
          <Stack align="center" gap={2}>
            <Loader size="sm" label="Syncing" class="create-muted" />
            <Card.Title size="h6">Syncing your accounts</Card.Title>
            <Text size="sm" dimmed>
              We're pulling in your latest transactions. This usually takes a few seconds.
            </Text>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </Stack>
        </Card.Body>
      </Card>
    </>
  );
}

export function Column2() {
  const [payout, setPayout] = createSignal(2500, { name: 'payoutThreshold' });
  const money = (value: number) => `$${value.toLocaleString('en-US')}`;

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>Payout Threshold</Card.Title>
          <Card.Description>Set the minimum balance required before a payout is triggered.</Card.Description>
          <CloseButton size="sm" />
        </Card.Header>
        <Card.Body>
          <Stack>
            <Select label="Preferred Currency" size="sm" data={CURRENCIES} defaultValue="usd" />
            <Stack gap={1.5}>
              <Slider
                label="Minimum Payout Amount"
                labelSection={
                  <Text as="span" size="2xl" weight="semibold" tabularNums aria-hidden="true">
                    ${payout().toFixed(2)}
                  </Text>
                }
                min={50}
                max={10000}
                value={payout()}
                onChange={setPayout}
                valueLabel={null}
                valueText={money}
              />
              <Group justify="space-between" wrap="nowrap" gap={0}>
                <Text as="span" size="xs" dimmed>
                  $50 (MIN)
                </Text>
                <Text as="span" size="xs" dimmed>
                  $10,000 (MAX)
                </Text>
              </Group>
            </Stack>
            <Textarea label="Notes" size="sm" rows={3} placeholder="Add any notes for this payout configuration..." />
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" color="primary" fullWidth>
            Save Threshold
          </Button>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Body>
          <Stack>
            <Stack gap={2}>
              <Stack gap={1}>
                <Text size="sm" dimmed>
                  Claimable Balance
                </Text>
                <Text size="5xl" weight="semibold" tabularNums>
                  $0.00
                </Text>
              </Stack>
              <div>
                <Badge size="sm" variant="soft" leftSection={<span class="create-one-a-dot" aria-hidden="true" />}>
                  Pending Setup
                </Badge>
              </div>
            </Stack>
            <div class="create-inset">
              <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
                <span class="create-muted">Net Royalties</span>
                <span>$0.00</span>
              </Group>
              <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
                <span class="create-muted">Processing Fee</span>
                <span>-$0.00</span>
              </Group>
              <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
                <span class="create-muted">Total Ready to Claim</span>
                <strong>$0.00 USD</strong>
              </Group>
            </div>
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Box w="100%">
            <Text size="sm" dimmed>
              Once your bank is connected, balances over $10.00 are automatically eligible for monthly distribution on the 15th of
              each month.
            </Text>
          </Box>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Preferences</Card.Title>
          <Card.Description>Manage your account settings and notifications.</Card.Description>
          <CloseButton size="sm" />
        </Card.Header>
        <Card.Body>
          <Stack>
            <Select label="Default Currency" size="sm" data={CURRENCIES} defaultValue="usd" />
            <div>
              <Switch
                class="create-one-a-setting"
                labelPosition="left"
                size="sm"
                label="Public Statistics"
                description="Allow others to see your total stream count and listening activity"
                defaultChecked
              />
              <Switch
                class="create-one-a-setting"
                labelPosition="left"
                size="sm"
                label="Email Notifications"
                description="Monthly royalty reports and distribution updates"
                defaultChecked
              />
            </div>
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Group justify="space-between" class="create-one-a-fill">
            <Button size="sm" variant="outline">
              Reset
            </Button>
            <Button size="sm" color="primary">
              Save Preferences
            </Button>
          </Group>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Body class="create-one-a-donut">
          <Center>
            <RingProgress value={80} size="12rem" thickness={13} roundCaps={false} label="Savings goal">
              <Text as="span" size="2xl" weight="semibold" tabularNums>
                $24,000
              </Text>
              <Text as="span" size="xs" dimmed>
                80% of $30,000
              </Text>
            </RingProgress>
          </Center>
        </Card.Body>
        <Divider />
        <Card.Body>
          <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
            <span class="create-muted">Projected Finish</span>
            <strong>October 2024</strong>
          </Group>
          <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
            <span class="create-muted">Monthly Average</span>
            <strong>$1,250</strong>
          </Group>
          <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
            <span class="create-muted">Top Contributor</span>
            <strong>Auto-Transfer</strong>
          </Group>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Kitchen Island</Card.Title>
          <Card.Description>Hue Color Ambient</Card.Description>
          <Switch aria-label="Kitchen Island light" size="sm" defaultChecked />
        </Card.Header>
        <Card.Body>
          <Stack>
            <Chip.Group aria-label="Scene" size="sm" defaultValue="cooking">
              <Chip value="cooking">Cooking</Chip>
              <Chip value="dining">Dining</Chip>
              <Chip value="nightlight">Nightlight</Chip>
              <Chip value="focus">Focus</Chip>
            </Chip.Group>
            <Stack gap={2}>
              <For each={LIGHTS}>
                {(light) => (
                  <Slider
                    class="create-one-a-light"
                    size="sm"
                    label={
                      <>
                        <light.icon aria-hidden="true" />
                        {light.label}
                      </>
                    }
                    defaultValue={light.value}
                    valueLabel={null}
                  />
                )}
              </For>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>
    </>
  );
}
