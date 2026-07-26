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

const openWeatherCity = process.env.OPENWEATHER_CITY ?? 'Colombo';

async function fetchWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const base = {
    task: 'T07',
    provider: 'openweather',
    city: openWeatherCity,
    keyExposed: false,
  };

  if (!apiKey) {
    return { ...base, available: false };
  }

  try {
    const params = new URLSearchParams({
      q: openWeatherCity,
      appid: apiKey,
      units: 'metric',
    });
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`);
    if (!response.ok) {
      return { ...base, available: false };
    }
    const data = await response.json();
    return {
      ...base,
      available: true,
      temperatureC: data.main?.temp ?? null,
      condition: data.weather?.[0]?.main ?? null,
    };
  } catch {
    return { ...base, available: false };
  }
}

const weather = await fetchWeather();

const contactProvider = {
  task: 'T10',
  provider: 'web3forms',
  accessKeyStoredInSecret: Boolean(process.env.VITE_WEB3FORMS_ACCESS_KEY),
  targetEmailConfigured: Boolean(process.env.WEB3FORMS_TARGET_EMAIL),
};

function featureFlags() {
  return {
    task: 'T15',
    showInsights: process.env.FEATURE_SHOW_INSIGHTS === 'true',
    valueRedacted: true,
  };
}
const emailAlert = {
  task: 'T16',
  provider: process.env.EMAIL_PROVIDER || 'resend',
  configured: Boolean(process.env.RESEND_API_KEY),
  secretRedacted: true,
};

const healthDir = join(distDir, 'health');
const statusDir = join(distDir, 'status');
const weatherDir = join(distDir, 'api', 'weather');
const contactDir = join(distDir, 'api', 'contact');
const emailAlertDir = join(distDir, 'api', 'email-alert');
mkdirSync(healthDir, { recursive: true });
mkdirSync(statusDir, { recursive: true });
mkdirSync(weatherDir, { recursive: true });
mkdirSync(contactDir, { recursive: true });
mkdirSync(emailAlertDir, { recursive: true });

writeFileSync(join(healthDir, 'index.html'), 'ok\n');
writeFileSync(join(weatherDir, 'index.html'), `${JSON.stringify(weather, null, 2)}\n`);
writeFileSync(join(contactDir, 'index.html'), `${JSON.stringify(contactProvider, null, 2)}\n`);
writeFileSync(join(emailAlertDir, 'index.html'), `${JSON.stringify(emailAlert, null, 2)}\n`);

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
  weather,
  contact: contactProvider,
  features: featureFlags(),
  email: emailAlert,
};

writeFileSync(join(statusDir, 'index.html'), `${JSON.stringify(status, null, 2)}\n`);

console.log(`Generated /health and /status for commit ${commitSha}`);
