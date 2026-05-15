---
description: "GitHub Pages deployment tasks for Calculator View Modes"
---

# Tasks: Calculator View Modes — GitHub Pages Deployment

**Input**: Design documents from `/specs/001-calc-view-modes/`

**Context**: Core calculator implementation (Simple Mode, Scientific Mode, Accessibility) is already complete. These tasks cover only the GitHub Pages deployment addition described in the updated `plan.md`.

**TDD**: No new calculator logic → no new tests required. The existing `test` job gates deployment via `needs: test`.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- No `[Story]` labels — deployment is cross-cutting infrastructure, not tied to a specific user story

---

## Phase 1: Setup (Repository Configuration)

**Purpose**: One-time manual configuration in GitHub to enable Pages deployment

- [ ] T001 Enable GitHub Pages in repository settings — go to Settings → Pages → set Source to "GitHub Actions" (must be done before the first deploy job can succeed; no code change required)

---

## Phase 2: Deployment Infrastructure

**Purpose**: Add the deploy job and supporting file to the project

- [X] T002 Update .github/workflows/ci.yml — add `deploy` job after the existing `test` job with: `needs: test`; `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`; `permissions: pages: write, id-token: write`; `environment: name: github-pages, url: ${{ steps.deployment.outputs.page_url }}`; steps: `actions/checkout@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` with `path: '.'`, `actions/deploy-pages@v4` with `id: deployment`
- [X] T003 [P] Create .nojekyll file at repo root (empty file) — suppresses Jekyll processing on GitHub Pages and prevents `_` prefixed paths from being ignored; speeds up deploy by skipping the Jekyll build step

---

## Phase 3: Polish & Validation

**Purpose**: Confirm the deployment is live and the quickstart URL is accurate

- [ ] T004 Push changes to main branch and verify the GitHub Actions `deploy` job completes with a green checkmark in the Actions tab; confirm the calculator is live at the GitHub Pages URL shown in the job output (`steps.deployment.outputs.page_url`)

---

## Dependencies & Execution Order

- **T001** (manual): Do once in GitHub UI before merging; no code dependency
- **T002** and **T003** can be done in parallel (different files)
- **T004** depends on T001 + T002 + T003 all being complete and pushed to main

---

## Parallel Execution Example

```
Manual:     T001 (GitHub UI — enable Pages source)
Parallel:   T002 ci.yml update  ║  T003 .nojekyll file
Sequential: T004 push → verify live deploy
```

---

## Notes

- The `upload-pages-artifact` action with `path: '.'` uploads the entire repo root. GitHub Pages will serve `index.html` automatically.
- The `id-token: write` permission enables OIDC authentication — no Personal Access Token or deploy key required.
- The deploy job only runs on `push` to `main`; PRs run only the `test` job.
- T001 is a one-time setup step; once Pages is enabled it persists across future pushes.
