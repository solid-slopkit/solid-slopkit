import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/avatar/basic';
import basicCode from '../../examples/components/avatar/basic.tsx?raw';
import Variants from '../../examples/components/avatar/variants';
import variantsCode from '../../examples/components/avatar/variants.tsx?raw';
import Sizes from '../../examples/components/avatar/sizes';
import sizesCode from '../../examples/components/avatar/sizes.tsx?raw';
import Group from '../../examples/components/avatar/group';
import groupCode from '../../examples/components/avatar/group.tsx?raw';
import WithName from '../../examples/components/avatar/with-name';
import withNameCode from '../../examples/components/avatar/with-name.tsx?raw';

export default function AvatarPage() {
  return (
    <article class="docs-page">
      <Title>Avatar · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Avatar</h1>
      <p class="docs-lead">
        A person or entity: their picture, or a placeholder with initials or an icon. <code>Avatar.Group</code> stacks several.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Avatar } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        With <code>src</code>, the picture fills the circle. Without one, or when it fails to load, a placeholder shows: the
        children, else the initials of <code>name</code>, else a person icon. The third avatar below points at a missing file.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="variants">Colors and variants</H2>
      <p>
        <code>color</code> takes a color role and <code>variant</code> styles the placeholder: <code>soft</code> (the default),{' '}
        <code>solid</code> or <code>outline</code>. Placeholder backgrounds are opaque, so overlapping avatars don't show through.
      </p>
      <Example component={Variants} code={variantsCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>From 24 to 80px; the initials scale with the circle.</p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="group">Group</H2>
      <p>
        <code>Avatar.Group</code> overlaps its avatars, each ringed in the surface color. For a count of the rest, add an Avatar
        with <code>+N</code> and an <code>alt</code>. Give the group <code>role="group"</code> and a label when it stands for a
        set.
      </p>
      <Example component={Group} code={groupCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        <code>alt</code>, or else <code>name</code>, labels the avatar: it gets <code>role="img"</code> and that name. When the
        name is already shown next to it, pass <code>alt=""</code>, as on an <code>img</code>: the avatar is hidden from assistive
        technology but still shows the initials.
      </p>
      <Example component={WithName} code={withNameCode} />

      <H2 id="avatar-props">Avatar props</H2>
      <p>
        Other props are passed to the <code>span</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'src', type: 'string', description: 'The picture. The placeholder shows without it.' },
          { name: 'alt', type: 'string', description: 'The accessible name. Defaults to name; "" hides the avatar.' },
          { name: 'name', type: 'string', description: "Gives the initials, and the name when there's no alt." },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role of the placeholder. Base colors if omitted.',
          },
          { name: 'variant', type: "'soft' | 'solid' | 'outline'", default: "'soft'", description: 'Look of the placeholder.' },
          { name: 'children', type: 'JSX.Element', description: 'Placeholder content. Wins over the initials.' },
        ]}
      />

      <H2 id="avatar-group-props">Avatar.Group props</H2>
      <p>
        No props of its own. Other props are passed to the <code>div</code>.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-avatar</code>, with <code>data-size</code>, <code>data-color</code>,{' '}
        <code>data-variant</code>, and <code>data-placeholder</code> while the placeholder shows. Its slots are{' '}
        <code>avatar-image</code> and <code>avatar-placeholder</code>. The group is <code>.slp-avatar-group</code>; its ring is a{' '}
        <code>box-shadow</code> on each avatar. A square avatar is one selector:{' '}
        <code>{'.slp-avatar { border-radius: 8px }'}</code>. Its rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-avatar-color',
            default: 'var(--slp-color-<color>)',
            description: "Placeholder color. For a color that isn't a role.",
          },
          {
            name: '--slp-avatar-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Text color on a solid placeholder.',
          },
        ]}
      />
    </article>
  );
}
