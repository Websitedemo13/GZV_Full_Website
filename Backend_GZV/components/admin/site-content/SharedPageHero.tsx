"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"

interface SharedPageHeroProps {
  badge?: string
  badgeColor?: string
  title?: string
  titleColor?: string
  description?: string
  descriptionColor?: string
  useImage?: boolean
  backgroundImageUrl?: string
  imagePositionY?: string
  bgColor?: string
  textColor?: string
  titleAlignment?: "left" | "center" | "right"
  isPreviewMode?: boolean
  onPositionChange?: (val: string) => void
  onBadgeClick?: () => void
  onTitleClick?: () => void
  onDescriptionClick?: () => void
}

export function SharedPageHero({
  badge,
  badgeColor = "#ffffff",
  title,
  titleColor = "#ffffff",
  description,
  descriptionColor = "rgba(255,255,255,0.85)",
  useImage = true,
  backgroundImageUrl,
  imagePositionY = "50%",
  bgColor = "#050505",
  titleAlignment = "center",
  isPreviewMode = false,
  onPositionChange,
  onBadgeClick,
  onTitleClick,
  onDescriptionClick,
}: SharedPageHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const alignClass =
    titleAlignment === "left"
      ? "text-left items-start"
      : titleAlignment === "right"
      ? "text-right items-end"
      : "text-center items-center"

  const parseHtmlText = (str?: string) => {
    if (!str) return ""
    // Strip HTML tags for clean banner rendering if needed
    return str.replace(/<[^>]*>?/gm, "")
  }

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[#050505] py-24 text-white min-h-[500px] flex items-center justify-center"
      style={{ backgroundColor: useImage ? "#050505" : bgColor }}
    >
      {useImage && backgroundImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-no-repeat opacity-35 grayscale"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundPosition: `center ${imagePositionY}`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Decorative Overlays */}
      <div
        className="absolute inset-0 bg-[linear-gradient(110deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.88)_54%,rgba(237,28,36,0.30)_100%)]"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-1 bg-[#ed1c24]" aria-hidden="true" />
      <div
        className="absolute bottom-0 left-0 h-20 w-full border-t border-white/10 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_14px)]"
        aria-hidden="true"
      />

      <div className="container relative z-10 px-6">
        <div className={`mx-auto max-w-4xl flex flex-col ${alignClass}`}>
          {badge && (
            <motion.div
              onClick={onBadgeClick}
              className={`mb-6 inline-flex items-center gap-2 border-l-4 border-[#ed1c24] bg-white/10 px-4 py-2 backdrop-blur-sm ${
                isPreviewMode ? "cursor-pointer hover:ring-2 hover:ring-[#ed1c24]" : ""
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span
                className="text-sm font-black uppercase tracking-wider"
                style={{ color: badgeColor }}
              >
                {parseHtmlText(badge)}
              </span>
            </motion.div>
          )}

          {title && (
            <motion.h1
              onClick={onTitleClick}
              className={`mb-6 text-5xl font-black uppercase leading-tight md:text-6xl ${
                isPreviewMode ? "cursor-pointer hover:ring-2 hover:ring-[#ed1c24]" : ""
              }`}
              style={{ color: titleColor }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {parseHtmlText(title)}
            </motion.h1>
          )}

          {description && (
            <motion.p
              onClick={onDescriptionClick}
              className={`mb-8 text-xl font-semibold leading-relaxed ${
                isPreviewMode ? "cursor-pointer hover:ring-2 hover:ring-[#ed1c24]" : ""
              }`}
              style={{ color: descriptionColor }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {parseHtmlText(description)}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  )
}
