import { For } from 'solid-js';
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Copy,
  Ellipsis,
  Info,
  Minus,
  Plus,
  RotateCw,
  Search,
  Server,
  Settings,
  Share,
  Trash2,
} from '@lucide/solid';
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  CopyButton,
  Divider,
  Flex,
  Grid,
  Group,
  Radio,
  SegmentedControl,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@solid-slopkit/components';
import { GroupedBars } from '../charts';
import './two-a.css';

const SWATCHES = [
  'base-100',
  'base-content',
  'primary',
  'secondary',
  'neutral',
  'accent',
  'base-300',
  'info',
  'success',
  'warning',
  'error',
  'base-200',
];

function Typography() {
  return (
    <Card>
      <Card.Body>
        <Stack gap={4}>
          <Stack gap={1}>
            <Title order={3} weight="normal" class="create-two-a-display">
              Default · System
            </Title>
            <Text size="sm" class="create-muted">
              Designers love packing quirky glyphs into test phrases. This is a preview of the typography styles.
            </Text>
          </Stack>
          <SimpleGrid cols={6} spacing={2} verticalSpacing={3}>
            <For each={SWATCHES}>
              {(name) => (
                <Stack gap={1.5} class="create-two-a-swatch">
                  <span style={{ background: `var(--slp-color-${name})` }} />
                  <code>--{name}</code>
                </Stack>
              )}
            </For>
          </SimpleGrid>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function InheritTypography() {
  return (
    <Card>
      <Card.Body>
        <Stack gap={2}>
          <p class="create-eyebrow">Inherit - System</p>
          <Title order={3} size="h2" weight="medium">
            Designing with rhythm and hierarchy.
          </Title>
          <Text size="sm" class="create-muted">
            A strong body style keeps long-form content readable and balances the visual weight of headings.
          </Text>
          <Text size="sm" class="create-muted">
            Thoughtful spacing and cadence help paragraphs scan quickly without feeling dense.
          </Text>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button variant="outline" size="sm" fullWidth>
          Share Feedback
        </Button>
      </Card.Footer>
    </Card>
  );
}

function Codespaces() {
  return (
    <Card>
      <Card.Body>
        <Stack gap={4}>
          <SegmentedControl aria-label="Where to code" size="sm" fullWidth data={['Codespaces', 'Local']} />
          <Group justify="space-between" wrap="nowrap">
            <div>
              <Text size="sm" weight="semibold">
                Codespaces
              </Text>
              <Text size="xs" class="create-muted">
                Your workspaces in the cloud
              </Text>
            </div>
            <Group gap={1} wrap="nowrap">
              <ActionIcon label="New codespace" size="sm">
                <Plus aria-hidden="true" />
              </ActionIcon>
              <ActionIcon label="More options" size="sm">
                <Ellipsis aria-hidden="true" />
              </ActionIcon>
            </Group>
          </Group>
          <Divider />
          <Stack align="center" gap={2} class="create-empty">
            <Server aria-hidden="true" class="create-two-a-empty-icon" />
            <Text size="sm" weight="medium">
              No codespaces
            </Text>
            <Text size="xs" class="create-muted">
              You don't have any codespaces with this repository checked out
            </Text>
            <Button size="xs">Create Codespace</Button>
            <Anchor href="#" size="xs" class="create-muted">
              Learn more about codespaces
            </Anchor>
          </Stack>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Text size="xs" class="create-muted create-two-a-fill">
          Codespace usage for this repository is paid for by slopkit.
        </Text>
      </Card.Footer>
    </Card>
  );
}

const INVOICE = [
  ['Design System License', '1', '$499.00', '$499.00'],
  ['Priority Support', '12', '$99.00', '$1,188.00'],
  ['Custom Components', '3', '$250.00', '$750.00'],
];

function Invoice() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Invoice #INV-2847
          </Title>
          <Text size="sm" class="create-muted">
            Due March 30, 2026
          </Text>
        </div>
        <Badge variant="soft" size="sm">
          Pending
        </Badge>
      </Card.Header>
      <Card.Body>
        <Table.ScrollContainer role="region" aria-label="Invoice items">
          <Table size="sm" class="create-two-a-invoice">
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Item</Table.Th>
                <Table.Th scope="col">Qty</Table.Th>
                <Table.Th scope="col">Rate</Table.Th>
                <Table.Th scope="col">Amount</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <For each={INVOICE}>
                {([item, qty, rate, amount]) => (
                  <Table.Tr>
                    <Table.Td>{item}</Table.Td>
                    <Table.Td>{qty}</Table.Td>
                    <Table.Td>{rate}</Table.Td>
                    <Table.Td>{amount}</Table.Td>
                  </Table.Tr>
                )}
              </For>
              <Table.Tr class="create-two-a-summary">
                <Table.Th scope="row" colspan={3}>
                  Subtotal
                </Table.Th>
                <Table.Td>$2,437.00</Table.Td>
              </Table.Tr>
              <Table.Tr class="create-two-a-summary">
                <Table.Th scope="row" colspan={3}>
                  Tax
                </Table.Th>
                <Table.Td>$0.00</Table.Td>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr class="create-two-a-summary">
                <Table.Th scope="row" colspan={3}>
                  Total Due
                </Table.Th>
                <Table.Td>$2,437.00</Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>
      </Card.Body>
      <Card.Footer>
        <Group justify="space-between" gap={2.5} class="create-two-a-fill">
          <Button variant="outline" size="sm">
            Download PDF
          </Button>
          <Button color="primary" size="sm">
            Pay Now
          </Button>
        </Group>
      </Card.Footer>
    </Card>
  );
}

