'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Loader2, ShieldCheck, Users2 } from 'lucide-react'
import { api, gzver } from '@/lib/api-supabase'
import PageBanner from '@/components/sections/common/PageBanner'
import BuilderPageGate from '@/components/BuilderPageGate'

type DepartmentGroup = {
  key: string
  name: string
  description: string
  color: string
  sortOrder: number
  members: gzver[]
}

const fallbackDepartment = {
  key: 'khac',
  name: 'GZVers',
  description: 'Những thành viên đang đóng góp trong hệ sinh thái GZV.',
  color: '#ed1c24',
  sortOrder: 999,
}

const getDepartmentMeta = (member: gzver) => {
  const department = member.gzver_departments
  return {
    key: department?.slug || member.department_name || fallbackDepartment.key,
    name: department?.name || member.department_name || fallbackDepartment.name,
    description: department?.description || fallbackDepartment.description,
    color: department?.color || fallbackDepartment.color,
    sortOrder: department?.sort_order ?? fallbackDepartment.sortOrder,
  }
}

const MAIN_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'directors', label: 'Ban Điều Hành' },
  { id: 'advisors', label: 'Ban Cố Vấn' },
  { id: 'gzvers', label: 'GZVers' },
]

export default function GzverPage() {
  const [gzvers, setGzvers] = useState<gzver[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGroup, setActiveGroup] = useState('all')

  useEffect(() => {
    let active = true
    const fetchGzvers = async () => {
      try {
        setLoading(true)
        const data = await api.getGzvers()
        if (active) setGzvers((data || []).sort((a, b) => (a.order || 0) - (b.order || 0)))
      } catch (error) {
        console.error('Error fetching gzvers:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchGzvers()
    return () => {
      active = false
    }
  }, [])

  const filteredGzvers = useMemo(() => {
    if (activeGroup === 'all') return gzvers
    if (activeGroup === 'directors') {
      return gzvers.filter(
        (m: any) =>
          m.is_director ||
          getDepartmentMeta(m).name.toLowerCase().includes('điều hành') ||
          getDepartmentMeta(m).name.toLowerCase().includes('leadership')
      )
    }
    if (activeGroup === 'advisors') {
      return gzvers.filter(
        (m: any) =>
          m.is_advisor ||
          m.is_mentor ||
          getDepartmentMeta(m).name.toLowerCase().includes('cố vấn') ||
          getDepartmentMeta(m).name.toLowerCase().includes('advisor')
      )
    }
    if (activeGroup === 'gzvers') {
      return gzvers.filter(
        (m: any) =>
          getDepartmentMeta(m).name.toLowerCase().includes('gzver') ||
          (!m.is_director && !m.is_advisor)
      )
    }
    return gzvers.filter((m) => getDepartmentMeta(m).key === activeGroup)
  }, [gzvers, activeGroup])

  const visibleGroups = useMemo(() => {
    const map = new Map<string, DepartmentGroup>()
    filteredGzvers.forEach((member) => {
      const meta = getDepartmentMeta(member)
      const group = map.get(meta.key) || { ...meta, members: [] }
      group.members.push(member)
      map.set(meta.key, group)
    })
    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
  }, [filteredGzvers])

  return (
    <>
      <PageBanner
        badge="GZV ORGANIZATION"
        title="GZVers"
        subtitle="Hệ sinh thái nhân sự GZV được chia theo từng ban để thể hiện rõ vai trò, trách nhiệm và năng lực triển khai."
        stats={[
          { value: `${gzvers.length}+`, label: 'Thành viên' },
          { value: `${visibleGroups.length}+`, label: 'Ban chuyên môn' },
          { value: '3+', label: 'Mũi triển khai' },
          { value: '100%', label: 'Thực chiến' },
        ]}
      />

      <BuilderPageGate slug="gzver">
        <div className="bg-white dark:bg-slate-950">

          <section className="border-b border-slate-200 bg-white py-8 dark:border-white/10 dark:bg-slate-950">
            <div className="container">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {MAIN_FILTERS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveGroup(tab.id)}
                    className={`h-11 border px-6 text-xs font-black uppercase tracking-wider transition ${
                      activeGroup === tab.id
                        ? 'border-[#ed1c24] bg-[#ed1c24] text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-900 dark:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 sm:py-20">
            <div className="container">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-28">
                  <Loader2 className="mb-5 h-12 w-12 animate-spin text-[#ed1c24]" />
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Đang tải dữ liệu GZVers...</p>
                </div>
              ) : visibleGroups.length > 0 ? (
                <div className="space-y-16">
                  {visibleGroups.map((group, groupIndex) => (
                    <motion.div
                      key={group.key}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: groupIndex * 0.06 }}
                    >
                      <div className="mb-8 grid gap-5 border-l-4 border-[#ed1c24] bg-slate-50 p-6 dark:bg-white/5 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                          <h2 className="text-3xl font-black uppercase leading-tight text-slate-950 dark:text-white md:text-4xl">{group.name}</h2>
                          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{group.description}</p>
                        </div>
                        <div className="flex items-center gap-3 border border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950">
                          <Users2 className="h-5 w-5 text-[#ed1c24]" />
                          <span className="text-2xl font-black text-slate-950 dark:text-white">{group.members.length}</span>
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">GZVers</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {group.members.map((member, index) => (
                          <motion.article
                            key={member.id}
                            initial={{ opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.04 }}
                            className="group flex min-h-[360px] flex-col overflow-hidden border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-[#ed1c24] hover:shadow-[0_28px_60px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-slate-900"
                          >
                            <div className="relative h-64 overflow-hidden bg-[#050505]">
                              <Image
                                src={member.avatar_url || '/gzvers/default.webp'}
                                alt={member.full_name}
                                fill
                                unoptimized
                                className="object-contain transition duration-700"
                                style={{
                                  objectPosition: `${member.avatar_position_x ?? 50}% ${member.avatar_position_y ?? 32}%`,
                                  transform: `scale(${(member.avatar_scale || 100) / 100})`,
                                }}
                              />
                              <div className="absolute inset-x-0 top-0 h-1 bg-[#ed1c24]" />
                              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                                <span className="bg-[#ed1c24] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-white">{member.role_level || member.position}</span>
                                {member.company && <span className="bg-black/75 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-white">@{member.company}</span>}
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#ed1c24]">{group.name}</p>
                              <h3 className="text-2xl font-black uppercase leading-tight text-slate-950 dark:text-white">{member.full_name}</h3>
                              <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">{member.position}</p>
                              <blockquote className="mt-5 line-clamp-3 flex-1 border-l-2 border-slate-200 pl-4 text-sm font-medium italic leading-6 text-slate-500 dark:border-white/10 dark:text-slate-400">
                                {member.testimonial || member.achievement_summary || 'Thành viên GZV với tinh thần triển khai thực chiến và trách nhiệm cao.'}
                              </blockquote>
                            </div>
                          </motion.article>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-200 bg-slate-50 py-20 text-center dark:border-white/10 dark:bg-white/5">
                  <p className="text-lg font-bold text-slate-500">Chưa có dữ liệu GZVers trong mục này.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </BuilderPageGate>
    </>
  )
}
