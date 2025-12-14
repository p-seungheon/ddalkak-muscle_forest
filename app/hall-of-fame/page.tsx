"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Home, Utensils, Dumbbell, Calendar, ShoppingBag, Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserStore, type UserProgress, type Achievement } from "@/lib/user-store"

type Tab = "home" | "diet" | "workout" | "schedule" | "hall-of-fame" | "store"

export default function HallOfFamePage() {
  const [progress, setProgress] = useState<UserProgress>(UserStore.getDefaultProgress())
  const [activeTab, setActiveTab] = useState<Tab>("hall-of-fame")
  const [selectedCategory, setSelectedCategory] = useState<"all" | Achievement["category"]>("all")

  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragDistance, setDragDistance] = useState(0)

  useEffect(() => {
    const loadedProgress = UserStore.loadProgress()
    const updatedProgress = UserStore.checkAchievements(loadedProgress)
    setProgress(updatedProgress)
    UserStore.saveProgress(updatedProgress)
  }, [])

  const categories: { value: "all" | Achievement["category"]; label: string; icon: string }[] = [
    { value: "all", label: "전체", icon: "🏅" },
    { value: "workout", label: "운동", icon: "💪" },
    { value: "diet", label: "식단", icon: "🍽️" },
    { value: "streak", label: "연속", icon: "🔥" },
    { value: "level", label: "레벨", icon: "⬆️" },
    { value: "special", label: "특별", icon: "✨" },
  ]

  const filteredAchievements =
    selectedCategory === "all"
      ? progress.achievements
      : progress.achievements.filter((a) => a.category === selectedCategory)

  const completedCount = progress.achievements.filter((a) => a.completed).length
  const totalCount = progress.achievements.length

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsContainerRef.current) return
    setIsDragging(true)
    setDragDistance(0)
    setStartX(e.pageX)
    setScrollLeft(tabsContainerRef.current.scrollLeft)
    tabsContainerRef.current.style.cursor = "grabbing"
    tabsContainerRef.current.style.userSelect = "none"
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsContainerRef.current) return
    e.preventDefault()
    const distance = e.pageX - startX
    setDragDistance(Math.abs(distance))
    tabsContainerRef.current.scrollLeft = scrollLeft - distance
  }

  const handleMouseUp = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.style.cursor = "grab"
      tabsContainerRef.current.style.userSelect = "auto"
    }
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    if (isDragging && tabsContainerRef.current) {
      tabsContainerRef.current.style.cursor = "grab"
      tabsContainerRef.current.style.userSelect = "auto"
    }
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!tabsContainerRef.current) return
    setIsDragging(true)
    setDragDistance(0)
    setStartX(e.touches[0].pageX)
    setScrollLeft(tabsContainerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !tabsContainerRef.current) return
    const distance = e.touches[0].pageX - startX
    setDragDistance(Math.abs(distance))
    tabsContainerRef.current.scrollLeft = scrollLeft - distance
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleCategoryClick = (category: "all" | Achievement["category"]) => {
    if (dragDistance < 5) {
      setSelectedCategory(category)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 scrollbar-hide">
      <div className="mx-auto max-w-[430px]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <h1 className="text-lg font-black tracking-tight">명예의 전당</h1>
            </div>
            <div className="w-5" />
          </div>
        </header>

        {/* Achievement Summary */}
        <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-amber-900 dark:to-orange-950 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-400 dark:bg-amber-500 rounded-full flex items-center justify-center text-3xl">🏆</div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium mb-1">달성한 업적</p>
              <p className="text-2xl font-black">
                {completedCount} / {totalCount}
              </p>
              <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="border-b border-border">
          <div
            ref={tabsContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-3"
            style={{
              cursor: "grab",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex-shrink-0 w-5" />
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryClick(category.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === category.value
                    ? "bg-black text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category.icon} {category.label}
              </button>
            ))}
            <div className="flex-shrink-0 w-5" />
          </div>
        </div>

        {/* Achievements List */}
        <div className="p-5 space-y-3">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 border-2 rounded-lg transition-all ${
                achievement.completed
                  ? "border-yellow-400 bg-yellow-50 dark:border-amber-500 dark:bg-amber-900"
                  : "border-border bg-card hover:border-foreground"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                    achievement.completed ? "bg-yellow-400 dark:bg-amber-500" : "bg-muted"
                  }`}
                >
                  {achievement.completed ? achievement.icon : "🔒"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-sm">{achievement.title}</h3>
                    {achievement.completed && (
                      <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">완료</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>

                  {/* Progress Bar */}
                  {!achievement.completed && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {achievement.currentProgress} / {achievement.requirement}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {Math.round((achievement.currentProgress / achievement.requirement) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-500"
                          style={{
                            width: `${Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-blue-600">+{achievement.reward.xp} XP</span>
                    <span className="font-bold text-green-600">+{achievement.reward.points} P</span>
                  </div>

                  {/* Completion Date */}
                  {achievement.completed && achievement.completedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      달성일: {new Date(achievement.completedAt).toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-card border-t border-border">
          <div className="flex items-center justify-around py-2">
            <Link
              href="/"
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                activeTab === "home" ? "opacity-100" : "opacity-40"
              }`}
              onClick={() => setActiveTab("home")}
            >
              <Home className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium whitespace-nowrap">홈</span>
            </Link>
            <Link
              href="/diet"
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                activeTab === "diet" ? "opacity-100" : "opacity-40"
              }`}
              onClick={() => setActiveTab("diet")}
            >
              <Utensils className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium whitespace-nowrap">식단</span>
            </Link>
            <Link
              href="/workout"
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                activeTab === "workout" ? "opacity-100" : "opacity-40"
              }`}
              onClick={() => setActiveTab("workout")}
            >
              <Dumbbell className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium whitespace-nowrap">운동</span>
            </Link>
            <Link
              href="/schedule"
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                activeTab === "schedule" ? "opacity-100" : "opacity-40"
              }`}
              onClick={() => setActiveTab("schedule")}
            >
              <Calendar className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium whitespace-nowrap">일정</span>
            </Link>
            <Link
              href="/hall-of-fame"
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                activeTab === "hall-of-fame" ? "opacity-100" : "opacity-40"
              }`}
              onClick={() => setActiveTab("hall-of-fame")}
            >
              <Trophy className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium whitespace-nowrap">명예</span>
            </Link>
            <Link
              href="/store"
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                activeTab === "store" ? "opacity-100" : "opacity-40"
              }`}
              onClick={() => setActiveTab("store")}
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium whitespace-nowrap">스토어</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  )
}
