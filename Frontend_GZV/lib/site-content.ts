'use client'

import { supabase } from '@/lib/api-supabase'

// ⚡ HIGH-PERFORMANCE CACHING LAYER (Memory + LocalStorage SWR)
const memoryCache = new Map<string, { data: any; expiry: number }>()
const CACHE_TTL_MS = 60 * 1000 // 1 phút fresh cache

function getCachedData<T>(key: string): T | null {
  // 1. Check in-memory cache first (fastest - 0ms)
  const mem = memoryCache.get(key)
  if (mem && Date.now() < mem.expiry) {
    return mem.data as T
  }

  // 2. Check localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`gzv_cache_${key}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.data) {
          // Put back into memory cache
          memoryCache.set(key, { data: parsed.data, expiry: Date.now() + CACHE_TTL_MS })
          return parsed.data as T
        }
      }
    } catch (e) {}
  }
  return null
}

function setCachedData(key: string, data: any) {
  memoryCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS })
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `gzv_cache_${key}`,
        JSON.stringify({ data, timestamp: Date.now() })
      )
    } catch (e) {}
  }
}

export type SiteNavItem = {
  id?: string
  href: string
  label_vi: string
  label_en?: string | null
  parent_href?: string | null
  sort_order: number
  is_visible: boolean
  is_page_enabled: boolean
  is_external?: boolean | null
}

export type SitePageContent = {
  id?: string
  slug: string
  title: string
  menu_title?: string | null
  banner_badge?: string | null
  banner_title?: string | null
  banner_subtitle?: string | null
  banner_description?: string | null
  banner_image_url?: string | null
  show_badge?: boolean | null
  show_title?: boolean | null
  show_subtitle?: boolean | null
  content_html?: string | null
  is_visible: boolean
  seo_title?: string | null
  seo_description?: string | null
}

export type SiteLoadingSettings = {
  logo_url: string
  title: string
  subtitle: string
  effect: 'orbit' | 'pulse' | 'bars'
  background_from: string
  background_to: string
  accent_color: string
  enabled: boolean
  minimum_duration_ms: number
}

export type HomeSectionConfig = {
  section_key: string
  title: string
  subtitle?: string | null
  description?: string | null
  button_label?: string | null
  button_url?: string | null
  sort_order: number
  item_limit: number
  is_visible: boolean
  content_html?: string | null
  settings?: Record<string, any>
}

export type FooterSettings = {
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
  links: Array<{ label: string; href: string; visible?: boolean }>
  social_links: Array<{ label: string; href: string; icon?: string; visible?: boolean }>
}

export type FloatingAction = {
  action_key: string
  label: string
  href?: string | null
  icon_url?: string | null
  action_type: 'link' | 'chatbot'
  sort_order: number
  is_visible: boolean
  style?: Record<string, any>
}

export type BrandingSettings = {
  site_name: string
  header_logo_url: string
  footer_logo_url: string
  favicon_url: string
  default_title: string
  title_template: string
  default_description?: string | null
  default_keywords?: string | null
  og_image_url?: string | null
  author?: string | null
  canonical_url?: string | null
  og_title?: string | null
  og_description?: string | null
  og_url?: string | null
  header_site_name?: string
  show_logo?: boolean
  show_topbar?: boolean
  show_topbar_email?: boolean
  show_topbar_phone?: boolean
  show_topbar_badge?: boolean
  topbar_bg_color?: string
  topbar_text_color?: string
  header_bg_color?: string
  header_text_color?: string
  topbar_email_label?: string | null
  topbar_phone_label?: string | null
  topbar_badge_label?: string | null
}

export type PageBlock = {
  id?: string
  page_slug: string
  block_key: string
  component_type: string
  title?: string | null
  subtitle?: string | null
  sort_order: number
  is_visible: boolean
  props: Record<string, any>
}

export type SectionTemplate = {
  id?: string
  name: string
  component_type: string
  description?: string | null
  preview_image_url?: string | null
  default_props: Record<string, any>
  sort_order: number
  is_active: boolean
}

