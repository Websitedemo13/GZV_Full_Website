"use client"

import { useEffect, useMemo, useState } from "react"
import type React from "react"
import { ProtectedRoute } from "@/components/admin/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { GZVRichEditor } from "@/components/editor/GZVRichEditor"
import { MediaPickerDialog, type MediaPickResult } from "@/components/media/MediaPickerDialog"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bot,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Loader2,
  Menu,
  MessageCircle,
  MonitorCog,
  MoveVertical,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react"

// Import sub-components
import { SortableNavRow } from "@/components/admin/site-content/SortableNavRow"
import { EditMenuDialog } from "@/components/admin/site-content/EditMenuDialog"
import { SharedPageHero } from "@/components/admin/site-content/SharedPageHero"
import { HeaderFooterSeoTab } from "@/components/admin/site-content/HeaderFooterSeoTab"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

type NavItem = { id?: string; href: string; label_vi: string; label_en?: string | null; parent_href?: string | null; sort_order: number; is_visible: boolean; is_page_enabled: boolean; is_external?: boolean | null; children?: NavItem[] }
type PageContent = { id?: string; slug: string; title: string; menu_title?: string | null; banner_badge?: string | null; banner_title?: string | null; banner_subtitle?: string | null; banner_description?: string | null; banner_image_url?: string | null; content_html?: string | null; is_visible: boolean; seo_title?: string | null; seo_description?: string | null }
type HomeSection = { id?: string; section_key: string; title: string; subtitle?: string | null; description?: string | null; button_label?: string | null; button_url?: string | null; sort_order: number; item_limit: number; is_visible: boolean; content_html?: string | null; settings?: Record<string, any> }
type LoadingSettings = { id: number; logo_url: string; title: string; subtitle: string; effect: "orbit" | "pulse" | "bars"; background_from: string; background_to: string; accent_color: string; enabled: boolean; minimum_duration_ms: number }
type FooterSettings = {
  id: number
  logo_url: string
  intro_text: string
  background_color: string
  bottom_background_color: string
  facebook_page_url?: string | null
  address?: string | null
  phone_label?: string | null
  phone_url?: string | null
  email_label?: string | null
  email_url?: string | null
  newsletter_title?: string | null
  newsletter_description?: string | null
  copyright_text?: string | null
  contact_person?: string | null
  contact_person_phone?: string | null
  contact_person_email?: string | null
  social_facebook?: string | null
  social_youtube?: string | null
  social_instagram?: string | null
  social_tiktok?: string | null
  terms_url?: string | null
  privacy_url?: string | null
  show_social?: boolean
  footer_text_color?: string | null
  footer_link_color?: string | null
  links: Array<{ label: string; href: string; visible?: boolean }>
  social_links: Array<{ label?: string; href?: string; icon?: string; visible?: boolean; _meta?: string }>
}
type FloatingAction = { id?: string; action_key: string; label: string; href?: string | null; icon_url?: string | null; action_type: "link" | "chatbot"; sort_order: number; is_visible: boolean }
type BrandingSettings = { id: number; site_name: string; header_logo_url: string; footer_logo_url: string; favicon_url: string; default_title: string; title_template: string; default_description?: string | null; default_keywords?: string | null; og_image_url?: string | null; topbar_email_label?: string | null; topbar_phone_label?: string | null; topbar_badge_label?: string | null; header_bg_color?: string | null; header_text_color?: string | null; header_site_name?: string | null; show_logo?: boolean; author?: string | null; canonical_url?: string | null; og_title?: string | null; og_description?: string | null; og_url?: string | null }
type SectionTemplate = { id?: string; template_key: string; name: string; category: string; component_type: string; default_props: any; sort_order: number; is_active: boolean }
type PageBlock = { id?: string; page_slug: string; block_key: string; component_type: string; title?: string | null; props: any; content_html?: string | null; sort_order: number; is_visible: boolean; responsive?: any; seo?: any }

const defaultHomeSections: HomeSection[] = [
  {
    section_key: "hero",
    title: "GZV Ltd",
    subtitle: "The Next-Gen Company",
    description: "Đồng hành cùng doanh nghiệp và thế hệ trẻ qua Marketing, Sales và Digital Transformation với tư duy triển khai thực chiến.",
    button_label: "Khám phá dịch vụ",
    button_url: "/dich-vu",
    sort_order: 10,
    item_limit: 1,
    is_visible: true,
    settings: {
      video_url: "/Intro.mp4",
      poster_url: "/og-image.jpg",
      backgroundFrom: "#050505",
      backgroundTo: "#ed1c24",
      stats: [
        { value: "10+", label: "Dự án" },
        { value: "5000+", label: "Học viên" },
        { value: "50+", label: "Đối tác" },
      ],
    },
  },
  {
    section_key: "about_gzv",
    title: "CÂU CHUYỆN GZV",
    subtitle: "Từ một cộng đồng học hỏi đến hệ sinh thái triển khai thực chiến.",
    description: "GZV được xây dựng để kết nối thế hệ trẻ, chuyên gia và doanh nghiệp trong cùng một môi trường học tập - làm thật - tạo tác động thật. Chúng tôi tin rằng năng lực chỉ bền vững khi được rèn trong dự án thực tế, dưới sự đồng hành của những người có kinh nghiệm.",
    button_label: "Xem chi tiết",
    button_url: "/gioi-thieu",
    sort_order: 20,
    item_limit: 1,
    is_visible: true,
    settings: {
      eyebrow: "GIỚI THIỆU",
      image_url: "/gioi-thieu/19.webp",
      image_alt: "GZV",
      position_x: 50,
      position_y: 50,
      image_size: 100,
      button_label: "Xem chi tiết",
      button_url: "/gioi-thieu",
    },
  },
  {
    section_key: "projects",
    title: "DỰ ÁN ĐÃ TRIỂN KHAI",
    subtitle: "Những chiến dịch và dự án tiêu biểu do GZV cùng đối tác triển khai",
    description: "Danh sách các dự án thực chiến đã mang lại giá trị đo lường được cho doanh nghiệp.",
    button_label: "Xem tất cả dự án",
    button_url: "/du-an",
    sort_order: 30,
    item_limit: 6,
    is_visible: true,
    settings: {
      background: "#ffffff",
    },
  },
  {
    section_key: "services_three",
    title: "SERVICES",
    subtitle: "Marketing | Sales | Digital Transformation | Education | Events",
    description: "Giải pháp đào tạo, tư vấn và triển khai thực chiến cho cá nhân & doanh nghiệp.",
    button_label: "Xem tất cả dịch vụ",
    button_url: "/dich-vu",
    sort_order: 40,
    item_limit: 3,
    is_visible: true,
    settings: {
      services: [
        { title: "MARKETING & BRANDING", description: "Đào tạo thực chiến & tư vấn chiến lược marketing tổng thể, phát triển thương hiệu đa kênh.", link: "/dich-vu/marketing", icon: "megaphone" },
        { title: "SALES & PHÁT TRIỂN DOANH SỐ", description: "Xây dựng quy trình bán hàng, tối ưu hóa tỷ lệ chuyển đổi và mở rộng thị trường.", link: "/dich-vu", icon: "trend" },
        { title: "DIGITAL TRANSFORMATION", description: "Ứng dụng công nghệ, AI và tự động hóa quy trình vận hành doanh nghiệp hiệu quả.", link: "/dich-vu", icon: "cpu" },
      ],
    },
  },
  {
    section_key: "about_boxes",
    title: "VỀ CHÚNG TÔI",
    subtitle: "Đội ngũ nhân sự, chuyên gia và phòng ban nòng cốt tạo nên giá trị cho GZV.",
    description: "Ban Điều Hành, Ban Cố Vấn và Đội ngũ GZVers đồng hành cùng sự phát triển của hệ sinh thái.",
    button_label: "Xem thêm",
    button_url: "/gioi-thieu",
    sort_order: 50,
    item_limit: 6,
    is_visible: true,
    settings: {
      limitPerDepartment: 6,
      boxes: [
        { title: "BAN ĐIỀU HÀNH", description: "Đội ngũ lãnh đạo và định hướng chiến lược phát triển của GZV Center.", key: "ban_dieu_hanh" },
        { title: "BAN CỐ VẤN", description: "Các chuyên gia đầu ngành trong nhiều lĩnh vực đồng hành cố vấn chuyên môn.", key: "ban_co_van" },
        { title: "ĐỘI NGŨ GZVERS", description: "Những gương mặt trẻ tài năng, nhiệt huyết tham gia triển khai thực tế.", key: "gzvers" },
      ],
    },
  },
  {
    section_key: "partners",
    title: "ĐỐI TÁC",
    subtitle: "ĐỐI TÁC ĐỒNG HÀNH KHẮP CẢ NƯỚC",
    description: "GZV tự hào đồng hành cùng các doanh nghiệp, tổ chức giáo dục và thương hiệu hàng đầu.",
    button_label: "Hợp tác với GZV",
    button_url: "/lien-he",
    sort_order: 60,
    item_limit: 40,
    is_visible: true,
    settings: {
      background: "#ffffff",
    },
  },
  {
    section_key: "news",
    title: "TIN TỨC & BÀI VIẾT MỚI NHẤT",
    subtitle: "Cập nhật những thông tin, sự kiện và bài viết chia sẻ tri thức mới nhất từ GZV.",
    description: "Góc nhìn chuyên sâu, tin tức sự kiện và kiến thức thực chiến từ các chuyên gia.",
    button_label: "Xem tất cả bài viết",
    button_url: "/tin-tuc",
    sort_order: 70,
    item_limit: 6,
    is_visible: true,
    settings: {
      background: "#ffffff",
    },
  },
]

