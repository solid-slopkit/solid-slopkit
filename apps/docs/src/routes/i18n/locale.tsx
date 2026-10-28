import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import Handler from '../../examples/i18n/handler';
import handlerCode from '../../examples/i18n/handler.tsx?raw';
import handlerFile from '../../examples/i18n/handler.i18n.jsonc?raw';
import localeSwitchCode from '../../examples/i18n/locale-switch.tsx?raw';

export default function I18nLocale() {
  return (
    <article class="docs-page">
      <Title>Locale · i18n · slopkit</Title>
      <p class="docs-eyebrow">i18n</p>
      <h1>Locale</h1>
      <p class="docs-lead">
        Holding and switching the active locale, reading messages outside rendering, and matching a user's languages to the ones
        you have.
      </p>

      <H2 id="provider">The provider</H2>
      <CodeBlock
        code={`// Uncontrolled: the provider owns the locale, starting from initialLocale.
<I18nProvider initialLocale="en" onChange={(locale) => save(locale)}>

// Controlled: you own it, the provider shows it.
<I18nProvider locale={locale()} onChange={setLocale}>

// Reading and switching, below the provider:
const i18n = useContext(I18nContext);
i18n.locale(); // "en", tracked
i18n.setLocale('de');`}
      />
      <p>
        <code>onChange</code> receives the locale, never an event. With a controlled <code>locale</code>, <code>setLocale</code>{' '}
        only reports through <code>onChange</code> and the provider changes when the prop does. Nested providers override the
        locale for their subtree. Reading <code>I18nContext</code> outside a provider throws. A language switcher is a few lines:
      </p>
      <CodeBlock code={localeSwitchCode} />
      <p>
        The package doesn't detect or remember the locale. Reading a cookie, the <code>Accept-Language</code> header or{' '}
        <code>navigator.languages</code>, and saving the choice, are decisions for the app, which passes the result in.
      </p>

      <H2 id="match-locale">matchLocale</H2>
      <p>
        <code>matchLocale(requested, supported)</code> picks the best of your locales for what the user asked for.{' '}
        <code>requested</code> is one tag or a list in order of preference, such as <code>navigator.languages</code>; matching
        ignores case and returns the spelling from <code>supported</code>.
      </p>
      <CodeBlock
        code={`import { matchLocale } from '@solid-slopkit/i18n';

matchLocale('de-AT', ['en', 'de']); // "de"
matchLocale('pt', ['en', 'pt-BR']); // "pt-BR"
matchLocale(['fr-CA', 'de-CH', 'en'], ['en', 'de']); // "de"
matchLocale('ja', ['en', 'de']); // undefined`}
      />

      <H2 id="outside-rendering">Reading outside rendering</H2>
      <p>
        A message knows the locale because it looks at the reactive owner it's read from. During rendering, in a memo or in an
        effect, that's always the right provider. An event handler, a timer or a promise callback has no owner, so there:
      </p>
      <ul>
        <li>
          on the client, the message uses the provider that mounted last, which is correct unless one page mounts two providers
          with different locales;
        </li>
        <li>
          on the server, it throws, because the server can't know which request it's serving. Read during rendering, or use{' '}
          <code>useTranslations</code>.
        </li>
      </ul>
      <p>
        <code>useTranslations(translations)</code> returns the same messages bound to the provider above the component that calls
        it, so reads are correct everywhere. Call it while the component is being set up.
      </p>
      <CodeBlock lang="jsonc" code={handlerFile} />
      <Example component={Handler} code={handlerCode} column />

      <H2 id="missing">Missing messages and unknown locales</H2>
      <ul>
        <li>
          A message missing in the active locale shows the default locale's text, with one warning per message in development.
          Arguments are still formatted for the active locale.
        </li>
        <li>A locale that a file doesn't contain shows its default locale.</li>
        <li>
          Use <code>strict: true</code> in the plugin options in CI to make a missing message a build error instead of a warning.
        </li>
      </ul>
    </article>
  );
}