export function Column1() {
  return (
    <>
      <Typography />
      <InheritTypography />
      <Codespaces />
      <Invoice />
    </>
  );
}

const ICON_BUTTONS = [
  { label: 'Copy', icon: Copy },
  { label: 'Info', icon: Info },
  { label: 'Delete', icon: Trash2 },
  { label: 'Share', icon: Share },
  { label: 'Archive', icon: Archive },
  { label: 'More', icon: Ellipsis },
  { label: 'Reload', icon: RotateCw },
  { label: 'Add', icon: Plus },
  { label: 'Remove', icon: Minus },
  { label: 'Back', icon: ArrowLeft },
  { label: 'Forward', icon: ArrowRight },
  { label: 'Confirm', icon: Check },
  { label: 'Expand', icon: ChevronDown },
  { label: 'Search', icon: Search },
  { label: 'Settings', icon: Settings },
];

function IconButtons() {
  return (
    <Card>
      <Card.Body>
        <SimpleGrid cols={8} spacing={1} verticalSpacing={3}>
          <For each={ICON_BUTTONS}>
            {(button) => (
              <Center>
                <ActionIcon label={button.label} variant="outline" size="sm">
                  <button.icon aria-hidden="true" />
                </ActionIcon>
              </Center>
            )}
          </For>
        </SimpleGrid>
      </Card.Body>
    </Card>
  );
}

