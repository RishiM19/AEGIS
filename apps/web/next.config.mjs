/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @aegis/contracts and @aegis/core ship TypeScript-built ESM from
  // sibling workspace packages; transpile them rather than requiring a
  // separate pre-publish build step for local/dev workflows.
  transpilePackages: ["@aegis/core", "@aegis/contracts"],
};

export default nextConfig;
