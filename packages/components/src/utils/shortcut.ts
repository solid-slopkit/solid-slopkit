// Keyboard shortcuts that work anywhere on the page, such as the command dialog's and the app shell's.
const isApple = () => {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad|ipod/i.test(platform);
};

/**
 * Whether a key press is the shortcut, such as `mod+K`: modifiers (`mod`, `ctrl`, `meta`, `alt`, `shift`) and a
 * key, joined by `+`, ignoring case. `mod` is ⌘ on Apple devices and Ctrl elsewhere. The modifiers must match
 * exactly. A letter or digit also matches by its physical key, so it works with Alt and other layouts.
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut
    .toLowerCase()
    .split('+')
    .map((part) => part.trim());
  const key = parts.pop();
  if (!key) return false;
  const apple = isApple();
  const wanted = { ctrl: false, meta: false, alt: false, shift: false };
  for (const part of parts) {
    if (part === 'mod') wanted[apple ? 'meta' : 'ctrl'] = true;
    else if (part in wanted) wanted[part as keyof typeof wanted] = true;
    else return false;
  }
  if (
    event.ctrlKey !== wanted.ctrl ||
    event.metaKey !== wanted.meta ||
    event.altKey !== wanted.alt ||
    event.shiftKey !== wanted.shift
  ) {
    return false;
  }
  if (event.key.toLowerCase() === key) return true;
  return /^[a-z]$/.test(key) ? event.code === `Key${key.toUpperCase()}` : /^\d$/.test(key) && event.code === `Digit${key}`;
}
