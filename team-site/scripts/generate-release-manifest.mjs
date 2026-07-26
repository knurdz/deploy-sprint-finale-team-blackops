import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const distDir = join(__dirname, '..', 'dist');

function resolveCommitSha() {
  try {
    return execSync('git rev-parse HEAD', { cwd: repoRoot }).toString().trim();
  } catch {
    return process.env.GITHUB_SHA ?? 'unknown';
  }
}

function completedTaskMarkers() {
  let submission;
  try {
    submission = readFileSync(join(repoRoot, 'SUBMISSION.md'), 'utf8');
  } catch {
    return [];
  }

  const tasks = new Set();
  for (const line of submission.split('\n')) {
    if (!/^\|\s*T\d+\s*\|/.test(line)) {
      continue;
    }
    const [, task, , evidence, notes] = line.split('|').map((cell) => cell.trim());
    if (evidence || notes) {
      tasks.add(task);
    }
  }

  return [...tasks].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}

const commitSha = resolveCommitSha();

const manifest = {
  task: 'T23',
  commit: commitSha,
  artifact: {
    distArtifact: `site-dist-${commitSha}`,
    dockerImage: `deploy-sprint/blackops:${commitSha}`,
  },
  workflowRun: process.env.GITHUB_RUN_ID ?? null,
  deployedAt: new Date().toISOString(),
  completedTasks: completedTaskMarkers(),
};

const manifestPath = process.env.RELEASE_MANIFEST_PATH || 'release-manifest.json';

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, manifestPath), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated release manifest at dist/${manifestPath} for commit ${commitSha}`);
