"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CtaBandProps {
  title?: string
  description?: string
  buttonLabel?: string
  buttonUrl?: string
  backgroundFrom?: string
  backgroundTo?: string
}

export default function CtaBand({ title, description, buttonLabel, buttonUrl, backgroundFrom = "#ed1c24", backgroundTo = "#ed1c24" }: CtaBandProps) {
  return (
    <section className="py-16 text-white sm:py-20" style={{ background: `linear-gradient(90deg, ${backgroundFrom}, ${backgroundTo})` }}>
      <div className="container px-4 text-center">
        {title && <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">{title}</h2>}
        {description && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">{description}</p>}
        {buttonLabel && buttonUrl && (
          <Link href={buttonUrl}>
            <Button size="lg" className="mt-8 rounded-full bg-white px-10 py-7 text-lg font-black uppercase tracking-widest text-[#ed1c24] hover:bg-red-50">
              {buttonLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}
