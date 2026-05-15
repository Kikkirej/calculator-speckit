# Feature Specification: Calculator View Modes

**Feature Branch**: `001-calc-view-modes`

**Created**: 2026-05-14

**Status**: Draft

**Input**: User description: "the calculator has two view modes. 1 simple, 1 scientific. it is always centered and following accessibility guidelines."

## User Scenarios & Testing

### User Story 1 - Simple Mode (Priority: P1)

A user opens the calculator and immediately sees a clean, minimal interface showing only the essential arithmetic operations: addition, subtraction, multiplication, and division. The calculator is centered on screen. The user can perform basic calculations without visual clutter.

**Why this priority**: This is the default experience all users encounter first. A functional simple mode is the minimum viable product.

**Independent Test**: Open the calculator, verify it displays in simple mode by default and is centered on screen, then perform a basic arithmetic calculation end-to-end.

**Acceptance Scenarios**:

1. **Given** the calculator is opened, **When** the page loads, **Then** simple mode is displayed by default and the calculator is centered on screen.
2. **Given** simple mode is active, **When** the user enters numbers and an operator, **Then** the correct result is displayed.
3. **Given** simple mode is active, **When** the user views the interface, **Then** only basic arithmetic controls are visible (+, −, ×, ÷, =, Clear).

---

### User Story 2 - Scientific Mode (Priority: P2)

A user who needs advanced mathematical functions can switch to scientific mode. Additional functions appear alongside the basic ones. The user can toggle back to simple mode at any time. The calculator remains centered in either mode.

**Why this priority**: Scientific mode extends the app's value for advanced users but the app is fully functional without it.

**Independent Test**: Toggle to scientific mode, verify the extended functions appear, use a scientific function (e.g. sine), and toggle back to confirm the simple mode restores.

**Acceptance Scenarios**:

1. **Given** simple mode is active, **When** the user activates the mode toggle, **Then** the calculator switches to scientific mode and extended functions become visible.
2. **Given** scientific mode is active, **When** the user uses an extended function (sine, logarithm, square root, exponent), **Then** the correct result is displayed.
3. **Given** scientific mode is active, **When** the user activates the mode toggle again, **Then** the calculator returns to simple mode and extended functions are hidden.
4. **Given** either mode is active, **When** the layout is viewed at any viewport size, **Then** the calculator remains centered.

---

### User Story 3 - Accessibility (Priority: P3)

A user relying on a keyboard or screen reader can operate the calculator fully in both modes. All controls are reachable by keyboard alone. Screen readers announce the current mode, all button labels, and calculation results. Color contrast meets established accessibility standards.

**Why this priority**: Accessibility is a cross-cutting quality concern that layers on top of the functional modes.

**Independent Test**: Using keyboard-only navigation, complete a multi-step calculation in both modes; verify all state changes are announced by a screen reader.

**Acceptance Scenarios**:

1. **Given** the calculator is loaded, **When** the user navigates using only keyboard (Tab, Enter, Space), **Then** every button in both modes is reachable and activatable.
2. **Given** a screen reader is active, **When** the user switches modes, **Then** the screen reader announces the new mode.
3. **Given** a screen reader is active, **When** a result is displayed, **Then** the screen reader announces the result.
4. **Given** any display conditions, **When** the calculator is viewed, **Then** all text and interactive elements meet WCAG 2.1 AA color contrast ratios (4.5:1 for body text, 3:1 for large text).

---

### Edge Cases

- What happens when the user resizes the browser window? The calculator must remain centered.
- How does the system handle division by zero? A clear, user-friendly error message is shown; the state can be cleared to continue.
- What happens to the current expression when the user switches modes? The current display value is preserved; any pending operation is cleared.
- How does the calculator behave on small screens (< 360 px wide)? The layout remains centered and all controls remain accessible.

## Requirements

### Functional Requirements

- **FR-001**: The calculator MUST display in simple mode by default when first opened.
- **FR-002**: The calculator MUST provide a clearly labeled control to toggle between simple and scientific modes.
- **FR-003**: In simple mode the calculator MUST support: addition, subtraction, multiplication, division, equals, and clear.
- **FR-004**: In scientific mode the calculator MUST provide all simple-mode operations PLUS: sine, cosine, tangent, base-10 logarithm, natural logarithm, square root, exponentiation (xʸ), and parentheses for grouping.
- **FR-005**: The calculator MUST always be centered horizontally and vertically within the viewport.
- **FR-006**: All interactive controls MUST be operable via keyboard alone (Tab to navigate, Enter/Space to activate).
- **FR-007**: The current mode state MUST be communicated to assistive technologies whenever it changes.
- **FR-008**: Calculation results MUST be announced to assistive technologies when displayed.
- **FR-009**: All text and interactive elements MUST meet WCAG 2.1 AA color contrast ratios.
- **FR-010**: Division by zero MUST display a user-friendly error message and allow the user to continue.

### Key Entities

- **Calculator State**: Tracks the current display value, the pending operator, the stored operand, the active mode, and whether an error is shown.
- **Mode**: An enumerated value — either "simple" (basic arithmetic) or "scientific" (basic + extended functions).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can switch between modes in one interaction (≤ 1 second response time).
- **SC-002**: The calculator is visually centered across all tested viewport sizes (mobile 360 px, tablet 768 px, desktop 1280 px).
- **SC-003**: All interactive elements pass WCAG 2.1 AA automated accessibility checks with zero violations.
- **SC-004**: A keyboard-only user can complete a multi-step calculation in both simple and scientific modes without using a mouse.
- **SC-005**: A screen reader user receives audible feedback for every state change: mode switch, result display, and error condition.

## Assumptions

- The calculator is a static, client-side application — no server interaction is needed.
- "Accessibility guidelines" means WCAG 2.1 Level AA as the minimum target.
- The display value is preserved when switching modes; any pending operator is cleared on mode switch.
- Trigonometric functions operate in degrees by default; a degrees/radians toggle is out of scope for this feature.
- Dark/light theme toggling is out of scope for this feature.
- Mobile is a supported viewport but desktop/tablet is the primary target for v1.
