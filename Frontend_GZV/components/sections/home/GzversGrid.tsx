"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api, supabase } from "@/lib/api-supabase"

export interface GzversGridProps {
  title?: string
  subtitle?: string
  limit?: number
  background?: string
}

const FILTER_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "directors", label: "Ban điều hành" },
  { id: "advisors", label: "Ban cố vấn" },
  { id: "gzvers", label: "GZVers" },
]

export default function GzversGrid({
  title: propTitle,
  subtitle: propSubtitle,
  limit = 50,
  background,
}: GzversGridProps) {
  const [items, setItems] = useState<any[]>([])
  const [dbData, setDbData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

  const isDark = background ? String(background).toLowerCase() !== "#ffffff" && String(background).toLowerCase() !== "white" : false

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      supabase.from("site_home_sections").select("*").eq("section_key", "gzvers").maybeSingle(),
      api.getGzvers(),
    ])
      .then(([homeRes, data]) => {
        if (!active) return
        if (homeRes.data) {
          setDbData(homeRes.data)
        }
        setItems(data || [])
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách GZVers:", err)
        if (!active) return
        setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    let list = items
    if (activeFilter === "directors") {
      list = items.filter(
        (m: any) =>
          m.is_director ||
          m.department_name?.toLowerCase().includes("điều hành") ||
          m.position?.toLowerCase().includes("ceo") ||
          m.position?.toLowerCase().includes("director")
      )
    } else if (activeFilter === "advisors") {
      list = items.filter(
        (m: any) =>
          m.is_advisor ||
          m.is_mentor ||
          m.department_name?.toLowerCase().includes("cố vấn") ||
          m.position?.toLowerCase().includes("advisor") ||
          m.position?.toLowerCase().includes("cố vấn")
      )
    } else if (activeFilter === "gzvers") {
      list = items.filter(
        (m: any) =>
          !m.is_director &&
          !m.is_advisor &&
          !m.is_mentor
      )
    }
    return list.slice(0, Number(limit) || 50)
  }, [items, activeFilter, limit])

  if (dbData?.is_visible === false && !propTitle) {
    return null
  }

  const title = propTitle || dbData?.title || "ĐỘI NGŨ NHÂN SỰ GZV"
  const subtitle = propSubtitle || dbData?.subtitle || "Đội ngũ nhân sự, cố vấn và chuyên gia đồng hành"

  return (
    <section className="bg-white py-16 dark:bg-gray-900 sm:py-20" style={background ? { background } : undefined}>
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mb-10 max-w-4xl text-left">
            {title && (
              <h2 className={`text-3xl font-black uppercase tracking-tight sm:text-5xl ${isDark ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`mt-3 text-base sm:text-lg font-medium ${isDark ? "text-white/70" : "text-gray-600 dark:text-gray-300"}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-10 flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`h-11 border px-6 text-xs font-black uppercase tracking-wider transition ${
                activeFilter === tab.id
                  ? "border-[#ed1c24] bg-[#ed1c24] text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-900 hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-900 dark:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#ed1c24]" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải dữ liệu nhân sự...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => (
              <GzverCardItem key={item.id || item.slug || index} item={item} />
            ))}
          </div>
        ) : (
          <div className="border border-slate-100 bg-slate-50 py-16 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
            Chưa có nhân sự trong mục này.
          </div>
        )}
      </div>
    </section>
  )
}

function GzverCardItem({ item }: { item: any }) {
  const name = item.full_name || item.title || item.name || "GZVer"
  const image = item.avatar_url || item.image || "/gzvers/default.webp"
  const position = item.position || item.role_level || item.company || "GZVer"
  const href = item.slug ? `/gzver/${item.slug}` : `/gzver`

  return (
    <div className="group flex h-full flex-col justify-between overflow-hidden border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-[#ed1c24] hover:shadow-xl dark:border-white/10 dark:bg-slate-900">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-950">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            style={{
              objectPosition: `${item.avatar_position_x ?? 50}% ${item.avatar_position_y ?? 32}%`,
              transform: `scale(${(item.avatar_scale || 100) / 100})`,
            }}
          />
        </div>
        <div className="mt-5 text-center">
          <h3 className="text-xl font-black uppercase text-slate-950 transition group-hover:text-[#ed1c24] dark:text-white">
            {name}
          </h3>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {position}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link href={href}>
          <Button
            variant="outline"
            className="w-full rounded-none border-[#ed1c24] bg-white text-xs font-black uppercase text-[#ed1c24] transition hover:bg-[#ed1c24] hover:text-white dark:bg-slate-900"
          >
            Chi tiết <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
