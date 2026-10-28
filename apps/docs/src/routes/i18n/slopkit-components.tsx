import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import WithSlopkitUi from '../../examples/i18n/slopkit-components';
import slopkitUiCode from '../../examples/i18n/slopkit-components.tsx?raw';
import uiFile from '../../examples/i18n/ui.i18n.jsonc?raw';

export default function I18nSlopkitUi() {
  return (
    <article class="docs-page">
      <Title>With slopkit components · i18n · slopkit</Title>
      <p class="docs-eyebrow">i18n</p>
      <h1>With slopkit components</h1>
      <p class="docs-lead">Passing the locale and the components' built-in text from a translation file.</p>
      <p>
        <code>@solid-slopkit/components</code> and <code>@solid-slopkit/i18n</code> are independent packages. They meet through
        props: <code>SlopkitUi</code> takes <code>locale</code>, which components format dates and numbers with, and each
        component that renders built-in text (an accessible name such as "Close", an empty state) takes it as a prop with an
        English default. Give both the values of a translation file.
      </p>
      <CodeBlock lang="jsonc" code={uiFile} />
      <Example component={WithSlopkitUi} code={slopkitUiCode} column />

      <H2 id="notes">Notes</H2>
      <ul>
        <li>
          Put the bridge once near the root, inside <code>I18nProvider</code>, so every slopkit component formats for the active
          locale.
        </li>
        <li>
          <code>SlopkitUi</code>'s <code>locale</code> doesn't have to be the same string as your i18n locale: pass what{' '}
          <code>Intl</code> should format with (<code>"en-GB"</code> for an <code>"en"</code> site, for instance).
        </li>
        <li>
          <code>SlopkitUi</code> holds no translation dictionary. Pass translated built-in text where you render the component (
          <code>closeButtonLabel</code>, <code>nothingFoundMessage</code>, …); a shared translation file keeps those strings in
          one place. Each component's page lists its text props.
        </li>
        <li>Translated text for common locales isn't shipped; it's content, kept in your own translation files.</li>
      </ul>
    </article>
  );
}
