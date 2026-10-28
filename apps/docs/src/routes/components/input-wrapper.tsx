import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/input-wrapper/basic';
import basicCode from '../../examples/components/input-wrapper/basic.tsx?raw';
import Sizes from '../../examples/components/input-wrapper/sizes';
import sizesCode from '../../examples/components/input-wrapper/sizes.tsx?raw';
import LabelSection from '../../examples/components/input-wrapper/label-section';
import labelSectionCode from '../../examples/components/input-wrapper/label-section.tsx?raw';
import Group from '../../examples/components/input-wrapper/group';
import groupCode from '../../examples/components/input-wrapper/group.tsx?raw';
import { withBase } from '../../base';

export default function InputWrapperPage() {
  return (
    <article class="docs-page">
      <Title>InputWrapper · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>InputWrapper</h1>
      <p class="docs-lead">
        A label, description and error around a field. The field inside, such as an{' '}
        <a href={withBase('/components/input')}>Input</a>, gets the ids, the invalid state and the size from it.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { InputWrapper } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The label's <code>for</code> points at the control, and the control's <code>aria-describedby</code> lists the description
        and the error. <code>error</code> also marks the field invalid; <code>error={'{true}'}</code> does that without a message.
        The message isn't a live region: it's read when the field is focused, not announced as you type. <code>required</code>{' '}
        adds an asterisk, hidden from screen readers, and makes the control <code>required</code>, which they announce. Type
        something without an @ below.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="sizes">Sizes</H2>
      <p>
        <code>size</code> sizes the label and texts, and is the field's default size.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="label-section">Label section</H2>
      <p>
        <code>labelSection</code> puts content at the end of the label's row, on its baseline: a link, a count, or the current
        value of a slider. It sits outside the <code>label</code>, so it isn't part of the field's accessible name; hide a visual
        duplicate of the value with <code>aria-hidden</code>. Every field and slider takes it.
      </p>
      <Example component={LabelSection} code={labelSectionCode} />

      <H2 id="groups">Groups and custom fields</H2>
      <p>
        A group of controls, such as radios, can't be labelled with <code>for</code>. With <code>labelElement="div"</code>, the
        label is a <code>div</code>, and the group points at it: <code>useInputWrapper()</code> gives a custom field the{' '}
        <code>id</code>, <code>labelId()</code>, <code>describedBy()</code>, <code>invalid()</code>, <code>required()</code> and{' '}
        <code>size()</code>.
      </p>
      <Example component={Group} code={groupCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the root <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'label', type: 'JSX.Element', description: "The field's label." },
          {
            name: 'labelSection',
            type: 'JSX.Element',
            description: "Content at the end of the label's row, such as the current value or a link.",
          },
          { name: 'description', type: 'JSX.Element', description: 'Help text between the label and the field.' },
          {
            name: 'error',
            type: 'JSX.Element',
            description: 'Error message under the field; marks it invalid. true: no message.',
          },
          { name: 'required', type: 'boolean', default: 'false', description: 'Asterisk, and a required control.' },
          { name: 'withAsterisk', type: 'boolean', default: 'required', description: 'Shows the asterisk.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "'md'",
            description: "Text size, and the field's default size.",
          },
          { name: 'id', type: 'string', default: 'generated', description: "The control's id. Read once." },
          {
            name: 'labelElement',
            type: "'label' | 'div'",
            default: "'label'",
            description: 'div for a group of controls. Read once.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-input-wrapper</code>, with <code>data-size</code> and <code>data-invalid</code>. Its
        slots are <code>input-wrapper-label</code>, <code>input-wrapper-required</code>, <code>input-wrapper-label-row</code> (the
        label and the section, with a section), <code>input-wrapper-label-section</code>, <code>input-wrapper-description</code>{' '}
        and <code>input-wrapper-error</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
