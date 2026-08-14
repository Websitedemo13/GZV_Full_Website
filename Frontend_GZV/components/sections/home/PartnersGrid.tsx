"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/api-supabase"

export interface PartnersGridProps {
  title?: string
  subtitle?: string
  limit?: number
  background?: string
}

export default function PartnersGrid({
  title: propTitle,
  subtitle: propSubtitle,
  limit = 40,
}: PartnersGridProps) {
  const [items, setItems] = useState<any[]>([])
  const [dbProps, setDbProps] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const [blockRes, partnersRes] = await Promise.all([
          (!propTitle || !propSubtitle)
            ? supabase.from("site_page_blocks").select("props").eq("component_type", "partners_grid").limit(1).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from("partners").select("*").order("sort_order", { ascending: true }).limit(Number(limit) || 40),
        ])

        if (!active) return

        if (blockRes.data?.props) {
          setDbProps(blockRes.data.props)
        }

        if (partnersRes.data && partnersRes.data.length > 0) {
          const activeOnly = partnersRes.data.filter((p: any) => p.is_active !== false)
          setItems(activeOnly.length > 0 ? activeOnly : partnersRes.data)
        }
      } catch (err: any) {
        console.error("Lỗi tải dữ liệu đối tác:", err?.message || err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()

    return () => {
      active = false
    }
  }, [limit, propTitle, propSubtitle])

  const title = propTitle || dbProps?.title || "ĐỐI TÁC"
  const subtitle = propSubtitle || dbProps?.subtitle || "Các đơn vị đồng hành cùng hệ sinh thái GZV."

  return (
    <section className="bg-white py-16 dark:bg-slate-950 lg:py-24">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mb-12 max-w-4xl text-left">
            {title && <h2 className="text-3xl font-black uppercase text-slate-950 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{subtitle}</p>}
          </div>
        )}

        {loading ? (
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#ed1c24]" />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {items.map((item, index) => <PartnerLogoItem key={item.id || item.slug || index} item={item} />)}
          </div>
        ) : (
          <div className="py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            Chưa có đối tác nào trong hệ thống.
          </div>
        )}
      </div>
    </section>
  )
}

function PartnerLogoItem({ item }: { item: any }) {
  const title = item.name || item.title || "Đối tác"
  const image = item.logo_url || item.image || "/placeholder.jpg"
  const href = item.website_url || ""

  const logo = (
    <div className="flex h-28 flex-col justify-between overflow-hidden border border-slate-200 bg-white transition hover:border-[#ed1c24] dark:border-white/10">
      <div className="flex h-20 items-center justify-center p-4">
        <img src={image} alt={title} className="max-h-14 w-auto max-w-full object-contain" />
      </div>
      <div className="border-t border-slate-200 px-3 py-2 text-center dark:border-white/10">
        <p className="truncate text-xs font-black text-slate-950">{title}</p>
      </div>
    </div>
  )

  return href ? <Link href={href} target="_blank" rel="noreferrer">{logo}</Link> : logo
}
