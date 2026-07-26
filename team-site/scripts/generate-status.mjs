import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

function resolveCommitSha() {
  try {
    return execSync('git rev-parse HEAD', { cwd: join(__dirname, '..') })
      .toString()
      .trim();
  } catch {
    return process.env.GITHUB_SHA ?? 'unknown';
  }
}

const commitSha = resolveCommitSha();
const releaseId = process.env.GITHUB_RUN_ID ?? commitSha.slice(0, 7);
const teamName = process.env.TEAM_NAME ?? 'blackops';
const deployTime = new Date().toISOString();
const domainConnected = process.env.DOMAIN_CONNECTED === 'true';
const assignedDomain = process.env.ASSIGNED_DOMAIN ?? null;
const domainRecordType = process.env.DNS_RECORD_TYPE ?? null;
const publicUrlConfigured = Boolean(process.env.VITE_PUBLIC_URL || process.env.PUBLIC_URL);

const healthDir = join(distDir, 'health');
const statusDir = join(distDir, 'status');
mkdirSync(healthDir, { recursive: true });
mkdirSync(statusDir, { recursive: true });

writeFileSync(join(healthDir, 'index.html'), 'ok\n');

const status = {
  task: 'T01',
  team: teamName,
  commit: commitSha,
  releaseId: String(releaseId),
  deployTime,
  domain: {
    connected: domainConnected,
    host: assignedDomain,
    recordType: domainRecordType,
    verifiedAt: domainConnected ? deployTime : null,
  },
  config: {
    publicUrlConfigured,
    secretsRedacted: true,
  },
};

writeFileSync(join(statusDir, 'index.html'), `${JSON.stringify(status, null, 2)}\n`);

console.log(`Generated /health and /status for commit ${commitSha}`);
