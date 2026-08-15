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
    { value: "10+", label: "Năm kinh nghiệm", description: "Đồng hành và phát triển" },
    { value: "5000+", label: "Học viên", description: "Tham gia đào tạo" },
    { value: "50+", label: "Doanh nghiệp", description: "Đối tác chiến lược" },
    { value: "98%", label: "Hài lòng", description: "Đánh giá chất lượng" },
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
      className={`relative overflow-hidden py-16 text-white ${className}`}
      style={bgStyle}
    >
      <div className="container relative z-10 mx-auto px-4">
        {(badge || title || subtitle) && (
          <div className="mx-auto mb-12 max-w-3xl text-center">
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
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative overflow-hidden border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <div
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
                style={{ color: accentColor }}
              >
                {stat.value}
              </div>
              <div className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                {stat.label}
              </div>
              {stat.description && (
                <div className="mt-1 text-[11px] text-white/60">
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
