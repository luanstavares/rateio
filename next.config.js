/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    prependData: `@import "./styles/variables.scss";`,
  },
};

module.exports = nextConfig;
