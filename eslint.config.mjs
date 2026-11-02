import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ['node_modules/**', '.next/**', 'next-env.d.ts'],
  },
  {
    rules: {
      'no-alert': 'error',
    },
  },
];

export default eslintConfig;
