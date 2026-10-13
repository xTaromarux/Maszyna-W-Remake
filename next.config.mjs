import { fileURLToPath } from 'node:url';
const staticExport = process.env.NEXT_STATIC_EXPORT === '1';
const apiTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '');
const stripApiPrefix = process.env.API_PROXY_STRIP_PREFIX === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  reactStrictMode: true,
  output: staticExport ? 'export' : undefined,
  images: { unoptimized: true },
  devIndicators: false,
  ...(apiTarget && !staticExport
    ? {
        async rewrites() {
          return [
            { source: '/api/:path*', destination: `${apiTarget}${stripApiPrefix ? '' : '/api'}/:path*` },
            { source: '/health', destination: `${apiTarget}/health` },
          ];
        },
      }
    : {}),
};
export default nextConfig;
