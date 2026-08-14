"use client"

import { useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Send, Loader2, ArrowUpRight } from "lucide-react"
import { supabase } from "@/lib/api-supabase"
import { toast } from "sonner"
import { motion } from "framer-motion"

// TikTok inline SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.84 19.4a6.34 6.34 0 0 0 10.86-4.43V8.27a8.16 8.16 0 0 0 4.77 1.52V6.34a4.85 4.85 0 0 1-1.88.35z" />
    </svg>
  )
}

function hexToHSL(hex: string): string {
  if (!hex) return ""
  if (hex.startsWith("hsl")) return hex.replace(/hsl\(|\)/g, "")
  hex = hex.replace("#", "")
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("")
  }
  if (hex.length !== 6) return ""
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export interface FooterProps {
  overrideConfig?: {
    logo_url?: string | null
    site_title?: string
    brand_tagline?: string
    contact_address?: string
    contact_phone?: string
    contact_email?: string
    links?: Array<{ label: string; url: string }>
    social_facebook?: string
    social_youtube?: string
    social_instagram?: string
    social_tiktok?: string
    facebook_page_url?: string
    contact_person?: string
    contact_person_phone?: string
    contact_person_email?: string
    copyright_text?: string
    terms_url?: string
    privacy_url?: string
    show_social?: boolean
    primary_color?: string
    secondary_color?: string
    accent_color?: string
    footer_bg_color?: string
    footer_text_color?: string
    footer_link_color?: string
  }
  activeColumn?: number | string | null
  onSelectColumn?: (col: number | string) => void
}

