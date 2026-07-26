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

mkdirSync(distDir, { recursive: true });

writeFileSync(join(distDir, 'health'), 'ok\n');

const status = {
  task: 'T01',
  team: teamName,
  commit: commitSha,
  releaseId: String(releaseId),
  deployTime,
};

writeFileSync(join(distDir, 'status'), `${JSON.stringify(status, null, 2)}\n`);

console.log(`Generated /health and /status for commit ${commitSha}`);
