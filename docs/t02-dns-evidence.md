# T02 - DNS Evidence

Fill this in after creating records in the organizer DNS portal (finalist dashboard). Do not paste portal passwords, API tokens, or the TXT challenge value here.

## Records Created

- Assigned domain:
- Record type (A/CNAME):
- Record name:
- Record value (redacted if it's a private origin host):
- TXT record name:
- TXT record verified: yes/no (do not paste the token value)

## DNS Lookup Output

```text
$ dig <assigned-domain>
<paste output here>

$ dig TXT _deploy-sprint-challenge.<assigned-domain>
<paste output here>
```

## HTTP/HTTPS Compatibility Check

```text
$ curl -I http://<assigned-domain>/health
<paste output here>

$ curl -I https://<assigned-domain>/health
<paste output here>

$ curl -I http://<vps-ip>/health
<paste output here>
```

## Repo Variables Set

After the portal automation (or manually via GitHub Settings > Secrets and variables > Actions > Variables), confirm these are set so `/status` reports `domain.connected=true`:

- `DOMAIN_CONNECTED=true`
- `ASSIGNED_DOMAIN=<assigned-domain>`
- `DNS_RECORD_TYPE=A` (or `CNAME`)
- `PUBLIC_URL` / `DOMAIN_PUBLIC_URL` updated to the HTTPS assigned domain

## Portal Export / Screenshot

Attach a redacted portal screenshot or export (no password/token visible) here or link it in the PR.
