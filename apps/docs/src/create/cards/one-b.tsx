import './one-b.css';
import { For } from 'solid-js';
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarClock,
  Car,
  ChartColumn,
  ChartPie,
  ChevronRight,
  CircleAlert,
  Coffee,
  CreditCard,
  Ellipsis,
  FileText,
  Folder,
  Gauge,
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  MessageCircle,
  Palette,
  PiggyBank,
  Receipt,
  Repeat,
  Search,
  Shield,
  ShoppingCart,
  Target,
  TrendingUp,
  Tv,
  User,
  Wallet,
} from '@lucide/solid';
import {
  Accordion,
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Center,
  Chip,
  CloseButton,
  Group,
  Menu,
  NavLink,
  PasswordInput,
  Progress,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@solid-slopkit/components';
import { Bars } from '../charts';
import { withBase } from '../../base';

// A card title with a muted line under it, for the start of a Card.Header.
function Heading(props: { title: string; subtitle?: string }) {
  return (
    <Stack gap={0.5} class="create-one-b-heading">
      <Title order={3} size="h6">
        {props.title}
      </Title>
      {props.subtitle && (
        <Text size="sm" class="create-muted">
          {props.subtitle}
        </Text>
      )}
    </Stack>
  );
}

function SavingsTargets() {
  const targets = [
    { name: 'Retirement', goal: '$420,000', percent: 65, saved: '$273,000' },
    { name: 'Real Estate', goal: '$85,000', percent: 32, saved: '$27,200' },
  ];
  return (
    <Card>
      <Card.Header>
        <Heading title="Savings Targets" subtitle="Active milestones for 2024" />
        <Button size="xs" variant="outline">
          New Goal
        </Button>
      </Card.Header>
      <Card.Body>
        <Stack gap={3}>
          <For each={targets}>
            {(target) => (
              <Stack gap={2.5} class="create-inset">
                <p class="create-eyebrow">{target.name}</p>
                <Box mt={1} mb={1.5}>
                  <p class="create-figure">{target.goal}</p>
                </Box>
                <Progress value={target.percent} size="xs" label={`${target.name} progress`} />
                <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
                  <span class="create-muted">{target.percent}% achieved</span>
                  <strong>{target.saved}</strong>
                </Group>
              </Stack>
            )}
          </For>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Stack gap={3} class="create-one-b-fill">
          <Text size="sm" class="create-muted">
            You have not met your targets for this year.
          </Text>
        </Stack>
      </Card.Footer>
    </Card>
  );
}

function BuyInvestment() {
  return (
    <Card>
      <Card.Header>
        <Heading title="Buy Investment" />
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <TextInput
            label="Amount to Invest"
            size="sm"
            leftSection={<span aria-hidden="true">$</span>}
            value="1,000.00"
            inputmode="decimal"
          />
          <Stack gap={2}>
            <Select
              label="Order Type"
              size="sm"
              defaultValue="market"
              data={[
                { value: 'market', label: 'Market Order' },
                { value: 'limit', label: 'Limit Order' },
                { value: 'stop', label: 'Stop Order' },
              ]}
            />
            <Text size="sm" class="create-muted">
              Market orders execute at the current price.
            </Text>
          </Stack>
          <Stack gap={2}>
            <Group justify="space-between" wrap="nowrap" gap={4} class="create-one-b-row-kv">
              <span class="create-muted">Estimated Shares</span>
              <strong>1.95</strong>
            </Group>
            <Group justify="space-between" wrap="nowrap" gap={4} class="create-one-b-row-kv">
              <span class="create-muted">Buying Power</span>
              <strong>$12,450.00</strong>
            </Group>
          </Stack>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Stack gap={3} class="create-one-b-fill">
          <Button fullWidth>Review Order</Button>
          <Text size="xs" class="create-muted create-one-b-center">
            Trades are typically executed within minutes during market hours.
          </Text>
        </Stack>
      </Card.Footer>
    </Card>
  );
}

function RecentTransactions() {
  const rows = [
    { icon: Coffee, name: 'Blue Bottle Coffee', category: 'Food & Drink', date: 'Today, 10:24 AM', amount: '-$6.50' },
    { icon: ShoppingCart, name: 'Whole Foods Market', category: 'Groceries', date: 'Yesterday', amount: '-$142.30' },
    { icon: Wallet, name: 'Stripe Payout', category: 'Income', date: 'Oct 12', amount: '+$4,200.00', income: true },
    { icon: Car, name: 'Uber Technologies', category: 'Transport', date: 'Oct 11', amount: '-$24.10' },
    { icon: Tv, name: 'Netflix Subscription', category: 'Entertainment', date: 'Oct 10', amount: '-$19.99' },
  ];
  return (
    <Card>
      <Card.Header>
        <Heading title="Recent Transactions" subtitle="Your latest account activity." />
        <Button size="xs" variant="outline">
          View All
        </Button>
      </Card.Header>
      <Card.Body>
        <Table class="create-one-b-transactions" aria-label="Recent transactions" size="sm">
          <Table.Tbody>
            <For each={rows}>
              {(row) => (
                <Table.Tr>
                  <Table.Td>
                    <Group gap={3} wrap="nowrap">
                      <Center class="create-one-b-tile">
                        <row.icon aria-hidden="true" />
                      </Center>
                      <div>
                        <Text size="sm" weight="medium">
                          {row.name}
                        </Text>
                        <Text size="xs" class="create-muted">
                          {row.category}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td class="create-muted">{row.date}</Table.Td>
                  <Table.Td class="create-one-b-amount" data-income={row.income ? '' : undefined}>
                    {row.amount}
                  </Table.Td>
                  <Table.Td class="create-one-b-menu-cell">
                    <Menu position="bottom-end">
                      <Menu.Target>
                        {(target) => (
                          <ActionIcon {...target} label={`More for ${row.name}`} size="sm">
                            <Ellipsis aria-hidden="true" />
                          </ActionIcon>
                        )}
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<Receipt aria-hidden="true" />}>View receipt</Menu.Item>
                        <Menu.Item leftSection={<Folder aria-hidden="true" />}>Change category</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              )}
            </For>
          </Table.Tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

type NavGroup = { label: string; links: { label: string; icon: typeof User; active?: boolean }[] };

function NavCard(props: { label: string; groups: NavGroup[] }) {
  return (
    <Card>
      <Card.Body class="create-one-b-nav-body">
        <nav aria-label={props.label}>
          <Stack gap={3}>
            <For each={props.groups}>
              {(group) => (
                <div>
                  <Text size="xs" class="create-muted create-one-b-nav-label">
                    {group.label}
                  </Text>
                  <For each={group.links}>
                    {(link) => (
                      <NavLink
                        // The router marks a link to the page it's on: the current one links to this page, the rest
                        // go nowhere.
                        href={link.active ? withBase('/create') : undefined}
                        label={link.label}
                        color="neutral"
                        leftSection={<link.icon aria-hidden="true" />}
                        class="create-one-b-nav-link"
                      />
                    )}
                  </For>
                </div>
              )}
            </For>
          </Stack>
        </nav>
      </Card.Body>
    </Card>
  );
}

function Faq() {
  const items = [
    {
      value: 'security',
      question: 'How secure is my financial data with Acme?',
      answer:
        'We use bank-level AES-256 encryption, SOC 2 Type II certified infrastructure, and never store your credentials. All connections use read-only access tokens. We are a SEC registered investment advisor.',
    },
    {
      value: 'connect',
      question: 'How do I connect my bank or investment accounts?',
      answer: 'Open Accounts, choose Add account and sign in with your bank. Most institutions connect in under a minute.',
    },
    {
      value: 'export',
      question: 'Can I export my data for tax purposes?',
      answer: 'Yes. Reports lets you download a year of transactions and realized gains as CSV or PDF.',
    },
  ];
  return (
    <Card>
      <Card.Body>
        <Stack gap={3}>
          <SegmentedControl aria-label="Topic" size="sm" fullWidth data={['General', 'Billing', 'Goals']} />
          <Accordion defaultValue="security" class="create-one-b-faq">
            <For each={items}>
              {(item) => (
                <Accordion.Item value={item.value}>
                  <Accordion.Control>{item.question}</Accordion.Control>
                  <Accordion.Panel>{item.answer}</Accordion.Panel>
                </Accordion.Item>
              )}
            </For>
          </Accordion>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Stack gap={3} class="create-one-b-fill">
          <Button variant="outline" size="sm" fullWidth>
            Contact Support
          </Button>
        </Stack>
      </Card.Footer>
    </Card>
  );
}

function AccountOptions() {
  const options = [
    { icon: Gauge, title: 'Change transfer limit', text: 'Adjust how much you can send from your balance.' },
    { icon: CalendarClock, title: 'Scheduled transfers', text: 'Set up a transfer to send at a later date.' },
    { icon: ArrowLeftRight, title: 'Direct Debits', text: 'Set up and manage regular payments.' },
    { icon: Repeat, title: 'Recurring card payments', text: 'Manage your repeated card transactions.' },
  ];
  return (
    <Card>
      <Card.Body>
        <Stack gap={3}>
          <Breadcrumbs separator={<ChevronRight aria-hidden="true" class="create-one-b-crumb-sep" />}>
            <Anchor href="#" underline="hover" size="sm" class="create-muted">
              Home
            </Anchor>
            <Anchor href="#" underline="hover" size="sm" class="create-muted" aria-label="Accounts">
              …
            </Anchor>
            <Text as="span" size="sm" aria-current="page">
              Payments
            </Text>
          </Breadcrumbs>
          <For each={options}>
            {(option) => (
              <a href="#" class="create-inset create-one-b-option">
                <Group gap={3} wrap="nowrap">
                  <option.icon aria-hidden="true" class="create-one-b-option-icon" />
                  <Stack gap={0.5} class="create-one-b-fill">
                    <Text as="span" size="sm" weight="medium">
                      {option.title}
                    </Text>
                    <Text as="span" size="sm" class="create-muted">
                      {option.text}
                    </Text>
                  </Stack>
                  <ChevronRight aria-hidden="true" class="create-one-b-option-chevron" />
                </Group>
              </a>
            )}
          </For>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function FrontDoor() {
  return (
    <Card>
      <Card.Header>
        <Heading title="Front Door" subtitle="Smart Lock Pro" />
        <Group gap={1.5} wrap="nowrap" class="create-muted create-one-b-status">
          <Text as="span" size="sm">
            Locked
          </Text>
          <Lock aria-hidden="true" />
        </Group>
      </Card.Header>
      <Card.Body>
        <div class="create-one-b-camera" role="img" aria-label="Front door camera, live">
          <Badge size="xs" color="error" variant="soft" class="create-one-b-live">
            Live
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );
}

function Holdings() {
  const holdings = [
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', meta: '112 shares · Jan 2021', type: 'ETF', value: '$48,230.40' },
    { ticker: 'VIG', name: 'Vanguard Dividend Appreciation', meta: '450 shares · Mar 2022', type: 'ETF', value: '$26,033.79' },
    { ticker: 'AAPL', name: 'Apple Inc.', meta: '85 shares · Nov 2020', type: 'Stock', value: '$18,488.90' },
    { ticker: 'O', name: 'Realty Income Corp', meta: '320 shares · Jun 2023', type: 'REIT', value: '$15,136.59' },
  ];
  return (
    <Card>
      <Card.Body>
        <Stack gap={3}>
          <Group justify="space-between" wrap="nowrap" gap={4}>
            <TextInput
              aria-label="Search holdings"
              placeholder="Search holdings or tickers..."
              size="sm"
              type="search"
              leftSection={<Search aria-hidden="true" />}
              class="create-one-b-search"
            />
            <Chip.Group aria-label="Asset type" size="sm" defaultValue="etfs">
              <Chip value="stocks">Stocks</Chip>
              <Chip value="etfs">ETFs</Chip>
              <Chip value="reits">REITs</Chip>
            </Chip.Group>
          </Group>
          <For each={holdings}>
            {(holding) => (
              <Group gap={3} wrap="nowrap" class="create-inset">
                <Center class="create-one-b-ticker">{holding.ticker}</Center>
                <div class="create-one-b-fill">
                  <Text size="sm" weight="medium">
                    {holding.name}
                  </Text>
                  <p class="create-eyebrow">{holding.meta}</p>
                </div>
                <Badge size="sm" variant="outline">
                  {holding.type}
                </Badge>
                <div class="create-one-b-value">
                  <p class="create-eyebrow">Value</p>
                  <Text size="sm" weight="semibold">
                    {holding.value}
                  </Text>
                </div>
              </Group>
            )}
          </For>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function Column3() {
  return (
    <>
      <SimpleGrid cols={2} spacing={10}>
        <SavingsTargets />
        <BuyInvestment />
      </SimpleGrid>
      <RecentTransactions />
      <SimpleGrid cols={2} spacing={10}>
        <Stack gap={10}>
          <SimpleGrid cols={2} spacing={10}>
            <NavCard
              label="Finances"
              groups={[
                {
                  label: 'Overview',
                  links: [
                    { label: 'Dashboard', icon: LayoutDashboard, active: true },
                    { label: 'Transactions', icon: ArrowLeftRight },
                    { label: 'Investments', icon: TrendingUp },
                    { label: 'Accounts', icon: Landmark },
                    { label: 'Spending', icon: ChartPie },
                  ],
                },
                {
                  label: 'Planning',
                  links: [
                    { label: 'Goals', icon: Target },
                    { label: 'Budget', icon: PiggyBank },
                    { label: 'Reports', icon: ChartColumn },
                    { label: 'Documents', icon: FileText },
                  ],
                },
              ]}
            />
            <NavCard
              label="Settings"
              groups={[
                {
                  label: 'Account',
                  links: [
                    { label: 'Profile', icon: User },
                    { label: 'Billing', icon: CreditCard, active: true },
                    { label: 'Notifications', icon: Bell },
                    { label: 'Security', icon: Shield },
                    { label: 'Appearance', icon: Palette },
                  ],
                },
                {
                  label: 'Support',
                  links: [
                    { label: 'Help Center', icon: LifeBuoy },
                    { label: 'Contact Us', icon: MessageCircle },
                    { label: 'Documentation', icon: BookOpen },
                    { label: 'Status', icon: Activity },
                  ],
                },
              ]}
            />
          </SimpleGrid>
          <Faq />
        </Stack>
        <Stack gap={10}>
          <AccountOptions />
          <FrontDoor />
        </Stack>
      </SimpleGrid>
      <Holdings />
    </>
  );
}

function AccountAccess() {
  return (
    <Card>
      <Card.Header>
        <Heading title="Account Access" subtitle="Update your credentials or re-authenticate." />
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <TextInput label="Email Address" type="email" size="sm" value="artist@studio.inc" autocomplete="email" />
          <div class="create-one-b-password">
            <PasswordInput label="Current Password" size="sm" value="correcthorse" autocomplete="current-password" />
            <Anchor href="#" underline="hover" size="xs" class="create-muted create-one-b-forgot">
              Forgot?
            </Anchor>
          </div>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Stack gap={3} class="create-one-b-fill">
          <Button fullWidth size="sm" leftSection={<Lock aria-hidden="true" />}>
            Update Security
          </Button>
          <a href="#" class="create-inset create-one-b-option">
            <Group gap={3} wrap="nowrap">
              <CircleAlert aria-hidden="true" class="create-one-b-option-icon create-one-b-danger" />
              <Stack gap={0.5} class="create-one-b-fill">
                <Text as="span" size="sm" weight="semibold">
                  Danger Zone
                </Text>
                <Text as="span" size="sm" class="create-muted">
                  Archive account and remove catalog
                </Text>
              </Stack>
              <ArrowRight aria-hidden="true" class="create-one-b-option-chevron" />
            </Group>
          </a>
        </Stack>
      </Card.Footer>
    </Card>
  );
}

function CardBalance() {
  return (
    <Stack gap={3}>
      <SimpleGrid cols={2} spacing={3}>
        <Card>
          <Card.Body class="create-one-b-small">
            <Stack gap={1}>
              <Text size="sm" class="create-muted">
                Card Balance
              </Text>
              <Box mb={1}>
                <p class="create-figure">US$12.94</p>
              </Box>
              <Text size="sm" class="create-muted">
                US$11,337.06 Available
              </Text>
            </Stack>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body class="create-one-b-small">
            <Stack gap={1}>
              <Text size="sm" class="create-muted">
                Payment Due
              </Text>
              <Box mb={1}>
                <p class="create-figure">1 Apr</p>
              </Box>
              <Button size="xs" variant="outline" fullWidth>
                Pay Early
              </Button>
            </Stack>
          </Card.Body>
        </Card>
      </SimpleGrid>
      <Card>
        <Card.Body>
          <Stack gap={3}>
            <Group justify="space-between" wrap="nowrap" gap={4} class="create-one-b-row-kv">
              <Title order={3} size="h6" class="create-muted create-one-b-quiet">
                Yearly Activity
              </Title>
              <Badge size="sm" variant="soft">
                +US$0.25 Daily Cash
              </Badge>
            </Group>
            <Bars
              values={[32, 45, 30, 50, 40, 44, 55, 36, 46, 58, 42, 68]}
              labels={['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']}
              height="2.5rem"
              color="var(--create-chart-2)"
            />
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}

function TransferFunds() {
  return (
    <Card>
      <Card.Header>
        <Heading title="Transfer Funds" subtitle="Move money between your connected accounts." />
        <CloseButton size="sm" />
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <TextInput
            label="Amount to Transfer"
            size="sm"
            leftSection={<span aria-hidden="true">$</span>}
            value="1,200.00"
            inputmode="decimal"
          />
          <Select
            label="From Account"
            size="sm"
            defaultValue="checking"
            data={[
              { value: 'checking', label: 'Main Checking (··8402) — $12,450.00' },
              { value: 'savings', label: 'High Yield Savings (··1192) — $42,100.00' },
            ]}
          />
          <Select
            label="To Account"
            size="sm"
            defaultValue="savings"
            data={[
              { value: 'checking', label: 'Main Checking (··8402) — $12,450.00' },
              { value: 'savings', label: 'High Yield Savings (··1192) — $42,100.00' },
            ]}
          />
          <div class="create-inset create-one-b-summary">
            <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
              <span class="create-muted">Estimated arrival</span>
              <span>Today, Apr 14</span>
            </Group>
            <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
              <span class="create-muted">Transaction fee</span>
              <span>$0.00</span>
            </Group>
            <Group justify="space-between" wrap="nowrap" gap={4} class="create-kv">
              <strong>Total amount</strong>
              <strong>$1,200.00</strong>
            </Group>
          </div>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Stack gap={3} class="create-one-b-fill">
          <Button fullWidth size="sm">
            Confirm Transfer
          </Button>
        </Stack>
      </Card.Footer>
    </Card>
  );
}

function CoverArt() {
  return (
    <Card>
      <Card.Body>
        <Stack gap={3}>
          <p class="create-eyebrow">Cover Art</p>
          <Center class="create-one-b-artwork">
            <ImageIcon aria-hidden="true" />
          </Center>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Stack gap={3} class="create-one-b-fill">
          <Button variant="soft" size="sm" fullWidth>
            Upload Artwork
          </Button>
          <Text size="xs" class="create-muted create-one-b-center">
            Minimum 3000 × 3000px
            <br />
            JPEG or PNG only
          </Text>
        </Stack>
      </Card.Footer>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card aria-busy="true" aria-label="Loading">
      <Card.Body>
        <Stack gap={3}>
          <Stack gap={2}>
            <Skeleton style={{ height: '0.75rem', width: '40%' }} />
            <Skeleton style={{ height: '0.75rem', width: '55%' }} />
          </Stack>
          <Skeleton style={{ height: '6rem' }} />
          <Stack gap={2}>
            <Skeleton style={{ height: '0.75rem' }} />
            <Skeleton style={{ height: '0.75rem', width: '75%' }} />
            <Skeleton style={{ height: '0.75rem', width: '50%' }} />
          </Stack>
          <SimpleGrid cols={2} spacing={2}>
            <Skeleton style={{ height: '2rem' }} />
            <Skeleton style={{ height: '2rem' }} />
          </SimpleGrid>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function Column4() {
  return (
    <>
      <AccountAccess />
      <CardBalance />
      <TransferFunds />
      <CoverArt />
      <LoadingCard />
    </>
  );
}
