"use client"

import ContactForm from "@/components/ContactForm"

export interface ContactFormBlockProps {
  title?: string
  subtitle?: string
}

export default function ContactFormBlock({ title, subtitle }: ContactFormBlockProps) {
  return (
    <section className="bg-white py-16 dark:bg-slate-950 sm:py-20">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {title && <h2 className="text-3xl font-black text-slate-950 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{subtitle}</p>}
          </div>
        )}
        <ContactForm />
      </div>
    </section>
  )
}

