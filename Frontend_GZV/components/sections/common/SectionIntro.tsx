"use client"

export interface SectionIntroProps {
  eyebrow?: string
  title?: string
  subtitle?: string
  align?: "left" | "center"
  invert?: boolean
}

export default function SectionIntro({ eyebrow, title, subtitle, align = "left", invert = false }: SectionIntroProps) {
  if (!eyebrow && !title && !subtitle) return null
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} mb-10 max-w-4xl`}>
      {eyebrow && <p className={`mb-3 border-l-4 border-[#ed1c24] pl-3 text-xs font-black uppercase tracking-[0.2em] ${align === "center" ? "inline-block text-left" : ""} ${invert ? "text-white/70" : "text-slate-500"}`}>{eyebrow}</p>}
      {title && <h2 className={`text-3xl font-black uppercase leading-tight tracking-normal sm:text-5xl ${invert ? "text-white" : "text-slate-950 dark:text-white"}`}>{title}</h2>}
      {subtitle && <p className={`mt-4 text-base font-semibold leading-8 ${invert ? "text-white/70" : "text-slate-600 dark:text-slate-300"}`}>{subtitle}</p>}
    </div>
  )
}
