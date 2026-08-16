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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  RefreshCw,
  Handshake,
  Pencil,
  Trash2,
  Building2,
  GraduationCap,
  Eye,
  EyeOff,
  GripVertical,
  ChevronRight,
  Layers,
  Sparkles,
  ExternalLink,
  Save,
  Loader2,
  Globe,
  Users2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PartnerModal } from "@/components/admin/partners/PartnerModal"
import { PartnerDeleteModal } from "@/components/admin/partners/PartnerDeleteModal"

export interface Partner {
  id: string
  name: string
  logo_url: string
  category: string
  website_url: string | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type PartnerCategory = string

export interface CategoryItem {
  key: string
  label: string
  aliases?: string[]
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

const INITIAL_CATEGORIES: CategoryItem[] = [
  { key: "don-vi-chi-dao", label: "ĐƠN VỊ CHỈ ĐẠO THỰC HIỆN", aliases: ["don-vi-chi-dao", "chi-dao", "governance"] },
  { key: "doi-tac-dong-hanh", label: "ĐỐI TÁC ĐỒNG HÀNH", aliases: ["doi-tac-dong-hanh", "corporate", "dong-hanh"] },
  { key: "dai-hoc-cao-dang", label: "ĐẠI HỌC/ CAO ĐẲNG", aliases: ["dai-hoc-cao-dang", "education", "dai-hoc"] },
  { key: "don-vi-bao-tro", label: "ĐƠN VỊ BẢO TRỢ", aliases: ["don-vi-bao-tro", "sponsor", "bao-tro"] },
  { key: "don-vi-thuc-hien", label: "ĐƠN VỊ THỰC HIỆN", aliases: ["don-vi-thuc-hien", "organizer", "thuc-hien"] },
  { key: "doi-tac-khac", label: "ĐỐI TÁC KHÁC", aliases: ["doi-tac-khac", "other", "khac", ""] },
]

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>("don-vi-thuc-hien")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [current, setCurrent] = useState<Partner | null>(null)

  // Category Edit / Add Dialog State
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isNewCategoryDialog, setIsNewCategoryDialog] = useState(false)
  const [editingCategoryLabel, setEditingCategoryLabel] = useState("")

