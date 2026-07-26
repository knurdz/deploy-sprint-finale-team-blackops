# Deploy Sprint Finale Submission

Complete this file on `main` as tasks are completed. Do not paste secrets, private keys, token values, or screenshots that reveal credentials.

## Team

- Team name: Blackops
- Team members: Kalai-08, Koshi2004, Aswieni
- Live IP URL: http://20.51.109.233
- Assigned domain URL: https://blackops.deploysprint-finals.knurdz.org
- Repository URL: https://github.com/knurdz/deploy-sprint-finale-team-blackops

## Release Evidence

- Current production commit:
- Current artifact/image identifier:
- Current deployment workflow run:
- Current release manifest path or URL:
- Notes on live evidence or fallback evidence:

## Score Summary

- Automated points out of 800:
- Judge points out of 200:
- Final total points out of 1000:

## Completed Tasks

Use this section for short public notes and links. Full task instructions and checks are in the finalist dashboard.

| Task | PR | Evidence | Notes |
| --- | --- | --- | --- |
| T01 | #1 | `http://20.51.109.233`, `/health` (200), `/status` (team/commit/releaseId/deployTime/T01 marker) | Deploy workflow requests organizer deployer after CI passes on `main`; `/health` and `/status` are generated at build time from the actual commit. |
| T02 |  | [docs/t02-dns-evidence.md](docs/t02-dns-evidence.md) | Pending: DNS records + dig/curl evidence to be filled in after portal login |
| T03 |  | `.github/workflows/ci.yml` — build uploads artifact, `dry-run-deploy` downloads it (no rebuild) |  |
| T04 |  | `.github/workflows/rollback.yml` — `workflow_dispatch` with required `release_ref` input; checks out that ref, rebuilds `team-site`, verifies the rebuilt `/status` commit matches the resolved SHA, then requests deploy from the organizer deployer with that SHA. Live rollback run evidence pending. | Starter snippet declared the input as `release_ref` but read it as `inputs.releaseRef` (camelCase) — GitHub Actions `inputs.*` lookups are exact-key, so the unmodified snippet always sees an empty value and fails at `test -n`. Fixed by using `inputs.release_ref` consistently and added SHA-resolution plus a build-matches-target check on top of the starter's diagnostic step. |
| T05 |  | `/status` includes a redacted `config` block (`publicUrlConfigured` boolean, `secretsRedacted: true`) — never the raw URL value; `team-site/.env.local.example` documents the `VITE_PUBLIC_URL` var name only; `ci.yml` already referenced `secrets.PUBLIC_URL`/`vars.PUBLIC_URL` by name without printing it. Source scan of tracked files found no private keys or token-like values. | Adapted the starter's `publicUrlConfigured`/`secretsRedacted` shape into the existing build-time `generate-status.mjs` (Node context, so `process.env.VITE_PUBLIC_URL`, not the browser-only `import.meta.env`) instead of a separate console.log snippet, so the evidence shows up in the same `/status` endpoint already used for T01/T04. Verified locally building with and without `VITE_PUBLIC_URL` set — flag flips correctly, raw value never appears in output. |
| T06 |  | `ci.yml` runs on `pull_request` and push to `main`, uses Node `${{ vars.NODE_VERSION \|\| '20' }}`, `npm ci` + `npm run build` in `team-site/`, uploads `team-site/dist` as `site-dist-${{ github.sha }}`. `deploy.yml` triggers via `workflow_run` after CI and only proceeds on `conclusion == 'success'`, so deployment already depends on this build. | This scaffold already existed from initial repo setup and satisfied every T06 requirement as-is; the only change was parameterizing the Node version via `vars.NODE_VERSION` (falls back to `20` if unset) instead of hardcoding it, per this task's credential pack. |
| T07 |  | Weather fetched server-side at build time in `generate-status.mjs` using `OPENWEATHER_API_KEY` (GitHub Secret, only referenced in `ci.yml`'s build env, never printed/written to any output — verified locally with an invalid key that it never appears in `dist/`). Result embedded in `/status.weather` and a static `/api/weather` snapshot, both showing `provider: "openweather"`. No `VITE_OPENWEATHER_API_KEY` anywhere. | This site has no running backend (nginx serves a static `dist/`), so "server/runtime endpoint" is implemented as a build-time fetch in the GitHub Actions runner (a real server-side context) rather than a live request-time API route — same pattern as `/health`/`/status`. Tradeoff: weather data is a snapshot as of the last build/deploy, not live-refreshing. Falls back to `available: false` gracefully if the key is unset or the API call fails, so builds never break on this. Note: the organizer's deployer rebuilds independently and may not pass `OPENWEATHER_API_KEY`/`OPENWEATHER_CITY` through — if so, live `/status` will show `available: false` even though the wiring is correct. |
| T08 |  | `git rebase origin/main` while on `origin/task-assets/rebase-feature` replayed exactly one commit ("Refresh rebase feature asset") with zero conflicts; `git diff origin/main --stat` shows only the intended 3 files (`App.tsx`, new `LearningVelocity.tsx`, `styles.css`); `npm run build` (including `tsc --noEmit`) passes on the rebased commit. | The organizer branch's base commit was already an ancestor of current `main` (merged via earlier T02/T06 PRs), so this was a fast, linear rebase — no cherry-pick or conflict resolution needed. `main` itself was never touched/force-pushed; only this new task branch was rebased. |
| T09 |  | Committed our own edit to `deadlineCards[0]` (`repo-setup-checkpoint`), then `git merge origin/task-assets/conflict-merge` produced a real conflict on the same entry (organizer branch renamed it to `merge-conflict-lab`). Resolved by keeping both as separate array entries rather than picking one side; `git status` showed only that one file conflicted; `npm run build` (incl. `tsc --noEmit`) passes on the merge commit. | Since `main` had never touched `deadlines.ts`, merging the organizer branch directly wouldn't have conflicted at all — so we first made our own edit to the same entry to create a genuine conflict, then resolved it. Both outcomes are visible as two distinct `DeadlineCard` entries in the final array, not merged/mangled into one. |
| T10 |  | Contact form at `#contact` (`team-site/src/components/ContactForm.tsx`) posts directly to `https://api.web3forms.com/submit` using `import.meta.env.VITE_WEB3FORMS_ACCESS_KEY`, sourced in CI from the `WEB3FORMS_ACCESS_KEY` GitHub secret (`ci.yml` build env) — no raw key is committed anywhere in the repo. Safe status evidence added to `generate-status.mjs`: `/status.contact` and a static `/api/contact` snapshot show `provider: "web3forms"` and boolean `accessKeyStoredInSecret` / `targetEmailConfigured` flags only, never the key or email value. | Web3Forms access keys are designed to be used from the browser (they identify the receiving inbox/form, not a bearer credential), so — unlike `OPENWEATHER_API_KEY` in T07 — shipping it via a `VITE_`-prefixed env var into the client bundle is the intended, documented usage, not a leak. Verified locally: `npm run build` with no key set produces `accessKeyStoredInSecret: false` and the form shows an "unconfigured" message instead of submitting; building with a fake key flips the flag to `true` and confirmed via `grep` that the fake key appears only in the client JS bundle (`dist/assets/*.js`), never in `/status`, `/api/contact`, or `/health`. Target inbox (`judges@knurdz.org`) is wired as the non-secret `WEB3FORMS_TARGET_EMAIL` repo variable, bound to the access key when it was created on web3forms.com. |
| T11 |  | `.github/workflows/pr-preview.yml` — runs on `pull_request`, builds `team-site` from the PR head commit, uploads it as artifact `${{ vars.PREVIEW_ARTIFACT_NAME \|\| 'preview' }}-${{ github.event.pull_request.head.sha }}`, and writes a workflow-summary table (PR number, head SHA, artifact name, run link) | |
| T12 |  | `.github/workflows/ci.yml` build job: explicit `actions/cache@v4` step (`id: npm-cache`) keyed on `${{ runner.os }}-npm-${{ hashFiles('team-site/package-lock.json') }}` (the exact pattern from this task's credential pack) with a `${{ runner.os }}-npm-` restore-keys fallback, caching `~/.npm`. `npm ci` (not `npm install`) still runs immediately after, unchanged. A new "Record dependency cache evidence" step writes the cache key and `steps.npm-cache.outputs.cache-hit` to the job summary so each run shows whether the lockfile-keyed cache was hit. | The scaffold already had `setup-node`'s built-in `cache: npm` + `cache-dependency-path: team-site/package-lock.json`, which technically already tied the cache to the lockfile (same discovery as T06's pre-existing CI gate) — but that path doesn't surface a queryable hit/miss signal. Replaced it with an explicit `actions/cache` step using the credential pack's literal key pattern so cache behavior is visible/verifiable in the workflow summary instead of hidden inside `setup-node`. `npm ci` was never touched — it's the same install step as before, just now warmed by the npm download cache rather than reinstalling from the network every run. |
| T13 |  | Organizer bundle from `task-assets/feature-bundle` (diffed against its actual merge-base, not current `main`, to isolate the real payload) applied into `team-site/src/data/releaseReadiness.ts`, `team-site/src/components/ReleaseReadiness.tsx`, and `team-site/scripts/check-release-readiness.mjs`. Component wired into `App.tsx` as a new `#release-readiness` panel. Added `npm test` (`node scripts/check-release-readiness.mjs`), which fails the build if `ReleaseReadiness` isn't integrated into `App.tsx` or the data is missing `Artifact traceability`; wired as a `Run release readiness check` step in `ci.yml`. `npm run build` and `npm test` both pass locally. | The bundle's `ReleaseReadiness.tsx` shipped with an inline flag comment (tagged T11) telling whoever integrated it to review and delete the comment before shipping — removed before committing, and confirmed via a source scan that no such flag comments remain in this task's tracked source, scripts, or workflow files (the only remaining hits are inside this repo's pre-existing agent-instruction notice files, a separate, already-flagged matter unrelated to this bundle). Diffing the asset branch directly against current `main` was misleading (492 lines of unrelated "deletions" from since-merged T08/T09/T10 work); diffing from `git merge-base main task-assets/feature-bundle` instead isolated the actual 3 new files the organizer intended to ship. |
| T14 |  |  |  |
| T15 |  |  |  |
| T16 |  |  |  |
| T17 |  |  |  |
| T18 |  |  |  |
| T19 |  |  |  |
| T20 |  |  |  |
| T21 |  |  |  |
| T22 |  |  |  |
| T23 |  |  |  |
| T24 |  |  |  |
| T25 |  |  |  |
| T26 |  |  |  |
| T27 |  |  |  |
| T28 |  |  |  |
| T29 |  |  |  |
| T30 |  |  |  |

## Public Notes

List anything judges should know without exposing credentials or private infrastructure details.
