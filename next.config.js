/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a different build output dir to avoid issues with a locked `.next` during development
  // This helps when .next contains locked/corrupted files on Windows (EPERM errors).
  distDir: '.next_dev',
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
