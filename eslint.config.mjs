import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: ["design/**"] },
  ...nextConfig,
];

export default config;