export const defaultNavigation: SiteNavItem[] = [
  { href: '/', label_vi: 'Trang chủ', label_en: 'Home', sort_order: 10, is_visible: true, is_page_enabled: true },
  { href: '/gioi-thieu', label_vi: 'Giới thiệu', label_en: 'About Us', sort_order: 20, is_visible: true, is_page_enabled: true },
  { href: '/dich-vu', label_vi: 'Dịch vụ', label_en: 'Services', sort_order: 30, is_visible: true, is_page_enabled: true },
  { href: '/du-an', label_vi: 'Dự án', label_en: 'Projects', sort_order: 40, is_visible: true, is_page_enabled: true },
  { href: '/gzver', label_vi: 'GZVers', label_en: 'GZVers', sort_order: 50, is_visible: true, is_page_enabled: true },
  { href: '/doi-tac', label_vi: 'Đối tác', label_en: 'Partners', sort_order: 60, is_visible: true, is_page_enabled: true },
  { href: '/tin-tuc', label_vi: 'Tin tức', label_en: 'News', sort_order: 70, is_visible: true, is_page_enabled: true },
  { href: '/lien-he', label_vi: 'Liên hệ', label_en: 'Contact', sort_order: 80, is_visible: true, is_page_enabled: true },
]

export const defaultLoadingSettings: SiteLoadingSettings = {
  logo_url: '/logo.webp',
  title: 'GZV',
  subtitle: 'Hệ sinh thái số & Đào tạo thực chiến',
  effect: 'orbit',
  background_from: '#050505',
  background_to: '#111111',
  accent_color: '#ed1c24',
  enabled: false,
  minimum_duration_ms: 900,
}

export const defaultFooterSettings: FooterSettings = {
  logo_url: '/logo.webp',
  intro_text: 'GZV - The Voice of Genzers',
  background_color: '#050505',
  bottom_background_color: '#111111',
  facebook_page_url: 'https://www.facebook.com/gzv.one',
  address: '279 Nguyễn Tri Phương, Phường Diên Hồng, TP.Hồ Chí Minh',
  phone_label: 'Điện thoại: (+84) 329 381 489',
  phone_url: 'tel:+84329381489',
  email_label: 'Email: gzv.one@gmail.com',
  email_url: 'mailto:gzv.one@gmail.com',
  newsletter_title: 'Kết nối với chúng tôi',
  newsletter_description: 'Đăng ký để nhận thông tin về các chương trình, dự án và sự kiện mới nhất.',
  copyright_text: 'GZV. Phát triển bởi Phòng Công nghệ thông tin.',
  links: [
    { label: 'GIỚI THIỆU', href: '/gioi-thieu', visible: true },
    { label: 'DỊCH VỤ', href: '/dich-vu', visible: true },
    { label: 'DỰ ÁN', href: '/du-an', visible: true },
    { label: 'GZVers', href: '/gzver', visible: true },
    { label: 'TIN TỨC', href: '/tin-tuc', visible: true },
    { label: 'LIÊN HỆ', href: '/lien-he', visible: true },
  ],
  social_links: [
    { label: 'Facebook', href: 'https://www.facebook.com/gzv.one', icon: 'facebook', visible: true },
    { label: 'YouTube', href: 'https://www.youtube.com/@gzvLifeLongLearning', icon: 'youtube', visible: true },
    { label: 'Zalo', href: 'https://zalo.me/g/acumou501', icon: 'zalo', visible: true },
  ],
}

export const defaultBrandingSettings: BrandingSettings = {
  site_name: 'GZV',
  header_logo_url: '/logo.webp',
  footer_logo_url: '/logo.webp',
  favicon_url: '/logo/favicon.ico',
  default_title: 'GZV - The Voice of Genzers',
  title_template: '%s | GZV',
  default_description: 'GZV Center',
  default_keywords: 'GZV, đào tạo, mentoring, coaching',
  og_image_url: '/og-image.jpg',
  topbar_email_label: 'gzv.one@gmail.com',
  topbar_phone_label: '(+84) 329 381 489',
  topbar_badge_label: 'GZV',
}

export const getPageSlugFromPath = (pathname: string) => pathname.split('/').filter(Boolean)[0] || 'home'

export async function getSiteNavigation() {
  const cached = getCachedData<SiteNavItem[]>('site_navigation')
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('site_navigation')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    const result = (data && data.length ? data : defaultNavigation) as SiteNavItem[]
    setCachedData('site_navigation', result)
    return result
  } catch (error) {
    console.warn('Using default navigation because site_navigation is unavailable.', error)
    return defaultNavigation
  }
}

