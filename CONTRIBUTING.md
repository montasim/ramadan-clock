# Contributing to Ramadan Clock

Thank you for helping make Ramadan Clock more dependable and useful.

## Before you begin

- Search existing issues before creating a new one.
- Open an issue before starting a large or behavior-changing contribution.
- Never include credentials, production data, or private user information.
- Treat prayer-time changes as accuracy-sensitive: document the source, method, district, date, and expected difference.

## Local development

1. Fork and clone the repository.
2. Install Node.js 24 LTS and pnpm 11.7.0.
3. Run `pnpm install`.
4. Copy `.env.example` to `.env.local` and provide development values.
5. Run `pnpm db:generate` and `pnpm db:push`.
6. Start the application with `pnpm dev`.

## Making a change

Create a focused branch:

```bash
git switch -c feature/short-description
```

Keep changes scoped, preserve existing behavior outside the issue, and add or update tests for domain logic. Before opening a pull request, run:

```bash
pnpm lint
pnpm type-check
pnpm test
```

Use a clear commit message and complete the pull-request template. Include screenshots for visible changes and reproduction details for bug fixes.

## Reporting schedule discrepancies

Include all of the following:

- District and Gregorian date
- Displayed Sehri or Iftar time
- Expected time
- Trusted local timetable or authority
- Calculation method or adjustment, when known

This information is necessary because calculated times may legitimately differ by method and local convention.
