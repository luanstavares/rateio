const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const target = new Module(filename, module);
  target.filename = filename;
  target.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = target.require.bind(target);
  target.require = (id) =>
    Object.hasOwn(overrides, id)
      ? overrides[id]
      : id === 'server-only'
        ? {}
        : original(id);
  target._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
  return target.exports;
}
const cookies = load('lib/auth/session-cookies.ts');
const pair = {
  accessToken: 'replacement-access',
  refreshToken: 'b'.repeat(64),
  expiresAt: new Date(Date.now() + 7776000000).toISOString(),
  accessExpiresAt: new Date(Date.now() + 86400000).toISOString(),
};
const request = () =>
  new NextRequest('http://localhost:3101/conta', {
    headers: { cookie: `rateio_refresh_token=${'a'.repeat(64)}` },
  });
function setup(apiResult) {
  const refresh = load('lib/auth/session-refresh.ts', {
    '../api/auth': { refreshApiSession: apiResult },
    './session-cookies': cookies,
  });
  const proxy = load('proxy.ts', {
    './lib/auth/session-refresh': refresh,
    './lib/auth/session-cookies': cookies,
  }).default;
  return { refresh, proxy };
}

test('one-day cookie lifetime follows API expiry and keeps HttpOnly protection', () => {
  const response = NextResponse.json({});
  cookies.setSessionCookies(response, pair);
  const cookie = response.cookies.get('rateio_access_token');
  assert(cookie.maxAge >= 86398 && cookie.maxAge <= 86400);
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.sameSite, 'lax');
});

test('successful refresh forwards new credentials into the same request', async () => {
  const { proxy } = setup(async () => ({ data: pair }));
  const response = await proxy(request());
  assert.equal(
    response.cookies.get('rateio_refresh_token').value,
    pair.refreshToken,
  );
  assert(
    response.headers
      .get('x-middleware-request-cookie')
      .includes(pair.accessToken),
  );
});

test('temporary upstream failure preserves cookies and returns a retryable response', async () => {
  const { proxy, refresh } = setup(async () => ({
    error: { kind: 'api', statusCode: 503 },
  }));
  assert.equal(
    (await refresh.refreshSessionTokens('a'.repeat(64))).kind,
    'unavailable',
  );
  const response = await proxy(request());
  assert.equal(response.status, 503);
  assert.equal(response.cookies.getAll().length, 0);
});

test('invalid refresh does not emit deletion cookies that can erase a concurrent renewal', async () => {
  const { proxy } = setup(async () => ({
    error: { kind: 'api', statusCode: 401 },
  }));
  const response = await proxy(request());
  assert.equal(response.cookies.getAll().length, 0);
  assert(
    !response.headers
      .get('x-middleware-request-cookie')
      .includes('a'.repeat(64)),
  );
});

test('legacy access JWT without session identity is renewed before rendering', async () => {
  let calls = 0;
  const { proxy } = setup(async () => {
    calls++;
    return { data: pair };
  });
  const legacy = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url')}.signature`;
  const req = new NextRequest('http://localhost:3101/conta', {
    headers: {
      cookie: `rateio_access_token=${legacy}; rateio_refresh_token=${'a'.repeat(64)}`,
    },
  });
  await proxy(req);
  assert.equal(calls, 1);
});

test('refresh endpoint returns safe status without exposing tokens or deleting newer cookies', async () => {
  const { rotateSession } = load('lib/auth/server-session.ts', {
    react: { cache: (fn) => fn },
    'next/headers': {
      cookies: async () => ({ get: () => ({ value: 'a'.repeat(64) }) }),
    },
    '../api/auth': {},
    './session-refresh': {
      refreshSessionTokens: async () => ({ kind: 'invalid' }),
    },
    './session-cookies': cookies,
  });
  const response = await rotateSession();
  assert.equal(response.status, 401);
  assert.equal(response.cookies.getAll().length, 0);
  assert.deepEqual(await response.json(), { success: false });
});

test('failed logout retains credentials and exposes failure instead of claiming success', async () => {
  const { logoutSession } = load('lib/auth/server-session.ts', {
    react: { cache: (fn) => fn },
    'next/headers': {
      cookies: async () => ({ get: () => ({ value: 'a'.repeat(64) }) }),
    },
    '../api/auth': {
      revokeApiSession: async () => ({ error: { kind: 'network' } }),
    },
    './session-refresh': {},
    './session-cookies': cookies,
  });
  const response = NextResponse.json({});
  await assert.rejects(() => logoutSession(response));
  assert.equal(response.cookies.getAll().length, 0);
});

