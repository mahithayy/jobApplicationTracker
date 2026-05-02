import type { NextConfig } from "next";

// We define our Content Security Policy (CSP) as a string, then format it.
// This tells the browser exactly what resources are allowed to load.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  cacheComponents: true,

  // This asynchronous function applies our headers to all routes (/(.*))
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevents clickjacking by blocking your site from loading in iframes
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevents the browser from guessing the MIME type
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // Protects where your referral data goes
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // Forces HTTPS
          },
        ],
      },
    ];
  },
};

export default nextConfig;