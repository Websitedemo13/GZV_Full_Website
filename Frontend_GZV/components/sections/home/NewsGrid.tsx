"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, supabase } from "@/lib/api-supabase"

export interface NewsGridProps {
  title?: string
  subtitle?: string
  limit?: number
  background?: string
}

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "digital-transformation", label: "Digital Transformation" },
  { id: "events", label: "Events" },
  { id: "education", label: "Education" },
]

export default function NewsGrid({
  title: propTitle,
  subtitle: propSubtitle,
  limit = 6,
  background,
}: NewsGridProps) {
  const [items, setItems] = useState<any[]>([])
  const [dbProps, setDbProps] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const isDark = background ? String(background).toLowerCase() !== "#ffffff" && String(background).toLowerCase() !== "white" : false

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const [homeRes, blockRes, posts] = await Promise.all([
          supabase.from("site_home_sections").select("*").eq("section_key", "news").maybeSingle(),
          supabase.from("site_page_blocks").select("props").eq("component_type", "news_grid").limit(1).maybeSingle(),
          api.getBlogPosts(),
        ])

        if (!active) return

        const homeData = homeRes.data
        const blockProps = blockRes.data?.props
        const combined = { ...(blockProps || {}), ...(homeData || {}), ...(homeData?.settings || {}) }
        setDbProps(combined)

        const finalLimit = combined?.item_limit || limit || 6
        if (posts) {
          setItems(posts.slice(0, Number(finalLimit)))
        }
      } catch (err: any) {
        console.error("Lỗi tải tin tức:", err?.message || err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()

    return () => {
      active = false
    }
  }, [limit, propTitle, propSubtitle])

  if (dbProps?.is_visible === false && !propTitle) {
    return null
  }

  const title = propTitle || dbProps?.title || "TIN TỨC & BÀI VIẾT MỚI NHẤT"
  const subtitle = propSubtitle || dbProps?.subtitle || "Cập nhật những thông tin, sự kiện và bài viết chia sẻ tri thức mới nhất từ GZV."

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items
    return items.filter((item) => {
      const targetText = [
        item.category,
        item.field,
        item.tags,
        item.title,
        item.description,
        item.excerpt,
      ].flatMap((val) => (Array.isArray(val) ? val : [val])).filter(Boolean).join(" ").toLowerCase()

      const searchCat = selectedCategory.toLowerCase().replace("-", " ")
      const labelCat = CATEGORIES.find((c) => c.id === selectedCategory)?.label.toLowerCase() || ""

      return targetText.includes(searchCat) || targetText.includes(labelCat)
    })
  }, [items, selectedCategory])

  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900 sm:py-20" style={background ? { background } : undefined}>
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mb-8 max-w-4xl text-left">
            {title && <h2 className={`text-3xl font-black uppercase sm:text-5xl ${isDark ? "text-white" : "text-gray-900 dark:text-white"}`}>{title}</h2>}
            {subtitle && <p className={`mt-4 text-lg ${isDark ? "text-white/70" : "text-gray-600 dark:text-gray-300"}`}>{subtitle}</p>}
          </div>
        )}

        {loading ? (
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#ed1c24]" />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => <NewsCardItem key={item.id || item.slug || index} item={item} />)}
          </div>
        ) : (
          <div className="py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            Chưa có tin tức nào trong hệ thống.
          </div>
        )}
      </div>
    </section>
  )
}

function NewsCardItem({ item }: { item: any }) {
  const title = item.title || "Tin tức"
  const image = item.image || item.thumbnail_url || "/placeholder.jpg"
  const description = item.description || item.excerpt || ""
  const href = item.slug ? `/tin-tuc/${item.slug}` : ""

  const card = (
    <Card className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-gray-800">
      <div>
        <div className="relative h-52 bg-slate-100">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
        <CardHeader className="text-center">
          <CardTitle className="line-clamp-2 text-center text-xl font-black dark:text-white">{title}</CardTitle>
        </CardHeader>
      </div>
      <CardContent className="flex flex-1 flex-col justify-between pt-0">
        {description && <p className="mb-6 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>}
        {href && (
          <Button variant="outline" className="mt-auto w-full rounded-xl border-[#ed1c24] text-xs font-black uppercase text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white transition">
            Chi tiết <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )

  if (!href) return card
  return <Link href={href}>{card}</Link>
}
