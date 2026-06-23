import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"

export const metadata: Metadata = {
  
  title: "Giới thiệu - GZV Center",
  description: "Tìm hiểu về GZV Center - Trung tâm đào tạo và phát triển kỹ năng chuyên nghiệp hàng đầu Việt Nam",
}

export default function AboutPage() {
  return <AboutPageClient />
}