const fallbackTemplates: SectionTemplate[] = [
  {
    template_key: "hero-stats",
    name: "Hero Sắc Cạnh + Số Liệu (HeroStats)",
    category: "home",
    component_type: "hero_stats",
    default_props: {
      title: "TIÊU ĐỀ TRANG",
      subtitle: "Mô tả ngắn, gọn và sắc nét cho trang.",
      stats: [{ value: "10+", label: "Dự án" }, { value: "5000+", label: "Học viên" }, { value: "50+", label: "Đối tác" }],
      backgroundFrom: "#050505",
      backgroundTo: "#ed1c24",
    },
    sort_order: 1,
    is_active: true,
  },
  {
    template_key: "about-gzv",
    name: "Giới Thiệu GZV (AboutGzv)",
    category: "home",
    component_type: "about_gzv",
    default_props: {
      title: "GZV LTD - HÀNH TRÌNH KIẾN TẠO",
      subtitle: "GZV Center được thành lập với sứ mệnh hỗ trợ và phát triển năng lực lãnh đạo cho thế hệ trẻ.",
      description: "Chúng tôi mang đến các chương trình huấn luyện, tư vấn chiến lược và môi trường trải nghiệm thực chiến.",
      image_url: "/placeholder.jpg",
      button_label: "XEM CÂU CHUYỆN GZV",
      button_url: "/gioi-thieu",
    },
    sort_order: 2,
    is_active: true,
  },
  {
    template_key: "projects-grid",
    name: "Dự Án Tiêu Biểu (ProjectsGrid)",
    category: "home",
    component_type: "projects_grid",
    default_props: {
      title: "DỰ ÁN TIÊU BIỂU",
      subtitle: "Những chiến dịch và dự án tiêu biểu do GZV cùng đối tác triển khai.",
      item_limit: 6,
      button_label: "XEM TẤT CẢ DỰ ÁN",
      button_url: "/du-an",
    },
    sort_order: 3,
    is_active: true,
  },
  {
    template_key: "services-three",
    name: "Dịch Vụ Cung Cấp (ServicesThree)",
    category: "home",
    component_type: "services_three",
    default_props: {
      title: "GIẢI PHÁP ĐÀO TẠO & PHÁT TRIỂN",
      subtitle: "Các gói giải pháp được thiết kế tối ưu cho cá nhân và tổ chức.",
    },
    sort_order: 4,
    is_active: true,
  },
  {
    template_key: "about-boxes",
    name: "Khối Sứ Mệnh & Tầm Nhìn (AboutBoxes)",
    category: "home",
    component_type: "about_boxes",
    default_props: {
      title: "GIÁ TRỊ CỐT LÕI CỦA GZV",
      items: [
        { title: "SỨ MỆNH", description: "Truyền cảm hứng và khai phóng tiềm năng của thế hệ trẻ Việt Nam.", icon: "target" },
        { title: "TẦM NHÌN", description: "Trở thành hệ sinh thái đào tạo & phát triển tư duy hàng đầu.", icon: "eye" },
        { title: "GIÁ TRỊ", description: "Chân thật - Đột phá - Bền vững - Đồng hành.", icon: "award" },
      ],
    },
    sort_order: 5,
    is_active: true,
  },
  {
    template_key: "partners-grid",
    name: "Đối Tác Đồng Hành (PartnersGrid)",
    category: "home",
    component_type: "partners_grid",
    default_props: {
      title: "ĐỐI TÁC ĐỒNG HÀNH KHẮP CẢ NƯỚC",
      subtitle: "GZV tự hào đồng hành cùng các tập đoàn và thương hiệu hàng đầu.",
    },
    sort_order: 6,
    is_active: true,
  },
  {
    template_key: "news-grid",
    name: "Tin Tức & Bài Viết Mới Nhất (NewsGrid)",
    category: "home",
    component_type: "news_grid",
    default_props: {
      title: "TIN TỨC & BÀI VIẾT MỚI NHẤT",
      subtitle: "Cập nhật những thông tin, sự kiện và bài viết chia sẻ tri thức mới nhất từ GZV.",
      item_limit: 3,
      button_label: "XEM TẤT CẢ BÀI VIẾT",
      button_url: "/tin-tuc",
    },
    sort_order: 7,
    is_active: true,
  },
  {
    template_key: "feature-grid-red",
    name: "Lưới Giá Trị / Tính Năng (FeatureGrid)",
    category: "content",
    component_type: "feature_grid",
    default_props: {
      title: "GIÁ TRỊ NỔI BẬT",
      subtitle: "Các điểm mạnh có thể thêm, xóa, sửa trực tiếp trong props.",
      columns: 3,
      items: [
        { title: "Tư duy chiến lược", description: "Mô tả ngắn cho giá trị này.", icon: "target", color: "#ed1c24" },
        { title: "Triển khai thực chiến", description: "Mô tả ngắn cho giá trị này.", icon: "book", color: "#050505" },
        { title: "Đo lường kết quả", description: "Mô tả ngắn cho giá trị này.", icon: "award", color: "#ed1c24" },
      ],
    },
    sort_order: 10,
    is_active: true,
  },
  {
    template_key: "gallery-editor",
    name: "Bộ Ảnh Thư Viện (ImageGallery)",
    category: "media",
    component_type: "image_gallery",
    default_props: {
      title: "THƯ VIỆN HÌNH ẢNH",
      subtitle: "Quản lý từng ảnh, tiêu đề, mô tả và phân loại.",
      images: [
        { src: "/placeholder.jpg", title: "Ảnh 1", category: "GZV", description: "Mô tả ảnh", alt: "GZV" },
        { src: "/placeholder.jpg", title: "Ảnh 2", category: "GZV", description: "Mô tả ảnh", alt: "GZV" },
      ],
    },
    sort_order: 11,
    is_active: true,
  },
  {
    template_key: "rich-content",
    name: "Khối Nội Dung Rich Text (HtmlBlock)",
    category: "content",
    component_type: "html_rich",
    default_props: { maxWidth: "980px" },
    sort_order: 12,
    is_active: true,
  },
  {
    template_key: "contact-layout",
    name: "Form + Thông Tin Liên Hệ",
    category: "contact",
    component_type: "contact_section",
    default_props: {
      title: "KẾT NỐI VỚI CHÚNG TÔI",
      subtitle: "Để lại thông tin để nhận tư vấn nhanh nhất.",
      phone: "(+84) 329 381 489",
      email: "gzv.one@gmail.com",
      address: "279 Nguyễn Tri Phương, Phường Diên Hồng, TP.Hồ Chí Minh",
    },
    sort_order: 13,
    is_active: true,
  },
]

const defaultNav: NavItem[] = [
  { href: "/", label_vi: "TRANG CHỦ", label_en: "HOME", sort_order: 5, is_visible: true, is_page_enabled: true },
  { href: "/gioi-thieu", label_vi: "GIỚI THIỆU", label_en: "ABOUT", sort_order: 10, is_visible: true, is_page_enabled: true },
  {
    href: "/dich-vu",
    label_vi: "DỊCH VỤ",
    label_en: "SERVICES",
    sort_order: 20,
    is_visible: true,
    is_page_enabled: true,
    children: [
      { href: "/dich-vu/marketing", label_vi: "MARKETING", label_en: "MARKETING", parent_href: "/dich-vu", sort_order: 10, is_visible: true, is_page_enabled: true },
      { href: "/cua-hang", label_vi: "CỬA HÀNG", label_en: "STORE", parent_href: "/dich-vu", sort_order: 20, is_visible: true, is_page_enabled: true },
    ],
  },
  { href: "/du-an", label_vi: "DỰ ÁN", label_en: "PROJECTS", sort_order: 30, is_visible: true, is_page_enabled: true },
  { href: "/gzver", label_vi: "GZVers", label_en: "GZVers", sort_order: 40, is_visible: true, is_page_enabled: true },
  { href: "/tin-tuc", label_vi: "TIN TỨC", label_en: "NEWS", sort_order: 50, is_visible: true, is_page_enabled: true },
  { href: "/lien-he", label_vi: "LIÊN HỆ", label_en: "CONTACT", sort_order: 60, is_visible: true, is_page_enabled: true },
]

const quickBuilderPages = [
  { slug: "dich-vu", label: "Dịch vụ", hint: "Trang riêng /dich-vu" },
  { slug: "gioi-thieu", label: "Giới thiệu", hint: "Câu chuyện, sứ mệnh, tầm nhìn" },
  { slug: "du-an", label: "Dự án", hint: "Banner, block dự án" },
  { slug: "gzver", label: "GZVers", hint: "Cộng đồng, ban, profile" },
  { slug: "tin-tuc", label: "Tin tức", hint: "Banner và block nội dung tin" },
  { slug: "lien-he", label: "Liên hệ", hint: "Form, map, thông tin liên hệ" },
]

const defaultLoading: LoadingSettings = { id: 1, logo_url: "/logo.webp", title: "GZV", subtitle: "Đang tải dữ liệu...", effect: "orbit", background_from: "#050505", background_to: "#ed1c24", accent_color: "#ed1c24", enabled: true, minimum_duration_ms: 900 }
const defaultBranding: BrandingSettings = { id: 1, site_name: "GZV", header_logo_url: "/logo.webp", footer_logo_url: "/logo.webp", favicon_url: "/logo/favicon.ico", default_title: "GZV - The Voice of Genzers", title_template: "%s | GZV", default_description: "GZV Center", default_keywords: "GZV, đào tạo, mentoring, coaching", og_image_url: "/og-image.jpg", topbar_email_label: "gzv.one@gmail.com", topbar_phone_label: "(+84) 329 381 489", topbar_badge_label: "GZV" }
const defaultFooter: FooterSettings = {
  id: 1,
  logo_url: "/logo.webp",
  intro_text: "GZV - The Voice of Genzers",
  background_color: "#050505",
  bottom_background_color: "#111111",
  facebook_page_url: "https://www.facebook.com/gzv.one",
  address: "279 Nguyễn Tri Phương, Phường Diên Hồng, TP.Hồ Chí Minh",
  phone_label: "Điện Thoại: (+84) 329 381 489",
  phone_url: "tel:+84329381489",
  email_label: "Email: gzv.one@gmail.com",
  email_url: "mailto:gzv.one@gmail.com",
  newsletter_title: "Kết nối với chúng tôi",
  newsletter_description: "Đăng ký để nhận thông tin về các khóa học và sự kiện mới nhất.",
  copyright_text: "gzv Center. Phát triển bởi Phòng Công nghệ thông tin.",
  links: [],
  social_links: [],
}

const defaultBannerConfig = {
  badge: "GZV CENTER",
  title: "TIÊU ĐỀ BÌA CỦA TRANG",
  subtitle: "Mô tả ngắn gọn sắc nét cho banner trang",
  use_image: true,
  cover_url: "/placeholder.jpg",
  imagePositionY: "50%",
  bg_color: "#050505",
  titleAlignment: "center" as "left" | "center" | "right",
  show_badge: true,
  show_title: true,
  show_subtitle: true,
  badge_color: "#ffffff",
  title_color: "#ffffff",
  subtitle_color: "rgba(255,255,255,0.85)",
}

function normalizeSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}

function SwitchLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg border p-3"><Label>{label}</Label><Switch checked={checked} onCheckedChange={onChange} /></div>
}

function ListCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="rounded-none border-slate-200 dark:border-white/10"><CardHeader><CardTitle className="text-base font-black uppercase">{title}</CardTitle></CardHeader><CardContent className="space-y-2">{children}</CardContent></Card>
}

function ControlStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function PickerInput({ value, onChange, onPick }: { value: string; onChange: (value: string) => void; onPick: () => void }) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-none" />
      <Button type="button" variant="outline" onClick={onPick} className="rounded-none"><ImageIcon className="h-4 w-4" /></Button>
    </div>
  )
}

function renderPropControl(value: any, onChange: (value: any) => void) {
  if (typeof value === "boolean") {
    return <Switch checked={value} onCheckedChange={onChange} />
  }
  if (typeof value === "number") {
    return <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="rounded-none" />
  }
  if (typeof value === "string") {
    const looksLikeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
    if (looksLikeColor) {
      return (
        <div className="flex gap-2">
          <Input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="w-16 shrink-0 rounded-none" />
          <Input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-none font-mono" />
        </div>
      )
    }
    if (value.length > 90) {
      return <Textarea value={value} onChange={(event) => onChange(event.target.value)} className="rounded-none text-xs" />
    }
    return <Input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-none" />
  }
  if (Array.isArray(value)) {
    return <ArrayPropEditor rows={value} onChange={onChange} />
  }

  return (
    <Textarea
      className="min-h-[120px] font-mono text-xs rounded-none"
      value={JSON.stringify(value ?? null, null, 2)}
      onChange={(event) => {
        try {
          onChange(JSON.parse(event.target.value || "null"))
        } catch {
          onChange(value)
        }
      }}
    />
  )
}