test('browser refresh is shared across callers and serialized with logout operations', async () => {
  const originalFetch = global.fetch;
  const originalWindow = global.window;
  const descriptor = Object.getOwnPropertyDescriptor(global, 'navigator');
  const originalChannel = global.BroadcastChannel;
  let calls = 0;
  const order = [];
  global.window = new EventTarget();
  global.BroadcastChannel = class {
    postMessage() {}
    close() {}
  };
  Object.defineProperty(global, 'navigator', {
    configurable: true,
    value: { locks: { request: (_name, operation) => operation() } },
  });
  global.fetch = async () => {
    calls++;
    order.push('refresh');
    return new Response('{}', { status: 200 });
  };
  try {
    const client = load('lib/auth/session-client.ts');
    const all = Array.from({ length: 8 }, () => client.refreshBrowserSession());
    const logout = client.withSessionLock(async () => {
      order.push('logout');
    });
    assert((await Promise.all(all)).every(Boolean));
    await logout;
    assert.equal(calls, 1);
    assert.deepEqual(order, ['refresh', 'logout']);
  } finally {
    global.fetch = originalFetch;
    global.window = originalWindow;
    global.BroadcastChannel = originalChannel;
    if (descriptor) Object.defineProperty(global, 'navigator', descriptor);
    else delete global.navigator;
  }
});

function googleStartRoute() {
  return load('app/api/auth/google/route.ts', {
    '../../../../lib/api/server-config': {
      getServerApiBaseUrl: () => 'http://api:3000',
    },
    '../../../../lib/auth/session-cookies': cookies,
  }).GET;
}

test('server API clients read the internal URL at runtime and preserve authorization', () => {
  const previousInternal = process.env.API_INTERNAL_BASE_URL;
  const previousPublic = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://public.example.com';
    const serverConfig = load('lib/api/server-config.ts', {
      './config': load('lib/api/config.ts'),
    });
    const { createServerApiClient } = load('lib/api/server-client.ts', {
      './generated/client': { createClient: (options) => options },
      './server-config': serverConfig,
    });
    process.env.API_INTERNAL_BASE_URL = 'http://api:3000/';
    const client = createServerApiClient('server-token');
    assert.equal(client.baseUrl, 'http://api:3000');
    assert.equal(client.headers.Authorization, 'Bearer server-token');
    process.env.API_INTERNAL_BASE_URL = 'http://another-api:3000';
    assert.equal(createServerApiClient().baseUrl, 'http://another-api:3000');
    delete process.env.API_INTERNAL_BASE_URL;
    assert.equal(createServerApiClient().baseUrl, 'https://public.example.com');
    process.env.API_INTERNAL_BASE_URL = 'ftp://api:3000';
    assert.throws(() => serverConfig.getServerApiBaseUrl(), /HTTP or HTTPS/);
    process.env.API_INTERNAL_BASE_URL = 'not-a-url';
    assert.throws(() => serverConfig.getServerApiBaseUrl(), /valid URL/);
  } finally {
    if (previousInternal === undefined)
      delete process.env.API_INTERNAL_BASE_URL;
    else process.env.API_INTERNAL_BASE_URL = previousInternal;
    if (previousPublic === undefined)
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = previousPublic;
  }
});

