# Feature Specification: Fix Firefox Browser Bugs

**Feature Branch**: `003-fix-firefox-bugs`

**Created**: 2026-05-15

**Status**: Draft

**Input**: User description: "fix following bugs: 1st the scientifc buttons are always visible, 2nd the typing via keyboard doesn't work. Both happened in firefox browser."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scientific Panel Visibility (Priority: P1)

A user opens the calculator in Firefox. The scientific button panel should be hidden until the user explicitly enables scientific mode. Currently the panel is always visible regardless of mode, cluttering the interface and confusing users.

**Why this priority**: Correctness of UI state is a fundamental expectation; an always-visible panel breaks the core mode-switching feature and affects all Firefox users.

**Independent Test**: Open the calculator in Firefox in a fresh tab. The scientific buttons panel must not be visible on page load. Toggle scientific mode on — panel appears. Toggle off — panel disappears.

**Acceptance Scenarios**:

1. **Given** the calculator loads in Firefox in simple mode, **When** the page is fully rendered, **Then** the scientific button panel is not visible.
2. **Given** the calculator is in simple mode, **When** the user clicks the "Scientific" mode toggle, **Then** the scientific button panel becomes visible.
3. **Given** the calculator is in scientific mode, **When** the user clicks the mode toggle again, **Then** the scientific button panel is hidden.
4. **Given** the calculator is in any mode, **When** the page is resized or the CSS re-evaluated, **Then** the panel visibility matches the current mode.

---

### User Story 2 - Keyboard Input Support (Priority: P2)

A user wants to enter calculations using the keyboard instead of clicking buttons. Currently, pressing number keys, operator keys, Enter, or Escape has no effect — the keyboard is completely non-functional as input.

**Why this priority**: Keyboard input is a usability requirement previously specified and implemented, but it does not work in Firefox. Simple-mode and scientific-mode users both need this to function.

**Independent Test**: Open the calculator in Firefox. Press keys 1, +, 2, Enter. The display must show "3". Press Escape — display resets to 0.

**Acceptance Scenarios**:

1. **Given** the calculator is open, **When** the user presses digit keys (0–9), **Then** those digits appear in the display.
2. **Given** a number is in the display, **When** the user presses +, -, *, /, **Then** the corresponding operator is selected and ready for the next operand.
3. **Given** two numbers and an operator are entered, **When** the user presses Enter or =, **Then** the result is evaluated and shown.
4. **Given** any state, **When** the user presses Escape, **Then** the calculator clears to its initial state.
5. **Given** any state, **When** the user presses Backspace, **Then** the last entered digit is removed (or display resets to 0 if single digit).
6. **Given** the calculator is open, **When** the user presses "." (period), **Then** a decimal point is appended to the current number.

---

### Edge Cases

- What happens when the user holds a key down (key repeat)? Each key-repeat event is treated as a new press.
- What happens if a key is pressed while the calculator is in an error state? Pressing Escape clears the error; other keys are ignored or start fresh.
- What happens on non-Latin keyboard layouts? Only standard ASCII keys for digits and operators are handled; non-mapped keys are ignored.
- What happens if the CSS `display` property conflicts with the `hidden` HTML attribute? The `hidden` attribute must always win and hide the element.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The scientific button panel MUST be hidden on page load when the calculator is in simple mode, in all supported browsers including Firefox.
- **FR-002**: The scientific button panel MUST become visible when scientific mode is activated and MUST be hidden when scientific mode is deactivated, regardless of CSS grid or other layout rules.
- **FR-003**: The `hidden` HTML attribute MUST take precedence over any CSS `display` property to ensure consistent cross-browser hide/show behavior.
- **FR-004**: The calculator MUST respond to keyboard input: digit keys (0–9), operator keys (+, -, *, /), caret (^) for power, period (.) for decimal, Enter for evaluate, Escape for clear.
- **FR-005**: Keyboard input MUST work in Firefox without requiring any browser-specific workarounds beyond standard DOM event handling.
- **FR-006**: Pressing Enter or "=" via keyboard MUST trigger evaluation the same as clicking the = button.
- **FR-007**: Pressing Escape via keyboard MUST clear the calculator the same as clicking the C button.
- **FR-008**: Pressing Backspace via keyboard MUST have a defined behavior (clear to 0 or remove last digit).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The scientific button panel is not visible in any browser (including Firefox) when the calculator starts in simple mode — verifiable on page load with no user interaction.
- **SC-002**: All digit and operator keyboard inputs produce the same result as clicking the corresponding buttons — verified by entering a multi-step calculation entirely via keyboard.
- **SC-003**: The Enter and Escape keys correctly evaluate and clear the calculator in Firefox — verified by end-to-end keyboard-only calculation.
- **SC-004**: No regression in existing click-based interaction after the fixes are applied — verified by completing all pre-existing quickstart scenarios using mouse clicks only.

## Assumptions

- The bugs are Firefox-specific but the fixes must not break behavior in other browsers (Chrome, Safari, Edge).
- Keyboard support applies to both simple mode and scientific mode.
- Backspace removes the last entered character from the current number; if the display is a single digit or "0", it resets to "0".
- No new UI elements are needed — fixes are purely in CSS and JavaScript event handling.
- The existing `data-action` attribute pattern in the HTML buttons is the canonical mapping that keyboard handlers should reference.