export async function getSiteLoadingSettings() {
  const cached = getCachedData<SiteLoadingSettings>('site_loading_settings')
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('site_loading_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    const result = { ...defaultLoadingSettings, ...(data || {}) } as SiteLoadingSettings
    setCachedData('site_loading_settings', result)
    return result
  } catch (error) {
    console.warn('Using default loading settings because site_loading_settings is unavailable.', error)
    return defaultLoadingSettings
  }
}

export async function getSitePageContent(slug: string) {
  const cacheKey = `site_page_${slug}`
  const cached = getCachedData<SitePageContent | null>(cacheKey)
  if (cached !== null) return cached

  try {
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw error
    setCachedData(cacheKey, data)
    return data as SitePageContent | null
  } catch (error) {
    console.warn(`No managed content loaded for ${slug}.`, error)
    return null
  }
}

export async function getHomeSectionConfig(sectionKey: string) {
  const cacheKey = `home_section_${sectionKey}`
  const cached = getCachedData<HomeSectionConfig | null>(cacheKey)
  if (cached !== null) return cached

  try {
    const { data, error } = await supabase
      .from('site_home_sections')
      .select('*')
      .eq('section_key', sectionKey)
      .maybeSingle()

    if (error) throw error
    return data as HomeSectionConfig | null
  } catch (error) {
    console.warn(`No managed home section loaded for ${sectionKey}.`, error)
    return null
  }
}

export async function getHomeSections() {
  const cached = getCachedData<HomeSectionConfig[]>('site_home_sections')
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('site_home_sections')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    const result = (data || []) as HomeSectionConfig[]
    setCachedData('site_home_sections', result)
    return result
  } catch (error) {
    console.warn('No managed home sections loaded.', error)
    return []
  }
}

export async function getFooterSettings() {
  const fetchFresh = async () => {
    try {
      const { data, error } = await supabase
        .from('site_footer_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      if (error) throw error
      const result = { ...defaultFooterSettings, ...(data || {}) } as FooterSettings
      setCachedData('site_footer_settings', result)
      return result
    } catch (error) {
      return defaultFooterSettings
    }
  }

  const cached = getCachedData<FooterSettings>('site_footer_settings')
  if (cached) {
    // Background revalidate
    fetchFresh()
    return cached
  }

  return await fetchFresh()
}

export async function getFloatingActions() {
  const cached = getCachedData<FloatingAction[]>('site_floating_actions')
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('site_floating_actions')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    const result = (data || []) as FloatingAction[]
    setCachedData('site_floating_actions', result)
    return result
  } catch (error) {
    console.warn('Floating actions are unavailable.', error)
    return []
  }
}

export async function getActivePartners(limit = 40) {
  const cacheKey = `active_partners_${limit}`
  const cached = getCachedData<any[]>(cacheKey)
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('partners')
      .select('id, name, logo_url, website_url, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) throw error
    setCachedData(cacheKey, data || [])
    return data || []
  } catch (error) {
    console.warn('Partners are unavailable.', error)
    return []
  }
}

export async function getBrandingSettings() {
  const cached = getCachedData<BrandingSettings>('site_branding_settings')
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('site_branding_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    const result = { ...defaultBrandingSettings, ...(data || {}) } as BrandingSettings
    setCachedData('site_branding_settings', result)
    return result
  } catch (error) {
    console.warn('Using default branding settings because site_branding_settings is unavailable.', error)
    return defaultBrandingSettings
  }
}

export async function getPageBlocks(slug: string) {
  const cacheKey = `page_blocks_${slug}`
  const cached = getCachedData<PageBlock[]>(cacheKey)
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('site_page_blocks')
      .select('*')
      .eq('page_slug', slug)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    setCachedData(cacheKey, data || [])
    return (data || []) as PageBlock[]
  } catch (error) {
    console.warn(`No page blocks loaded for ${slug}.`, error)
    return []
  }
}

export async function getSectionTemplates() {
  const cached = getCachedData<SectionTemplate[]>('section_templates')
  if (cached) return cached

  try {
    const { data, error } = await supabase
      .from('site_section_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    setCachedData('section_templates', data || [])
    return (data || []) as SectionTemplate[]
  } catch (error) {
    console.warn('No section templates loaded.', error)
    return []
  }
}
