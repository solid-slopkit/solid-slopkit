# Avatar

A person or entity: their picture, or a placeholder with initials or an icon. A `span`. `Avatar.Group` stacks several.

```tsx
import { Avatar } from '@solid-slopkit/components';
```

## Usage

```tsx
<Avatar src={user.photo} name={user.name} />
<Avatar name="Grace Hopper" color="primary" />

<Avatar.Group>
  <Avatar src="/ada.png" name="Ada Lovelace" />
  <Avatar name="Alan Turing" />
  <Avatar alt="3 more">+3</Avatar>
</Avatar.Group>
```

- **Picture:** with `src`, the picture fills the circle, cropped to cover it. Without `src`, or when it fails to load, the placeholder shows. That includes a picture that failed before the page hydrated. A new `src` gets its own try.
- **Placeholder:** the children if there are any (an icon, or a count like `+3`); otherwise the initials of `name`, the first letters of its first and last words; otherwise a person icon.
- **Accessible name:** `alt`, or else `name`, labels the avatar: it gets `role="img"` and that `aria-label`, and the picture and placeholder inside are hidden from assistive technology. Without either, the avatar has no role and its children are read as text, so `<Avatar>+3</Avatar>` reads "+3"; an avatar with only the icon announces nothing.
- **Decorative:** when the name is already shown next to the avatar, pass `alt=""`, as on an `img`: the avatar is hidden from assistive technology, and still shows the initials of `name`.
- **Look:** `size` from `xs` to `xl` (24, 32, 40, 56 and 80px). `color` takes a color role and `variant` styles the placeholder: `soft` (the default, a light tint), `solid` or `outline`. Placeholder backgrounds are opaque, so overlapping avatars don't show through.
- **Group:** `Avatar.Group` is a `div` that overlaps its avatars by a quarter of their size, each ringed in the surface color. For a count of the rest, add a last Avatar with `+N` and an `alt`. Give the group `role="group"` and an `aria-label` when it stands for a set, such as "Reviewers".

## Props

### Avatar

Other props are passed to the `span`.

| Prop       | Type                                                                                               | Default  | Description                                             |
| ---------- | -------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| `src`      | `string`                                                                                           | —        | The picture. The placeholder shows without it.          |
| `alt`      | `string`                                                                                           | —        | The accessible name. Defaults to `name`; `""` hides it. |
| `name`     | `string`                                                                                           | —        | Gives the initials, and the name when there's no `alt`. |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`   | Size.                                                   |
| `color`    | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —        | Color role of the placeholder. Base colors if omitted.  |
| `variant`  | `'soft' \| 'solid' \| 'outline'`                                                                   | `'soft'` | Look of the placeholder.                                |
| `children` | `JSX.Element`                                                                                      | —        | Placeholder content. Wins over the initials.            |

### Avatar.Group

No props of its own. Other props are passed to the `div`.

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-avatar`, and `.slp-avatar-group` on the group.
- Slots: `[data-slot="avatar-image"]` (the `img`), `[data-slot="avatar-placeholder"]`.
- State and variant attributes on the root: `data-size`, `data-color`, `data-variant`, `data-placeholder` (while the placeholder shows).
- A square avatar is one selector: `.slp-avatar { border-radius: 8px }`. The group's ring is a `box-shadow` on each avatar, in `--slp-color-base-100`; on another surface, set it with `.slp-avatar-group > .slp-avatar { box-shadow: 0 0 0 2px var(--slp-color-base-200) }`.

CSS variables, set on the avatar or any ancestor:

| Variable               | Default                            | Description                                       |
| ---------------------- | ---------------------------------- | ------------------------------------------------- |
| `--slp-avatar-color`   | `var(--slp-color-<color>)`         | Placeholder color. For a color that isn't a role. |
| `--slp-avatar-content` | `var(--slp-color-<color>-content)` | Text color on a solid placeholder.                |
