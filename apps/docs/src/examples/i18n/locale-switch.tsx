import { useContext } from 'solid-js';
import { SegmentedControl } from '@solid-slopkit/components';
import { I18nContext } from '@solid-slopkit/i18n';

/** The demos' language switcher: reads and sets the locale of the nearest I18nProvider. */
export function LocaleSwitch() {
  const i18n = useContext(I18nContext);
  return (
    <SegmentedControl aria-label="Language" size="xs" data={['en', 'de', 'uk']} value={i18n.locale()} onChange={i18n.setLocale} />
  );
}