  // Category Delete Dialog State
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null)
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false)

  const fetchPartners = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
    if (error) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" })
    } else {
      const partnerList = (data as Partner[]) || []
      setPartners(partnerList)

      // Collect any custom categories present in DB that aren't in INITIAL_CATEGORIES
      const knownKeys = new Set(INITIAL_CATEGORIES.flatMap((c) => [c.key, ...(c.aliases || [])]))
      const extraCategories: CategoryItem[] = []
      partnerList.forEach((p) => {
        if (p.category && !knownKeys.has(p.category)) {
          knownKeys.add(p.category)
          extraCategories.push({
            key: p.category,
            label: p.category.toUpperCase(),
            aliases: [p.category],
          })
        }
      })
      if (extraCategories.length > 0) {
        setCategories([...INITIAL_CATEGORIES.filter((c) => c.key !== "doi-tac-khac"), ...extraCategories, INITIAL_CATEGORIES.find((c) => c.key === "doi-tac-khac")!])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  // Helper to match partner to category
  const matchesCategory = (partner: Partner, cat: CategoryItem) => {
    const pCat = (partner.category || "").toLowerCase()

    // If matching a specific known category
    if (cat.key !== "doi-tac-khac") {
      if (pCat === cat.key.toLowerCase()) return true
      if (cat.aliases?.some((a) => a.toLowerCase() === pCat)) return true
      if (pCat === cat.label.toLowerCase()) return true
      return false
    }

    // For "doi-tac-khac": matches if explicit key, or if partner category doesn't match any OTHER category
    if (pCat === "doi-tac-khac" || pCat === "other" || pCat === "khac" || !pCat) {
      return true
    }

    const otherCategories = categories.filter((c) => c.key !== "doi-tac-khac")
    const matchedOther = otherCategories.some((other) => {
      if (pCat === other.key.toLowerCase()) return true
      if (other.aliases?.some((a) => a.toLowerCase() === pCat)) return true
      if (pCat === other.label.toLowerCase()) return true
      return false
    })

    return !matchedOther
  }

  // Active Category Object
  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => c.key === activeCategoryKey) || categories[0]
  }, [categories, activeCategoryKey])

  // Filter partners in the active category + search query
  const filteredInActiveCategory = useMemo(() => {
    if (!activeCategoryObj) return []
    return partners.filter((p) => {
      const matchCat = matchesCategory(p, activeCategoryObj)
      if (!matchCat) return false
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchName = p.name?.toLowerCase().includes(query)
        const matchWeb = p.website_url?.toLowerCase().includes(query)
        if (!matchName && !matchWeb) return false
      }
      return true
    })
  }, [partners, activeCategoryObj, search, categories])

  const toggleActive = async (p: Partner) => {
    const nextStatus = !p.is_active
    setPartners((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: nextStatus } : x)))
    const { error } = await supabase.from("partners").update({ is_active: nextStatus }).eq("id", p.id)
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
      fetchPartners()
    } else {
      toast({
        title: nextStatus ? "Đã bật hiển thị" : "Đã tạm ẩn",
        description: `Đối tác ${p.name} hiện ${nextStatus ? "đang hiển thị" : "đã được ẩn"}.`,
      })
    }
  }

  const openAdd = () => {
    setCurrent(null)
    setModalOpen(true)
  }

  const openEdit = (p: Partner) => {
    setCurrent(p)
    setModalOpen(true)
  }

  const openDelete = (p: Partner) => {
    setCurrent(p)
    setDeleteOpen(false)
    setTimeout(() => {
      setCurrent(p)
      setDeleteOpen(true)
    }, 10)
  }

  const handleDelete = async () => {
    if (!current) return
    const { error } = await supabase.from("partners").delete().eq("id", current.id)
    if (error) {
      toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Đã xóa", description: `Đã xóa đối tác ${current.name}.` })
      setDeleteOpen(false)
      fetchPartners()
    }
  }

  const handleOpenEditCategory = () => {
    if (!activeCategoryObj) return
    setIsNewCategoryDialog(false)
    setEditingCategoryLabel(activeCategoryObj.label)
    setIsEditCategoryOpen(true)
  }

  const handleOpenAddCategory = () => {
    setIsNewCategoryDialog(true)
    setEditingCategoryLabel("")
    setIsEditCategoryOpen(true)
  }

  const handleSaveCategoryLabel = () => {
    if (!editingCategoryLabel.trim()) return

    if (isNewCategoryDialog) {
      const newKey = slugify(editingCategoryLabel) || `cat-${Date.now()}`
      const newCat: CategoryItem = {
        key: newKey,
        label: editingCategoryLabel.trim().toUpperCase(),
        aliases: [newKey],
      }
      setCategories((prev) => {
        const others = prev.filter((c) => c.key !== "doi-tac-khac")
        const fallbackOther = prev.find((c) => c.key === "doi-tac-khac") || {
          key: "doi-tac-khac",
          label: "ĐỐI TÁC KHÁC",
          aliases: ["doi-tac-khac", "other", "khac"],
        }
        return [...others, newCat, fallbackOther]
      })
      setActiveCategoryKey(newKey)
      setIsEditCategoryOpen(false)
      toast({ title: "Đã thêm danh mục mới", description: `Danh mục ${newCat.label} đã được tạo thành công.` })
    } else {
      if (!activeCategoryObj) return
      setCategories((prev) =>
        prev.map((c) => (c.key === activeCategoryObj.key ? { ...c, label: editingCategoryLabel.trim().toUpperCase() } : c))
      )
      setIsEditCategoryOpen(false)
      toast({ title: "Đã cập nhật", description: "Tên danh mục đối tác đã được thay đổi." })
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory || deletingCategory.key === "doi-tac-khac") return
    setDeletingCategoryLoading(true)

    try {
      // 1. Move all partners belonging to this category to "doi-tac-khac"
      const keysToMigrate = [deletingCategory.key, ...(deletingCategory.aliases || [])]
      for (const k of keysToMigrate) {
        await supabase.from("partners").update({ category: "doi-tac-khac" }).eq("category", k)
      }

      // 2. Remove category from local state
      setCategories((prev) => prev.filter((c) => c.key !== deletingCategory.key))

      // 3. Switch active to "doi-tac-khac"
      setActiveCategoryKey("doi-tac-khac")
      setIsDeleteCategoryOpen(false)
      setDeletingCategory(null)

      toast({
        title: "Đã xóa danh mục",
        description: `Đã xóa danh mục ${deletingCategory.label}. Các đối tác thuộc danh mục này đã được tự động chuyển sang "ĐỐI TÁC KHÁC".`,
      })

      fetchPartners()
    } catch (err: any) {
      toast({ title: "Lỗi xóa danh mục", description: err.message, variant: "destructive" })
    } finally {
      setDeletingCategoryLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-2 md:p-0">

      {/* Top Header Card Matching Image */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#ed1c24] text-white shadow-xs">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-none border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase text-[#ed1c24] dark:border-red-900/40 dark:bg-red-950/30">
                <Sparkles className="h-3 w-3" />
                <span>ĐỐI TÁC VSM</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">
                QUẢN LÝ ĐỐI TÁC
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPartners}
              disabled={loading}
              className="h-10 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 text-[#ed1c24] ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>

            <Button
              onClick={openAdd}
              className="h-10 px-5 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218] shadow-sm transition-all"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              + THÊM ĐỐI TÁC MỚI
            </Button>
          </div>
        </div>
      </div>

      {/* 2-Column Main Section Matching Image */}
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Card 1: TÌM KIẾM ĐỐI TÁC */}
          <div className="border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10 flex items-center gap-2">
              <Search className="h-4 w-4 text-[#ed1c24]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                TÌM KIẾM ĐỐI TÁC
              </span>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập tên đối tác..."
                  className="h-10 rounded-none border-slate-200 bg-slate-50/70 pl-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Card 2: DANH MỤC ĐỐI TÁC */}
          <div className="border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#ed1c24]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  DANH MỤC ĐỐI TÁC
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="text-[10px] font-black uppercase text-[#ed1c24] hover:underline inline-flex items-center gap-1"
                title="Tạo thêm danh mục mới"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm
              </button>
            </div>

            <div className="p-2 space-y-1.5">
              {categories.map((cat) => {
                const isSelected = activeCategoryKey === cat.key
                const count = partners.filter((p) => matchesCategory(p, cat)).length

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveCategoryKey(cat.key)}
                    className={`w-full flex items-center justify-between p-2.5 transition-all text-left border ${isSelected
                        ? "border-2 border-[#ed1c24] bg-red-50/50 text-[#ed1c24] dark:bg-red-950/20"
                        : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/5 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50"
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <GripVertical className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className={`text-[11px] font-black uppercase tracking-wide truncate ${isSelected ? "text-[#ed1c24]" : "text-slate-800 dark:text-slate-200"
                        }`}>
                        {cat.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${isSelected
                          ? "bg-[#ed1c24] text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                        {count}
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 ${isSelected ? "text-[#ed1c24]" : "text-slate-400"}`} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Main Content */}
        <div className="border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
          {/* Active Category Header */}
          <div className="border-b border-slate-200 p-5 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase text-slate-950 dark:text-white tracking-wide">
                  {activeCategoryObj?.label || "DANH MỤC ĐỐI TÁC"}
                </h2>
                {activeCategoryObj?.key !== "doi-tac-khac" && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleOpenEditCategory}
                      className="text-slate-400 hover:text-[#ed1c24] transition-colors p-1"
                      title="Chỉnh sửa tên danh mục"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingCategory(activeCategoryObj)
                        setIsDeleteCategoryOpen(true)
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Xóa danh mục này"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Đang quản lý <span className="font-bold text-[#ed1c24]">{filteredInActiveCategory.length} đối tác</span> trong danh mục này.
            </p>
          </div>

          {/* Partners Grid */}
          <div className="p-5">
            {loading && partners.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-none bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredInActiveCategory.length === 0 ? (
              <div className="border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center dark:border-white/10 dark:bg-slate-950/40">
                <Handshake className="mx-auto text-slate-300 dark:text-slate-700 mb-3 h-10 w-10" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chưa có đối tác nào trong danh mục này.
                </p>
                <Button
                  onClick={openAdd}
                  className="mt-4 rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218] text-xs font-black uppercase"
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Thêm đối tác ngay
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInActiveCategory.map((partner, index) => (
                  <PartnerCardItem
                    key={partner.id}
                    partner={partner}
                    displayIndex={index + 1}
                    onEdit={() => openEdit(partner)}
                    onDelete={() => openDelete(partner)}
                    onToggle={() => toggleActive(partner)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Partner Modal */}
      <PartnerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        partner={current}
        existing={partners}
        categories={categories}
        defaultCategoryKey={activeCategoryKey}
        onSuccess={() => {
          setModalOpen(false)
          fetchPartners()
        }}
      />

      {/* Delete Partner Modal */}
      <PartnerDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        partner={current}
        onConfirm={handleDelete}
      />

      {/* Rename / Add Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="max-w-md rounded-none border border-slate-200 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden">
          <div className="h-1 w-full bg-[#ed1c24]" />
          <div className="p-5">
            <DialogTitle className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {isNewCategoryDialog ? "Thêm danh mục đối tác mới" : "Đổi tên danh mục đối tác"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {isNewCategoryDialog
                ? "Nhập tên danh mục đối tác mới để phân loại và quản lý."
                : "Nhập tên hiển thị mới cho danh mục này trên thanh quản trị."}
            </DialogDescription>
            <div className="mt-4 space-y-2">
              <Input
                value={editingCategoryLabel}
                onChange={(e) => setEditingCategoryLabel(e.target.value)}
                placeholder="VD: NHÀ TÀI TRỢ KIM CƯƠNG..."
                className="h-10 rounded-none border-slate-200 text-xs font-bold uppercase"
                autoFocus
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-white/10 dark:bg-slate-950">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditCategoryOpen(false)}
              className="h-8.5 rounded-none text-xs font-black uppercase"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveCategoryLabel}
              className="h-8.5 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              {isNewCategoryDialog ? "Tạo danh mục" : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
        <DialogContent className="max-w-md rounded-none border border-slate-200 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden select-none">
          <div className="h-1 w-full bg-[#ed1c24]" />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-red-100 text-[#ed1c24] dark:bg-red-950/40 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[9px] font-black uppercase tracking-widest text-[#ed1c24] leading-tight">
                  XÁC NHẬN XÓA DANH MỤC
                </span>
                <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Xóa danh mục này?
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn xóa danh mục{" "}
                  <span className="font-bold text-slate-900 dark:text-white underline decoration-[#ed1c24]">
                    {deletingCategory?.label}
                  </span>
                  ? Tất cả các đối tác thuộc danh mục này sẽ tự động chuyển sang danh mục{" "}
                  <span className="font-bold text-[#ed1c24]">"ĐỐI TÁC KHÁC"</span>.
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-3.5 dark:border-white/10 dark:bg-slate-950/50">
            <Button
              type="button"
              variant="outline"
              disabled={deletingCategoryLoading}
              onClick={() => setIsDeleteCategoryOpen(false)}
              className="h-9 rounded-none border-slate-300 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={deletingCategoryLoading}
              onClick={handleDeleteCategory}
              className="h-9 rounded-none bg-[#ed1c24] px-4 text-xs font-black uppercase text-white hover:bg-[#c91218] shadow-xs"
            >
              {deletingCategoryLoading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              {deletingCategoryLoading ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PartnerCardItem({
  partner,
  displayIndex,
  onEdit,
  onDelete,
  onToggle,
}: {
  partner: Partner
  displayIndex: number
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const isUrl = partner.logo_url?.startsWith("http") || partner.logo_url?.startsWith("/")

  return (
    <div className={`border p-4 transition-all shadow-2xs ${partner.is_active
        ? "border-slate-200 bg-white hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-900"
        : "border-slate-200/60 bg-slate-50/60 opacity-75 dark:border-white/5 dark:bg-slate-950/40"
      }`}>
      {/* Top row: Logo (Left) and Actions (Right) */}
      <div className="flex items-start justify-between gap-3">
        {/* Logo Thumbnail Container */}
        <div className="relative h-14 w-24 shrink-0 overflow-hidden border border-slate-200 bg-white p-1.5 flex items-center justify-center dark:border-white/10">
          {isUrl && partner.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={partner.logo_url}
              alt={partner.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={`h-8 w-8 rounded-none transition-colors ${partner.is_active
                ? "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                : "text-slate-400 hover:text-red-600"
              }`}
            title={partner.is_active ? "Đang hiển thị (Bấm để ẩn)" : "Đang ẩn (Bấm để hiển thị)"}
          >
            {partner.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-red-500" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 rounded-none text-slate-600 hover:text-[#ed1c24] hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-950/30"
            title="Chỉnh sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 rounded-none text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Middle row: Partner Name */}
      <div className="mt-3.5">
        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
          {partner.name}
        </h3>
      </div>

      {/* Bottom row: Website URL (Left) and Sort Order Badge (Right) */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
        <div className="min-w-0 pr-2">
          {partner.website_url ? (
            <a
              href={partner.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-[#ed1c24] font-medium truncate block flex items-center gap-1 hover:underline"
            >
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">{partner.website_url.replace(/^https?:\/\//, "")}</span>
            </a>
          ) : (
            <span className="text-slate-400 font-medium italic">Không có website</span>
          )}
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
            <GripVertical className="h-2.5 w-2.5" />
            <span>#{partner.sort_order ?? displayIndex}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
