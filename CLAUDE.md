# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- **Dev server:** `npm run dev` (Vite with HMR)
- **Build:** `npm run build` (runs `tsc -b && vite build`, outputs to `dist/`)
- **Lint:** `npm run lint` (ESLint flat config, TS/TSX files only)
- **Preview production build:** `npm run preview`

No test framework is configured.

## Architecture

React 19 + TypeScript + Vite SPA using **Fluent UI v9** (`@fluentui/react-components`). Simulates an Azure Portal-style "API Hub" experience — all backend interactions are mocked with `setTimeout` delays (no real HTTP calls, no API client).

### Entry & Layout

- `src/main.tsx` — mounts app in `FluentProvider` with `webLightTheme`
- `src/App.tsx` — two-column flex layout: `Sidebar` (left, 220px) + `ApiHub` (right, scrollable)

### Component Structure

- `src/components/Sidebar.tsx` — Azure Portal-style left nav, embeds `ChatWidget`, animates width when chat expands
- `src/components/ChatWidget.tsx` — collapsible AI chat panel with hardcoded demo responses
- `src/components/v2/` — **active UI components:**
  - `ApiHub.tsx` — three-tab container (API Management, API Definition, CORS)
  - `ApiManagementTab.tsx` — most complex component; three states (not-linked → linking → linked) with hero banner, features grid, cascading dropdowns, animated progress, and linked summary
  - `ApiDefinitionTab.tsx` — OpenAPI spec URL configuration form
  - `CorsTab.tsx` — dynamic CORS origins list with validation and credentials conflict detection
- `src/components/` (root-level, non-v2) — older v1 components (PageHeader, LinkForm, LinkedView, etc.), currently unused by App.tsx

### Key Patterns

- No routing library — tab switching is pure `useState` in `ApiHub`
- No state management library — all state via `useState`/`useCallback`
- All styles use Fluent UI v9 `makeStyles()` with Griffel (CSS-in-JS)
- Components import from `@fluentui/react-components` and `@fluentui/react-icons`
- ESM project (`"type": "module"` in package.json)

## TypeScript

Strict mode enabled with additional checks: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `erasableSyntaxOnly`. Target ES2023.

## Deployment

Two Azure Static Web Apps deployments via GitHub Actions (push to `main` triggers both). The `dist/` folder is committed to the repo. SWA auto-detects and builds the Vite app.

## Fluent UI v9 Conventions

Always wrap the app root in `<FluentProvider theme={webLightTheme}>`. Use `makeStyles()` for styling — never inline styles or CSS modules. Import components individually from `@fluentui/react-components`. See `.claude/skills/fluentui/SKILL.md` for detailed component patterns and best practices.