test('Google sign-in redirects directly to Google while binding state and return path', async () => {
  const originalFetch = global.fetch;
  let state;
  global.fetch = async (url, options) => {
    assert.equal(url.origin, 'http://api:3000');
    assert.equal(url.pathname, '/auth/google');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.cache, 'no-store');
    assert(options.signal instanceof AbortSignal);
    state = url.searchParams.get('state');
    assert.match(state, /^[A-Za-z0-9_-]{43}$/);
    const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleUrl.searchParams.set('state', state);
    return new Response(null, {
      status: 302,
      headers: { location: googleUrl.href },
    });
  };
  try {
    const response = await googleStartRoute()(
      new NextRequest(
        'https://rateio.example.com/api/auth/google?returnTo=%2Fconta',
      ),
    );
    const destination = new URL(response.headers.get('location'));
    assert.equal(destination.origin, 'https://accounts.google.com');
    assert.equal(destination.searchParams.get('state'), state);
    assert.equal(response.cookies.get('rateio_oauth_state').value, state);
    assert.equal(response.cookies.get('rateio_oauth_state').httpOnly, true);
    assert.equal(
      response.cookies.get('rateio_oauth_return_to').value,
      '/conta',
    );
    assert.match(response.headers.get('cache-control'), /no-store/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('Google sign-in fails closed for unavailable or invalid upstream redirects', async (t) => {
  const cases = [
    [
      'network failure',
      async () => {
        throw new Error('API unavailable');
      },
    ],
    ['non-redirect response', async () => new Response('{}', { status: 200 })],
    ['missing location', async () => new Response(null, { status: 302 })],
    [
      'untrusted destination',
      async (url) =>
        new Response(null, {
          status: 302,
          headers: {
            location: `https://attacker.example/?state=${url.searchParams.get('state')}`,
          },
        }),
    ],
    [
      'insecure Google URL',
      async (url) =>
        new Response(null, {
          status: 302,
          headers: {
            location: `http://accounts.google.com/?state=${url.searchParams.get('state')}`,
          },
        }),
    ],
    [
      'mismatched state',
      async () =>
        new Response(null, {
          status: 302,
          headers: {
            location:
              'https://accounts.google.com/o/oauth2/v2/auth?state=wrong',
          },
        }),
    ],
  ];
  for (const [name, fetchResult] of cases) {
    await t.test(name, async () => {
      const originalFetch = global.fetch;
      global.fetch = fetchResult;
      try {
        const response = await googleStartRoute()(
          new NextRequest('https://rateio.example.com/api/auth/google'),
        );
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('location'), null);
        assert.equal(response.cookies.getAll().length, 0);
        assert.deepEqual(await response.json(), {
          error: 'Google sign-in is temporarily unavailable',
        });
      } finally {
        global.fetch = originalFetch;
      }
    });
  }
});

function googleCallbackRoute() {
  return load('app/api/auth/google/callback/route.ts', {
    '../../../../../lib/api/generated': {
      authControllerGoogleCallback: async () => ({ data: pair }),
    },
    '../../../../../lib/api/server-client': {
      createServerApiClient: () => ({}),
    },
    '../../../../../lib/api/errors': {
      normalizeApiResult: (result) => result,
    },
    '../../../../../lib/api/rateios': {},
    '../../../../../lib/auth/session-cookies': cookies,
  }).GET;
}

function callbackRequest(returnTo, state = 'valid-state') {
  return new NextRequest(
    `http://localhost:3000/api/auth/google/callback?code=test-code&state=${state}`,
    {
      headers: {
        host: 'rateio.example.com',
        'x-forwarded-host': 'rateio.example.com',
        'x-forwarded-proto': 'https',
        cookie: `rateio_oauth_state=valid-state; rateio_oauth_return_to=${encodeURIComponent(returnTo)}`,
      },
    },
  );
}

test('callback keeps redirects relative behind a reverse proxy', async () => {
  const response = await googleCallbackRoute()(
    callbackRequest('/conta?tab=settings'),
  );
  assert.equal(response.headers.get('location'), '/conta?tab=settings');
  assert.equal(
    response.cookies.get('rateio_access_token').value,
    pair.accessToken,
  );
  assert.equal(response.cookies.get('rateio_access_token').httpOnly, true);
  assert.match(response.headers.get('cache-control'), /no-store/);
});

test('callback errors preserve a relative return path without authenticating', async () => {
  const response = await googleCallbackRoute()(
    callbackRequest('/conta?tab=settings', 'wrong-state'),
  );
  assert.equal(
    response.headers.get('location'),
    '/conta?tab=settings&authError=oauth',
  );
  assert.equal(response.cookies.get('rateio_access_token'), undefined);
});

test('callback rejects external and protocol-relative return destinations', async () => {
  for (const returnTo of ['https://attacker.example', '//attacker.example']) {
    const response = await googleCallbackRoute()(callbackRequest(returnTo));
    assert.equal(response.headers.get('location'), '/');
  }
});

test('production realtime resolves to the public website even with a Docker API URL', () => {
  const previousMode = process.env.NODE_ENV;
  const previousPublic = process.env.NEXT_PUBLIC_API_BASE_URL;
  const previousLocation = Object.getOwnPropertyDescriptor(global, 'location');
  let socket;
  try {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://api:3000';
    Object.defineProperty(global, 'location', {
      configurable: true,
      value: new URL('https://rateio.example.com/rateios/example'),
    });
    const config = load('lib/api/config.ts');
    const { io } = require('socket.io-client');
    socket = io(config.getRealtimeUrl(), {
      autoConnect: false,
      forceNew: true,
      withCredentials: true,
    });
    assert.equal(new URL(socket.io.uri).origin, 'https://rateio.example.com');
    assert.equal(socket.nsp, '/rateios');
    assert.equal(socket.io.opts.path, '/socket.io');
    assert.equal(socket.io.opts.withCredentials, true);
    assert.equal(socket.connected, false);
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    assert.equal(config.getRealtimeUrl(), '/rateios');
  } finally {
    socket?.disconnect();
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
    if (previousPublic === undefined)
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = previousPublic;
    if (previousLocation)
      Object.defineProperty(global, 'location', previousLocation);
    else delete global.location;
  }
});

test('development realtime keeps using the separately running local API', () => {
  const previousMode = process.env.NODE_ENV;
  const previousPublic = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3300/backend/';
    const config = load('lib/api/config.ts');
    assert.equal(config.getRealtimeUrl(), 'http://localhost:3300/rateios');
  } finally {
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
    if (previousPublic === undefined)
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = previousPublic;
  }
});
