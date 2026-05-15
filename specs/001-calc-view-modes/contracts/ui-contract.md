# UI Contract: Calculator View Modes

**Phase**: 1 | **Branch**: `001-calc-view-modes` | **Date**: 2026-05-15

This document defines the HTML element interface — IDs, ARIA attributes, and expected behaviours — that `ui.js` must honour and that acceptance tests verify.

## Element Identifiers

| Element | Selector | Purpose |
|---------|----------|---------|
| Display output | `#display` | Shows `currentValue`; ARIA live region |
| Mode toggle button | `#mode-toggle` | Switches simple ↔ scientific |
| Mode status region | `#mode-status` | Hidden live region that announces mode changes |
| Simple button group | `#buttons-simple` | Contains basic arithmetic buttons; always visible |
| Scientific button group | `#buttons-scientific` | Contains extended function buttons; visible only in scientific mode |
| Calculator container | `#calculator` | Root widget element |

## ARIA Contract

### Display (`#display`)

```html
<output id="display" aria-live="polite" aria-atomic="true">0</output>
```

- Tag: `<output>` (semantic output element; implicitly has `role="status"`)
- `aria-live="polite"`: result announced without interrupting current speech
- `aria-atomic="true"`: entire value read on each update, not just the diff
- Content: always the current `state.currentValue` string

### Mode Toggle (`#mode-toggle`)

```html
<button id="mode-toggle" aria-pressed="false">Scientific</button>
```

- `aria-pressed="false"` when in simple mode; `aria-pressed="true"` when in scientific mode
- Visible label: "Scientific" — conveys what activating the button does
- `ui.js` must update `aria-pressed` on every toggle

### Mode Status (`#mode-status`)

```html
<div id="mode-status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

- Visually hidden (`.sr-only` utility class: `position:absolute; clip:rect(0,0,0,0)`)
- `ui.js` sets `textContent` to "Simple mode" or "Scientific mode" on each toggle
- Screen reader announces mode change immediately after toggle

### Scientific Button Group (`#buttons-scientific`)

```html
<div id="buttons-scientific" hidden>...</div>
```

- Uses native `hidden` attribute (not CSS `display:none`) so the element is removed from the accessibility tree in simple mode
- `ui.js` removes or sets the `hidden` attribute on mode toggle

### All Buttons

```html
<button type="button" data-action="..." >label</button>
```

- `type="button"` prevents accidental form submission
- `data-action` attribute used by `ui.js` as the event dispatch key (see Calc API contract)
- Visible text label is the accessible name; no `aria-label` unless label is a symbol with no agreed-upon text equivalent

## Mode Behaviour Contract

| Mode | `#buttons-scientific` | `#mode-toggle` aria-pressed |
|------|-----------------------|-----------------------------|
| simple | `hidden` present | `"false"` |
| scientific | `hidden` absent | `"true"` |

## Keyboard Contract

All interactive elements are native `<button>` elements. The browser handles:
- `Tab` / `Shift+Tab` — focus traversal
- `Enter` / `Space` — button activation

No custom key handlers are required. Tab order follows DOM order (left-to-right, top-to-bottom). The mode toggle button appears before the button grid in DOM order.

## Color Contrast Requirements

| Context | Minimum Ratio |
|---------|--------------|
| Display text (result digits) | 4.5:1 |
| Button labels (normal size) | 4.5:1 |
| Button labels if ≥ 18pt or ≥ 14pt bold | 3:1 |
| Focus indicator vs adjacent background | 3:1 |
| Button border / UI component | 3:1 |

These ratios must hold for all button states: default, hover, focus, active.

## CSS Centering Contract

```css
body {
  display: grid;
  place-items: center;
  min-height: 100svh;
  margin: 0;
}

#calculator-wrapper {
  max-height: 100svh;
  overflow-y: auto;
}
```

- `#calculator` must remain centered at viewport widths 360 px – 1280 px
- When scientific mode expands the calculator height beyond the viewport, `#calculator-wrapper` scrolls; centering is not broken
- No JavaScript required for centering
