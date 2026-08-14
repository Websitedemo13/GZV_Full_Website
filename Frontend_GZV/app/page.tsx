import HeroVideo from "@/components/HeroVideo"
import AboutGzv from "@/components/sections/home/AboutGzv"
import ProjectsGrid from "@/components/sections/home/ProjectsGrid"
import ServicesThree from "@/components/sections/home/ServicesThree"
import AboutBoxes from "@/components/sections/home/AboutBoxes"
import PartnersGrid from "@/components/sections/home/PartnersGrid"
import NewsGrid from "@/components/sections/home/NewsGrid"

export default function HomePage() {
  return (
    <>
      {/* Hero Video Banner */}
      <HeroVideo />
      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

      {/* 1. Câu chuyện GZV (Nền Trắng) */}
      <AboutGzv />
      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

      {/* 2. Dự án đã triển khai (Nền Xám) */}
      <ProjectsGrid />
      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

      {/* 3. Dịch vụ (Nền Trắng) */}
      <ServicesThree />
      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

      {/* 4. Về chúng tôi (Nền Xám) */}
      <AboutBoxes />
      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

      {/* 5. Đối tác (Nền Trắng) */}
      <PartnersGrid />
      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

      {/* 6. Tin tức (Nền Xám) */}
      <NewsGrid />
      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
    </>
  )
}