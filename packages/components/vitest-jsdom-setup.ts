// jsdom has no Popover API, which the overlays call (the browser baseline has it; ADR 0010). These stand-ins only
// record whether an element is shown, in `data-test-popover-open`: anything about the top layer itself is tested in
// the browser project.
if (typeof HTMLElement !== 'undefined' && !('showPopover' in HTMLElement.prototype)) {
  Object.assign(HTMLElement.prototype, {
    showPopover(this: HTMLElement) {
      this.setAttribute('data-test-popover-open', '');
    },
    hidePopover(this: HTMLElement) {
      this.removeAttribute('data-test-popover-open');
    },
    togglePopover(this: HTMLElement, force?: boolean) {
      const open = force ?? !this.hasAttribute('data-test-popover-open');
      this.toggleAttribute('data-test-popover-open', open);
      return open;
    },
  });
}

// Nor does it have a modal `<dialog>`. These open and close it, without the top layer or inertness, which are tested
// in the browser project.
if (typeof HTMLDialogElement !== 'undefined' && !('showModal' in HTMLDialogElement.prototype)) {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
    close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
}

// Nor `checkVisibility`, which finding the focusable elements calls; jsdom lays nothing out, so connected counts.
if (typeof Element !== 'undefined' && !('checkVisibility' in Element.prototype)) {
  Object.assign(Element.prototype, {
    checkVisibility(this: Element) {
      return this.isConnected;
    },
  });
}

// Nor `scrollIntoView`, which the combobox calls to bring the active option into view; jsdom lays nothing out, so
// there's nothing to scroll. Scrolling is tested in the browser project.
if (typeof Element !== 'undefined' && !('scrollIntoView' in Element.prototype)) {
  Object.assign(Element.prototype, {
    scrollIntoView() {},
  });
}
