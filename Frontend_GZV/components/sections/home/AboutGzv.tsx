"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SectionIntro from "@/components/sections/common/SectionIntro"
import { supabase } from "@/lib/api-supabase"

export interface AboutGzvProps {
  eyebrow?: string
  title?: string
  subtitle?: string
  body?: string
  image_url?: string
  image_alt?: string
  position_x?: number
  position_y?: number
  image_size?: number
  button_label?: string
  button_url?: string
}

export default function AboutGzv({
  eyebrow: propEyebrow,
  title: propTitle,
  subtitle: propSubtitle,
  body: propBody,
  image_url: propImageUrl,
  image_alt: propImageAlt,
  position_x: propPositionX,
  position_y: propPositionY,
  image_size: propImageSize,
  button_label: propButtonLabel,
  button_url: propButtonUrl,
}: AboutGzvProps) {
  const [dbData, setDbData] = useState<any>(null)

  useEffect(() => {
    if (propTitle || propBody) return

    let active = true
    supabase
      .from("site_page_blocks")
      .select("props")
      .in("component_type", ["about_gzv", "story_split"])
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data?.props) {
          setDbData(data.props)
        }
      })

    return () => {
      active = false
    }
  }, [propTitle, propBody])

  const title = propTitle ?? dbData?.title ?? "CÂU CHUYỆN GZV"
  const subtitle = propSubtitle ?? dbData?.subtitle ?? "Từ một cộng đồng học hỏi đến hệ sinh thái triển khai thực chiến."
  const body = propBody ?? dbData?.body ?? dbData?.description ?? "GZV được xây dựng để kết nối thế hệ trẻ, chuyên gia và doanh nghiệp trong cùng một môi trường học tập - làm thật - tạo tác động thật. Chúng tôi tin rằng năng lực chỉ bền vững khi được rèn trong dự án thực tế, dưới sự đồng hành của những người có kinh nghiệm."
  const imageUrl = propImageUrl ?? dbData?.image_url ?? "/gioi-thieu/19.webp"
  const imageAlt = propImageAlt ?? dbData?.image_alt ?? title ?? "GZV"
  const positionX = propPositionX ?? dbData?.position_x ?? 50
  const positionY = propPositionY ?? dbData?.position_y ?? 50
  const imageSize = propImageSize ?? dbData?.image_size ?? 100
  const buttonLabel = propButtonLabel ?? dbData?.button_label ?? "Xem chi tiết"
  const buttonUrl = propButtonUrl ?? dbData?.button_url ?? "/gioi-thieu"

  return (
    <section className="bg-white py-16 dark:bg-slate-950 lg:py-24">
      <div className="container grid gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <SectionIntro title={title} subtitle={subtitle} align="left" />
          {body && <div className="max-w-3xl whitespace-pre-line text-base font-semibold leading-8 text-slate-600 dark:text-slate-300">{body}</div>}
          <div className="mt-8">
            <Link href={buttonUrl || "/gioi-thieu"}>
              <Button className="h-12 rounded-xl bg-[#ed1c24] px-8 text-sm font-black uppercase text-white hover:bg-[#c91218] transition">
                {buttonLabel || "Xem chi tiết"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
            style={{ objectPosition: `${Number(positionX)}% ${Number(positionY)}%`, transform: `scale(${Number(imageSize) / 100})` }}
          />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ed1c24]" />
        </div>
      </div>
    </section>
  )
}
