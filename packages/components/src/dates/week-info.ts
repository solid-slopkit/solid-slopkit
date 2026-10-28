// The locale's week: the day it starts on and its weekend days. Read from `Intl.Locale` week info, which not every
// supported browser has (ADR 0010), so a table of the regions whose week differs from the most common one (starts
// on Monday, weekend on Saturday and Sunday) stands in. It comes from CLDR, the data `Intl` reads, so the server and
// a browser without week info still agree, and hydration matches.

import type { DayOfWeek } from './date';

export interface WeekInfo {
  /** The day a week starts on, numbered like `Date.prototype.getDay()`: 0 is Sunday. */
  firstDayOfWeek: DayOfWeek;
  /** The weekend days, in the order they come in the week. */
  weekendDays: DayOfWeek[];
}

// Intl numbers days 1 (Monday) … 7 (Sunday).
interface IntlWeekInfo {
  firstDay: number;
  weekend: number[];
}

type LocaleWithWeekInfo = Intl.Locale & { getWeekInfo?: () => IntlWeekInfo; weekInfo?: IntlWeekInfo };

const SUNDAY_FIRST =
  'AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN IS JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW';
const SATURDAY_FIRST = 'AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY';
const FRIDAY_FIRST = 'MV';
const FRIDAY_SATURDAY_WEEKEND = 'BH DZ EG IL IQ JO KW LY OM QA SA SD SY YE';

const FIRST_DAY: Record<string, DayOfWeek> = {};
for (const region of SUNDAY_FIRST.split(' ')) FIRST_DAY[region] = 0;
for (const region of SATURDAY_FIRST.split(' ')) FIRST_DAY[region] = 6;
for (const region of FRIDAY_FIRST.split(' ')) FIRST_DAY[region] = 5;

const WEEKEND: Record<string, DayOfWeek[]> = { AF: [4, 5], IN: [0], IR: [5], UG: [0] };
for (const region of FRIDAY_SATURDAY_WEEKEND.split(' ')) WEEKEND[region] = [5, 6];

// The `fw` Unicode extension (`en-US-u-fw-mon`) picks the first day.
const FW_KEYWORDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function fromIntl(info: IntlWeekInfo): WeekInfo {
  return {
    firstDayOfWeek: (info.firstDay % 7) as DayOfWeek,
    weekendDays: info.weekend.map((day) => (day % 7) as DayOfWeek),
  };
}

function fromTable(locale: Intl.Locale): WeekInfo {
  const region = locale.region ?? locale.maximize().region ?? '';
  const fw = /-u(?:-[a-z0-9]{2,8})*?-fw-([a-z]{3})\b/i.exec(locale.toString())?.[1]?.toLowerCase();
  const fwDay = fw ? FW_KEYWORDS.indexOf(fw) : -1;
  return {
    firstDayOfWeek: fwDay >= 0 ? (fwDay as DayOfWeek) : (FIRST_DAY[region] ?? 1),
    weekendDays: WEEKEND[region] ?? [6, 0],
  };
}

const cache = new Map<string, WeekInfo>();

/** The week of a BCP 47 locale: the day it starts on and its weekend days. Throws a `RangeError` on an invalid tag. */
export function getWeekInfo(locale: string): WeekInfo {
  let info = cache.get(locale);
  if (!info) {
    const intlLocale = new Intl.Locale(locale) as LocaleWithWeekInfo;
    const intlInfo = intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo;
    info = intlInfo ? fromIntl(intlInfo) : fromTable(intlLocale);
    cache.set(locale, info);
  }
  return { firstDayOfWeek: info.firstDayOfWeek, weekendDays: [...info.weekendDays] };
}

/** @internal The table fallback, exported for tests. */
export const weekInfoFromTable = (locale: string): WeekInfo => fromTable(new Intl.Locale(locale));
