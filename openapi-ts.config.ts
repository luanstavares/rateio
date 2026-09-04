import { defineConfig } from '@hey-api/openapi-ts';

const openApiSource =
  process.env.OPENAPI_SOURCE?.trim() ?? 'http://localhost:3000/openapi.json';

export default defineConfig({
  input: openApiSource,
  output: 'lib/api/generated',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    {
      name: '@hey-api/sdk',
      auth: false,
    },
  ],
});
