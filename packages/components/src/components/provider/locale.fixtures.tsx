// SSR scenarios for locale.test.tsx.
import { I18nProvider } from '@solid-slopkit/i18n';
import { SlopkitUi, useLocale } from '.';

const Price = () => {
  const locale = useLocale();
  return <p>{new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(1234.5)}</p>;
};

export const german = () => (
  <SlopkitUi locale="de-DE">
    <Price />
  </SlopkitUi>
);

export const germanFromI18n = () => (
  <I18nProvider locale="de-DE">
    <SlopkitUi>
      <Price />
    </SlopkitUi>
  </I18nProvider>
);
