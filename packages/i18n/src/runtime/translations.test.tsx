import { render } from '@solidjs/testing-library';
import { Errored, createSignal, flush, isPending } from 'solid-js';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { I18nContext } from './context';
import { I18nProvider } from './provider';
import { defineTranslations, preloadTranslations, useTranslations } from './translations';
import { useContext } from 'solid-js';
import { data, de, deferred, en, inline, shape, type Users } from './fixtures';

const users = () => defineTranslations<Users>(inline());
const settle = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
  flush();
};

afterEach(() => vi.restoreAllMocks());

describe('reading messages', () => {
  test('messages, nested groups and messages with arguments, in the active locale', () => {
    const t = users();
    const { container } = render(() => (
      <I18nProvider initialLocale="en">
        <p>
          {t.title}|{t.form.submit}|{t.greeting({ name: 'Ada' })}|{t.items({ n: 3 })}
        </p>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('Users|Save|Hello Ada|3 users');
  });

  test('the view is plain data: enumerable keys and spread', () => {
    const t = users();
    render(() => (
      <I18nProvider initialLocale="de">
        <span />
        {void expect(Object.keys(t)).toEqual(['title', 'greeting', 'items', 'form', 'onlyDefault'])}
        {void expect({ ...t.form }).toEqual({ submit: 'Speichern' })}
      </I18nProvider>
    ));
  });

  test('switching the locale updates the text', () => {
    const t = users();
    let setLocale!: (locale: string) => void;
    const Grab = () => ((setLocale = useContext(I18nContext).setLocale), null);
    const { container } = render(() => (
      <I18nProvider initialLocale="en">
        <Grab />
        <p>{t.title}</p>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('Users');
    setLocale('de');
    flush();
    expect(container).toHaveTextContent('Benutzer');
  });

  test('a message missing in the active locale falls back to the default, with one warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const t = users();
    const { container } = render(() => (
      <I18nProvider initialLocale="de">
        <p>{t.onlyDefault}</p>
        <p>{t.onlyDefault}</p>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('Only in EnglishOnly in English');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/users\.onlyDefault is missing in "de"/);
  });

  test('a locale the file does not have shows the default locale', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const t = users();
    const { container } = render(() => (
      <I18nProvider initialLocale="fr">
        <p>
          {t.title}|{t.items({ n: 2 })}
        </p>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('Users|2 users');
  });

  test('formats arguments with the active locale, also when the text falls back', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const t = users();
    const { container } = render(() => (
      <I18nProvider initialLocale="de">
        <p>{t.items({ n: 1234 })}</p>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('1.234 Benutzer');
  });

  test('without a provider it fails with a clear message', () => {
    const t = users();
    expect(() => render(() => <p>{t.title}</p>)).toThrow(/no I18nProvider/);
  });
});

describe('I18nProvider', () => {
  test('uncontrolled: setLocale changes the locale and reports it', () => {
    const onChange = vi.fn();
    let ctx!: ReturnType<typeof useContext<typeof I18nContext extends never ? never : any>>;
    const Grab = () => ((ctx = useContext(I18nContext)), null);
    render(() => (
      <I18nProvider initialLocale="en" onChange={onChange}>
        <Grab />
      </I18nProvider>
    ));
    expect(ctx.locale()).toBe('en');
    ctx.setLocale('de');
    flush();
    expect(ctx.locale()).toBe('de');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('de');
    ctx.setLocale('de');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('controlled: setLocale only reports; the prop decides', () => {
    const onChange = vi.fn();
    const [locale, setLocale] = createSignal('en');
    let ctx!: any;
    const Grab = () => ((ctx = useContext(I18nContext)), null);
    render(() => (
      <I18nProvider locale={locale()} onChange={onChange}>
        <Grab />
      </I18nProvider>
    ));
    ctx.setLocale('de');
    flush();
    expect(onChange).toHaveBeenCalledExactlyOnceWith('de');
    expect(ctx.locale()).toBe('en');
    setLocale('de');
    flush();
    expect(ctx.locale()).toBe('de');
  });

  test('a nested provider overrides the locale for its subtree', () => {
    const t = users();
    const { container } = render(() => (
      <I18nProvider initialLocale="en">
        <p>{t.title}</p>
        <I18nProvider initialLocale="de">
          <p>{t.title}</p>
        </I18nProvider>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('UsersBenutzer');
  });
});

describe('reads without an owner', () => {
  test('an event handler reads the locale of the provider that mounted last', () => {
    const t = users();
    let read = '';
    const { getByRole } = render(() => (
      <I18nProvider initialLocale="de">
        <button onClick={() => (read = t.title)}>go</button>
      </I18nProvider>
    ));
    getByRole('button').click();
    expect(read).toBe('Benutzer');
  });

  test('before any provider has mounted, an ownerless read fails clearly', () => {
    expect(() => users().title).toThrow(/no I18nProvider/);
  });

  test('useTranslations binds to its own provider, also with two providers on the page', () => {
    const t = users();
    const reads: string[] = [];
    const Probe = () => {
      const bound = useTranslations(t);
      return <button onClick={() => reads.push(bound.title)}>read</button>;
    };
    const { getAllByRole } = render(() => (
      <>
        <I18nProvider initialLocale="en">
          <Probe />
        </I18nProvider>
        <I18nProvider initialLocale="de">
          <Probe />
        </I18nProvider>
      </>
    ));
    for (const button of getAllByRole('button')) button.click();
    expect(reads).toEqual(['Users', 'Benutzer']);
  });

  test('useTranslations needs a provider and a translation file', () => {
    expect(() => render(() => <>{void useTranslations(users())}</>)).toThrow();
    expect(() => render(() => <I18nProvider initialLocale="en">{void useTranslations({})}</I18nProvider>)).toThrow(
      /default export of a translation file/,
    );
  });
});

describe('loading a locale chunk', () => {
  test('the provider shows its fallback until the chunk arrives', async () => {
    const { definition, resolvers, loaded } = deferred();
    const t = defineTranslations<Users>(definition);
    const { container } = render(() => (
      <I18nProvider initialLocale="en" fallback={<i>loading</i>}>
        <p>{t.title}</p>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('loading');
    expect(loaded).toEqual(['en']);
    resolvers.en!();
    await settle();
    expect(container).toHaveTextContent('Users');
    expect(container).not.toHaveTextContent('loading');
  });

  test('switching the locale keeps the old text until the new chunk is ready', async () => {
    const { definition, resolvers, loaded } = deferred();
    const t = defineTranslations<Users>(definition);
    let ctx!: any;
    const Grab = () => {
      ctx = useContext(I18nContext);
      return <b>{isPending(() => ctx.locale()) ? 'switching' : 'idle'}</b>;
    };
    const { container } = render(() => (
      <I18nProvider initialLocale="en" fallback={<i>loading</i>}>
        <Grab />
        <p>{t.title}</p>
      </I18nProvider>
    ));
    resolvers.en!();
    await settle();
    expect(container).toHaveTextContent('Users');

    ctx.setLocale('de');
    flush();
    expect(loaded).toEqual(['en', 'de']);
    expect(container).toHaveTextContent('Users');
    expect(container).toHaveTextContent('switching');
    expect(container).not.toHaveTextContent('loading');

    resolvers.de!();
    await settle();
    expect(container).toHaveTextContent('Benutzer');
    expect(container).toHaveTextContent('idle');
  });

  test('a chunk is loaded once, however many readers it has', async () => {
    const { definition, resolvers, loaded } = deferred();
    const t = defineTranslations<Users>(definition);
    render(() => (
      <I18nProvider initialLocale="en">
        <p>{t.title}</p>
        <p>{t.form.submit}</p>
      </I18nProvider>
    ));
    resolvers.en!();
    await settle();
    expect(loaded).toEqual(['en']);
  });

  test('a failed load reaches the nearest Errored boundary', async () => {
    const t = defineTranslations<Users>({
      ...inline(),
      locales: { en: () => Promise.reject(new Error('chunk failed')), de: {} },
    });
    const { container } = render(() => (
      <Errored fallback={(error: () => unknown) => <em>{String(error())}</em>}>
        <I18nProvider initialLocale="en">
          <p>{t.title}</p>
        </I18nProvider>
      </Errored>
    ));
    await settle();
    expect(container).toHaveTextContent('chunk failed');
  });

  test('preloadTranslations makes the first render ready, with no fallback', async () => {
    const { definition, resolvers } = deferred();
    const t = defineTranslations<Users>(definition);
    const preloaded = preloadTranslations('en', t);
    resolvers.en!();
    await preloaded;
    const { container } = render(() => (
      <I18nProvider initialLocale="en" fallback={<i>loading</i>}>
        <p>{t.title}</p>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('Users');
    expect(container).not.toHaveTextContent('loading');
  });

  test('preloadTranslations of an unknown locale loads the default locale', async () => {
    const { definition, loaded } = deferred();
    void preloadTranslations('fr', defineTranslations<Users>(definition));
    expect(loaded).toEqual(['en']);
  });
});

describe('hot updates', () => {
  const edited = (title: string, extra = {}) => ({
    ...inline(),
    locales: { en: data({ ...en, title, ...extra }), de: data(de) },
  });

  test('replacing the messages updates what is rendered, through the same object', () => {
    const t = defineTranslations<Users>(inline());
    const { container } = render(() => (
      <I18nProvider initialLocale="en">
        <p>{t.title}</p>
      </I18nProvider>
    ));
    expect(container).toHaveTextContent('Users');
    expect(defineTranslations<Users>(edited('Members'), t)).toBe(t);
    flush();
    expect(container).toHaveTextContent('Members');
  });

  test('a changed set of keys is a new object, so the caller can reload', () => {
    const t = defineTranslations<Users>(inline());
    const next = defineTranslations<Users>({ ...edited('Users'), shape: shape({ ...en, added: 'x' }) }, t);
    expect(next === t).toBe(false); // not toBe: its failure message would read every getter
  });
});

describe('ownerless reads before the chunk has loaded', () => {
  test('throw until the chunk has loaded (preload what handlers need), then read normally', async () => {
    const { definition, resolvers } = deferred();
    const t = defineTranslations<Users>(definition);
    render(() => <I18nProvider initialLocale="en">{null}</I18nProvider>);
    expect(() => t.title).toThrow();
    void preloadTranslations('en', t);
    resolvers.en!();
    await settle();
    expect(t.title).toBe('Users');
  });
});
