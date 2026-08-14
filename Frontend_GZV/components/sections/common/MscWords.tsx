"use client"

export interface MscWordsProps {
  lines?: string[]
  accentLetters?: string[]
  accentColor?: string
}

export default function MscWords({ lines = [], accentLetters = [], accentColor = "#f97316" }: MscWordsProps) {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900 sm:py-20">
      <div className="container px-4 text-center">
        <div className="space-y-3">
          {lines.map((line: string, index: number) => {
            const first = accentLetters[index] || line.charAt(0)
            const rest = line.startsWith(first) ? line.slice(first.length) : line
            return (
              <h2 key={index} className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span style={{ color: accentColor }}>{first}</span>{rest}
              </h2>
            )
          })}
        </div>
      </div>
    </section>
  )
}
