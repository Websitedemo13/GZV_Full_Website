import type { Metadata } from "next"
import PageBanner from "@/components/sections/common/PageBanner"
import PageBuilderRenderer from "@/components/PageBuilderRenderer"

export const metadata: Metadata = {
  title: "Dịch vụ - GZV",
  description: "Marketing, Sales và Digital Transformation theo mô hình triển khai thực chiến của GZV.",
}

export default function ServicesPage() {
  return (
    <>
      <PageBanner
        badge="Giải pháp thực chiến"
        title="Dịch vụ"
        subtitle="Marketing, Sales và Digital Transformation theo mô hình triển khai thực chiến của GZV."
      />
      <PageBuilderRenderer slug="dich-vu" />
    </>
  )
}
