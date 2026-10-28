import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { withBase } from '../../base';

import Usage from '../../examples/i18n/usage';
import usageCode from '../../examples/i18n/usage.tsx?raw';
import usersFile from '../../examples/i18n/users.i18n.jsonc?raw';
import Shared from '../../examples/i18n/shared';
import sharedCode from '../../examples/i18n/shared.tsx?raw';
import commonFile from '../../examples/i18n/common.i18n.jsonc?raw';

export default function I18nOverview() {
  return (
    <article class="docs-page">
      <Title>i18n · slopkit</Title>
      <p class="docs-eyebrow">i18n</p>
      <h1>Overview</h1>
      <p class="docs-lead">
        <code>@solid-slopkit/i18n</code> keeps translations next to the component that uses them, the way CSS modules keep styles.
        A Vite plugin turns each translation file into a module, so importing it gives you the messages of the active locale as a
        typed object.
      </p>

      <H2 id="installation">Installation</H2>
      <p>
        Install <code>@solid-slopkit/i18n</code> from npm, then add the plugin (see <a href={withBase('/i18n/setup')}>Setup</a>).
      </p>
      <CodeBlock lang="bash" code="pnpm add @solid-slopkit/i18n" />
      <p>
        It needs <code>solid-js</code> and <code>@solidjs/web</code> 2.x, and Vite for the plugin. It doesn't depend on{' '}
        <code>@solid-slopkit/components</code>; the two meet through props.
      </p>

      <H2 id="translation-file">A translation file</H2>
      <p>
        A file named <code>*.i18n.jsonc</code> holds the messages of <strong>every</strong> locale for one component. It's JSON
        with comments. Messages can be grouped in nested objects, and every leaf is a string.
      </p>
      <CodeBlock lang="jsonc" code={usersFile} />
      <p>
        The default locale (set in the plugin options) defines the keys. Another locale may lag behind: a message it lacks falls
        back to the default locale's text, with a warning in development. A key that exists only in a non-default locale is a
        build error, and so is a message that isn't valid.
      </p>

      <H2 id="usage">Using it</H2>
      <p>
        Import the file and read its keys. <code>translations.title</code> is a <code>string</code> typed from the file, and a
        wrong key is a type error. Reading inside JSX is reactive: the text follows the locale of the nearest{' '}
        <code>I18nProvider</code>, which holds the active locale. The switcher sets it with <code>setLocale</code> from{' '}
        <code>useContext(I18nContext)</code>.
      </p>
      <Example component={Usage} code={usageCode} column />

      <H2 id="shared">Shared strings</H2>
      <p>
        There is no separate kind of "global" translation. A file of shared strings is a translation file that several components
        import, next to each component's own file. Each file is loaded once, however many components read it.
      </p>
      <CodeBlock lang="jsonc" code={commonFile} />
      <Example component={Shared} code={sharedCode} column />

      <H2 id="notes">Notes</H2>
      <ul>
        <li>
          Components run once. Read a message inside JSX or a memo, not into a variable at the top of the component, or it won't
          follow the locale.
        </li>
        <li>Message keys can't contain a dot or be empty; leaves can't be arrays, numbers or null.</li>
        <li>
          The suffix is configurable but can't end in <code>.json</code>. TypeScript types a real <code>.json</code> import from
          the file itself, so the generated types would never be used. See <a href={withBase('/i18n/setup')}>Setup</a>.
        </li>
      </ul>

      <H2 id="next">Next</H2>
      <ul>
        <li>
          <a href={withBase('/i18n/setup')}>Setup</a>: the plugin, <code>tsconfig</code>, tests and CI.
        </li>
        <li>
          <a href={withBase('/i18n/messages')}>Messages</a>: arguments, plurals, select, numbers and dates.
        </li>
        <li>
          <a href={withBase('/i18n/locale')}>Locale</a>: switching, reading outside rendering, <code>matchLocale</code>.
        </li>
        <li>
          <a href={withBase('/i18n/loading')}>Loading</a>: chunks, the loading boundary, preloading and SSR.
        </li>
        <li>
          <a href={withBase('/i18n/slopkit-components')}>With slopkit components</a>: the locale and the components' built-in
          text.
        </li>
      </ul>
    </article>
  );
}
