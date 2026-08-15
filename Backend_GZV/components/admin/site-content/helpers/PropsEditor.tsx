import React, { useState } from "react"
import { Filter, Link2, Palette, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { PageBlock } from "../types"
import { Field } from "./BasicHelpers"
import { ImagePositionAndZoomEditor } from "./ImagePositionAndZoomEditor"

export function PropsEditor({
  value,
  onChange,
  onPickSingleImage,
  componentType,
}: {
  value: Record<string, any>
  onChange: (value: Record<string, any>) => void
  onPickSingleImage?: () => void
  componentType?: string
}) {
  const updateKey = (key: string, nextValue: any) => {
    onChange({ ...(value || {}), [key]: nextValue })
  }

  const typeLower = (componentType || "").toLowerCase().trim()
  const isCta = typeLower.includes("cta") || typeLower.includes("band") || value?.buttonLabel !== undefined || value?.button_label !== undefined || value?.buttonUrl !== undefined || value?.button_url !== undefined || value?.button_text !== undefined
  const isBgConfigurable = isCta || typeLower.includes("banner") || value?.backgroundFrom !== undefined || value?.background_from !== undefined || value?.backgroundTo !== undefined || value?.background_to !== undefined || value?.backgroundColor !== undefined || value?.background_color !== undefined
  const isProjects = typeLower.includes("project") || typeLower.includes("du-an") || typeLower.includes("du_an") || value?.show_search !== undefined || value?.show_categories !== undefined
  const hasBody = (value?.body !== undefined || value?.description !== undefined || isCta) && !isProjects
  const hasStats = Array.isArray(value?.stats)
  const hasItems = Array.isArray(value?.items) && !hasStats
  const hasImage = value?.image_url !== undefined || value?.image !== undefined || value?.position_x !== undefined

  // If section has no editable fields, show note
  if (!hasBody && !hasStats && !hasItems && !hasImage && !isCta && !isBgConfigurable && !isProjects) {
    return (
      <div className="rounded-none border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center dark:border-white/10 dark:bg-slate-950">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Section này hiển thị dữ liệu mặc định từ hệ thống.
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Bạn có thể bấm &quot;Mở Cấu hình JSON & HTML nâng cao&quot; bên dưới để tùy biến chuyên sâu nếu cần.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-none border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950">
      {/* Projects Grid Search & Filter Controls */}
      {isProjects && (
        <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <Filter className="h-4 w-4 text-[#ed1c24]" />
            <div>
              <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Cấu hình Bộ lọc & Tìm kiếm Dự án</p>
              <p className="text-[11px] text-slate-500">Tùy chọn ẩn/hiện thanh tìm kiếm, bộ lọc danh mục và số lượng dự án.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between border border-slate-100 p-3 bg-slate-50/50 dark:border-white/5 dark:bg-slate-950">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Hiện thanh tìm kiếm</p>
                <p className="text-[10px] text-slate-400">Ô gõ tìm kiếm tên dự án</p>
              </div>
              <Switch
                checked={value?.show_search !== false && value?.showSearch !== false}
                onCheckedChange={(checked) => {
                  updateKey("show_search", checked)
                  if (value.showSearch !== undefined) updateKey("showSearch", checked)
                }}
              />
            </div>

            <div className="flex items-center justify-between border border-slate-100 p-3 bg-slate-50/50 dark:border-white/5 dark:bg-slate-950">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Hiện bộ lọc danh mục</p>
                <p className="text-[10px] text-slate-400">Các nút: Marketing, Sales, v.v.</p>
              </div>
              <Switch
                checked={value?.show_categories !== false && value?.showCategories !== false && value?.show_filter !== false}
                onCheckedChange={(checked) => {
                  updateKey("show_categories", checked)
                  if (value.showCategories !== undefined) updateKey("showCategories", checked)
                }}
              />
            </div>
          </div>

          <Field label="Số lượng dự án hiển thị tối đa (Limit)">
            <Input
              type="number"
              value={value.limit || 6}
              onChange={(e) => updateKey("limit", Number(e.target.value))}
              placeholder="6"
              className="rounded-none text-xs w-full sm:w-48"
            />
          </Field>
        </div>
      )}

      {/* 1. Body / Description Field */}
      {hasBody && (
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
            Nội dung chi tiết / Mô tả
          </Label>
          <Textarea
            rows={4}
            value={value.body || value.description || ""}
            onChange={(e) => {
              if (value.description !== undefined) {
                updateKey("description", e.target.value)
              } else {
                updateKey("body", e.target.value)
              }
            }}
            className="rounded-none text-xs leading-relaxed border-slate-300 bg-white dark:bg-slate-900 dark:border-white/10"
            placeholder="Nhập nội dung mô tả..."
          />
        </div>
      )}

      {/* 2. CTA Button & Link Config */}
      {isCta && (
        <div className="space-y-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <Link2 className="h-4 w-4 text-[#ed1c24]" />
            <div>
              <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Cấu hình Nút bấm & Liên kết (CTA Button)</p>
              <p className="text-[11px] text-slate-500">Tên hiển thị trên nút và đường dẫn khi người dùng nhấp vào.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tên nút bấm (CTA Label)">
              <Input
                value={value.buttonLabel || value.button_label || value.button_text || ""}
                onChange={(e) => {
                  if (value.button_label !== undefined) {
                    updateKey("button_label", e.target.value)
                  } else {
                    updateKey("buttonLabel", e.target.value)
                  }
                }}
                placeholder="Ví dụ: Đăng ký tư vấn miễn phí"
                className="rounded-none text-xs font-bold"
              />
            </Field>
            <Field label="Đường dẫn nút bấm (CTA URL)">
              <Input
                value={value.buttonUrl || value.button_url || value.button_link || ""}
                onChange={(e) => {
                  if (value.button_url !== undefined) {
                    updateKey("button_url", e.target.value)
                  } else {
                    updateKey("buttonUrl", e.target.value)
                  }
                }}
                placeholder="Ví dụ: /lien-he hoặc https://..."
                className="rounded-none text-xs font-mono"
              />
            </Field>
          </div>
        </div>
      )}

      {/* 3. Background Color / Gradient Config */}
      {isBgConfigurable && (
        <div className="space-y-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <Palette className="h-4 w-4 text-[#ed1c24]" />
            <div>
              <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Màu nền Section (Background Color / Gradient)</p>
              <p className="text-[11px] text-slate-500">Tùy chỉnh màu sắc nền đơn sắc hoặc gradient trải dài.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Màu nền / Gradient Bắt đầu (From)">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={value.backgroundFrom || value.background_from || value.backgroundColor || value.background_color || "#ed1c24"}
                  onChange={(e) => {
                    if (value.background_from !== undefined) {
                      updateKey("background_from", e.target.value)
                    } else {
                      updateKey("backgroundFrom", e.target.value)
                    }
                  }}
                  className="w-14 h-9 p-1 rounded-none cursor-pointer shrink-0 border-slate-300"
                />
                <Input
                  value={value.backgroundFrom || value.background_from || value.backgroundColor || value.background_color || "#ed1c24"}
                  onChange={(e) => {
                    if (value.background_from !== undefined) {
                      updateKey("background_from", e.target.value)
                    } else {
                      updateKey("backgroundFrom", e.target.value)
                    }
                  }}
                  className="rounded-none font-mono text-xs"
                  placeholder="#ed1c24"
                />
              </div>
            </Field>

            <Field label="Màu nền / Gradient Kết thúc (To)">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={value.backgroundTo || value.background_to || value.backgroundColor || value.background_color || "#ed1c24"}
                  onChange={(e) => {
                    if (value.background_to !== undefined) {
                      updateKey("background_to", e.target.value)
                    } else {
                      updateKey("backgroundTo", e.target.value)
                    }
                  }}
                  className="w-14 h-9 p-1 rounded-none cursor-pointer shrink-0 border-slate-300"
                />
                <Input
                  value={value.backgroundTo || value.background_to || value.backgroundColor || value.background_color || "#ed1c24"}
                  onChange={(e) => {
                    if (value.background_to !== undefined) {
                      updateKey("background_to", e.target.value)
                    } else {
                      updateKey("backgroundTo", e.target.value)
                    }
                  }}
                  className="rounded-none font-mono text-xs"
                  placeholder="#ed1c24"
                />
              </div>
            </Field>
          </div>

          {/* Live Gradient Preview Strip */}
          <div
            className="h-10 w-full flex items-center justify-center text-xs font-bold text-white rounded-none shadow-inner select-none transition-all"
            style={{
              background: `linear-gradient(90deg, ${value.backgroundFrom || value.background_from || value.backgroundColor || value.background_color || "#ed1c24"}, ${value.backgroundTo || value.background_to || value.backgroundColor || value.background_color || "#ed1c24"})`,
            }}
          >
            Xem trước màu nền Section
          </div>
        </div>
      )}

      {/* 4. Image Editor with Drag-to-align & Zoom */}
      {hasImage && (
        <ImagePositionAndZoomEditor
          imageUrl={value.image_url || value.image || ""}
          positionX={value.position_x ?? 50}
          positionY={value.position_y ?? 50}
          imageSize={value.image_size ?? 100}
          onChange={(patch) => onChange({ ...(value || {}), ...patch })}
          onPickImage={onPickSingleImage}
          title="Ảnh minh họa Section"
        />
      )}

      {/* 5. Stats Field */}
      {hasStats && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
            <div>
              <Label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
                Chỉ số thống kê (Stats)
              </Label>
              <p className="text-[11px] text-slate-500">Các khối số liệu nổi bật hiển thị kèm theo section.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white transition"
              onClick={() => {
                const current = Array.isArray(value.stats) ? [...value.stats] : []
                updateKey("stats", [...current, { label: "Nhãn mới", value: "10+" }])
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm chỉ số
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(value.stats || []).map((st: any, idx: number) => (
              <div
                key={idx}
                className="border border-slate-200 bg-white p-3 shadow-2xs dark:border-white/10 dark:bg-slate-900 space-y-2 relative"
              >
                <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ed1c24]">
                    Chỉ số #{idx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => {
                      const current = Array.isArray(value.stats) ? [...value.stats] : []
                      updateKey("stats", current.filter((_, i) => i !== idx))
                    }}
                    title="Xóa chỉ số"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Field label="Số liệu hiển thị">
                  <Input
                    value={st.value || ""}
                    onChange={(e) => {
                      const current = Array.isArray(value.stats) ? [...value.stats] : []
                      current[idx] = { ...(current[idx] || {}), value: e.target.value }
                      updateKey("stats", current)
                    }}
                    placeholder="Ví dụ: 50+, 5000+, 10..."
                    className="h-8 text-xs font-black rounded-none font-mono"
                  />
                </Field>

                <Field label="Nhãn mô tả">
                  <Input
                    value={st.label || ""}
                    onChange={(e) => {
                      const current = Array.isArray(value.stats) ? [...value.stats] : []
                      current[idx] = { ...(current[idx] || {}), label: e.target.value }
                      updateKey("stats", current)
                    }}
                    placeholder="Ví dụ: Doanh nghiệp, Học viên..."
                    className="h-8 text-xs rounded-none"
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Items Field (if component has items instead of stats) */}
      {hasItems && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
            <Label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
              Danh sách mục (Items)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white"
              onClick={() => {
                const current = Array.isArray(value.items) ? [...value.items] : []
                updateKey("items", [...current, { title: "Mục mới", description: "" }])
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm mục
            </Button>
          </div>

          <div className="space-y-2">
            {(value.items || []).map((it: any, idx: number) => (
              <div key={idx} className="border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-[#ed1c24]">Mục #{idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      const current = Array.isArray(value.items) ? [...value.items] : []
                      updateKey("items", current.filter((_, i) => i !== idx))
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input
                  value={it.title || ""}
                  onChange={(e) => {
                    const current = Array.isArray(value.items) ? [...value.items] : []
                    current[idx] = { ...(current[idx] || {}), title: e.target.value }
                    updateKey("items", current)
                  }}
                  placeholder="Tiêu đề mục..."
                  className="h-8 text-xs font-bold rounded-none"
                />
                <Textarea
                  rows={2}
                  value={it.description || ""}
                  onChange={(e) => {
                    const current = Array.isArray(value.items) ? [...value.items] : []
                    current[idx] = { ...(current[idx] || {}), description: e.target.value }
                    updateKey("items", current)
                  }}
                  placeholder="Mô tả mục..."
                  className="text-xs rounded-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function BlockPropsEditor({
  block,
  blockIndex,
  onChange,
  onPickImage,
  onPickSingleImage,
}: {
  block: PageBlock
  blockIndex: number
  onChange: (value: Record<string, any>) => void
  onPickImage: (imageIndex: number) => void
  onPickSingleImage?: () => void
}) {
  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null)
  if (block.component_type !== "image_gallery") {
    return (
      <PropsEditor
        value={block.props || {}}
        onChange={onChange}
        onPickSingleImage={onPickSingleImage}
        componentType={block.component_type || block.block_key || ""}
      />
    )
  }

  const props = block.props || {}
  const images = Array.isArray(props.images) ? props.images : []
  const updateImage = (imageIndex: number, patch: Record<string, any>) => {
    const nextImages = images.map((image: any, idx: number) => idx === imageIndex ? { ...image, ...patch } : image)
    onChange({ ...props, images: nextImages })
  }
  const moveImage = (imageIndex: number, direction: -1 | 1) => {
    const swapIndex = imageIndex + direction
    if (swapIndex < 0 || swapIndex >= images.length) return
    const nextImages = [...images]
      ;[nextImages[imageIndex], nextImages[swapIndex]] = [nextImages[swapIndex], nextImages[imageIndex]]
    onChange({ ...props, images: nextImages })
  }
  const dropImage = (targetIndex: number) => {
    if (dragImageIndex === null || dragImageIndex === targetIndex) {
      setDragImageIndex(null)
      return
    }
    const nextImages = [...images]
    const [moved] = nextImages.splice(dragImageIndex, 1)
    nextImages.splice(targetIndex, 0, moved)
    onChange({ ...props, images: nextImages })
    setDragImageIndex(null)
  }

  return (
    <div className="space-y-4 rounded-none border bg-slate-50 p-4 dark:bg-slate-950">
      <div>
        <Label className="text-xs font-bold">Image Gallery Props</Label>
        <p className="mt-1 text-xs text-slate-500">Chỉnh ảnh trong Media Library hoặc dán URL trực tiếp.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Tiêu đề gallery">
          <Input value={props.title || ""} onChange={(e) => onChange({ ...props, title: e.target.value })} className="rounded-none" />
        </Field>
        <Field label="Phụ đề gallery">
          <Input value={props.subtitle || ""} onChange={(e) => onChange({ ...props, subtitle: e.target.value })} className="rounded-none" />
        </Field>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Danh sách ảnh ({images.length})</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => onChange({ ...props, images: [...images, { src: "/placeholder.jpg", title: `Ảnh ${images.length + 1}`, category: "GZV", description: "", alt: "GZV" }] })}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm ảnh
          </Button>
        </div>
        {images.map((image: any, imgIdx: number) => (
          <div
            key={imgIdx}
            draggable
            onDragStart={() => setDragImageIndex(imgIdx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dropImage(imgIdx)}
            className="border bg-white p-3 dark:bg-slate-900"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 cursor-grab">
                <GripVertical className="h-3.5 w-3.5" /> Ảnh #{imgIdx + 1}
              </span>
              <div className="flex gap-1">
                <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-none" disabled={imgIdx === 0} onClick={() => moveImage(imgIdx, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-none" disabled={imgIdx === images.length - 1} onClick={() => moveImage(imgIdx, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="destructive" size="icon" className="h-7 w-7 rounded-none" onClick={() => onChange({ ...props, images: images.filter((_: any, i: number) => i !== imgIdx) })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <Field label="URL ảnh">
                <div className="flex gap-2">
                  <Input value={image.src || ""} onChange={(e) => updateImage(imgIdx, { src: e.target.value })} className="rounded-none font-mono text-xs" />
                  <Button type="button" variant="outline" size="sm" className="rounded-none shrink-0" onClick={() => onPickImage(imgIdx)}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
              <Field label="Tiêu đề ảnh"><Input value={image.title || ""} onChange={(e) => updateImage(imgIdx, { title: e.target.value })} className="rounded-none" /></Field>
              <Field label="Danh mục"><Input value={image.category || ""} onChange={(e) => updateImage(imgIdx, { category: e.target.value })} className="rounded-none" /></Field>
              <Field label="Alt text"><Input value={image.alt || ""} onChange={(e) => updateImage(imgIdx, { alt: e.target.value })} className="rounded-none" /></Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