function ArrayPropEditor({ rows, onChange }: { rows: any[]; onChange: (value: any[]) => void }) {
  const isObjectArray = rows.every((row) => row && typeof row === "object" && !Array.isArray(row))
  const move = (index: number, direction: -1 | 1) => {
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= rows.length) return
    const nextRows = [...rows]
      ;[nextRows[index], nextRows[swapIndex]] = [nextRows[swapIndex], nextRows[index]]
    onChange(nextRows)
  }

  if (!isObjectArray) {
    return (
      <Textarea
        className="min-h-[120px] font-mono text-xs rounded-none"
        value={JSON.stringify(rows, null, 2)}
        onChange={(event) => {
          try {
            const parsed = JSON.parse(event.target.value || "[]")
            onChange(Array.isArray(parsed) ? parsed : rows)
          } catch {
            onChange(rows)
          }
        }}
      />
    )
  }

  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row || {}))))
  const updateRow = (index: number, key: string, nextValue: string) => {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: nextValue } : row))
  }
  const addRow = () => {
    const template = Object.fromEntries((keys.length ? keys : ["title", "description"]).map((key) => [key, ""]))
    onChange([...rows, template])
  }

  return (
    <div className="space-y-3 border bg-white p-3 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Danh sách item</span>
        <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" /> Thêm item
        </Button>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="border bg-slate-50 p-3 dark:bg-slate-950">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><GripVertical className="h-3.5 w-3.5" /> Item #{index + 1}</span>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-none" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-none" disabled={index === rows.length - 1} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
              <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-none" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {keys.map((key) => (
              <Field key={key} label={key}>
                {String(row?.[key] || "").length > 80 ? (
                  <Textarea value={String(row?.[key] || "")} onChange={(event) => updateRow(index, key, event.target.value)} className="rounded-none" />
                ) : (
                  <Input value={String(row?.[key] ?? "")} onChange={(event) => updateRow(index, key, event.target.value)} className="rounded-none" />
                )}
              </Field>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PropsEditor({ value, onChange }: { value: Record<string, any>; onChange: (value: Record<string, any>) => void }) {
  const [rawJson, setRawJson] = useState(() => JSON.stringify(value || {}, null, 2))
  const [jsonError, setJsonError] = useState("")

  useEffect(() => {
    setRawJson(JSON.stringify(value || {}, null, 2))
    setJsonError("")
  }, [value])

  const updateKey = (key: string, nextValue: any) => {
    onChange({ ...(value || {}), [key]: nextValue })
  }

  const entries = Object.entries(value || {})

  return (
    <div className="space-y-4 rounded-none border bg-slate-50 p-4 dark:bg-slate-950">
      <div>
        <Label className="text-xs font-bold">Props editor</Label>
        <p className="mt-1 text-xs text-slate-500">Edit nhanh từng field. Object/array vẫn có JSON riêng để can thiệp sâu.</p>
      </div>
      {entries.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {entries.map(([key, item]) => (
            <Field key={key} label={key}>
              {renderPropControl(item, (nextValue) => updateKey(key, nextValue))}
            </Field>
          ))}
        </div>
      )}
      <Field label="Raw JSON">
        <Textarea
          className="min-h-[180px] font-mono text-xs rounded-none"
          value={rawJson}
          onChange={(event) => {
            const text = event.target.value
            setRawJson(text)
            try {
              const parsed = JSON.parse(text || "{}")
              setJsonError("")
              onChange(parsed)
            } catch (error: any) {
              setJsonError(error.message || "JSON không hợp lệ")
            }
          }}
        />
      </Field>
      {jsonError && <p className="text-xs font-bold text-red-600">{jsonError}</p>}
    </div>
  )
}

