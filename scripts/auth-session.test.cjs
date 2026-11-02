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
