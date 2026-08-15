"use client"

import React from "react"
import { motion } from "framer-motion"

export interface StatItem {
  value: string
  label: string
  description?: string
}

export interface StatsBarProps {
  badge?: string
  title?: string
  subtitle?: string
  stats?: StatItem[]
  columns?: number
  backgroundFrom?: string
  backgroundTo?: string
  bgColor?: string
  accentColor?: string
  className?: string
}

export default function StatsBar({
  badge,
  title,
  subtitle,
  stats = [
    { value: "3", label: "Mũi triển khai", description: "Marketing, Sales, Chuyển đổi số" },
    { value: "50+", label: "Đối tác", description: "Doanh nghiệp đồng hành" },
    { value: "10+", label: "Lĩnh vực", description: "Kinh nghiệm thực tiễn" },
    { value: "100%", label: "Thực chiến", description: "Tập trung vào kết quả" },
  ],
  columns = 4,
  backgroundFrom = "#050505",
  backgroundTo = "#111111",
  bgColor,
  accentColor = "#ed1c24",
  className = "",
}: StatsBarProps) {
  if (!stats || stats.length === 0) return null

  const gridColsClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2 lg:grid-cols-4"

  const bgStyle = bgColor
    ? { backgroundColor: bgColor }
    : { background: `linear-gradient(135deg, ${backgroundFrom}, ${backgroundTo})` }

  return (
    <section
      className={`relative overflow-hidden py-14 sm:py-16 text-white border-b border-white/10 ${className}`}
      style={bgStyle}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        {(badge || title || subtitle) && (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {badge && (
              <span
                className="mb-3 inline-block border-l-2 px-3 py-1 text-xs font-black uppercase tracking-wider text-white"
                style={{ borderColor: accentColor }}
              >
                {badge}
              </span>
            )}
            {title && (
              <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl lg:text-4xl text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-sm sm:text-base text-white/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid gap-4 sm:gap-6 ${gridColsClass}`}>
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="group relative overflow-hidden border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition hover:border-[#ed1c24]/50 hover:bg-white/[0.08] shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[#ed1c24] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-sm"
                style={{ color: accentColor }}
              >
                {stat.value}
              </div>
              <div className="mt-2 text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                {stat.label}
              </div>
              {stat.description && (
                <div className="mt-1.5 text-[11px] text-white/60 font-medium leading-relaxed">
                  {stat.description}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
