import './one-c.css';
import { createSignal, For } from 'solid-js';
import { AtSign, AudioWaveform, Cloud, CreditCard, Globe, Music } from '@lucide/solid';
import {
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  CloseButton,
  Divider,
  Group,
  Progress,
  Radio,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@solid-slopkit/components';
import { Calendar, isSameDay } from '@solid-slopkit/components/dates';
import { AreaChart, Bars } from '../charts';

function PayoutCard() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Text size="sm" dimmed>
            Payout Preferences
          </Text>
          <Title order={3} size="h5">
            Receiving Method
          </Title>
        </div>
        <CloseButton size="sm" label="Close payout preferences" />
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <TextInput label="Account Holder Name" defaultValue="Synthetic Horizons Music LLC" />
          <Radio.Group label="Receiving Method" defaultValue="bank">
            <SimpleGrid cols={2} spacing={3}>
              <Radio.Card value="bank">
                <Text size="sm" weight="medium">
                  Bank Transfer
                </Text>
                <Text size="sm" dimmed>
                  SWIFT / IBAN
                </Text>
              </Radio.Card>
              <Radio.Card value="paypal">
                <Text size="sm" weight="medium">
                  PayPal
                </Text>
                <Text size="sm" dimmed>
                  Instant Payout
                </Text>
              </Radio.Card>
            </SimpleGrid>
          </Radio.Group>
          <TextInput label="IBAN / Account Number" placeholder="DE89 3704 0044 ...." />
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button fullWidth color="primary">
          Save Payout Settings
        </Button>
      </Card.Footer>
    </Card>
  );
}

function PowerUsageCard() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Power Usage
          </Title>
          <Text size="sm" dimmed>
            Whole Home
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <Bars
            values={[22, 52, 57, 44, 62, 54, 69, 60]}
            labels={['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p']}
            height="5rem"
          />
          <Divider />
          <SimpleGrid cols={2} spacing={4}>
            <div>
              <Text size="sm" dimmed>
                Currently Using
              </Text>
              <Text size="lg" weight="semibold">
                3.4 kW
              </Text>
            </div>
            <div>
              <Text size="sm" dimmed>
                Solar Gen
              </Text>
              <Text size="lg" weight="semibold">
                +1.2 kW
              </Text>
            </div>
          </SimpleGrid>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Stack gap={2} style={{ flex: '1' }}>
          <Text id="create-one-c-battery" size="sm" dimmed>
            Battery Level
          </Text>
          <Group gap={3} wrap="nowrap">
            <Progress value={85} size="sm" aria-labelledby="create-one-c-battery" style={{ flex: '1' }} />
            <Text size="sm" weight="medium">
              85%
            </Text>
          </Group>
        </Stack>
      </Card.Footer>
    </Card>
  );
}

function EmptyCard(props: { icon: typeof CreditCard; title: string; text: string; action: string }) {
  return (
    <Card>
      <Card.Body>
        <Stack align="center" gap={2} class="create-empty">
          <ThemeIcon variant="soft" size="md">
            <props.icon aria-hidden="true" />
          </ThemeIcon>
          <Title order={3} size="h6">
            {props.title}
          </Title>
          <Text size="sm" dimmed>
            {props.text}
          </Text>
          <Button size="sm" color="primary">
            {props.action}
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}

const PAYMENTS = [
  { name: 'Netflix Subscription', date: 'Apr 15, 2024', amount: '$19.99' },
  { name: 'Rent Payment', date: 'Apr 1, 2024', amount: '$2,400.00' },
  { name: 'Auto Insurance', date: 'Apr 22, 2024', amount: '$186.00' },
];

function UpcomingPaymentsCard() {
  const [picked, setPicked] = createSignal(new Date(2026, 9, 16), { name: 'paymentsDay' });
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Upcoming Payments
          </Title>
          <Text size="sm" dimmed>
            Select a date to view scheduled payments.
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={3}>
          <Center class="create-one-c-calendar">
            <Calendar
              defaultDate={new Date(2026, 9, 1)}
              weekendDays={[]}
              getDayProps={(date) => ({ selected: isSameDay(date, picked()) })}
              onDayClick={(date) => setPicked(date)}
            />
          </Center>
          <For each={PAYMENTS}>
            {(payment) => (
              <Group class="create-inset" justify="space-between" wrap="nowrap">
                <div>
                  <Text size="sm" weight="medium">
                    {payment.name}
                  </Text>
                  <Text size="sm" dimmed>
                    {payment.date}
                  </Text>
                </div>
                <Badge variant="outline" size="sm">
                  {payment.amount}
                </Badge>
              </Group>
            )}
          </For>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function ShadesCard() {
  // How far the shade is drawn down, from 0 (open) to 100 (closed).
  const [closed, setClosed] = createSignal(50, { name: 'shadeClosed' });
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Living Room
          </Title>
          <Text size="sm" dimmed>
            Roller Shades
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={3}>
          <div class="create-one-c-window" aria-hidden="true">
            <div class="create-one-c-shade" style={{ height: `${closed()}%` }} />
          </div>
          <Group gap={3} wrap="nowrap">
            <span class="create-eyebrow">Open</span>
            <Slider
              class="create-one-c-shade-slider"
              label="Shade position"
              value={closed()}
              onChange={setClosed}
              valueLabel={(value) => `${value}%`}
              valueText={(value) => `${value}% closed`}
            />
            <span class="create-eyebrow">Close</span>
          </Group>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <SimpleGrid cols={3} spacing={2} style={{ width: '100%' }}>
          <Button variant="outline" size="sm" onClick={() => setClosed(0)}>
            Open
          </Button>
          <Button variant="outline" size="sm" onClick={() => setClosed(50)}>
            Half
          </Button>
          <Button variant="outline" size="sm" onClick={() => setClosed(100)}>
            Closed
          </Button>
        </SimpleGrid>
      </Card.Footer>
    </Card>
  );
}

export function Column5() {
  return (
    <>
      <PayoutCard />
      <PowerUsageCard />
      <EmptyCard
        icon={CreditCard}
        title="Connect Bank"
        text="Link your payout method to receive monthly royalty distributions automatically."
        action="Set Up Payouts"
      />
      <UpcomingPaymentsCard />
      <ShadesCard />
    </>
  );
}

function StockCard() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Stock Performance
          </Title>
          <Text size="sm" dimmed>
            6-month price history.
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <Select label="Ticker" defaultValue="VOO" data={['VOO', 'VIG', 'AAPL', 'O']} />
          <Divider />
          <AreaChart values={[52, 50, 54, 58, 55, 53, 57, 61, 58, 56, 60, 66]} height="10rem" smooth />
        </Stack>
      </Card.Body>
    </Card>
  );
}

