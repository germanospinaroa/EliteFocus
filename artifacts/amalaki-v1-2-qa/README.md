# Amalaki V1.2 QA evidence

Date: 2026-10-27

## Automated checks

- `npm test`: PASS — 11 files, 34 tests.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS — 35 routes generated.
- `git diff --check`: PASS.
- Editorial scan for the removed generic phrases: PASS.

## Functional assertions covered by tests

- CO and US resolve explicitly; unknown market remains explicit.
- CO nutrition (`18 kcal`) never appears in US content.
- US nutrition (`25 cal`) never appears in CO content.
- The three explanation levels are distinct and the full level includes product knowledge.
- UNKNOWN has no market-specific nutrition or regulatory content.

## Browser evidence

The local development server started at `http://localhost:3000`, but the available Chrome DevTools bridge could not start because Chrome is running as root in this environment. No screenshot is claimed from this run. The protected catalog route also requires an authenticated QA fixture session, which was not available locally.

The previous visual baselines remain in `artifacts/amalaki-v1-qa/` and `artifacts/amalaki-v1-1-qa/`; they are not presented as V1.2 screenshots.

## Remaining production QA

Run the authenticated fixture matrix against preview/production with the existing `scripts/qa-fixtures.ts`: VIP CO → US → CO, Ambassador CO → US, and UNKNOWN → each market. Capture 390×844 and desktop screenshots, console/network results, `/login`, and the protected catalog route after deployment.
