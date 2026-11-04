const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.resolve(
  __dirname,
  '../lib/rateio/participant-profile.ts',
);
const target = new Module(filename, module);
target._compile(
  ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  filename,
);
const { participantProfile } = target.exports;

test('uses the member name and stored Google picture URL', () => {
  assert.deepEqual(
    participantProfile({
      displayName: 'Maria',
      user: {
        name: 'Maria Júlia',
        pictureUrl: 'https://lh3.googleusercontent.com/profile',
      },
    }),
    {
      displayName: 'Maria',
      pictureUrl: 'https://lh3.googleusercontent.com/profile',
    },
  );
});

test('supports directory members with only a nested user profile', () => {
  assert.deepEqual(
    participantProfile({
      user: {
        name: 'Luan',
        pictureUrl: 'https://lh3.googleusercontent.com/luan',
      },
    }),
    {
      displayName: 'Luan',
      pictureUrl: 'https://lh3.googleusercontent.com/luan',
    },
  );
});

test('keeps anonymous names and uses a missing-picture fallback', () => {
  assert.deepEqual(
    participantProfile({ displayName: 'Convidado', user: null }),
    {
      displayName: 'Convidado',
      pictureUrl: null,
    },
  );
});

test('malformed and blank profile fields cannot become image URLs', () => {
  for (const value of [
    null,
    undefined,
    'invalid',
    {},
    { displayName: ' ', user: { name: '', pictureUrl: {} } },
    { user: { pictureUrl: ' ' } },
  ]) {
    assert.deepEqual(participantProfile(value), {
      displayName: 'Participante',
      pictureUrl: null,
    });
  }
});