export default function Footer({ overrideConfig, activeColumn, onSelectColumn }: FooterProps = {}) {
  const fc: any = overrideConfig ?? {}
  const logoUrl = overrideConfig?.logo_url !== undefined
    ? overrideConfig.logo_url
    : "/logo.webp"
  const siteTitle = overrideConfig?.site_title !== undefined
    ? overrideConfig.site_title
    : "GZV Center"

  const primaryRaw = overrideConfig?.primary_color || "#ed1c24"
  const secondaryRaw = overrideConfig?.secondary_color
  const accentRaw = overrideConfig?.accent_color

  const footerStyleObj: Record<string, string> = {}
  if (primaryRaw) {
    const hsl = hexToHSL(primaryRaw)
    if (hsl) {
      footerStyleObj["--primary"] = hsl
      footerStyleObj["--ring"] = hsl
      footerStyleObj["--vsm-primary"] = hsl
    }
  }
  if (secondaryRaw) {
    const hsl = hexToHSL(secondaryRaw)
    if (hsl) {
      footerStyleObj["--secondary"] = hsl
      footerStyleObj["--vsm-secondary"] = hsl
    }
  }
  if (accentRaw) {
    const hsl = hexToHSL(accentRaw)
    if (hsl) {
      footerStyleObj["--accent"] = hsl
      footerStyleObj["--vsm-accent"] = hsl
    }
  }

  if (fc.footer_bg_color) {
    footerStyleObj["backgroundColor"] = fc.footer_bg_color
  }
  if (fc.footer_text_color) {
    footerStyleObj["color"] = fc.footer_text_color
    const hsl = hexToHSL(fc.footer_text_color)
    if (hsl) {
      footerStyleObj["--foreground"] = hsl
      footerStyleObj["--muted-foreground"] = hsl
    }
  }
  if (fc.footer_link_color) {
    const hsl = hexToHSL(fc.footer_link_color)
    if (hsl) {
      footerStyleObj["--primary"] = hsl
    }
  }

  const quickLinks: Array<{ label: string; url: string }> = (fc.links?.length ? fc.links : [
    { label: "Giới thiệu", url: "/gioi-thieu" },
    { label: "Dịch vụ", url: "/dich-vu" },
    { label: "Dự án", url: "/du-an" },
    { label: "GZVers", url: "/gzver" },
    { label: "Tin tức", url: "/tin-tuc" },
    { label: "Liên hệ", url: "/lien-he" },
  ])

  const showSocial = fc.show_social !== false

  const socials = showSocial ? ([
    fc.social_facebook && { icon: Facebook, url: fc.social_facebook, label: "Facebook" },
    fc.social_youtube && { icon: Youtube, url: fc.social_youtube, label: "YouTube" },
    fc.social_instagram && { icon: Instagram, url: fc.social_instagram, label: "Instagram" },
    fc.social_tiktok && { icon: TikTokIcon, url: fc.social_tiktok, label: "TikTok" },
  ].filter(Boolean) as Array<{ icon: any; url: string; label: string }>) : []

  const fbPage = fc.facebook_page_url || "https://www.facebook.com/gzv.one"
  const fbEmbedSrc = fbPage
    ? `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fbPage)}&tabs&width=250&height=160&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`
    : null

  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Email không hợp lệ"); return }
    setSubscribing(true)
    const { error } = await supabase.from("newsletter_subscribers").insert({ email })
    setSubscribing(false)
    if (error) {
      if (error.code === "23505") toast.info("Bạn đã đăng ký rồi, cảm ơn!")
      else toast.error("Không đăng ký được, vui lòng thử lại")
      return
    }
    toast.success("Cảm ơn bạn đã đăng ký nhận tin!")
    setEmail("")
  }

  const copyright = fc.copyright_text || `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved.`

  return (
    <footer
      className="relative mt-0 border-t border-border bg-[#050505] text-white select-none"
      style={footerStyleObj as React.CSSProperties}
    >
      <div className="container mx-auto px-4 py-12 md:py-16 relative max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Cột 1: Brand + address */}
          <motion.div
            onClick={() => onSelectColumn?.(1)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`space-y-5 rounded-none transition-all ${onSelectColumn ? "cursor-pointer p-3 border border-transparent hover:border-primary/60 hover:bg-primary/5" : ""
              } ${activeColumn === 1 ? "border-primary bg-primary/10 ring-2 ring-primary" : ""}`}
          >
            <Link href="/" className="inline-flex items-center gap-2" onClick={(e) => onSelectColumn && e.preventDefault()}>
              {logoUrl ? (
                <img src={logoUrl} alt={siteTitle} className="h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-none bg-[#ed1c24] text-white flex items-center justify-center">
                  <span className="font-extrabold text-sm">GZV</span>
                </div>
              )}
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              {fc.brand_tagline || "GZV Center — Hệ sinh thái đào tạo, tư vấn và triển khai dự án thực chiến."}
            </p>
            <ul className="space-y-3 text-xs font-semibold">
              {(fc.contact_address || "Tầng 3, Tòa nhà GZV, Hà Nội") && (
                <li className="flex items-start gap-2.5 text-slate-300">
                  <MapPin className="h-4 w-4 text-[#ed1c24] mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{fc.contact_address || "Hệ sinh thái GZV Center"}</span>
                </li>
              )}
              {fc.contact_phone && (
                <li>
                  <a href={`tel:${fc.contact_phone}`} className="flex items-center gap-2.5 text-slate-300 hover:text-[#ed1c24] transition-colors" onClick={(e) => onSelectColumn && e.preventDefault()}>
                    <Phone className="h-4 w-4 text-[#ed1c24] shrink-0" />
                    <span>{fc.contact_phone}</span>
                  </a>
                </li>
              )}
              {fc.contact_email && (
                <li>
                  <a href={`mailto:${fc.contact_email}`} className="flex items-center gap-2.5 text-slate-300 hover:text-[#ed1c24] transition-colors" onClick={(e) => onSelectColumn && e.preventDefault()}>
                    <Mail className="h-4 w-4 text-[#ed1c24] shrink-0" />
                    <span>{fc.contact_email}</span>
                  </a>
                </li>
              )}
            </ul>
          </motion.div>

          {/* Cột 2: Quick links */}
          <motion.div
            onClick={() => onSelectColumn?.(2)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className={`space-y-5 rounded-none transition-all ${onSelectColumn ? "cursor-pointer p-3 border border-transparent hover:border-primary/60 hover:bg-primary/5" : ""
              } ${activeColumn === 2 ? "border-primary bg-primary/10 ring-2 ring-primary" : ""}`}
          >
            <h3 className="font-black text-sm uppercase tracking-wider relative inline-block text-white pb-1.5 border-b-2 border-[#ed1c24]">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3 text-xs font-semibold">
              {quickLinks.map((l) => (
                <li key={l.url}>
                  <Link
                    href={l.url}
                    onClick={(e) => onSelectColumn && e.preventDefault()}
                    className="group inline-flex items-center gap-2 text-slate-300 hover:text-[#ed1c24] transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-none bg-[#ed1c24]/40 group-hover:bg-[#ed1c24] transition-colors" />
                    {l.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#ed1c24] shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Cột 3: Connect / Social */}
          <motion.div
            onClick={() => onSelectColumn?.(3)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`space-y-5 rounded-none transition-all min-w-0 overflow-hidden ${onSelectColumn ? "cursor-pointer p-3 border border-transparent hover:border-primary/60 hover:bg-primary/5" : ""
              } ${activeColumn === 3 ? "border-primary bg-primary/10 ring-2 ring-primary" : ""}`}
          >
            <h3 className="font-black text-sm uppercase tracking-wider relative inline-block text-white pb-1.5 border-b-2 border-[#ed1c24]">
              Kết nối với chúng tôi
            </h3>

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => {
                  const Icon = s.icon
                  return (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      onClick={(e) => onSelectColumn && e.preventDefault()}
                      className="w-10 h-10 rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218] transition-colors flex items-center justify-center shadow-sm"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  )
                })}
              </div>
            )}

            {fbEmbedSrc && (
              <div className="w-full max-w-[250px] overflow-hidden rounded-none bg-black mt-4 shadow-none">
                <iframe
                  src={fbEmbedSrc}
                  width="250"
                  height="160"
                  style={{ border: "none", overflow: "hidden" }}
                  scrolling="no"
                  frameBorder="0"
                  allow="encrypted-media"
                  title="Facebook Page"
                  loading="lazy"
                  className="w-[250px] max-w-full h-[160px] block border-0"
                />
              </div>
            )}
          </motion.div>

          {/* Cột 4: Newsletter & Contact Person */}
          <motion.div
            onClick={() => onSelectColumn?.(4)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className={`space-y-4 rounded-none transition-all ${onSelectColumn ? "cursor-pointer p-3 border border-transparent hover:border-primary/60 hover:bg-primary/5" : ""
              } ${activeColumn === 4 ? "border-primary bg-primary/10 ring-2 ring-primary" : ""}`}
          >
            <h3 className="font-black text-sm uppercase tracking-wider relative inline-block text-white pb-1.5 border-b-2 border-[#ed1c24]">
              Đăng ký nhận tin mới
            </h3>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">Nhận thông tin hoạt động và chương trình đào tạo mới nhất từ GZV.</p>
            <form onSubmit={subscribe} className="relative mt-2" onClick={(e) => onSelectColumn && e.stopPropagation()}>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="w-full pl-4 pr-12 py-3 h-11 rounded-none bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#ed1c24] transition-all placeholder:text-slate-400"
              />
              <button
                type="submit" disabled={subscribing}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218] flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Đăng ký"
              >
                {subscribing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </form>

            {(() => {
              const personName = fc.contact_person || "GZV Ltd"
              const personPhone = fc.contact_person_phone || "(+84) 329 381 489"
              const personEmail = fc.contact_person_email || "one.gzv@gmail.com"

              return (
                <div
                  className="mt-6 p-4 rounded-none border space-y-1.5 text-xs font-semibold bg-white text-slate-900 border-slate-200"
                >
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                    Liên hệ GZV
                  </p>
                  <p className="font-bold text-slate-900">
                    {personName}
                  </p>
                  <p className="text-slate-600">
                    Điện thoại:{" "}
                    <a
                      href={`tel:${personPhone}`}
                      onClick={(e) => onSelectColumn && e.preventDefault()}
                      className="font-bold hover:underline transition-all text-slate-900"
                    >
                      {personPhone}
                    </a>
                  </p>
                  <p className="text-slate-600">
                    Email:{" "}
                    <a
                      href={`mailto:${personEmail}`}
                      onClick={(e) => onSelectColumn && e.preventDefault()}
                      className="font-bold hover:underline transition-all text-slate-900"
                    >
                      {personEmail}
                    </a>
                  </p>
                </div>
              )
            })()}
          </motion.div>
        </div>

        {/* Bottom bar / Copyright */}
        <div
          onClick={() => onSelectColumn?.("copyright")}
          className={`mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-semibold rounded-none transition-all ${onSelectColumn ? "cursor-pointer p-3 border border-transparent hover:border-primary/60 hover:bg-primary/5" : ""
            } ${activeColumn === "copyright" ? "border-primary bg-primary/10 ring-2 ring-primary" : ""}`}
        >
          <p>{copyright}</p>
          <div className="flex items-center gap-5">
            {fc.terms_url && <a href={fc.terms_url} onClick={(e) => onSelectColumn && e.preventDefault()} className="hover:text-[#ed1c24] transition-colors">Điều khoản sử dụng</a>}
            {fc.privacy_url && <a href={fc.privacy_url} onClick={(e) => onSelectColumn && e.preventDefault()} className="hover:text-[#ed1c24] transition-colors">Bảo mật</a>}
          </div>
        </div>
      </div>
    </footer>
  )
}
