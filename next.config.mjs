/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove the deprecated appDir: true line
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
}

export default nextConfig
