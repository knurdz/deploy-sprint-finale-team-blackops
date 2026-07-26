import { appendFileSync } from 'node:fs';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL ?? 'Deploy Sprint <alerts@knurdz.org>';
const to = process.env.ALERT_RECIPIENT_EMAIL ?? 'judges@knurdz.org';
const provider = process.env.EMAIL_PROVIDER ?? 'resend';
const sha = process.env.DEPLOY_SHA ?? 'unknown';
const runId = process.env.SOURCE_RUN_ID ?? 'unknown';

const subject = `Deploy Sprint - blackops - ${sha === 'unknown' ? sha : sha.slice(0, 7)}`;
const text = `Team blackops requested a deploy for commit ${sha}.\nSource CI run: ${runId}.`;

function recordEvidence(mode, extra = {}) {
  const lines = [
    '### Deploy alert',
    '',
    '| Field | Value |',
    '|---|---|',
    `| Task | \`T16\` |`,
    `| Provider | \`${provider}\` |`,
    `| Configured | \`${Boolean(apiKey)}\` |`,
    `| Secret redacted | \`true\` |`,
    `| From | \`${from}\` |`,
    `| To | \`${to}\` |`,
    `| Subject | \`${subject}\` |`,
    `| Mode | \`${mode}\` |`,
    ...Object.entries(extra).map(([key, value]) => `| ${key} | \`${value}\` |`),
    '',
  ].join('\n');

  console.log(lines);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(summaryPath, `${lines}\n`);
  }
}

if (!apiKey) {
  recordEvidence('dry-run (RESEND_API_KEY not set)');
  process.exit(0);
}

try {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!response.ok) {
    // Never log the response body here: some providers echo request
    // details (including auth hints) in error payloads.
    recordEvidence('send-failed', { 'HTTP status': response.status });
    process.exit(0);
  }

  const data = await response.json();
  recordEvidence('sent', { 'Resend message id': data.id ?? 'unknown' });
} catch (error) {
  recordEvidence('send-error', { error: error.message });
  process.exit(0);
}
