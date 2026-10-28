import { expect, test } from 'vitest';
import * as i18n from './index';

// The public runtime surface, pinned: adding or removing an export is a deliberate change.
test('exports', () => {
  expect(Object.keys(i18n).sort()).toEqual([
    'I18nContext',
    'I18nProvider',
    'defineTranslations',
    'matchLocale',
    'preloadTranslations',
    'useTranslations',
  ]);
});
