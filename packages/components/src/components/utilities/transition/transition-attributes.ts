import type { JSX } from '@solidjs/web';
import style from './transition.module.css';
import type { Presence, PresenceStatus } from '../../primitives';

/**
 * A ready-made enter and exit animation. The direction in the name is the way it moves while entering: `fade-up`
 * rises into place. `none` animates nothing, for writing your own CSS against `data-status`.
 */
export type TransitionName =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'scale-x'
  | 'scale-y'
  | 'pop'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'rotate-left'
  | 'rotate-right'
  | 'none';

export interface TransitionTiming {
  transition: () => TransitionName;
  duration: () => number;
  exitDuration: () => number | undefined;
  timingFunction: () => string;
}

/** The transition's class, timing custom properties and attributes, for an element whose presence is `presence`. */
export interface TransitionStyleAttributes {
  class: string;
  style: JSX.CSSProperties;
  'data-transition': TransitionName;
  'data-status': PresenceStatus;
}

/**
 * The attributes that animate an element with one of the presets, as Transition gives them to its child. Components
 * that run their own presence (an overlay's dropdown) put them on their element directly. `style` hides the element
 * while it isn't mounted, for content that stays in the DOM.
 */
export function transitionAttributes(presence: Presence, timing: TransitionTiming): TransitionStyleAttributes {
  return {
    class: `slp-transition ${style.transition}`,
    get style() {
      const duration = timing.duration();
      return {
        '--_transition-duration': `${duration}ms`,
        '--_transition-exit-duration': `${timing.exitDuration() ?? duration}ms`,
        '--_transition-timing-function': timing.timingFunction(),
        display: presence.mounted() ? undefined : 'none',
      };
    },
    get 'data-transition'() {
      return timing.transition();
    },
    get 'data-status'() {
      return presence.status();
    },
  };
}
