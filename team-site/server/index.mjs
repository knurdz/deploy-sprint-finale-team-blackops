import crypto from 'node:crypto';
import express from 'express';
import session from 'express-session';

const PORT = process.env.AUTH_PORT ?? 3000;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ??
  'https://blackops.deploysprint-finals.knurdz.org/auth/google/callback';
const SCOPES = process.env.GOOGLE_SCOPES ?? 'openid email profile';

const configured = Boolean(CLIENT_ID && CLIENT_SECRET && SESSION_SECRET);

const app = express();
app.set('trust proxy', true);

app.use(
  session({
    // Falls back to an ephemeral per-process secret only so the server can
    // still start and report configured: false in local/dry-run use --
    // sessions from a real deploy always need the real SESSION_SECRET.
    secret: SESSION_SECRET ?? crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Defaults to secure (required behind the real HTTPS redirect URI);
      // only relaxed when explicitly opted out, for local HTTP testing.
      secure: process.env.COOKIE_SECURE !== 'false',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    },
  }),
);

app.get('/auth/google', (req, res) => {
  if (!CLIENT_ID) {
    return res.status(503).json({
      task: 'T20',
      provider: 'google',
      ready: false,
      secretExposed: false,
      error: 'GOOGLE_CLIENT_ID is not configured',
    });
  }

  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.session.oauthState;
  delete req.session.oauthState;

  if (!state || !expectedState || state !== expectedState) {
    return res.status(400).json({
      task: 'T20',
      provider: 'google',
      ready: false,
      secretExposed: false,
      error: 'invalid_state',
    });
  }

  if (!code) {
    return res.status(400).json({
      task: 'T20',
      provider: 'google',
      ready: false,
      secretExposed: false,
      error: 'missing_code',
    });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(503).json({
      task: 'T20',
      provider: 'google',
      ready: false,
      secretExposed: false,
      error: 'oauth_not_configured',
    });
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      // Never forward Google's error body: on some failure modes it can
      // echo back request parameters, which is exactly what we must not
      // expose to the client.
      return res.status(502).json({
        task: 'T20',
        provider: 'google',
        ready: false,
        secretExposed: false,
        error: 'token_exchange_failed',
      });
    }

    const tokens = await tokenResponse.json();

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      return res.status(502).json({
        task: 'T20',
        provider: 'google',
        ready: false,
        secretExposed: false,
        error: 'profile_fetch_failed',
      });
    }

    const profile = await profileResponse.json();

    req.session.user = {
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
    };

    res.redirect('/');
  } catch {
    res.status(500).json({
      task: 'T20',
      provider: 'google',
      ready: false,
      secretExposed: false,
      error: 'server_error',
    });
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

app.get('/auth/me', (req, res) => {
  res.json({
    task: 'T20',
    provider: 'google',
    authenticated: Boolean(req.session.user),
    user: req.session.user
      ? { email: req.session.user.email, name: req.session.user.name }
      : null,
  });
});

app.get('/status/auth', (req, res) => {
  res.json({
    task: 'T20',
    provider: 'google',
    configured,
    secretExposed: false,
    redirectUri: REDIRECT_URI,
    scopes: SCOPES,
  });
});

app.listen(PORT, () => {
  console.log(`Auth server listening on ${PORT} (configured: ${configured})`);
});
