import { createContext, omit, useContext } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './card.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { Title, type TitleProps } from '../../typography/title';
import { Text, type TextOwnProps } from '../../typography/text';

export type CardVariant = 'outline' | 'soft' | 'elevated';
export type CardOrientation = 'vertical' | 'horizontal';
export type CardSize = 'sm' | 'md';

export interface CardOwnProps {
  /** `outline` (bordered, the default), `soft` (a quieter surface, no border) or `elevated` (a shadow). */
  variant?: CardVariant;
  /** `horizontal` puts Card.Image on the start side and stacks the other parts beside it. Defaults to `vertical`. */
  orientation?: CardOrientation;
  /** `sm` tightens the spacing and makes Card.Title smaller. Defaults to `md`. */
  size?: CardSize;
}

export type CardProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, CardOwnProps>;
export type CardPartProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;
export type CardImageProps = ElementProps<JSX.ImgHTMLAttributes<HTMLImageElement>, { alt: string }>;
export type CardTitleProps = TitleProps;
export type CardDescriptionProps = ElementProps<JSX.HTMLAttributes<HTMLParagraphElement>, Omit<TextOwnProps, 'children'>>;

// The card's size, for Card.Title's default look.
const CardSizeContext = createContext<() => CardSize>(() => 'md');

/**
 * The top part, for a title: a row that puts anything after the title at the end. With Card.Title and
 * Card.Description it stacks the two at the start and keeps the rest at the end.
 */
export function CardHeader(props: CardPartProps) {
  const others = omit(props, 'class');
  return <div class={joinClass(['slp-card-header', style.header], props.class)} {...others} />;
}

/**
 * The card's heading: a Title at level 3 that looks like an `h5` (an `h6` in a small card). Takes Title's props to
 * change either.
 */
export function CardTitle(props: CardTitleProps) {
  const cardSize = useContext(CardSizeContext);
  const others = omit(props, 'class', 'order', 'size');
  return (
    <Title
      order={props.order ?? 3}
      size={props.size ?? (cardSize() === 'sm' ? 'h6' : 'h5')}
      class={joinClass(['slp-card-title', style.title], props.class)}
      {...others}
    />
  );
}

/** A muted line under Card.Title: small, dimmed Text. Takes Text's props to change either. */
export function CardDescription(props: CardDescriptionProps) {
  const others = omit(props, 'class', 'size', 'dimmed');
  return (
    <Text
      size={props.size ?? 'sm'}
      dimmed={props.dimmed ?? true}
      class={joinClass(['slp-card-description', style.description], props.class)}
      {...others}
    />
  );
}

/** The padded main content. */
export function CardBody(props: CardPartProps) {
  const others = omit(props, 'class');
  return <div class={joinClass(['slp-card-body', style.body], props.class)} {...others} />;
}

/** The bottom part: a row of actions on a muted strip, below a divider. */
export function CardFooter(props: CardPartProps) {
  const others = omit(props, 'class');
  return <div class={joinClass(['slp-card-footer', style.footer], props.class)} {...others} />;
}

/** A full-bleed image, flush with the card's edges and cropped to fit. Takes the `img` attributes; `alt` is required. */
export function CardImage(props: CardImageProps) {
  const others = omit(props, 'class');
  return <img class={joinClass(['slp-card-image', style.image], props.class)} {...others} />;
}

/**
 * A card: content grouped on a surface, built from Card.Header, Card.Image, Card.Body and Card.Footer, with
 * Card.Title and Card.Description for its heading.
 */
export function Card(props: CardProps) {
  const mergedProps = mergeDefaultProps({ variant: 'outline', orientation: 'vertical', size: 'md' } as const, props);
  const others = omit(mergedProps, 'class', 'children', 'variant', 'orientation', 'size');

  return (
    <div
      data-variant={mergedProps.variant}
      data-orientation={mergedProps.orientation}
      data-size={mergedProps.size}
      class={joinClass(['slp-card', style.card], mergedProps.class)}
      {...others}
    >
      <CardSizeContext value={() => mergedProps.size}>{mergedProps.children}</CardSizeContext>
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Image = CardImage;
Card.Body = CardBody;
Card.Footer = CardFooter;
