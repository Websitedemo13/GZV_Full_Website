"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/api-supabase"

export interface ProjectsGridProps {
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

export default function ProjectsGrid({
  title: propTitle,
  subtitle: propSubtitle,
  limit = 6,
  background,
}: ProjectsGridProps) {
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
        const [blockRes, projectsRes] = await Promise.all([
          (!propTitle || !propSubtitle)
            ? supabase.from("site_page_blocks").select("props").eq("component_type", "projects_grid").limit(1).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from("projects").select("*").order("order_index", { ascending: true }).order("created_at", { ascending: false }).limit(Number(limit) || 6),
        ])

        if (!active) return

        if (blockRes.data?.props) {
          setDbProps(blockRes.data.props)
        }

        if (projectsRes.data) {
          setItems(projectsRes.data)
        }
      } catch (err: any) {
        console.error("Lỗi tải dữ liệu dự án:", err?.message || err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()

    return () => {
      active = false
    }
  }, [limit, propTitle, propSubtitle])

  const title = propTitle || dbProps?.title || "DỰ ÁN ĐÃ TRIỂN KHAI"
  const subtitle = propSubtitle || dbProps?.subtitle || "Các dự án Mentoring, Coaching và triển khai thực tế mà GZV đồng hành."

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items
    return items.filter((item) => {
      const targetText = [
        item.category,
        item.field,
        item.industry,
        item.tags,
        item.title,
        item.description,
        item.excerpt,
        item.company,
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

        <div className="mb-10 flex flex-wrap items-center justify-start gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
                  isActive
                    ? "bg-[#ed1c24] text-white shadow-md"
                    : isDark
                    ? "bg-white/10 text-white/80 hover:bg-white/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#ed1c24]" />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => <ProjectCardItem key={item.id || item.slug || index} item={item} />)}
          </div>
        ) : (
          <div className="py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            Chưa có dự án nào thuộc danh mục này.
          </div>
        )}
      </div>
    </section>
  )
}

function ProjectCardItem({ item }: { item: any }) {
  const title = item.title || item.name || "Dự án"
  const image = item.thumbnail_url || item.image || item.avatar_url || "/placeholder.jpg"
  const description = item.description || item.excerpt || ""
  const href = item.slug ? `/du-an/${item.slug}` : ""

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
