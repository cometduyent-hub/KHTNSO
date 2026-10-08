/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Bỏ qua lỗi TypeScript khi build trên Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bỏ qua cả lỗi ESLint khi build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
