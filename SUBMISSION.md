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
| T10 |  |  |  |
| T11 |  | `.github/workflows/pr-preview.yml` — runs on `pull_request`, builds `team-site` from the PR head commit, uploads it as artifact `${{ vars.PREVIEW_ARTIFACT_NAME \|\| 'preview' }}-${{ github.event.pull_request.head.sha }}`, and writes a workflow-summary table (PR number, head SHA, artifact name, run link) | |
| T12 |  |  |  |
| T13 |  |  |  |
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
