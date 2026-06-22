/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Cấu hình biến môi trường
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 2. Cấu hình Headers (Xử lý CORS)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // 3. Cấu hình REDIRECTS (Thêm link chuyển hướng của GZV tại đây)
  async redirects() {
    return [
      // Ví dụ: { source: '/old-link', destination: '/new-link', permanent: true },
    ]
  },

  // 4. Cấu hình tối ưu hóa hình ảnh
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'fowjalibpmzyeyjcgbrx.supabase.co', // Đã cập nhật domain GZV
      },
    ],
  },
}

module.exports = nextConfig