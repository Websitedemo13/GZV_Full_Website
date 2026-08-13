"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api-supabase"
import SectionIntro from "@/components/sections/common/SectionIntro"

export interface PeopleGridProps {
  title?: string
  subtitle?: string
  type?: string
  limit?: number
}

export default function PeopleGrid({
  title,
  subtitle,
  type = "directors",
  limit = 6,
}: PeopleGridProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api
      .getGzvers()
      .then((data) => {
        if (!active) return
        let rows = data || []
        if (type === "directors") rows = rows.filter((item: any) => item.is_director && item.is_active)
        else rows = rows.filter((item: any) => item.is_active)
        setItems(rows.slice(0, Number(limit) || 6))
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setItems([])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [type, limit])

  return (
    <section className="bg-white py-16 dark:bg-slate-950 lg:py-24">
      <div className="container px-4">
        <SectionIntro title={title} subtitle={subtitle} align="center" />
        {loading ? (
          <div className="mx-auto h-12 w-12 animate-spin border-b-2 border-[#ed1c24]" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group border border-slate-200 bg-slate-50 p-5 transition hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-900"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                  <img
                    src={item.avatar_url || "/gzvers/default.webp"}
                    alt={item.full_name}
                    className="h-full w-full object-contain transition duration-700"
                    style={{
                      objectPosition: `${item.avatar_position_x ?? 50}% ${item.avatar_position_y ?? 32}%`,
                      transform: `scale(${(item.avatar_scale || 100) / 100})`,
                    }}
                  />
                </div>
                <h3 className="mt-5 text-xl font-black uppercase text-slate-950 group-hover:text-[#ed1c24] dark:text-white">
                  {item.full_name}
                </h3>
                <p className="mt-1 text-sm font-black uppercase text-[#ed1c24]">
                  {item.position || item.company}
                </p>
                {item.achievement_summary && (
                  <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                    {item.achievement_summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
