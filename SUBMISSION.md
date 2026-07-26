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
| T03 |  |  |  |
| T04 |  | `.github/workflows/rollback.yml` — `workflow_dispatch` with required `release_ref` input; checks out that ref, rebuilds `team-site`, verifies the rebuilt `/status` commit matches the resolved SHA, then requests deploy from the organizer deployer with that SHA. Live rollback run evidence pending. | Starter snippet declared the input as `release_ref` but read it as `inputs.releaseRef` (camelCase) — GitHub Actions `inputs.*` lookups are exact-key, so the unmodified snippet always sees an empty value and fails at `test -n`. Fixed by using `inputs.release_ref` consistently and added SHA-resolution plus a build-matches-target check on top of the starter's diagnostic step. |
| T05 |  |  |  |
| T06 |  | `ci.yml` runs on `pull_request` and push to `main`, uses Node `${{ vars.NODE_VERSION \|\| '20' }}`, `npm ci` + `npm run build` in `team-site/`, uploads `team-site/dist` as `site-dist-${{ github.sha }}`. `deploy.yml` triggers via `workflow_run` after CI and only proceeds on `conclusion == 'success'`, so deployment already depends on this build. | This scaffold already existed from initial repo setup and satisfied every T06 requirement as-is; the only change was parameterizing the Node version via `vars.NODE_VERSION` (falls back to `20` if unset) instead of hardcoding it, per this task's credential pack. |
| T07 |  |  |  |
| T08 |  |  |  |
| T09 |  |  |  |
| T10 |  |  |  |
| T11 |  |  |  |
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