function Sampler() {
  return (
    <Card>
      <Card.Body>
        <Stack gap={4}>
          <Group gap={2}>
            <Button color="primary" size="sm">
              Button
            </Button>
            <Button color="secondary" variant="soft" size="sm">
              Secondary
            </Button>
            <Button variant="outline" size="sm">
              Outline
            </Button>
            <Button variant="ghost" size="sm">
              Ghost
            </Button>
          </Group>
          <Group justify="space-between" wrap="nowrap" class="create-two-a-bordered">
            <Text size="sm">Two-factor authentication</Text>
            <Button variant="soft" size="xs">
              Enable
            </Button>
          </Group>
          <Slider label="Volume" defaultValue={50} class="create-two-a-unlabelled" />
          <TextInput aria-label="Name" placeholder="Name" size="sm" rightSection={<Search aria-hidden="true" />} />
          <Textarea aria-label="Message" placeholder="Message" size="sm" rows={2} />
          <Group justify="space-between" wrap="nowrap">
            <Group gap={1} wrap="nowrap">
              <Badge color="primary" size="sm">
                Badge
              </Badge>
              <Badge color="secondary" variant="soft" size="sm">
                Secondary
              </Badge>
              <Badge variant="outline" size="sm">
                Outline
              </Badge>
            </Group>
            <Group gap={2} wrap="nowrap">
              <Radio.Group aria-label="Sample choice" defaultValue="one" size="sm">
                <Group gap={2} wrap="nowrap">
                  <Radio value="one" aria-label="Option one" />
                  <Radio value="two" aria-label="Option two" />
                </Group>
              </Radio.Group>
              <Checkbox aria-label="Sample checked" defaultChecked size="sm" />
              <Checkbox aria-label="Sample unchecked" size="sm" />
            </Group>
          </Group>
          <Group justify="space-between" wrap="nowrap">
            <Group gap={2} wrap="nowrap">
              <Button variant="outline" size="sm">
                Alert Dialog
              </Button>
              <Flex class="create-two-a-joined">
                <Button variant="outline" size="sm">
                  Button Group
                </Button>
                <ActionIcon label="More actions" variant="outline" size="sm">
                  <ChevronUp aria-hidden="true" />
                </ActionIcon>
              </Flex>
            </Group>
            <Switch aria-label="Sample switch" defaultChecked />
          </Group>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function Observability() {
  return (
    <Card>
      <div class="create-two-a-art" aria-hidden="true" />
      <Card.Body>
        <Stack gap={1}>
          <Title order={3} size="h5">
            Observability Plus is replacing Monitoring
          </Title>
          <Text size="sm" class="create-muted">
            Switch to the improved way to explore your data, with natural language. Monitoring will no longer be available on the
            Pro plan in November, 2025
          </Text>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Group justify="space-between" gap={2.5} class="create-two-a-fill">
          <Button variant="outline" size="sm" rightSection={<Plus aria-hidden="true" />}>
            Create Query
          </Button>
          <Badge color="warning" variant="soft" size="sm">
            Warning
          </Badge>
        </Group>
      </Card.Footer>
    </Card>
  );
}

function ShippingAddress() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Shipping Address
          </Title>
          <Text size="sm" class="create-muted">
            Where should we deliver?
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={3}>
          <TextInput label="Street address" placeholder="123 Main Street" size="sm" />
          <TextInput label="Apt / Suite" placeholder="Apt 4B" size="sm" />
          <SimpleGrid cols={2} spacing={3}>
            <TextInput label="City" placeholder="San Francisco" size="sm" />
            <Select
              label="State"
              size="sm"
              defaultValue="California"
              data={['California', 'New York', 'Oregon', 'Texas', 'Washington']}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing={3}>
            <TextInput label="ZIP Code" placeholder="94102" size="sm" />
            <Select label="Country" size="sm" defaultValue="United States" data={['United States', 'Canada', 'Mexico']} />
          </SimpleGrid>
          <Checkbox label="Save as default address" defaultChecked size="sm" />
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Group justify="space-between" gap={2.5} class="create-two-a-fill">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button color="primary" size="sm">
            Save Address
          </Button>
        </Group>
      </Card.Footer>
    </Card>
  );
}

export function Column2() {
  return (
    <>
      <IconButtons />
      <Sampler />
      <Observability />
      <ShippingAddress />
    </>
  );
}

const VARIABLES = [
  ['DATABASE_URL', '••••••••'],
  ['NEXT_PUBLIC_API', 'https://api.example.com'],
  ['STRIPE_SECRET', '••••••••'],
];

function EnvironmentVariables() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Environment Variables
          </Title>
          <Text size="xs" class="create-muted">
            Production · 8 variables
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={2}>
          <For each={VARIABLES}>
            {([name, value]) => (
              <Group justify="space-between" wrap="nowrap" gap={4} class="create-inset create-two-a-variable">
                <span>{name}</span>
                <span class="create-muted">{value}</span>
              </Group>
            )}
          </For>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Group justify="space-between" gap={2.5} class="create-two-a-fill">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button color="primary" size="sm">
            Deploy
          </Button>
        </Group>
      </Card.Footer>
    </Card>
  );
}

const TRAFFIC = [
  [186, 80],
  [305, 200],
  [237, 120],
  [73, 190],
  [209, 130],
  [214, 140],
];

