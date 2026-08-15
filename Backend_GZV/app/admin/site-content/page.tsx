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
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
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
  const [loadingSettings, setLoadingSettings] = useState<LoadingSettings>(defaultLoading)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState<"banner" | "builderBanner" | "loadingLogo" | "footerLogo" | "headerLogo" | "brandFooterLogo" | "favicon" | "ogImage" | "globalCover" | "pageCover" | null>(null)

  // Hero Banner states
  const [globalBannerConfig, setGlobalBannerConfig] = useState<any>(defaultBannerConfig)
  const [syncAllBanners, setSyncAllBanners] = useState(true)
  const [selectedPageForPreview, setSelectedPageForPreview] = useState<string | null>("gioi-thieu")
  const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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
        setLoadingSettings({ ...defaultLoading, ...(loadingResult.data || {}) })
        setHomeSections((sectionsResult.data || []) as HomeSection[])
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
        email_label: footer.email_label || "",
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
    const cleanSlug = rawPath === "/" || rawPath === "" || rawPath === "#" ? "gioi-thieu" : (normalizeSlug(rawPath.replace(/^\//, "")) || "gioi-thieu")
    setSelectedSlug(cleanSlug)
    setActiveTab("banner")
    toast.success(`Đã chuyển tới tab Banner cho trang /${cleanSlug}!`)
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
                  PAGES & SECTIONS
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Trang & Section (Website Control)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Quản lý danh sách trang, menu điều hướng và thiết kế giao diện Banner (Hero Header).
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
                  — Kéo thả để sắp xếp thứ tự menu, bấm nút "Sửa" để chuyển tới sửa trang đó.
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
                        onEditSections={() => handleGoToPageSections(item.href)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </TabsContent>

          {/* TAB 2: HERO BANNER DESIGN & CONTENT */}
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
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase hidden sm:inline">
                  Hiển thị chuẩn trên toàn hệ thống Website
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

                {/* Content Alignment */}
                <div className="pt-3 border-t border-slate-200 space-y-2 dark:border-white/10">
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Căn lề nội dung (Alignment)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={globalBannerConfig.titleAlignment === "left" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 rounded-none text-xs font-bold uppercase"
                      onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "left" })}
                    >
                      <AlignLeft className="h-4 w-4 mr-1.5" /> Trái
                    </Button>
                    <Button
                      type="button"
                      variant={globalBannerConfig.titleAlignment === "center" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 rounded-none text-xs font-bold uppercase"
                      onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "center" })}
                    >
                      <AlignCenter className="h-4 w-4 mr-1.5" /> Giữa
                    </Button>
                    <Button
                      type="button"
                      variant={globalBannerConfig.titleAlignment === "right" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 rounded-none text-xs font-bold uppercase"
                      onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "right" })}
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

          {/* TAB 3: HEADER, FOOTER & SEO UNIFIED TAB */}
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

          {/* TAB 4: FLOATING */}
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
          open={pickerOpen === "globalCover" || pickerOpen === "pageCover" || pickerOpen === "headerLogo" || pickerOpen === "favicon" || pickerOpen === "footerLogo" || pickerOpen === "ogImage"}
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
