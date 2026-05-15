# Feature Specification: Expanded Scientific Mode

**Feature Branch**: `002-expand-scientific`

**Created**: 2026-05-15

**Status**: Draft

**Input**: User description: "the scientifc view should have more buttons and including more complex logic like brackets, log, squareroot, etc..."

## User Scenarios & Testing

### User Story 1 - Bracketed Expressions (Priority: P1)

A user working on a multi-step calculation needs to control the order of operations. They can open a parenthesis, enter a sub-expression, close the parenthesis, then continue the outer expression. Pressing equals evaluates the full expression respecting all groupings. The display shows the expression being built (e.g., `(2+3)×`) so the user always knows where they are.

**Why this priority**: Parentheses are the defining capability that separates a scientific calculator from a basic one. Without them, complex expressions require manual reordering. This is the core new feature requested.

**Independent Test**: In scientific mode, enter `(2+3)×4=` and verify the result is 20, not 28 (which left-to-right evaluation without brackets would give for `2+3×4`).

**Acceptance Scenarios**:

1. **Given** scientific mode is active, **When** the user enters `(`, **Then** the display shows `(` and subsequent digits and operators are recorded inside the group.
2. **Given** an open parenthesis is pending, **When** the user enters a sub-expression and presses `)`, **Then** the display closes the group and the user can continue the outer expression.
3. **Given** the expression `(2+3)×4`, **When** the user presses `=`, **Then** the result shown is `20`.
4. **Given** the user presses `)` with no matching `(`, **When** the character is input, **Then** it is ignored and the display is unchanged.
5. **Given** the user presses `=` with one or more unclosed `(`, **When** evaluation is triggered, **Then** the unclosed groups are automatically closed and the expression is evaluated.
6. **Given** a sub-expression inside brackets results in division by zero, **When** the user presses `=`, **Then** the display shows a user-friendly error and the state can be cleared.

---

### User Story 2 - Additional Scientific Functions (Priority: P2)

A user performing scientific calculations needs access to common mathematical constants and functions that are not covered by the current button set. They can insert the value of π or e directly, compute percentages, take reciprocals (1/x), and compute factorials — all without leaving the calculator.

**Why this priority**: These functions are standard on physical and software scientific calculators. They extend the utility of scientific mode significantly and build on the existing button layout without requiring architectural changes.

**Independent Test**: In scientific mode, press `π` and verify the display shows approximately 3.141592654; then clear, enter `5`, press `!`, and verify the result is 120.

**Acceptance Scenarios**:

1. **Given** scientific mode is active, **When** the user presses the π button, **Then** the value 3.141592654 (10 significant figures) is inserted into the current expression.
2. **Given** scientific mode is active, **When** the user presses the e button, **Then** the value 2.718281828 (10 significant figures) is inserted into the current expression.
3. **Given** scientific mode is active and the display shows a non-negative integer, **When** the user presses `!`, **Then** the factorial is computed and displayed.
4. **Given** scientific mode is active and the display shows a non-zero number, **When** the user presses `1/x`, **Then** the reciprocal is computed and displayed.
5. **Given** scientific mode is active and the display shows a number, **When** the user presses `%`, **Then** the value is divided by 100 and displayed (e.g., `50 %` → `0.5`).
6. **Given** the user presses `!` on a negative number or non-integer, **Then** the display shows a user-friendly error.
7. **Given** the user presses `!` on a number greater than 170 (factorial overflow), **Then** the display shows a user-friendly error.

---

### User Story 3 - Degree / Radian Toggle (Priority: P3)

A user working with trigonometric functions in a scientific context can switch between degree and radian input modes. A visible indicator shows the current angle unit. The toggle persists until the user changes it again or clears the calculator.

**Why this priority**: Trigonometric functions currently assume degrees. Users working in radians (common in physics, engineering, and programming) will get wrong results without this toggle. It is lower priority because degree mode covers the most common casual use case.

**Independent Test**: Switch to radian mode, enter `π÷2`, press `sin`, and verify the result is 1 (sin(π/2 radians) = 1). Switch back to degree mode, enter `90`, press `sin`, and verify the result is also 1.

**Acceptance Scenarios**:

1. **Given** scientific mode is active, **When** the calculator loads or mode is toggled to scientific, **Then** degree mode is active by default and a `DEG` indicator is shown.
2. **Given** degree mode is active, **When** the user activates the angle toggle, **Then** the mode switches to radians and the indicator changes to `RAD`.
3. **Given** radian mode is active, **When** the user activates the angle toggle, **Then** the mode switches back to degrees and the indicator shows `DEG`.
4. **Given** radian mode is active, **When** the user enters `π÷2` and presses `sin`, **Then** the result is 1.
5. **Given** the user switches angle mode mid-calculation, **When** a trig function is applied, **Then** it uses the mode that is active at the moment the function button is pressed.