function BlockPropsEditor({
  block,
  blockIndex,
  onChange,
  onPickImage,
}: {
  block: PageBlock
  blockIndex: number
  onChange: (value: Record<string, any>) => void
  onPickImage: (imageIndex: number) => void
}) {
  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null)
  if (block.component_type !== "image_gallery") {
    return <PropsEditor value={block.props || {}} onChange={onChange} />
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

function SiteContentManager() {
  const [activeTab, setActiveTab] = useState("menu")
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNav)
  const [pages, setPages] = useState<PageContent[]>([])
  const [homeSections, setHomeSections] = useState<HomeSection[]>([])
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter)
  const [floating, setFloating] = useState<FloatingAction[]>([])
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding)
  const [templates, setTemplates] = useState<SectionTemplate[]>([])
  const [pageBlocks, setPageBlocks] = useState<PageBlock[]>([])
  const [selectedSlug, setSelectedSlug] = useState("gioi-thieu")
  const [builderSlug, setBuilderSlug] = useState("gioi-thieu")
  const [slugRenames, setSlugRenames] = useState<Record<string, string>>({})
  const [selectedSectionKey, setSelectedSectionKey] = useState("hero")
  const [loadingSettings, setLoadingSettings] = useState<LoadingSettings>(defaultLoading)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState<string | { blockImageIndex: number; imageIndex: number } | null>(null)

  // Hero Banner states
  const [globalBannerConfig, setGlobalBannerConfig] = useState<any>(defaultBannerConfig)
  const [syncAllBanners, setSyncAllBanners] = useState(true)
  const [selectedPageForPreview, setSelectedPageForPreview] = useState<string | null>("gioi-thieu")
  const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedPage = useMemo(() => pages.find((page) => page.slug === selectedSlug) || null, [pages, selectedSlug])
  const builderPage = useMemo(() => pages.find((page) => page.slug === builderSlug) || null, [pages, builderSlug])
  const builderBlocks = useMemo(
    () => pageBlocks
      .map((block, index) => ({ block, index }))
      .filter((item) => item.block.page_slug === builderSlug)
      .sort((a, b) => (a.block.sort_order || 0) - (b.block.sort_order || 0)),
    [pageBlocks, builderSlug],
  )
  const selectedSection = useMemo(() => homeSections.find((section) => section.section_key === selectedSectionKey) || null, [homeSections, selectedSectionKey])
  const builderSlugs = useMemo(() => {
    const navSlugs = defaultNav
      .map((item) => item.href.split("#")[0].replace("/", ""))
      .filter((slug) => slug && slug !== "")
    return [...new Set([...navSlugs, ...pages.map((page) => page.slug), ...pageBlocks.map((block) => block.page_slug)])]
  }, [pages, pageBlocks])
  const orderedHomeSections = useMemo(() => {
    const validHomeKeys = ["hero", "about_gzv", "projects", "services_three", "about_boxes", "partners", "news", "mentors", "gzvers"]
    return homeSections
      .filter((section) => validHomeKeys.includes(section.section_key))
      .map((section, index) => ({ section, index }))
      .sort((a, b) => (a.section.sort_order || 0) - (b.section.sort_order || 0))
  }, [homeSections])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [
          navResult,
          pagesResult,
          loadingResult,
          sectionsResult,
          footerResult,
          floatingResult,
          brandingResult,
          templatesResult,
          blocksResult,
          settingsResult,
        ] = await Promise.all([
          supabase.from("site_navigation").select("*").order("sort_order", { ascending: true }),
          supabase.from("site_pages").select("*").order("title", { ascending: true }),
          supabase.from("site_loading_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("site_home_sections").select("*").order("sort_order", { ascending: true }),
          supabase.from("site_footer_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("site_floating_actions").select("*").order("sort_order", { ascending: true }),
          supabase.from("site_branding_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("site_section_templates").select("*").order("sort_order", { ascending: true }),
          supabase.from("site_page_blocks").select("*").order("page_slug", { ascending: true }).order("sort_order", { ascending: true }),
          (async () => {
            try {
              return await supabase.from("site_settings").select("*").limit(1).maybeSingle()
            } catch (e) {
              return { data: null, error: null } as any
            }
          })(),
        ])

        let nextNav: NavItem[] = defaultNav
        if (navResult.data?.length) {
          const rawNav = navResult.data as NavItem[]
          const parentNavs = rawNav.filter((n) => !n.parent_href)
          const childNavs = rawNav.filter((n) => !!n.parent_href)
          nextNav = parentNavs.map((parent) => {
            const children = childNavs.filter((c) => c.parent_href === parent.href)
            return children.length > 0 ? { ...parent, children } : parent
          })
          if (!nextNav.some((item) => item.href === "/")) {
            nextNav.unshift(defaultNav[0])
          }
        }

        const nextPages = pagesResult.data?.length
          ? (pagesResult.data as PageContent[])
          : defaultNav.map((item) => ({
            slug: item.href.replace("/", "") || "home",
            title: item.label_vi,
            menu_title: item.label_vi,
            banner_title: item.label_vi,
            is_visible: true,
          }))

        setNavItems(nextNav)
        setPages(nextPages)
        setSelectedSlug(nextPages[0]?.slug || "gioi-thieu")
        const validHomeKeys = ["hero", "about_gzv", "projects", "services_three", "about_boxes", "partners", "news"]
        const rawFetchedSections = (sectionsResult.data || []).filter((s: any) => validHomeKeys.includes(s.section_key)) as HomeSection[]
        const mergedHomeSections = defaultHomeSections.map((defSec) => {
          const found = rawFetchedSections.find((s) => s.section_key === defSec.section_key)
          if (!found) return defSec
          return {
            ...defSec,
            ...found,
            title: found.title !== undefined && found.title !== null && found.title !== "" ? found.title : defSec.title,
            subtitle: found.subtitle !== undefined && found.subtitle !== null ? found.subtitle : defSec.subtitle,
            description: found.description !== undefined && found.description !== null ? found.description : defSec.description,
            button_label: found.button_label !== undefined && found.button_label !== null ? found.button_label : defSec.button_label,
            button_url: found.button_url !== undefined && found.button_url !== null ? found.button_url : defSec.button_url,
            item_limit: found.item_limit || defSec.item_limit,
            is_visible: found.is_visible !== undefined ? found.is_visible : defSec.is_visible,
            sort_order: found.sort_order !== undefined ? found.sort_order : defSec.sort_order,
            settings: { ...(defSec.settings || {}), ...(found.settings || {}) },
          }
        })
        setHomeSections(mergedHomeSections)
        setSelectedSectionKey("hero")

        const fetchedFooter = (footerResult.data || {}) as any
        const metaItem = (fetchedFooter.social_links as any[])?.find((item: any) => item._meta === "contact_person_info") || {}
        setFooter({
          ...defaultFooter,
          ...fetchedFooter,
          contact_person: metaItem.contact_person || fetchedFooter.contact_person || "Dương Thế Khải",
          contact_person_phone: metaItem.contact_person_phone || fetchedFooter.contact_person_phone || "(+84) 329 381 489",
          contact_person_email: metaItem.contact_person_email || fetchedFooter.contact_person_email || "one.gzv@gmail.com",
          terms_url: metaItem.terms_url || fetchedFooter.terms_url || "/terms",
          privacy_url: metaItem.privacy_url || fetchedFooter.privacy_url || "/privacy",
          social_facebook: metaItem.social_facebook || fetchedFooter.social_facebook || "https://www.facebook.com/gzv.one",
          social_youtube: metaItem.social_youtube || fetchedFooter.social_youtube || "",
          social_instagram: metaItem.social_instagram || fetchedFooter.social_instagram || "",
          social_tiktok: metaItem.social_tiktok || fetchedFooter.social_tiktok || "",
        })
        setFloating((floatingResult.data || []) as FloatingAction[])
        const fetchedBranding = (brandingResult.data || {}) as any
        let headerMeta: any = {}
        try {
          if (fetchedBranding.default_keywords && fetchedBranding.default_keywords.startsWith("{")) {
            headerMeta = JSON.parse(fetchedBranding.default_keywords)
          }
        } catch (e) { }

        setBranding({
          ...defaultBranding,
          ...fetchedBranding,
          header_bg_color: headerMeta.header_bg_color || fetchedBranding.header_bg_color || "",
          header_text_color: headerMeta.header_text_color || fetchedBranding.header_text_color || "",
          header_site_name: headerMeta.header_site_name || fetchedBranding.header_site_name || fetchedBranding.site_name || "GZV CENTER",
          show_logo: headerMeta.show_logo !== undefined ? headerMeta.show_logo : (fetchedBranding.show_logo !== false),
          author: headerMeta.author || fetchedBranding.author || "GZV Center",
          canonical_url: headerMeta.canonical_url || fetchedBranding.canonical_url || "https://www.gzv.one",
          og_title: headerMeta.og_title || fetchedBranding.og_title || "",
          og_description: headerMeta.og_description || fetchedBranding.og_description || "",
          og_url: headerMeta.og_url || fetchedBranding.og_url || "",
        })
        setTemplates((templatesResult.data || []) as SectionTemplate[])
        setPageBlocks((blocksResult.data || []) as PageBlock[])

        if (settingsResult.data) {
          if (settingsResult.data.page_heroes?.global_banner) {
            setGlobalBannerConfig({ ...defaultBannerConfig, ...settingsResult.data.page_heroes.global_banner })
          }
          if (typeof settingsResult.data.page_heroes?.sync_all_banners === "boolean") {
            setSyncAllBanners(settingsResult.data.page_heroes.sync_all_banners)
          }
        }
      } catch (error: any) {
        toast.error(error.message || "Không tải được cấu hình website.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selectedPageObj = useMemo(
    () => pages.find((p) => p.slug === selectedPageForPreview) || pages[0] || null,
    [pages, selectedPageForPreview]
  )

  const saveNavigation = async () => {
    try {
      setSaving(true)
      const rows: any[] = []
      navItems.forEach((item, idx) => {
        rows.push({
          href: item.href,
          label_vi: item.label_vi,
          label_en: item.label_en || null,
          parent_href: null,
          sort_order: (idx + 1) * 10,
          is_visible: item.is_visible,
          is_page_enabled: item.is_page_enabled,
          is_external: item.is_external || false,
        })
        if (item.children && item.children.length > 0) {
          item.children.forEach((child, cIdx) => {
            rows.push({
              href: child.href,
              label_vi: child.label_vi,
              label_en: child.label_en || null,
              parent_href: item.href,
              sort_order: (cIdx + 1) * 10,
              is_visible: child.is_visible,
              is_page_enabled: child.is_page_enabled,
              is_external: child.is_external || false,
            })
          })
        }
      })

      const { error } = await supabase.from("site_navigation").upsert(rows, { onConflict: "href" })
      if (error) throw error
      toast.success("Đã lưu cấu hình menu điều hướng!")
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu menu")
    } finally {
      setSaving(false)
    }
  }

  const saveBannerConfig = async (targetSlug?: string) => {
    try {
      setSaving(true)
      if (targetSlug && selectedPageObj) {
        const { error } = await supabase.from("site_pages").upsert([
          {
            ...selectedPageObj,
            slug: selectedPageObj.slug,
            banner_badge: selectedPageObj.banner_badge,
            banner_title: selectedPageObj.banner_title,
            banner_subtitle: selectedPageObj.banner_subtitle,
            banner_image_url: selectedPageObj.banner_image_url,
          },
        ], { onConflict: "slug" })
        if (error) throw error
        toast.success(`Đã lưu banner trang ${selectedPageObj.title || selectedPageObj.slug}!`)
      } else {
        let existingSettings: any = null
        try {
          const res = await supabase.from("site_settings").select("page_heroes").eq("id", 1).maybeSingle()
          existingSettings = res.data
        } catch (e) { }

        const pageHeroes = existingSettings?.page_heroes || {}
        const updatedHeroes = {
          ...pageHeroes,
          global_banner: globalBannerConfig,
          sync_all_banners: syncAllBanners,
        }

        try {
          await supabase.from("site_settings").upsert([{ id: 1, page_heroes: updatedHeroes }], { onConflict: "id" })
        } catch (e) { }

        toast.success("Đã lưu cấu hình Giao diện Banner chung!")
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu banner")
    } finally {
      setSaving(false)
    }
  }

  const saveHeaderAndFooter = async () => {
    try {
      setSaving(true)

      const rawSocialLinks = Array.isArray(footer.social_links) ? footer.social_links : []
      const filteredSocialLinks = rawSocialLinks.filter((s: any) => s && s._meta !== "contact_person_info")

      const socialLinksPayload = [
        ...filteredSocialLinks,
        {
          _meta: "contact_person_info",
          contact_person: footer.contact_person || "",
          contact_person_phone: footer.contact_person_phone || "",
          contact_person_email: footer.contact_person_email || "",
          terms_url: footer.terms_url || "/terms",
          privacy_url: footer.privacy_url || "/privacy",
          social_facebook: footer.social_facebook || "",
          social_youtube: footer.social_youtube || "",
          social_instagram: footer.social_instagram || "",
          social_tiktok: footer.social_tiktok || "",
        },
      ]

      const footerPayload = {
        id: 1,
        logo_url: footer.logo_url !== undefined ? footer.logo_url : (branding.footer_logo_url ?? ""),
        intro_text: footer.intro_text || "",
        background_color: footer.background_color || "#050505",
        bottom_background_color: footer.bottom_background_color || footer.background_color || "#050505",
        facebook_page_url: footer.facebook_page_url || "",
        address: footer.address || "",
        phone_label: footer.phone_label || "",
        phone_url: footer.phone_url || "",
        email_label: footer.email_label || "",
        email_url: footer.email_url || "",
        newsletter_title: footer.newsletter_title || "",
        newsletter_description: footer.newsletter_description || "",
        copyright_text: footer.copyright_text || "",
        links: footer.links || [],
        social_links: socialLinksPayload,
      }

      const headerMeta = {
        header_bg_color: branding.header_bg_color || "",
        header_text_color: branding.header_text_color || "",
        header_site_name: branding.header_site_name || branding.site_name || "",
        show_logo: branding.show_logo !== false,
        author: branding.author || "GZV Center",
        canonical_url: branding.canonical_url || "https://www.gzv.one",
        og_title: branding.og_title || "",
        og_description: branding.og_description || "",
        og_url: branding.og_url || "",
      }

      const brandingPayload = {
        id: 1,
        site_name: branding.header_site_name || branding.site_name || "GZV",
        header_logo_url: branding.header_logo_url !== undefined ? branding.header_logo_url : "",
        footer_logo_url: branding.footer_logo_url !== undefined ? branding.footer_logo_url : "",
        favicon_url: branding.favicon_url || "/logo/favicon.ico",
        default_title: branding.default_title || "GZV - The Voice of Genzers",
        title_template: branding.title_template || "%s | GZV",
        default_description: branding.default_description || "",
        default_keywords: JSON.stringify(headerMeta),
        og_image_url: branding.og_image_url || "",
        topbar_email_label: branding.topbar_email_label || "gzv.one@gmail.com",
        topbar_phone_label: branding.topbar_phone_label || "(+84) 329 381 489",
        topbar_badge_label: branding.topbar_badge_label || "GZV",
      }

      const [brandingRes, footerRes] = await Promise.all([
        supabase.from("site_branding_settings").upsert([brandingPayload], { onConflict: "id" }),
        supabase.from("site_footer_settings").upsert([footerPayload], { onConflict: "id" }),
      ])
      if (brandingRes.error) throw brandingRes.error
      if (footerRes.error) throw footerRes.error
      toast.success("Đã lưu toàn bộ cấu hình Header, Footer & SEO thành công!")
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu cấu hình Header, Footer & SEO")
    } finally {
      setSaving(false)
    }
  }

  // Home Section functions
  const updateSection = (patch: Partial<HomeSection>) => {
    setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, ...patch } : item))
  }
  const updateSectionSettings = (patch: Record<string, any>) => {
    setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, settings: { ...(item.settings || {}), ...patch } } : item))
  }
  const moveHomeSection = (sectionKey: string, direction: -1 | 1) => {
    const currentPosition = orderedHomeSections.findIndex((entry) => entry.section.section_key === sectionKey)
    const current = orderedHomeSections[currentPosition]
    const swapWith = orderedHomeSections[currentPosition + direction]
    if (!current || !swapWith) return
    setHomeSections((items) => items.map((item, index) => {
      if (index === current.index) return { ...item, sort_order: swapWith.section.sort_order }
      if (index === swapWith.index) return { ...item, sort_order: current.section.sort_order }
      return item
    }))
  }
  const normalizeHomeSectionOrder = () => {
    setHomeSections((items) => {
      const rank = new Map(orderedHomeSections.map((item, position) => [item.section.section_key, (position + 1) * 10]))
      return items.map((item) => ({ ...item, sort_order: rank.get(item.section_key) || item.sort_order }))
    })
    toast.success("Đã sắp lại thứ tự section. Bấm Lưu section trang chủ để ghi lên Supabase.")
  }

  const addHomeSection = () => {
    const validHomeKeys = ["hero", "about_gzv", "projects", "services_three", "about_boxes", "partners", "news"]
    const missingDef = defaultHomeSections.find((def) => !homeSections.some((h) => h.section_key === def.section_key))
    if (!missingDef) {
      toast.info("Tất cả 7 section chuẩn của Trang Chủ đã có đầy đủ!")
      return
    }
    setHomeSections((items) => [...items, missingDef])
    setSelectedSectionKey(missingDef.section_key)
    toast.success(`Đã thêm section ${missingDef.title}`)
  }
  const resetHomeSectionsToDefault = () => {
    if (window.confirm("Bạn có chắc muốn nạp lại toàn bộ dữ liệu gốc chuẩn từ các component Home? Tất cả 7 section sẽ được điền đầy đủ dữ liệu từ code Frontend.")) {
      setHomeSections(defaultHomeSections)
      setSelectedSectionKey("hero")
      toast.success("Đã nạp toàn bộ dữ liệu gốc từ các component Home! Hãy bấm 'Lưu Section Trang Chủ' để lưu vào Database.")
    }
  }

  const deleteHomeSection = async (sectionKey: string) => {
    const updated = homeSections.filter((item) => item.section_key !== sectionKey)
    setHomeSections(updated)
    setSelectedSectionKey(updated[0]?.section_key || "hero")
    const { error } = await supabase.from("site_home_sections").delete().eq("section_key", sectionKey)
    if (error) toast.error(error.message)
    else toast.success("Đã xóa section trang chủ")
  }
  const saveHomeSections = async () => {
    try {
      setSaving(true)
      const validHomeKeys = ["hero", "about_gzv", "projects", "services_three", "about_boxes", "partners", "news"]
      const { data: existingDbSections } = await supabase.from("site_home_sections").select("section_key")
      if (existingDbSections && existingDbSections.length > 0) {
        const invalidKeys = existingDbSections.map((s: any) => s.section_key).filter((k: string) => !validHomeKeys.includes(k))
        if (invalidKeys.length > 0) {
          await supabase.from("site_home_sections").delete().in("section_key", invalidKeys)
        }
      }
      const filteredHomeSections = homeSections.filter((item) => validHomeKeys.includes(item.section_key))

      const rowsToSave = filteredHomeSections.map((sec) => ({
        section_key: sec.section_key,
        title: sec.title,
        subtitle: sec.subtitle || "",
        description: sec.description || "",
        button_label: sec.button_label || "",
        button_url: sec.button_url || "",
        sort_order: Number(sec.sort_order) || 0,
        item_limit: Number(sec.item_limit) || 6,
        is_visible: Boolean(sec.is_visible),
        settings: sec.settings || {},
      }))

      const { error: saveErr } = await supabase.from("site_home_sections").upsert(rowsToSave, { onConflict: "section_key" })
      if (saveErr) {
        console.error("Lỗi khi lưu site_home_sections:", saveErr)
        throw saveErr
      }

      // Đồng bộ vào site_page_blocks để các component Frontend đọc dữ liệu tức thì
      const blocksSync = filteredHomeSections.map((sec, idx) => ({
        page_slug: "home",
        block_key: sec.section_key,
        component_type: sec.section_key === "hero" ? "hero_stats" : sec.section_key === "projects" ? "projects_grid" : sec.section_key === "partners" ? "partners_grid" : sec.section_key === "news" ? "news_grid" : sec.section_key,
        title: sec.title,
        sort_order: (idx + 1) * 10,
        is_visible: sec.is_visible,
        props: {
          title: sec.title,
          subtitle: sec.subtitle,
          description: sec.description,
          body: sec.description,
          button_label: sec.button_label,
          button_url: sec.button_url,
          item_limit: sec.item_limit,
          limit: sec.item_limit,
          ...(sec.settings || {}),
        },
      }))
      await supabase.from("site_page_blocks").upsert(blocksSync, { onConflict: "page_slug,block_key" })

      toast.success("Đã lưu thành công 7 Section Trang Chủ vào Database!")
    } catch (err: any) {
      console.error("Lỗi khi lưu section:", err)
      toast.error(err.message || "Lỗi khi lưu section")
    } finally {
      setSaving(false)
    }
  }

  // Builder functions
  const updateBlock = (index: number, patch: Partial<PageBlock>) => {
    setPageBlocks((items) => items.map((item, idx) => idx === index ? { ...item, ...patch } : item))
  }
  const moveBlock = (blockIndex: number, direction: -1 | 1) => {
    const currentPosition = builderBlocks.findIndex((entry) => entry.index === blockIndex)
    const current = builderBlocks[currentPosition]
    const swapWith = builderBlocks[currentPosition + direction]
    if (!current || !swapWith) return
    setPageBlocks((rows) => rows.map((row, index) => {
      if (index === current.index) return { ...row, sort_order: swapWith.block.sort_order }
      if (index === swapWith.index) return { ...row, sort_order: current.block.sort_order }
      return row
    }))
  }
  const duplicateBlock = (block: PageBlock) => {
    setPageBlocks((rows) => {
      const samePage = rows.filter((row) => row.page_slug === builderSlug)
      return [...rows, {
        ...block,
        id: undefined,
        block_key: `${block.block_key}-copy-${Date.now()}`,
        title: `${block.title || block.block_key} copy`,
        sort_order: samePage.length * 10 + 10,
      }]
    })
  }
  const updateBuilderPage = (patch: Partial<PageContent>) => {
    setPages((items) => items.map((item) => item.slug === builderSlug ? { ...item, ...patch } : item))
  }
  const renameBuilderSlug = (value: string) => {
    const nextSlug = normalizeSlug(value)
    if (!nextSlug || nextSlug === builderSlug) return
    const previousSlug = builderSlug
    setSlugRenames((items) => ({ ...items, [previousSlug]: nextSlug }))
    setPages((items) => items.map((item) => item.slug === previousSlug ? { ...item, slug: nextSlug } : item))
    setPageBlocks((items) => items.map((item) => item.page_slug === previousSlug ? { ...item, page_slug: nextSlug } : item))
    setNavItems((items) => items.map((item) => item.href === `/${previousSlug}` ? { ...item, href: `/${nextSlug}` } : item))
    setSelectedSlug((slug) => slug === previousSlug ? nextSlug : slug)
    setBuilderSlug(nextSlug)
  }
  const saveBuilderLayout = async () => {
    try {
      setSaving(true)
      const oldSlugs = Object.keys(slugRenames)
      const slugsToClean = [...new Set([...oldSlugs, builderSlug])]
      const page = builderPage || {
        slug: builderSlug,
        title: builderSlug,
        menu_title: builderSlug,
        banner_title: builderSlug,
        is_visible: true,
      }
      if (oldSlugs.length > 0) {
        await supabase.from("site_page_blocks").delete().in("page_slug", oldSlugs)
        await supabase.from("site_pages").delete().in("slug", oldSlugs)
      }
      const pageRows = [page]
      const targetBlocks = pageBlocks.filter((item) => slugsToClean.includes(item.page_slug)).map((block, idx) => ({
        ...block,
        page_slug: builderSlug,
        sort_order: (idx + 1) * 10,
      }))
      await supabase.from("site_page_blocks").delete().eq("page_slug", builderSlug)
      if (targetBlocks.length > 0) {
        const { error: blockErr } = await supabase.from("site_page_blocks").upsert(targetBlocks)
        if (blockErr) throw blockErr
      }
      const { error: pageErr } = await supabase.from("site_pages").upsert(pageRows, { onConflict: "slug" })
      if (pageErr) throw pageErr
      setSlugRenames({})
      toast.success(`Đã lưu layout và block trang /${builderSlug}!`)
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu layout")
    } finally {
      setSaving(false)
    }
  }
  const addPage = () => {
    const slug = `trang-moi-${Date.now()}`
    setPages((items) => [
      ...items,
      {
        slug,
        title: "Trang mới",
        menu_title: "Trang mới",
        banner_badge: "GZV",
        banner_title: "Trang mới",
        banner_subtitle: "",
        banner_description: "",
        banner_image_url: "",
        content_html: "",
        is_visible: true,
      },
    ])
    setSelectedSlug(slug)
    setBuilderSlug(slug)
  }

  const handleNavDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = navItems.findIndex((item) => String(item.id || item.href) === active.id)
    const newIndex = navItems.findIndex((item) => String(item.id || item.href) === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newNav = [...navItems]
    const [removed] = newNav.splice(oldIndex, 1)
    newNav.splice(newIndex, 0, removed)
    setNavItems(newNav)
  }

  const handleAddNavItem = () => {
    const newHref = `/trang-moi-${Date.now()}`
    const newItem: NavItem = {
      href: newHref,
      label_vi: "TRANG MỚI",
      label_en: "NEW PAGE",
      parent_href: null,
      sort_order: (navItems.length + 1) * 10,
      is_visible: true,
      is_page_enabled: true,
      is_external: false,
    }
    setNavItems([...navItems, newItem])
    setEditingMenuIndex(navItems.length)
  }

  const handleEditMenuSave = (updatedItem: NavItem) => {
    if (editingMenuIndex === null) return
    const newNav = [...navItems]
    newNav[editingMenuIndex] = updatedItem
    setNavItems(newNav)
    setEditingMenuIndex(null)
  }

  const handleDeleteNavItem = (index: number) => {
    const targetHref = navItems[index]?.href || ""
    const defaultHrefs = ["/", "/gioi-thieu", "/dich-vu", "/dich-vu/marketing", "/cua-hang", "/du-an", "/gzver", "/tin-tuc", "/lien-he"]
    if (defaultHrefs.includes(targetHref) || defaultNav.some((d) => d.href === targetHref)) {
      toast.error("Không thể xóa các trang mặc định của hệ thống! Bạn chỉ có thể ẩn hoặc đổi tên.")
      return
    }
    setNavItems(navItems.filter((_, idx) => idx !== index))
  }

  const handleToggleNavVisible = (index: number) => {
    if (navItems[index]?.href === "/") {
      toast.error("Trang Chủ luôn hiển thị trên hệ thống!")
      return
    }
    const newNav = [...navItems]
    newNav[index].is_visible = !newNav[index].is_visible
    setNavItems(newNav)
  }

  const handleGoToPageSections = (href: string) => {
    const rawPath = (href || "").split("#")[0].trim()
    const isHome = rawPath === "/" || rawPath === "" || rawPath === "#"
    if (isHome) {
      setActiveTab("home")
      toast.success("Đã chuyển tới phần chỉnh sửa Section Trang Chủ!")
    } else {
      const cleanSlug = normalizeSlug(rawPath.replace(/^\//, "")) || "gioi-thieu"
      setBuilderSlug(cleanSlug)
      setSelectedSlug(cleanSlug)
      setActiveTab("builder")
      toast.success(`Đã chuyển tới phần chỉnh sửa Section trang /${cleanSlug}!`)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#ed1c24]" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Đang tải dữ liệu Website Control...</p>
      </div>
    )
  }

  const previewBannerData = {
    badge: syncAllBanners
      ? globalBannerConfig.badge
      : selectedPageObj?.banner_badge || globalBannerConfig.badge,
    title: syncAllBanners
      ? globalBannerConfig.title
      : selectedPageObj?.banner_title || selectedPageObj?.title || globalBannerConfig.title,
    description: syncAllBanners
      ? globalBannerConfig.subtitle
      : selectedPageObj?.banner_subtitle || selectedPageObj?.banner_description || globalBannerConfig.subtitle,
    badgeColor: globalBannerConfig.badge_color || "#ffffff",
    titleColor: globalBannerConfig.title_color || "#ffffff",
    descriptionColor: globalBannerConfig.subtitle_color || "rgba(255,255,255,0.85)",
    useImage: globalBannerConfig.use_image,
    backgroundImageUrl: selectedPageObj?.banner_image_url || globalBannerConfig.cover_url,
    imagePositionY: globalBannerConfig.imagePositionY || "50%",
    bgColor: globalBannerConfig.bg_color || "#050505",
    titleAlignment: globalBannerConfig.titleAlignment || "center",
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "collab"]}>
      <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">

        {/* 1. Header Trang Website Control */}
        <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
                <Menu className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                  WEBSITE CONTROL CENTER
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Điều Khiển Toàn Bộ Website
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Quản lý menu điều hướng, từng section trang chủ, page builder, banner hero, footer, floating buttons và loading.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNavItems(defaultNav)}
                className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
              >
                <RotateCcw className="mr-1.5 h-4 w-4 text-[#ed1c24]" /> Seed menu
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  saveNavigation()
                  saveBannerConfig()
                  saveHeaderAndFooter()
                }}
                disabled={saving}
                className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
              >
                <Save className="mr-1.5 h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ControlStat label="Menu Điều Hướng" value={navItems.length} />
            <ControlStat label="Danh Sách Trang" value={pages.length} />
            <ControlStat label="Section Trang Chủ" value={homeSections.length} />
            <ControlStat label="Page Blocks" value={pageBlocks.length} />
          </div>
        </div>

        {/* 2. Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 border border-slate-200 bg-slate-100 p-1.5 rounded-none shadow-xs dark:border-white/10 dark:bg-slate-900">
            <TabsTrigger value="menu" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <LayoutTemplate className="h-3.5 w-3.5 shrink-0" /> Menu
            </TabsTrigger>
            <TabsTrigger value="banner" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 shrink-0" /> Banner (Hero)
            </TabsTrigger>
            <TabsTrigger value="header_footer" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 shrink-0" /> Header & Footer
            </TabsTrigger>
            <TabsTrigger value="floating" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <Bot className="h-3.5 w-3.5 shrink-0" /> Floating
            </TabsTrigger>
            <TabsTrigger value="loading" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0" /> Loading
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MENU & DANH SÁCH TRANG */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-none border border-slate-200 shadow-xs dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-[#ed1c24] shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Cấu trúc Menu Điều Hướng
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                  — Kéo thả sắp xếp, bấm nút "Sửa" để sửa chi tiết menu hoặc nút "Section" để mở trang sửa section.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNavItem}
                  className="h-8 px-3 rounded-none text-[10px] font-black uppercase border-slate-200 text-slate-900 dark:border-white/10 dark:text-white"
                >
                  <Plus className="h-3.5 w-3.5 mr-1 text-[#ed1c24]" /> Thêm menu chính
                </Button>
                <Button
                  size="sm"
                  onClick={saveNavigation}
                  disabled={saving}
                  className="h-8 px-3.5 rounded-none text-[10px] font-black uppercase bg-[#ed1c24] text-white hover:bg-[#c91218]"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {saving ? "Đang lưu..." : "Lưu thay đổi Menu"}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNavDragEnd}>
                <SortableContext items={navItems.map((i) => String(i.id || i.href))} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {navItems.map((item, idx) => (
                      <SortableNavRow
                        key={item.id || item.href || idx}
                        id={String(item.id || item.href || idx)}
                        item={item}
                        idx={idx}
                        onEdit={() => setEditingMenuIndex(idx)}
                        onDelete={() => handleDeleteNavItem(idx)}
                        onToggleVisible={() => handleToggleNavVisible(idx)}
                        onGoToSection={() => handleGoToPageSections(item.href)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </TabsContent>

          {/* TAB 2: QUẢN LÝ SECTION TRANG CHỦ (HOME SECTIONS) */}
          <TabsContent value="home" className="space-y-6">
            <div className="flex items-center justify-between bg-white p-3.5 border border-slate-200 shadow-xs dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("menu")}
                  className="rounded-none border-slate-300 text-xs font-black uppercase text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:text-white"
                >
                  ← Quay lại Menu
                </Button>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
                <span className="text-xs font-black text-[#ed1c24] uppercase tracking-wide">
                  Đang chỉnh sửa: Section Trang Chủ (/)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetHomeSectionsToDefault}
                  className="rounded-none border-slate-300 text-xs font-black uppercase text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:text-white"
                  title="Nạp lại toàn bộ dữ liệu gốc từ các component Home"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-[#ed1c24]" /> Nạp dữ liệu gốc từ Home
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveHomeSections}
                  disabled={saving}
                  className="rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase"
                >
                  <Save className="mr-1.5 h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu Section Trang Chủ"}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <ListCard title="Section trang chủ">
                <div className="mb-2 grid grid-cols-[1fr_auto] gap-2">
                  <Button type="button" variant="outline" onClick={addHomeSection} className="w-full rounded-none text-xs font-bold uppercase">
                    <Plus className="mr-2 h-4 w-4" /> Thêm section
                  </Button>
                  <Button type="button" variant="outline" onClick={normalizeHomeSectionOrder} className="rounded-none px-3" title="Chuẩn hóa thứ tự">
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </div>
                {orderedHomeSections.map(({ section }, position) => (
                  <div key={section.section_key} className={`mb-2 grid grid-cols-[1fr_auto] border ${selectedSectionKey === section.section_key ? "border-[#ed1c24]" : "border-slate-200 dark:border-white/10"}`}>
                    <button onClick={() => setSelectedSectionKey(section.section_key)} className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-bold transition ${selectedSectionKey === section.section_key ? "bg-[#ed1c24] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                      <span className="line-clamp-2 uppercase">{section.title || section.section_key}</span>
                      {section.is_visible ? <Eye className="h-4 w-4 shrink-0" /> : <EyeOff className="h-4 w-4 shrink-0 opacity-50" />}
                    </button>
                    <div className="flex border-l bg-white dark:bg-slate-950">
                      <Button type="button" variant="ghost" size="icon" className="h-full w-8 rounded-none" disabled={position === 0} onClick={() => moveHomeSection(section.section_key, -1)} title="Đưa lên">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-full w-8 rounded-none" disabled={position === orderedHomeSections.length - 1} onClick={() => moveHomeSection(section.section_key, 1)} title="Đưa xuống">
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </ListCard>

              {selectedSection && (
                <Card className="rounded-none border-slate-200 dark:border-white/10">
                  <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                    <div>
                      <CardTitle className="text-lg font-black uppercase">Chỉnh section: <span className="text-[#ed1c24]">{selectedSection.title}</span></CardTitle>
                      <CardDescription className="text-xs font-semibold">Bật tắt, đổi tiêu đề, mô tả, nút và số lượng item trên trang chủ.</CardDescription>
                    </div>
                    <Button type="button" variant="destructive" size="sm" className="rounded-none font-bold uppercase text-xs" onClick={() => deleteHomeSection(selectedSection.section_key)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Xóa section
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Mã Section (Key)"><Input value={selectedSection.section_key} disabled className="rounded-none font-mono text-xs bg-slate-100 dark:bg-slate-800" /></Field>
                      <SwitchLine label="Bật hiển thị Section trên Trang Chủ" checked={selectedSection.is_visible} onChange={(v) => updateSection({ is_visible: v })} />
                      <Field label="Tiêu đề chính Section"><Input value={selectedSection.title || ""} onChange={(e) => updateSection({ title: e.target.value })} className="rounded-none font-bold" /></Field>
                      <Field label="Thứ tự hiển thị (sort_order)"><Input type="number" value={selectedSection.sort_order} onChange={(e) => updateSection({ sort_order: Number(e.target.value) })} className="rounded-none" /></Field>
                      {(selectedSection.section_key === "hero" || selectedSection.section_key === "about_gzv") && (
                        <>
                          <Field label="Tên nút bấm (CTA Label)"><Input value={selectedSection.button_label || ""} onChange={(e) => updateSection({ button_label: e.target.value })} placeholder="Ví dụ: Xem chi tiết" className="rounded-none" /></Field>
                          <Field label="Link nút bấm (CTA URL)"><Input value={selectedSection.button_url || ""} onChange={(e) => updateSection({ button_url: e.target.value })} placeholder="/gioi-thieu hoặc /dich-vu" className="rounded-none font-mono text-xs" /></Field>
                        </>
                      )}
                      {(selectedSection.section_key === "projects" || selectedSection.section_key === "partners" || selectedSection.section_key === "news") && (
                        <Field label="Số lượng item hiển thị tối đa (Limit)"><Input type="number" value={selectedSection.item_limit} onChange={(e) => updateSection({ item_limit: Number(e.target.value) })} className="rounded-none" /></Field>
                      )}
                    </div>
                    <Field label="Phụ đề / Slogan ngắn"><Input value={selectedSection.subtitle || ""} onChange={(e) => updateSection({ subtitle: e.target.value })} placeholder="Ví dụ: THE NEXT-GEN COMPANY" className="rounded-none text-xs" /></Field>

                    {selectedSection.section_key === "hero" && (
                      <Field label="Mô tả ngắn banner"><Textarea rows={3} value={selectedSection.description || ""} onChange={(e) => updateSection({ description: e.target.value })} placeholder="Đoạn mô tả ngắn hiển thị trên banner..." className="rounded-none text-xs" /></Field>
                    )}

                    {selectedSection.section_key === "about_gzv" && (
                      <Field label="Nội dung chi tiết câu chuyện GZV"><Textarea rows={5} value={selectedSection.description || ""} onChange={(e) => updateSection({ description: e.target.value })} placeholder="Đoạn văn câu chuyện GZV..." className="rounded-none text-xs" /></Field>
                    )}

                    {/* 1. HERO VIDEO CONTROLS */}
                    {selectedSection.section_key === "hero" && (
                      <div className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                          <Video className="h-5 w-5 text-[#ed1c24]" />
                          <div>
                            <p className="text-sm font-black uppercase text-slate-950 dark:text-white">Cấu hình Hero Video & Banner</p>
                            <p className="text-xs text-slate-500">Video giới thiệu, Poster và thông số ấn tượng trên màn hình đầu trang.</p>
                          </div>
                        </div>
                        <Field label="Video URL (mp4, webm hoặc YouTube/Vimeo)">
                          <div className="flex gap-2">
                            <Input
                              value={selectedSection.settings?.video_url || ""}
                              onChange={(e) => updateSectionSettings({ video_url: e.target.value })}
                              placeholder="/Intro.mp4 hoặc https://youtube.com/watch?v=..."
                              className="rounded-none font-mono text-xs"
                            />
                            <Button type="button" variant="outline" className="rounded-none shrink-0" onClick={() => setPickerOpen("heroVideo")}>
                              <Video className="mr-2 h-4 w-4" /> Chọn video
                            </Button>
                          </div>
                        </Field>
                        <Field label="Poster ảnh đại diện Video">
                          <div className="flex gap-2">
                            <Input
                              value={selectedSection.settings?.poster_url || ""}
                              onChange={(e) => updateSectionSettings({ poster_url: e.target.value })}
                              placeholder="/og-image.jpg"
                              className="rounded-none font-mono text-xs"
                            />
                            <Button type="button" variant="outline" className="rounded-none shrink-0" onClick={() => setPickerOpen("heroPoster")}>
                              <ImageIcon className="mr-2 h-4 w-4" /> Chọn ảnh
                            </Button>
                          </div>
                        </Field>
                        {selectedSection.settings?.poster_url && (
                          <div className="w-48 h-28 border border-slate-200 overflow-hidden bg-black">
                            <img src={selectedSection.settings.poster_url} alt="Poster preview" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Hero Stats */}
                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black uppercase">Chỉ số thống kê (Stats):</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-none text-xs h-7"
                              onClick={() => {
                                const currentStats = Array.isArray(selectedSection.settings?.stats) ? [...selectedSection.settings.stats] : []
                                updateSectionSettings({ stats: [...currentStats, { value: "10+", label: "Chỉ số mới" }] })
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" /> Thêm chỉ số
                            </Button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-3">
                            {(Array.isArray(selectedSection.settings?.stats) ? selectedSection.settings.stats : [
                              { value: "10+", label: "Dự án tiêu biểu" },
                              { value: "5000+", label: "Học viên kết nối" },
                              { value: "50+", label: "Đối tác đồng hành" }
                            ]).map((st: any, sIdx: number) => (
                              <div key={sIdx} className="border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-slate-900 space-y-1.5 relative">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-400">#{sIdx + 1}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                      const currentStats = Array.isArray(selectedSection.settings?.stats) ? [...selectedSection.settings.stats] : []
                                      updateSectionSettings({ stats: currentStats.filter((_, idx) => idx !== sIdx) })
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <Input
                                  value={st.value || ""}
                                  onChange={(e) => {
                                    const currentStats = Array.isArray(selectedSection.settings?.stats) ? [...selectedSection.settings.stats] : []
                                    currentStats[sIdx] = { ...(currentStats[sIdx] || {}), value: e.target.value }
                                    updateSectionSettings({ stats: currentStats })
                                  }}
                                  placeholder="Số liệu: 10+"
                                  className="h-7 text-xs font-black rounded-none"
                                />
                                <Input
                                  value={st.label || ""}
                                  onChange={(e) => {
                                    const currentStats = Array.isArray(selectedSection.settings?.stats) ? [...selectedSection.settings.stats] : []
                                    currentStats[sIdx] = { ...(currentStats[sIdx] || {}), label: e.target.value }
                                    updateSectionSettings({ stats: currentStats })
                                  }}
                                  placeholder="Nhãn: Dự án"
                                  className="h-7 text-xs rounded-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. ABOUT GZV CONTROLS */}
                    {selectedSection.section_key === "about_gzv" && (
                      <div className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                          <ImageIcon className="h-5 w-5 text-[#ed1c24]" />
                          <div>
                            <p className="text-sm font-black uppercase text-slate-950 dark:text-white">Ảnh & Căn chỉnh câu chuyện GZV</p>
                            <p className="text-xs text-slate-500">Cấu hình hình ảnh minh họa bên phải và vị trí hiển thị.</p>
                          </div>
                        </div>
                        <Field label="Đường dẫn ảnh minh họa (Image URL)">
                          <div className="flex gap-2">
                            <Input
                              value={selectedSection.settings?.image_url || "/gioi-thieu/19.webp"}
                              onChange={(e) => updateSectionSettings({ image_url: e.target.value })}
                              placeholder="/gioi-thieu/19.webp"
                              className="rounded-none font-mono text-xs"
                            />
                            <Button type="button" variant="outline" className="rounded-none shrink-0" onClick={() => setPickerOpen("aboutImage")}>
                              <ImageIcon className="mr-2 h-4 w-4" /> Chọn ảnh
                            </Button>
                          </div>
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Field label="Vị trí ngang X (%)">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={selectedSection.settings?.position_x ?? 50}
                              onChange={(e) => updateSectionSettings({ position_x: Number(e.target.value) })}
                              className="rounded-none text-xs"
                            />
                          </Field>
                          <Field label="Vị trí dọc Y (%)">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={selectedSection.settings?.position_y ?? 50}
                              onChange={(e) => updateSectionSettings({ position_y: Number(e.target.value) })}
                              className="rounded-none text-xs"
                            />
                          </Field>
                          <Field label="Tỉ lệ phóng to (%)">
                            <Input
                              type="number"
                              min={50}
                              max={200}
                              value={selectedSection.settings?.image_size ?? 100}
                              onChange={(e) => updateSectionSettings({ image_size: Number(e.target.value) })}
                              className="rounded-none text-xs"
                            />
                          </Field>
                        </div>
                        {selectedSection.settings?.image_url && (
                          <div className="relative h-44 w-full border border-slate-200 overflow-hidden bg-slate-200 dark:bg-slate-900">
                            <img
                              src={selectedSection.settings.image_url}
                              alt="About preview"
                              className="h-full w-full object-cover"
                              style={{
                                objectPosition: `${selectedSection.settings?.position_x ?? 50}% ${selectedSection.settings?.position_y ?? 50}%`,
                                transform: `scale(${(selectedSection.settings?.image_size ?? 100) / 100})`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. SERVICES THREE CONTROLS */}
                    {selectedSection.section_key === "services_three" && (
                      <div className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                          <div>
                            <p className="text-sm font-black uppercase text-slate-950 dark:text-white">Danh sách 3 Khối Dịch Vụ Chính</p>
                            <p className="text-xs text-slate-500">Chỉnh sửa tiêu đề, mô tả và liên kết cho từng dịch vụ.</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-none text-xs h-7"
                            onClick={() => {
                              const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                              updateSectionSettings({
                                services: [...currentServices, { title: "DỊCH VỤ MỚI", description: "Mô tả ngắn cho dịch vụ.", link: "/dich-vu", icon: "megaphone" }]
                              })
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Thêm dịch vụ
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {(Array.isArray(selectedSection.settings?.services) ? selectedSection.settings.services : [
                            { title: "MARKETING & BRANDING", description: "Giải pháp xây dựng và phát triển thương hiệu toàn diện.", link: "/dich-vu/marketing", icon: "megaphone" },
                            { title: "SALES & PHÁT TRIỂN", description: "Tối ưu hóa doanh số và mở rộng kênh tiếp cận khách hàng.", link: "/dich-vu", icon: "trend" },
                            { title: "DIGITAL TRANSFORMATION", description: "Chuyển đổi số và ứng dụng công nghệ hiệu quả.", link: "/dich-vu", icon: "cpu" }
                          ]).map((srv: any, srvIdx: number) => (
                            <div key={srvIdx} className="border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900 space-y-2 relative">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#ed1c24]">Dịch vụ #{srvIdx + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:bg-red-50"
                                  onClick={() => {
                                    const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                                    updateSectionSettings({ services: currentServices.filter((_, idx) => idx !== srvIdx) })
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                <Field label="Tiêu đề dịch vụ">
                                  <Input
                                    value={srv.title || ""}
                                    onChange={(e) => {
                                      const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                                      currentServices[srvIdx] = { ...(currentServices[srvIdx] || {}), title: e.target.value }
                                      updateSectionSettings({ services: currentServices })
                                    }}
                                    className="rounded-none text-xs font-bold"
                                  />
                                </Field>
                                <Field label="Đường dẫn liên kết">
                                  <Input
                                    value={srv.link || ""}
                                    onChange={(e) => {
                                      const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                                      currentServices[srvIdx] = { ...(currentServices[srvIdx] || {}), link: e.target.value }
                                      updateSectionSettings({ services: currentServices })
                                    }}
                                    className="rounded-none text-xs font-mono"
                                  />
                                </Field>
                              </div>
                              <Field label="Mô tả dịch vụ">
                                <Textarea
                                  rows={2}
                                  value={srv.description || ""}
                                  onChange={(e) => {
                                    const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                                    currentServices[srvIdx] = { ...(currentServices[srvIdx] || {}), description: e.target.value }
                                    updateSectionSettings({ services: currentServices })
                                  }}
                                  className="rounded-none text-xs"
                                />
                              </Field>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. ABOUT BOXES CONTROLS */}
                    {selectedSection.section_key === "about_boxes" && (
                      <div className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                          <div>
                            <p className="text-sm font-black uppercase text-slate-950 dark:text-white">Khối Sứ Mệnh, Tầm Nhìn & Giá Trị</p>
                            <p className="text-xs text-slate-500">Chỉnh sửa các khối định hướng chiến lược của GZV.</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-none text-xs h-7"
                            onClick={() => {
                              const currentItems = Array.isArray(selectedSection.settings?.items) ? [...selectedSection.settings.items] : []
                              updateSectionSettings({
                                items: [...currentItems, { title: "GIÁ TRỊ MỚI", description: "Mô tả giá trị cốt lõi.", icon: "award" }]
                              })
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Thêm khối
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {(Array.isArray(selectedSection.settings?.items) ? selectedSection.settings.items : [
                            { title: "SỨ MỆNH", description: "Truyền cảm hứng và khai phóng tiềm năng của thế hệ trẻ Việt Nam.", icon: "target" },
                            { title: "TẦM NHÌN", description: "Trở thành hệ sinh thái đào tạo & phát triển tư duy hàng đầu.", icon: "eye" },
                            { title: "GIÁ TRỊ", description: "Chân thật - Đột phá - Bền vững - Đồng hành.", icon: "award" }
                          ]).map((bx: any, bIdx: number) => (
                            <div key={bIdx} className="border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900 space-y-2 relative">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#ed1c24]">Khối #{bIdx + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:bg-red-50"
                                  onClick={() => {
                                    const currentItems = Array.isArray(selectedSection.settings?.items) ? [...selectedSection.settings.items] : []
                                    updateSectionSettings({ items: currentItems.filter((_, idx) => idx !== bIdx) })
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <Field label="Tiêu đề khối">
                                <Input
                                  value={bx.title || ""}
                                  onChange={(e) => {
                                    const currentItems = Array.isArray(selectedSection.settings?.items) ? [...selectedSection.settings.items] : []
                                    currentItems[bIdx] = { ...(currentItems[bIdx] || {}), title: e.target.value }
                                    updateSectionSettings({ items: currentItems })
                                  }}
                                  className="rounded-none text-xs font-bold"
                                />
                              </Field>
                              <Field label="Mô tả chi tiết">
                                <Textarea
                                  rows={2}
                                  value={bx.description || ""}
                                  onChange={(e) => {
                                    const currentItems = Array.isArray(selectedSection.settings?.items) ? [...selectedSection.settings.items] : []
                                    currentItems[bIdx] = { ...(currentItems[bIdx] || {}), description: e.target.value }
                                    updateSectionSettings({ items: currentItems })
                                  }}
                                  className="rounded-none text-xs"
                                />
                              </Field>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Field label="Cấu hình JSON nâng cao (Settings)">
                      <PropsEditor value={selectedSection.settings || {}} onChange={(settings) => updateSection({ settings })} />
                    </Field>

                    <Button onClick={saveHomeSections} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white uppercase text-xs font-black w-full sm:w-auto">
                      <Save className="h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu tất cả thay đổi Section"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: PAGE BUILDER & SECTIONS TỪNG TRANG */}
          <TabsContent value="builder" className="space-y-6">
            {/* Top Bar with Page Switcher & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-slate-200 shadow-xs dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("menu")}
                  className="rounded-none border-slate-300 text-xs font-black uppercase text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:text-white"
                >
                  ← Quay lại Menu
                </Button>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#ed1c24] uppercase tracking-wide">
                    Đang sửa Section:
                  </span>
                  <Select value={builderSlug} onValueChange={(val) => setBuilderSlug(val)}>
                    <SelectTrigger className="h-8 w-44 rounded-none font-bold text-xs border-slate-300 dark:border-white/10">
                      <SelectValue placeholder="Chọn trang..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {builderSlugs.map((slug) => (
                        <SelectItem key={slug} value={slug} className="text-xs font-bold uppercase">
                          /{slug}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button asChild variant="outline" size="sm" className="rounded-none text-xs font-bold">
                  <a href="/admin/images" target="_blank"><ImageIcon className="mr-1.5 h-3.5 w-3.5 text-[#ed1c24]" /> Media</a>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-none text-xs font-bold">
                  <a href={`https://www.gzv.one/${builderSlug}`} target="_blank" rel="noreferrer"><Eye className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Xem trang</a>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveBuilderLayout}
                  disabled={saving}
                  className="rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase"
                >
                  <Save className="mr-1.5 h-4 w-4" /> {saving ? "Đang lưu..." : `Lưu Layout /${builderSlug}`}
                </Button>
              </div>
            </div>

            {/* Standalone Dedicated Section Editor Card for Current Page */}
            <Card className="rounded-none border-slate-200 dark:border-white/10 shadow-xs">
              <CardHeader className="border-b border-slate-200 dark:border-white/10 pb-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                      <span>Cấu hình Section & Block: <span className="text-[#ed1c24]">/{builderSlug}</span></span>
                      {builderPage?.title && (
                        <Badge variant="outline" className="rounded-none font-bold text-[10px] uppercase border-[#ed1c24] text-[#ed1c24]">
                          {builderPage.title}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold mt-1">
                      Các section và block dưới đây được thiết kế hoàn toàn riêng biệt cho trang <strong>/{builderSlug}</strong>.
                    </CardDescription>
                  </div>

                  <Button type="button" variant="outline" size="sm" onClick={addPage} className="rounded-none text-xs font-bold uppercase shrink-0">
                    <Plus className="mr-1.5 h-3.5 w-3.5 text-[#ed1c24]" /> Thêm trang mới
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {/* 1. Page Specific Config */}
                <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
                  <div className="mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#ed1c24]" />
                    <p className="font-black text-slate-900 dark:text-white uppercase text-xs">Cấu hình trang public (/{builderSlug})</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Slug đường dẫn">
                      <Input value={builderSlug} onChange={(event) => renameBuilderSlug(event.target.value)} placeholder="vi-du-slug" className="rounded-none font-mono text-xs" />
                    </Field>
                    <SwitchLine label="Hiện trang công khai" checked={builderPage?.is_visible !== false} onChange={(value) => updateBuilderPage({ is_visible: value })} />
                    <Field label="Tên hiển thị trang"><Input value={builderPage?.title || ""} onChange={(event) => updateBuilderPage({ title: event.target.value })} className="rounded-none text-xs font-bold" /></Field>
                    <Field label="Tiêu đề Thẻ Tab / SEO"><Input value={(builderPage as any)?.seo_title || ""} onChange={(event) => updateBuilderPage({ seo_title: event.target.value } as any)} className="rounded-none text-xs" /></Field>
                  </div>
                </div>

                {/* 2. Available Block Templates Picker */}
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-[#ed1c24]" /> Thêm Section / Block mới vào trang /{builderSlug}
                  </Label>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {(templates.length ? templates : fallbackTemplates).map((template) => (
                      <Button
                        key={template.template_key}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-auto justify-start rounded-none border-slate-300 p-3 text-left font-bold uppercase text-[11px] hover:border-[#ed1c24] hover:bg-red-50/40 hover:text-[#ed1c24] dark:border-white/10 dark:hover:bg-red-950/20"
                        onClick={() => setPageBlocks((rows) => [...rows, {
                          page_slug: builderSlug,
                          block_key: `${template.template_key}-${Date.now()}`,
                          component_type: template.component_type,
                          title: template.name,
                          props: template.default_props || {},
                          content_html: "",
                          sort_order: rows.filter((r) => r.page_slug === builderSlug).length * 10 + 10,
                          is_visible: true,
                          responsive: {},
                          seo: {},
                        }])}
                      >
                        <Plus className="mr-2 h-4 w-4 text-[#ed1c24] shrink-0" />
                        <div>
                          <div>{template.name}</div>
                          <div className="text-[9px] font-mono text-slate-400 font-normal lowercase">{template.component_type}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 3. Page Blocks List */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                    <Label className="text-xs font-black uppercase text-slate-900 dark:text-white">
                      Danh sách Section & Block đang có trên trang /{builderSlug} ({builderBlocks.length})
                    </Label>
                    <span className="text-[11px] font-semibold text-slate-400">Kéo / dùng mũi tên để đổi thứ tự</span>
                  </div>

                  {builderBlocks.length === 0 && (
                    <div className="p-10 text-center space-y-2 border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50">
                      <Layers className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Chưa có Section nào trên trang /{builderSlug}</p>
                      <p className="text-[11px] text-slate-400">Bấm các mẫu Template ở trên để thêm khối nội dung mới cho trang này.</p>
                    </div>
                  )}

                  {builderBlocks.map(({ block, index }, position) => (
                    <div key={`${block.page_slug}-${block.block_key}-${index}`} className="space-y-3 border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900">
                      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_0.5fr_auto]">
                        <Field label="Slug trang"><Input value={block.page_slug} onChange={(e) => updateBlock(index, { page_slug: e.target.value })} className="rounded-none font-mono text-xs" disabled /></Field>
                        <Field label="Block key"><Input value={block.block_key} onChange={(e) => updateBlock(index, { block_key: e.target.value })} className="rounded-none font-mono text-xs" /></Field>
                        <Field label="Loại Component"><Input value={block.component_type} onChange={(e) => updateBlock(index, { component_type: e.target.value })} className="rounded-none text-xs font-semibold" /></Field>
                        <Field label="Thứ tự"><Input type="number" value={block.sort_order} onChange={(e) => updateBlock(index, { sort_order: Number(e.target.value) })} className="rounded-none text-xs" /></Field>
                        <div className="flex items-end gap-1">
                          <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-none" disabled={position === 0} onClick={() => moveBlock(index, -1)} title="Lên"><ArrowUp className="h-4 w-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-none" disabled={position === builderBlocks.length - 1} onClick={() => moveBlock(index, 1)} title="Xuống"><ArrowDown className="h-4 w-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-none" onClick={() => duplicateBlock(block)} title="Nhân bản"><Copy className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="icon" className="h-9 w-9 rounded-none" onClick={() => setPageBlocks((rows) => rows.filter((_, i) => i !== index))} title="Xóa block"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>

                      <Field label="Tên tiêu đề block (Quản trị)"><Input value={block.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} className="rounded-none text-xs font-bold" /></Field>

                      <BlockPropsEditor
                        block={block}
                        blockIndex={index}
                        onChange={(props) => updateBlock(index, { props })}
                        onPickImage={(imageIndex) => setPickerOpen({ blockImageIndex: index, imageIndex })}
                      />

                      <Field label="HTML tùy biến bổ sung (nếu có)">
                        <Textarea
                          className="min-h-[90px] font-mono text-xs rounded-none"
                          value={block.content_html || ""}
                          onChange={(e) => updateBlock(index, { content_html: e.target.value })}
                          placeholder="<div>Nội dung HTML tùy biến...</div>"
                        />
                      </Field>
                    </div>
                  ))}
                </div>

                <Button type="button" onClick={saveBuilderLayout} disabled={saving} className="w-full rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase h-10">
                  <Save className="mr-2 h-4 w-4" /> {saving ? "Đang lưu..." : `Lưu toàn bộ Section & Blocks cho trang /${builderSlug}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: HERO BANNER DESIGN & CONTENT */}
          <TabsContent value="banner" className="space-y-6">
            {/* Top Live Preview Banner */}
            <div className="border border-slate-200 rounded-none overflow-hidden shadow-md bg-slate-950 dark:border-white/10">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ed1c24] animate-pulse" />
                  Xem trước trực tiếp (Live Preview)
                  {syncAllBanners ? (
                    <> — <strong className="text-[#ed1c24] uppercase">Banner Chung (Global Banner)</strong></>
                  ) : (
                    selectedPageObj && (
                      <> — <strong className="text-white uppercase">{selectedPageObj.title || selectedPageObj.slug}</strong></>
                    )
                  )}
                </span>
              </div>

              <div className="w-full overflow-hidden relative select-none">
                <SharedPageHero
                  badge={previewBannerData.badge}
                  badgeColor={previewBannerData.badgeColor}
                  title={previewBannerData.title}
                  titleColor={previewBannerData.titleColor}
                  description={previewBannerData.description}
                  descriptionColor={previewBannerData.descriptionColor}
                  useImage={previewBannerData.useImage}
                  backgroundImageUrl={previewBannerData.backgroundImageUrl}
                  imagePositionY={previewBannerData.imagePositionY}
                  bgColor={previewBannerData.bgColor}
                  titleAlignment={previewBannerData.titleAlignment}
                  isPreviewMode={true}
                />
              </div>
            </div>

            {/* Split 2 Columns Below Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Banner Style Controls */}
              <div className="space-y-4 lg:col-span-5 border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Settings2 className="h-4 w-4 text-[#ed1c24]" /> Cấu hình Giao diện Banner Chung
                  </Label>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 border border-slate-200 dark:bg-slate-950/40 dark:border-white/10">
                  <div>
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">Đồng bộ tất cả Banner</Label>
                    <p className="text-[10px] text-slate-400">Bật để dùng chung mẫu Banner chuẩn cho toàn bộ các trang</p>
                  </div>
                  <Switch
                    checked={syncAllBanners}
                    onCheckedChange={(v) => setSyncAllBanners(v)}
                  />
                </div>

                {/* Background Use Image Switch */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:border-white/10">
                  <div>
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">Sử dụng ảnh làm nền</Label>
                    <p className="text-[10px] text-slate-400">Bật để dùng ảnh bìa, tắt để dùng màu phẳng</p>
                  </div>
                  <Switch
                    checked={globalBannerConfig.use_image}
                    onCheckedChange={(v) => setGlobalBannerConfig({ ...globalBannerConfig, use_image: v })}
                  />
                </div>

                {globalBannerConfig.use_image ? (
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">Ảnh bìa nền (Cover Image)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={globalBannerConfig.cover_url || ""}
                        onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, cover_url: e.target.value })}
                        placeholder="URL ảnh bìa"
                        className="flex-1 h-9 text-xs rounded-none border-slate-200 font-mono dark:border-white/10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPickerOpen("globalCover")}
                        className="h-9 rounded-none text-xs font-black uppercase border-slate-200 shrink-0 dark:border-white/10"
                      >
                        <ImageIcon className="h-4 w-4 mr-1 text-[#ed1c24]" /> Chọn ảnh
                      </Button>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <MoveVertical className="h-3.5 w-3.5 text-[#ed1c24]" /> Vị trí ảnh dọc (Y-Offset)
                        </Label>
                        <span className="text-xs font-mono text-slate-500">{globalBannerConfig.imagePositionY || "50%"}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={parseInt(globalBannerConfig.imagePositionY || "50", 10)}
                        onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, imagePositionY: `${e.target.value}%` })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ed1c24] dark:bg-slate-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">Màu nền phẳng (Background Color)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={globalBannerConfig.bg_color || "#050505"}
                        onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, bg_color: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded-none cursor-pointer border-slate-200 shrink-0"
                      />
                      <Input
                        value={globalBannerConfig.bg_color || "#050505"}
                        onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, bg_color: e.target.value })}
                        className="font-mono text-xs uppercase h-9 rounded-none border-slate-200 dark:border-white/10"
                      />
                    </div>
                  </div>
                )}

                {/* Alignment */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Căn lề Tiêu đề (Alignment)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={globalBannerConfig.titleAlignment === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "left" })}
                      className="rounded-none text-xs font-bold"
                    >
                      <AlignLeft className="h-4 w-4 mr-1.5" /> Trái
                    </Button>
                    <Button
                      type="button"
                      variant={globalBannerConfig.titleAlignment === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "center" })}
                      className="rounded-none text-xs font-bold"
                    >
                      <AlignCenter className="h-4 w-4 mr-1.5" /> Giữa
                    </Button>
                    <Button
                      type="button"
                      variant={globalBannerConfig.titleAlignment === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "right" })}
                      className="rounded-none text-xs font-bold"
                    >
                      <AlignRight className="h-4 w-4 mr-1.5" /> Phải
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => saveBannerConfig()}
                  disabled={saving}
                  className="w-full mt-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
                >
                  {saving ? "Đang lưu..." : "Lưu Giao diện Banner"}
                </Button>
              </div>

              {/* Right Column: Dynamic Pages & Text Editor */}
              <div className="space-y-5 lg:col-span-7">
                {/* Page Selection Grid */}
                <div className="p-4 bg-white border border-slate-200 rounded-none space-y-3 shadow-xs dark:border-white/10 dark:bg-slate-900">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center justify-between text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <AlignLeft className="h-4 w-4 text-[#ed1c24]" /> Danh sách các Trang ({pages.length})
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                      Bấm để chọn trang chỉnh sửa
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {pages.map((p) => {
                      const isSelected = selectedPageForPreview === p.slug
                      return (
                        <div
                          key={p.slug}
                          onClick={() => setSelectedPageForPreview(p.slug)}
                          className={`p-2.5 border cursor-pointer transition ${isSelected
                            ? "border-[#ed1c24] bg-red-50/50 text-[#ed1c24] font-black dark:bg-red-950/30"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300"
                            }`}
                        >
                          <p className="font-bold text-xs uppercase truncate">{p.title || p.slug}</p>
                          <p className="font-mono text-[9px] text-slate-400 truncate">/{p.slug}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Text Editor Form for Selected Page */}
                {selectedPageObj && (
                  <div className="p-5 bg-white border border-slate-200 rounded-none space-y-4 shadow-xs dark:border-white/10 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
                      <Label className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <AlignLeft className="h-4 w-4 text-[#ed1c24]" />
                        Nội dung Banner: <span className="text-[#ed1c24] font-mono">/{selectedPageObj.slug}</span>
                      </Label>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-900 dark:text-white">1. Nhãn phụ (Badge)</Label>
                      <Input
                        value={selectedPageObj.banner_badge || ""}
                        onChange={(e) =>
                          setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_badge: e.target.value } : p)))
                        }
                        placeholder="Ví dụ: GZV CENTER"
                        className="h-9 text-xs rounded-none border-slate-200 dark:border-white/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-900 dark:text-white">2. Tiêu đề chính (Title)</Label>
                      <Input
                        value={selectedPageObj.banner_title || selectedPageObj.title || ""}
                        onChange={(e) =>
                          setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_title: e.target.value } : p)))
                        }
                        placeholder="Ví dụ: DỰ ÁN ĐÃ TRIỂN KHAI"
                        className="h-9 text-xs rounded-none border-slate-200 dark:border-white/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-900 dark:text-white">3. Mô tả phụ (Subtitle)</Label>
                      <Textarea
                        value={selectedPageObj.banner_subtitle || selectedPageObj.banner_description || ""}
                        onChange={(e) =>
                          setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_subtitle: e.target.value, banner_description: e.target.value } : p)))
                        }
                        placeholder="Nhập mô tả ngắn cho trang này..."
                        className="min-h-[80px] text-xs rounded-none border-slate-200 dark:border-white/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-900 dark:text-white">Ảnh bìa riêng trang này (tùy chọn)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={selectedPageObj.banner_image_url || ""}
                          onChange={(e) =>
                            setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_image_url: e.target.value } : p)))
                          }
                          placeholder="URL ảnh bìa riêng"
                          className="flex-1 h-9 text-xs rounded-none font-mono border-slate-200 dark:border-white/10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPickerOpen("pageCover")}
                          className="h-9 rounded-none text-xs font-black uppercase shrink-0 border-slate-200 dark:border-white/10"
                        >
                          <ImageIcon className="h-4 w-4 mr-1 text-[#ed1c24]" /> Chọn ảnh
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => saveBannerConfig(selectedPageObj.slug)}
                      disabled={saving}
                      className="w-full mt-2 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
                    >
                      {saving ? "Đang lưu..." : `Lưu nội dung trang ${selectedPageObj.title || selectedPageObj.slug}`}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: HEADER, FOOTER & SEO UNIFIED TAB */}
          <TabsContent value="header_footer" className="space-y-6">
            <HeaderFooterSeoTab
              branding={branding}
              setBranding={setBranding}
              footer={footer}
              setFooter={setFooter}
              onPickMedia={(target) => setPickerOpen(target as any)}
              onSave={saveHeaderAndFooter}
              saving={saving}
            />
          </TabsContent>

          {/* TAB 6: FLOATING */}
          <TabsContent value="floating">
            <Card className="rounded-none border-slate-200 dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase">Cấu hình Nút Floating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">Nút liên hệ nhanh, hotline, Messenger, Zalo trên màn hình.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 7: LOADING */}
          <TabsContent value="loading">
            <Card className="rounded-none border-slate-200 dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase">Màn hình Loading Chờ Trang</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">Bật hiệu ứng Loading</Label>
                  <Switch
                    checked={loadingSettings.enabled}
                    onCheckedChange={(val) => setLoadingSettings({ ...loadingSettings, enabled: val })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Media Pickers */}
        <MediaPickerDialog
          open={pickerOpen !== null}
          onClose={() => setPickerOpen(null)}
          onSelect={(res) => {
            if (pickerOpen === "globalCover") {
              setGlobalBannerConfig({ ...globalBannerConfig, cover_url: res.url })
            } else if (pickerOpen === "pageCover" && selectedPageObj) {
              setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_image_url: res.url } : p)))
            } else if (pickerOpen === "headerLogo") {
              setBranding({ ...branding, header_logo_url: res.url })
            } else if (pickerOpen === "favicon") {
              setBranding({ ...branding, favicon_url: res.url })
            } else if (pickerOpen === "footerLogo") {
              setFooter({ ...footer, logo_url: res.url })
              setBranding({ ...branding, footer_logo_url: res.url })
            } else if (pickerOpen === "ogImage") {
              setBranding({ ...branding, og_image_url: res.url })
            } else if (pickerOpen === "heroVideo") {
              updateSectionSettings({ video_url: res.url })
            } else if (pickerOpen === "heroPoster") {
              updateSectionSettings({ poster_url: res.url })
            } else if (pickerOpen === "aboutImage") {
              updateSectionSettings({ image_url: res.url })
            } else if (pickerOpen === "builderBanner") {
              updateBuilderPage({ banner_image_url: res.url })
            } else if (typeof pickerOpen === "object" && pickerOpen !== null && "blockImageIndex" in pickerOpen) {
              const block = pageBlocks[pickerOpen.blockImageIndex]
              const images = Array.isArray(block?.props?.images) ? [...block.props.images] : []
              images[pickerOpen.imageIndex] = { ...(images[pickerOpen.imageIndex] || {}), src: res.url, alt: res.alt || "GZV" }
              updateBlock(pickerOpen.blockImageIndex, { props: { ...(block.props || {}), images } })
            }
            setPickerOpen(null)
          }}
          defaultFolder="site"
        />

        {/* Edit Menu Item Dialog */}
        <EditMenuDialog
          isOpen={editingMenuIndex !== null}
          onClose={() => setEditingMenuIndex(null)}
          item={editingMenuIndex !== null ? navItems[editingMenuIndex] : null}
          onSave={handleEditMenuSave}
        />
      </div>
    </ProtectedRoute>
  )
}

export default SiteContentManager