function TrafficChannels() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Traffic channels
          </Title>
          <Text size="sm" lineClamp={2} class="create-muted">
            Monthly desktop and mobile traffic for the last six months—compare volume and mix across platforms and devices at a
            glance.
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <GroupedBars groups={TRAFFIC} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} height="6rem" />
          <Group gap={4} justify="center">
            <Group gap={1.5} wrap="nowrap">
              <span class="create-two-a-dot" style={{ background: 'var(--create-chart-1)' }} aria-hidden="true" />
              <Text size="xs">Desktop</Text>
            </Group>
            <Group gap={1.5} wrap="nowrap">
              <span class="create-two-a-dot" style={{ background: 'var(--create-chart-2)' }} aria-hidden="true" />
              <Text size="xs">Mobile</Text>
            </Group>
          </Group>
          <SimpleGrid cols={3} spacing={0} class="create-two-a-stats">
            <div>
              <p class="create-eyebrow">Desktop</p>
              <Text size="sm" weight="semibold">
                1,224
              </Text>
            </div>
            <div>
              <p class="create-eyebrow">Mobile</p>
              <Text size="sm" weight="semibold">
                860
              </Text>
            </div>
            <div>
              <p class="create-eyebrow">Mix delta</p>
              <Text size="sm" weight="semibold">
                +42%
              </Text>
            </div>
          </SimpleGrid>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button color="primary" size="sm" fullWidth>
          View report
        </Button>
      </Card.Footer>
    </Card>
  );
}

const INVITES = [
  { email: 'alex@example.com', role: 'Editor' },
  { email: 'sam@example.com', role: 'Viewer' },
];

function InviteTeam() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Invite Team
          </Title>
          <Text size="sm" class="create-muted">
            Add members to your workspace
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={3}>
          <For each={INVITES}>
            {(invite, index) => (
              <Grid gutter={2}>
                <Grid.Col span="auto">
                  <TextInput aria-label={`Email ${index() + 1}`} type="email" defaultValue={invite.email} size="sm" />
                </Grid.Col>
                <Grid.Col span="content">
                  <Box w="6.5rem">
                    <Select
                      aria-label={`Role ${index() + 1}`}
                      size="sm"
                      defaultValue={invite.role}
                      data={['Admin', 'Editor', 'Viewer']}
                    />
                  </Box>
                </Grid.Col>
              </Grid>
            )}
          </For>
          <Button variant="outline" size="sm" fullWidth leftSection={<Plus aria-hidden="true" />}>
            Add another
          </Button>
          <TextInput
            label="Or share invite link"
            readOnly
            value="https://app.co/invite/x8f2k"
            size="sm"
            rightSection={<CopyButton value="https://app.co/invite/x8f2k" label="Copy invite link" size="xs" />}
          />
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button color="primary" size="sm" fullWidth>
          Send Invites
        </Button>
      </Card.Footer>
    </Card>
  );
}

function Agent() {
  return (
    <Card>
      <Card.Header>
        <div>
          <Title order={3} size="h5">
            Ship faster &amp; safer with Acme Agent
          </Title>
          <Text size="sm" class="create-muted">
            Your use is subject to Acme's Public Beta Agreement and AI Product Terms.
          </Text>
        </div>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <Stack role="list" gap={3} class="create-two-a-checks">
            <Group role="listitem" align="flex-start" gap={2} wrap="nowrap">
              <CircleCheck aria-hidden="true" />
              <Text size="sm" as="span">
                <strong>Code reviews</strong> with full codebase context to catch <strong>hard-to-find</strong> bugs.
              </Text>
            </Group>
            <Group role="listitem" align="flex-start" gap={2} wrap="nowrap">
              <CircleCheck aria-hidden="true" />
              <Text size="sm" as="span">
                <strong>Code suggestions</strong> validated in sandboxes before you merge.
              </Text>
            </Group>
            <Group role="listitem" align="flex-start" gap={2} wrap="nowrap">
              <CircleCheck aria-hidden="true" />
              <Text size="sm" as="span">
                <strong>Root-cause analysis</strong> for production issues with deployment context.{' '}
                <Badge variant="outline" size="sm">
                  Requires Observability Plus
                </Badge>
              </Text>
            </Group>
          </Stack>
          <Text size="sm" class="create-muted create-two-a-note">
            Pro teams get $100 in Acme Agent trial credit for 2 weeks after activation.
          </Text>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button color="primary" size="sm">
          Enable with $100 credits
        </Button>
      </Card.Footer>
    </Card>
  );
}

export function Column3() {
  return (
    <>
      <EnvironmentVariables />
      <TrafficChannels />
      <InviteTeam />
      <Agent />
    </>
  );
}
