"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getBrandingSettings, getPageSlugFromPath, getSitePageContent } from "@/lib/site-content"

const upsertMeta = (name: string, content?: string | null) => {
  if (!content) return
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement("meta")
    tag.name = name
    document.head.appendChild(tag)
  }
  tag.content = content
}

const updateFavicons = (faviconUrl?: string | null) => {
  if (!faviconUrl || typeof document === "undefined") return

  const rels = ["icon", "shortcut icon", "apple-touch-icon"]
  rels.forEach((rel) => {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
    if (link) {
      link.href = faviconUrl
    } else {
      link = document.createElement("link")
      link.rel = rel
      link.href = faviconUrl
      document.head.appendChild(link)
    }
  })
}

export default function SeoBrandingManager() {
  const pathname = usePathname()

  useEffect(() => {
    let active = true
    Promise.all([getBrandingSettings(), getSitePageContent(getPageSlugFromPath(pathname))]).then(([branding, page]) => {
      if (!active) return
      const isHome = getPageSlugFromPath(pathname) === "home" || !getPageSlugFromPath(pathname)
      const defaultSiteTitle = branding.default_title || branding.site_name || "GZV - The Voice of Genzers"

      if (isHome) {
        document.title = defaultSiteTitle
      } else {
        const pageTitle = page?.title && page.title !== "doi-tac" ? page.title : (page?.seo_title || "Đối tác")
        document.title = `${pageTitle} | ${branding.site_name || "GZV"}`
      }

      upsertMeta("description", page?.seo_description || branding.default_description)
      upsertMeta("keywords", branding.default_keywords)
      updateFavicons(branding.favicon_url)
    })
    return () => {
      active = false
    }
  }, [pathname])

  return null
}