function MilestoneCard() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Set a new milestone
          </Title>
          <Text size="sm" dimmed>
            Define your financial target and we'll help you pace your savings.
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <TextInput label="Goal Name" placeholder="e.g. New Car, Home Downpayment" />
          <SimpleGrid cols={2} spacing={3}>
            <TextInput label="Target Amount" defaultValue="$15,000" />
            <TextInput label="Target Date" defaultValue="Dec 2025" />
          </SimpleGrid>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Stack gap={2} style={{ flex: '1' }}>
          <Button fullWidth color="primary">
            Create Goal
          </Button>
          <Button fullWidth variant="outline">
            Cancel
          </Button>
        </Stack>
      </Card.Footer>
    </Card>
  );
}

function SocialLinksCard() {
  return (
    <Card>
      <Card.Header>
        <Title order={3} size="h5">
          Social Links
        </Title>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <TextInput
            label="Artist Profile URL"
            defaultValue="music.example.com/artist/3j...2k"
            leftSection={<Music aria-hidden="true" />}
          />
          <TextInput label="Instagram Handle" defaultValue="@juliandurye_music" leftSection={<AtSign aria-hidden="true" />} />
          <TextInput
            label="Audio Profile URL"
            placeholder="audio.example.com/username"
            leftSection={<Cloud aria-hidden="true" />}
          />
          <TextInput label="Website" type="url" placeholder="https://yoursite.com" leftSection={<Globe aria-hidden="true" />} />
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button variant="ghost" size="sm">
          Discard
        </Button>
        <Button size="sm" color="primary">
          Save Changes
        </Button>
      </Card.Footer>
    </Card>
  );
}

const NOTIFICATIONS = [
  { value: 'transactions', label: 'Transaction alerts', description: 'Deposits, withdrawals, and transfers.' },
  { value: 'security', label: 'Security alerts', description: 'Login attempts and account changes.' },
  { value: 'goals', label: 'Goal milestones', description: 'Updates at 25%, 50%, 75%, and 100%.' },
  { value: 'market', label: 'Market updates', description: 'Daily portfolio summary and price alerts.' },
];

function NotificationsCard() {
  const [checked, setChecked] = createSignal(['transactions', 'security'], { name: 'notifications' });
  const all = () => checked().length === NOTIFICATIONS.length;
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Notifications
          </Title>
          <Text size="sm" dimmed>
            Choose what you want to be notified about.
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <Checkbox
            label="Select all"
            size="sm"
            checked={all()}
            indeterminate={checked().length > 0 && !all()}
            onChange={(on) => setChecked(on ? NOTIFICATIONS.map((item) => item.value) : [])}
          />
          <Checkbox.Group size="sm" value={checked()} onChange={setChecked}>
            <Stack gap={3}>
              <For each={NOTIFICATIONS}>
                {(item) => <Checkbox value={item.value} label={item.label} description={item.description} />}
              </For>
            </Stack>
          </Checkbox.Group>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button fullWidth color="primary">
          Save Preferences
        </Button>
      </Card.Footer>
    </Card>
  );
}

export function Column6() {
  return (
    <>
      <StockCard />
      <EmptyCard
        icon={AudioWaveform}
        title="Explore Catalog"
        text="Check your ISRC codes, metadata, and visual assets before going live."
        action="View Catalog"
      />
      <MilestoneCard />
      <SocialLinksCard />
      <NotificationsCard />
    </>
  );
}
