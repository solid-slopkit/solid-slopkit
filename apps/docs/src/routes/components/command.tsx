import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Inline from '../../examples/components/command/inline';
import inlineCode from '../../examples/components/command/inline.tsx?raw';
import Dialog from '../../examples/components/command/dialog';
import dialogCode from '../../examples/components/command/dialog.tsx?raw';
import { withBase } from '../../base';

export default function CommandPage() {
  return (
    <article class="docs-page">
      <Title>Command · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Command</h1>
      <p class="docs-lead">
        A search over a list of commands. Type to find one, move with the arrows, and press Enter to select it. Use it inline, or
        in a CommandDialog for a palette over the whole app.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Command, CommandDialog } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Build it from parts: <code>Command.Input</code>, then <code>Command.List</code> with <code>Command.Item</code>,{' '}
        <code>Command.Group</code>, <code>Command.Separator</code> and <code>Command.Empty</code>. An item holds anything (an
        icon, its text, a <code>Command.Shortcut</code>), and <code>onSelect</code> is called with its value on a click, or on
        Enter while it's active.
      </p>
      <Example component={Inline} code={inlineCode} />

      <H2 id="dialog">Dialog</H2>
      <p>
        <code>CommandDialog</code> puts a Command in a modal. It's controlled: <code>opened</code>, and{' '}
        <code>onOpenedChange</code>, which is called when it asks to open or close. <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>
        <kbd>K</kbd> on Apple devices) asks for it from anywhere on the page. Selecting an item closes it, unless{' '}
        <code>closeOnSelect</code> is <code>false</code>. Its content is rendered only while it's open, so each opening starts
        with an empty search.
      </p>
      <Example component={Dialog} code={dialogCode} />
      <p>
        <code>shortcut</code> takes another key press, several, or <code>null</code> for none; <code>mod</code> is ⌘ on Apple
        devices and Ctrl elsewhere.
      </p>
      <CodeBlock
        code={`<CommandDialog opened={opened()} onOpenedChange={setOpened} shortcut={['mod+K', '/']}>…</CommandDialog>`}
      />

      <H2 id="search">Search</H2>
      <p>
        An item is found when its value or <code>keywords</code> contain every word of the search, ignoring case. Its value is{' '}
        <code>value</code>, or its text. The items the search doesn't find are hidden, in place; so are the groups with none
        found, and the separators while searching. <code>filter(value, search, keywords)</code> replaces the test. For results
        filtered elsewhere, such as on a server, pass <code>shouldFilter={'{false}'}</code> and render the results as they come.
      </p>
      <CodeBlock
        code={`<Command filter={(value, search) => value.toLowerCase().startsWith(search.toLowerCase())}>…</Command>

<Command shouldFilter={false} search={search()} onSearchChange={setSearch}>
  <Command.Input />
  <Command.List>
    <For each={results()}>{(result) => <Command.Item value={result.id}>{result.title}</Command.Item>}</For>
  </Command.List>
</Command>`}
      />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        Focus stays in the input, a combobox whose <code>aria-activedescendant</code> points at the active option of the listbox.
        The arrows move through the items, skipping disabled ones, and Enter selects the active one. The input is named{' '}
        <code>'Search'</code> and the list <code>'Suggestions'</code> unless you pass <code>aria-label</code>. A CommandDialog is
        a modal dialog named <code>'Command menu'</code>; Escape closes it, and focus goes back to where it was.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Command passes other props to its <code>div</code>. <code>Command.Input</code> passes its props to the{' '}
        <a href={withBase('/components/input')}>Input</a> (a <code>ghost</code> one, <code>lg</code>, with a search icon that{' '}
        <code>leftSection</code> replaces).
      </p>
      <PropsTable
        rows={[
          { name: 'search', type: 'string', description: 'The search text, for a controlled one.' },
          { name: 'onSearchChange', type: '(search: string) => void', description: "Called as it's typed." },
          { name: 'value', type: 'string', description: "The active item's value, for a controlled one." },
          { name: 'onValueChange', type: '(value: string | undefined) => void', description: 'Called as the active item moves.' },
          { name: 'filter', type: '(value, search, keywords) => boolean', description: 'Whether an item is found.' },
          {
            name: 'shouldFilter',
            type: 'boolean',
            default: 'true',
            description: (
              <>
                <code>false</code> shows every item.
              </>
            ),
          },
          { name: 'loop', type: 'boolean', default: 'true', description: 'Whether the arrow keys wrap around.' },
        ]}
      />

      <H2 id="item">Command.Item</H2>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', default: 'its text', description: "What it's searched by and onSelect gets." },
          { name: 'keywords', type: 'string[]', description: "More words it's found by, not shown." },
          { name: 'disabled', type: 'boolean', default: 'false', description: "Shown, but can't be selected." },
          { name: 'onSelect', type: '(value: string) => void', description: 'Called on a click, or Enter while active.' },
        ]}
      />
      <p>
        <code>Command.Group</code> takes a <code>heading</code>; <code>Command.Separator</code> takes <code>alwaysRender</code>,
        to show it while searching too.
      </p>

      <H2 id="dialog-props">CommandDialog</H2>
      <p>
        The props above, plus <a href={withBase('/components/modal')}>Modal</a>'s <code>size</code> (default <code>lg</code>),{' '}
        <code>centered</code>, <code>fullScreen</code>, <code>closeOnClickOutside</code>, <code>closeOnEscape</code>,{' '}
        <code>returnFocus</code>, <code>lockScroll</code>, <code>transition</code>, <code>transitionDuration</code> and{' '}
        <code>onExited</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: 'Whether it is open. Required.' },
          { name: 'onOpenedChange', type: '(opened: boolean) => void', description: 'Called when it asks to open or close.' },
          {
            name: 'shortcut',
            type: 'string | readonly string[] | null',
            default: "'mod+K'",
            description: 'The key press that asks it to open and close.',
          },
          { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'Whether selecting an item closes it.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-command</code>, a bordered surface; a CommandDialog's <code>{'<dialog>'}</code> is{' '}
        <code>.slp-command-dialog</code>, also a <code>.slp-modal</code>, and is the surface instead. The parts are{' '}
        <code>.slp-command-list</code>, <code>.slp-command-item</code> (with <code>data-active</code>, <code>data-disabled</code>,{' '}
        <code>data-value</code> when given, and <code>hidden</code>), <code>.slp-command-group</code>,{' '}
        <code>.slp-command-separator</code>, <code>.slp-command-empty</code> and <code>.slp-command-shortcut</code>, with matching{' '}
        <code>data-slot</code>s, plus <code>command-group-heading</code> and <code>command-input</code>. The rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
