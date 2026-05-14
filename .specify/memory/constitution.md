<!--
Sync Impact Report
Version change: (template) → 1.0.0
Added sections: Core Principles, Technology Constraints, Quality Gates, Governance
Removed sections: none (initial version)
Templates updated: ✅ constitution.md written
Follow-up TODOs: none
-->

# Calculator Speckit Constitution

## Core Principles

### I. Zero-Dependency Plain Web Stack

The project MUST use only vanilla JavaScript, HTML, and CSS. No libraries, frameworks,
build tools, transpilers, bundlers, or package managers are permitted. The deliverable
is a set of static files that run directly in any modern browser without a build step.

### II. Minimal Token / Code Footprint

Every line of code must justify its existence. Prefer concise, direct expressions over
abstractions, helpers, or indirection that exist only for anticipated future needs.
YAGNI is non-negotiable. No polyfills for evergreen browser features.

### III. Test-Driven Development (NON-NEGOTIABLE)

Tests MUST be written before implementation code. The Red-Green-Refactor cycle is
strictly enforced:
1. Write a failing test that captures the requirement.
2. Write the minimum code to make it pass.
3. Refactor only while tests remain green.

Tests use a minimal in-repo test harness (plain JS, no test framework libraries).
Every logical unit of calculator behaviour MUST have a corresponding test.

### IV. CI Verification via GitHub Actions

All tests and static checks MUST pass in a GitHub Actions workflow on every push and
pull request. No code merges to the default branch unless the workflow is green.
The workflow MUST be self-contained — no external services, no secrets required for
the test suite.

## Technology Constraints

- **Languages**: HTML5, CSS3, ES2020+ (vanilla JS modules or single-file scripts)
- **Testing**: Custom in-repo test runner (plain JS assertions, no Jest/Mocha/etc.)
- **CI**: GitHub Actions (`ubuntu-latest`, no additional runners)
- **Browser target**: Latest stable Chrome, Firefox, Safari — no IE/legacy support

## Quality Gates

Every PR and push MUST pass:
1. All unit tests (run via Node.js in CI — test harness must be Node-compatible)
2. No JavaScript syntax errors (`node --check` or equivalent)
3. GitHub Actions workflow exits 0

## Governance

This constitution supersedes all other development guidance. Amendments require a
PR that updates this file, increments the version, and adjusts any affected templates
or workflow files.

- MAJOR bump: removal or redefinition of a core principle
- MINOR bump: new principle or section added
- PATCH bump: clarifications, wording, typo fixes

**Version**: 1.0.0 | **Ratified**: 2026-05-14 | **Last Amended**: 2026-05-14
