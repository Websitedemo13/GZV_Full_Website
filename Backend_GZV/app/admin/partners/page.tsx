"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Plus, Search, RefreshCw, Handshake, Pencil, Trash2,
  ArrowUp, ArrowDown, Building2, GraduationCap, Eye, EyeOff,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PartnerModal } from "@/components/admin/partners/PartnerModal"
import { PartnerDeleteModal } from "@/components/admin/partners/PartnerDeleteModal"

export type PartnerCategory = "corporate" | "education"

export interface Partner {
  id: string
  name: string
  logo_url: string
  category: PartnerCategory
  website_url: string | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

const CATEGORY_LABEL: Record<PartnerCategory, string> = {
  corporate: "Doanh nghiệp",
  education: "Giáo dục & Hiệp hội",
}

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"all" | PartnerCategory>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [current, setCurrent] = useState<Partner | null>(null)

  const fetchPartners = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
    if (error) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" })
    } else {
      setPartners((data as Partner[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const filtered = useMemo(() => {
    return partners.filter(p => {
      if (tab !== "all" && p.category !== tab) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [partners, tab, search])

  const stats = useMemo(() => ({
    total: partners.length,
    corporate: partners.filter(p => p.category === "corporate").length,
    education: partners.filter(p => p.category === "education").length,
    active: partners.filter(p => p.is_active).length,
  }), [partners])

  const toggleActive = async (p: Partner) => {
    // optimistic
    setPartners(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
    const { error } = await supabase.from("partners").update({ is_active: !p.is_active }).eq("id", p.id)
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
      fetchPartners()
    }
  }

  const move = async (p: Partner, dir: -1 | 1) => {
    const siblings = partners
      .filter(x => x.category === p.category)
      .sort((a, b) => a.sort_order - b.sort_order)
    const idx = siblings.findIndex(s => s.id === p.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= siblings.length) return
    const other = siblings[swapIdx]
    const a = p.sort_order
    const b = other.sort_order
    setPartners(prev => prev.map(x => {
      if (x.id === p.id) return { ...x, sort_order: b }
      if (x.id === other.id) return { ...x, sort_order: a }
      return x
    }))
    const [r1, r2] = await Promise.all([
      supabase.from("partners").update({ sort_order: b }).eq("id", p.id),
      supabase.from("partners").update({ sort_order: a }).eq("id", other.id),
    ])
    if (r1.error || r2.error) {
      toast({ title: "Lỗi sắp xếp", description: (r1.error || r2.error)?.message, variant: "destructive" })
      fetchPartners()
    }
  }

  const openAdd = () => { setCurrent(null); setModalOpen(true) }
  const openEdit = (p: Partner) => { setCurrent(p); setModalOpen(true) }
  const openDelete = (p: Partner) => { setCurrent(p); setDeleteOpen(true) }

  const handleDelete = async () => {
    if (!current) return
    const { error } = await supabase.from("partners").delete().eq("id", current.id)
    if (error) {
      toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Đã xóa", description: `Đã xóa ${current.name}.` })
      setDeleteOpen(false)
      fetchPartners()
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                PARTNERS & SPONSORS
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Đối Tác & Doanh Nghiệp Đồng Hành
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Quản lý logo, danh mục và thứ tự hiển thị của các đối tác trên trang /dong-hanh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPartners}
              disabled={loading}
              className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 text-[#ed1c24] ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={openAdd}
              className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm đối tác mới
            </Button>
          </div>
        </div>

        {/* 4 Control Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng Đối Tác</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{stats.total}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Doanh Nghiệp</p>
            <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">{stats.corporate}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Giáo Dục & Hiệp Hội</p>
            <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">{stats.education}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Đang Hiển Thị</p>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-11 rounded-none border-slate-200 bg-slate-50 pl-10 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            placeholder="Tìm kiếm theo tên đối tác, doanh nghiệp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-1">
            Phân Loại:
          </span>
          {(["all", "corporate", "education"] as const).map((t) => {
            const isSelected = tab === t
            const count = t === "all" ? stats.total : t === "corporate" ? stats.corporate : stats.education
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`h-9.5 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "border-[#ed1c24] bg-[#ed1c24] text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300"
                }`}
              >
                <span>{t === "all" ? "Tất Cả" : CATEGORY_LABEL[t]}</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Partners Grid */}
      {loading && partners.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-56 rounded-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-none border-slate-200 bg-white p-16 text-center dark:border-white/10 dark:bg-slate-900">
          <Handshake className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
          <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Không có đối tác nào phù hợp với bộ lọc.</p>
          <Button onClick={openAdd} className="mt-4 rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218] text-xs font-black uppercase">
            <Plus className="mr-2" size={16} /> Thêm đối tác mới
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <PartnerCard
              key={p.id}
              partner={p}
              onEdit={() => openEdit(p)}
              onDelete={() => openDelete(p)}
              onToggle={() => toggleActive(p)}
              onUp={() => move(p, -1)}
              onDown={() => move(p, 1)}
            />
          ))}
        </div>
      )}

      <PartnerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        partner={current}
        existing={partners}
        onSuccess={() => { setModalOpen(false); fetchPartners() }}
      />
      <PartnerDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        partner={current}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function PartnerCard({ partner, onEdit, onDelete, onToggle, onUp, onDown }: {
  partner: Partner
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onUp: () => void
  onDown: () => void
}) {
  const isUrl = partner.logo_url?.startsWith("http")
  return (
    <div className="group relative overflow-hidden border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900 transition-all hover:border-[#ed1c24]">
      <div className="relative h-32 bg-white flex items-center justify-center p-4 border-b border-slate-100 dark:border-white/5">
        {isUrl ? (
          <Image
            src={partner.logo_url}
            alt={partner.name}
            width={300}
            height={200}
            className="max-h-full w-auto object-contain"
            unoptimized
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={partner.logo_url || "/placeholder.svg"} alt={partner.name} className="max-h-full w-auto object-contain" />
        )}
        {!partner.is_active && (
          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-600 text-white">
              Đang ẩn
            </span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-900 dark:text-white truncate text-xs uppercase">{partner.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              {CATEGORY_LABEL[partner.category]} · #{partner.sort_order}
            </p>
          </div>
          <Switch checked={partner.is_active} onCheckedChange={onToggle} />
        </div>

        <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-white/5">
          <Button size="icon" variant="ghost" onClick={onUp}
            className="h-7 w-7 rounded-none text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800">
            <ArrowUp size={13} />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDown}
            className="h-7 w-7 rounded-none text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800">
            <ArrowDown size={13} />
          </Button>
          <div className="flex-1" />
          <Button size="icon" variant="ghost" onClick={onEdit}
            className="h-7 w-7 rounded-none text-slate-700 hover:text-[#ed1c24] hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-950/40">
            <Pencil size={13} />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete}
            className="h-7 w-7 rounded-none text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40">
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}