---

### Edge Cases

- What happens when parentheses are nested three or more levels deep (e.g., `((2+3)×(4+5))`)? All nesting levels evaluate correctly.
- What happens when the user presses `=` immediately after opening a `(`? The open bracket is discarded and the pending expression is evaluated as-is.
- What happens when `n!` is called with `0`? The result is `1` (0! = 1 by definition).
- What happens when `1/x` is called with `0`? The display shows a user-friendly error (division by zero).
- What happens when `π` or `e` is pressed immediately after another number (e.g., `2π`)? It is treated as implicit multiplication: `2×π`.
- What happens with very large factorial results that cannot be represented in 15 significant figures? The result is shown in scientific notation (e.g., `1.307674368e+12` for 15!).
- What happens when the user switches the angle unit while trig results are already on the display? The existing result is not recalculated; only future function calls use the new unit.

## Requirements

### Functional Requirements

- **FR-001**: In scientific mode, the calculator MUST provide `(` and `)` buttons for grouping sub-expressions.
- **FR-002**: Parentheses MUST respect standard mathematical order of operations (sub-expressions are evaluated before the outer expression).
- **FR-003**: The display MUST show the expression being built (including open parentheses) so the user can track nesting.
- **FR-004**: Pressing `)` with no matching `(` MUST be silently ignored.
- **FR-005**: Pressing `=` with unclosed `(` MUST automatically close all pending groups and evaluate the full expression.
- **FR-006**: In scientific mode, the calculator MUST provide a π button that inserts the value of pi (≥ 10 significant figures).
- **FR-007**: In scientific mode, the calculator MUST provide an e button that inserts Euler's number (≥ 10 significant figures).
- **FR-008**: In scientific mode, the calculator MUST provide a `!` (factorial) button that computes n! for non-negative integers ≤ 170.
- **FR-009**: In scientific mode, the calculator MUST provide a `1/x` button that computes the reciprocal of the current value.
- **FR-010**: In scientific mode, the calculator MUST provide a `%` button that divides the current value by 100.
- **FR-011**: The scientific mode MUST include a degree/radian toggle that controls how trigonometric functions interpret their input.
- **FR-012**: The active angle unit (DEG or RAD) MUST be visibly indicated on screen whenever scientific mode is active.
- **FR-013**: The degree/radian setting MUST default to degree mode when scientific mode is first activated.
- **FR-014**: Pressing `!` on a negative number, non-integer, or value greater than 170 MUST display a user-friendly error message; the state can be cleared to continue.
- **FR-015**: All new scientific buttons MUST be keyboard-accessible and meet WCAG 2.1 AA color contrast requirements, consistent with existing buttons.

### Key Entities

- **ExpressionBuffer**: The sequence of tokens (numbers, operators, open/close parentheses) currently being entered. Replaces the simple `currentValue` string for complex expression tracking.
- **ParenthesisDepth**: A counter tracking how many `(` have been opened without a matching `)`. Used to validate input and auto-close on `=`.
- **AngleUnit**: An enumerated value — either `"degrees"` or `"radians"`. Controls how sin, cos, tan interpret their numeric input.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can enter and evaluate a three-level nested parenthesised expression (e.g., `((1+2)×(3+4))÷7`) in under 30 seconds.
- **SC-002**: All 8 new function buttons (π, e, !, 1/x, %, (, ), DEG/RAD toggle) are reachable by keyboard alone using Tab and Enter/Space.
- **SC-003**: Switching between degree and radian mode takes exactly one interaction (≤ 1 second response).
- **SC-004**: All error states (unmatched brackets, factorial overflow, divide by zero in sub-expression) display a clear, non-technical message and allow the user to recover by pressing Clear.
- **SC-005**: Existing simple-mode and scientific-mode calculations that worked before this feature continue to produce correct results (zero regression).

## Assumptions

- The existing simple/scientific dual-mode architecture is preserved; all new buttons appear only in scientific mode.
- `π` and `e` inserted mid-expression are treated as numeric tokens (implicit multiplication is applied when they immediately follow another number).
- Factorial is defined only for non-negative integers ≤ 170; inputs outside this range produce an error, not a truncated/rounded result.
- The `%` button is a unary operator (divides current value by 100), not a binary modulo operator.
- The degree/radian setting is not persisted across page reloads; it resets to degrees on each load.
- Keyboard shortcuts for new buttons follow the same convention as existing buttons (visible label = accessible name).
- Brackets support arbitrary nesting depth within what can be reasonably displayed on screen.
