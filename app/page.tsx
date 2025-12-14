"use client"

import { useState, useEffect } from "react"
import { Home, Utensils, Dumbbell, ShoppingBag, User, Calendar, TrendingUp, Trophy } from "lucide-react"
import Link from "next/link"
import { UserStore, type UserProgress } from "@/lib/user-store"
import { InteractiveShiba } from "@/components/interactive-shiba"

type Tab = "home" | "diet" | "workout" | "schedule" | "hall-of-fame" | "store" | "my"

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress>(UserStore.getDefaultProgress())
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [dailyChallenge, setDailyChallenge] = useState<string>("")
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  useEffect(() => {
    const hasVisited = localStorage.getItem("has_visited")
    if (!hasVisited) {
      window.location.href = "/main"
      return
    }
    setIsFirstVisit(false)

    setProgress(UserStore.loadProgress())

    const challenges = [
      "오늘은 상체 운동의 날! 벤치프레스로 가슴을 자극해보세요 💪",
      "하체의 날입니다. 스쿼트 5세트로 하루를 시작하세요 🦵",
      "등 운동으로 넓은 등판을 만들어보세요! 데드리프트 추천 🔥",
      "어깨를 키우는 날! 숄더프레스로 볼륨감을 더하세요 ⚡",
      "팔 운동 집중의 날. 이두/삼두를 골고루 자극하세요 💥",
    ]
    const today = new Date().getDay()
    setDailyChallenge(challenges[today % challenges.length])
  }, [])

  if (isFirstVisit) {
    return null
  }

  const getLevelText = () => {
    if (progress.level === 1) return "Lv.1 헬린이 시바"
    if (progress.level === 2) return "Lv.2 초보 시바"
    if (progress.level === 3) return "Lv.3 운동러 시바"
    if (progress.level === 4) return "Lv.4 득근 시바"
    return "Lv.5 근육신 시바"
  }

  const xpProgress = UserStore.getXPProgress(progress)
  const nextLevelXP = UserStore.getXPForNextLevel(progress)
  const muscleDelta =
    Number.isFinite(progress.muscleMass) && Number.isFinite(progress.baseMuscleMass)
      ? progress.muscleMass - progress.baseMuscleMass
      : 0
  const bodyFatDelta =
    Number.isFinite(progress.bodyFat) && Number.isFinite(progress.baseBodyFat)
      ? progress.bodyFat - progress.baseBodyFat
      : 0

  const heightM = progress.height > 0 ? progress.height / 100 : 0
  const bmi = heightM > 0 ? progress.weight / (heightM * heightM) : null

  const hasMuscle = Number.isFinite(progress.muscleMass)
  const hasBodyFat = Number.isFinite(progress.bodyFat)
  const hasWeight = Number.isFinite(progress.weight)

  return (
    <>
      <div className="min-h-screen bg-background pb-20 scrollbar-hide">
        <div className="mx-auto max-w-[430px]">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-background border-b border-border">
            <div className="flex items-center justify-between px-5 py-3">
              <h1 className="text-lg font-black tracking-tight">득근의 숲</h1>
              <Link href="/my">
                <button className="p-2 rounded-full transition-colors hover:bg-muted">
                  <User className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </header>

          <div className="relative aspect-square bg-gradient-to-b from-gray-100 to-gray-200 dark:from-background dark:to-background">
            <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold rounded-full">
              {getLevelText()}
            </div>
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 text-xs font-bold rounded-full bg-card text-foreground border border-border dark:bg-primary dark:text-primary-foreground">
              {progress.currentStreak}일 연속
            </div>

            <InteractiveShiba level={progress.level} />
          </div>

          {/* XP Progress Bar */}
          <div className="border-t border-b border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold tracking-wider text-muted-foreground">XP PROGRESS</p>
              <p className="text-xs font-bold">
                {progress.currentXP.toLocaleString()} / {nextLevelXP > 0 ? nextLevelXP.toLocaleString() : "MAX"}
              </p>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* Body Overview Card */}
          <div className="border-t border-border">
            <div className="bg-card dark:bg-background px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-foreground">내 몸 한눈에</p>
                <p className="text-[11px] text-muted-foreground font-medium">오늘 기준 요약</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                {/* 1행: 골격근량 / 체지방률 */}
                <div className="border border-border rounded-xl p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">골격근량</p>
                  <p className="text-base font-black text-foreground">
                    {hasMuscle ? `${progress.muscleMass.toFixed(1)}kg` : "미설정"}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between gap-1 overflow-hidden">
                    <span className="flex-1 min-w-0 truncate">
                      {progress.targetMuscleMass != null
                        ? `목표 ${progress.targetMuscleMass.toFixed(1)}kg`
                        : "목표 미설정"}
                    </span>
                    {hasMuscle && muscleDelta !== 0 ? (
                      <span
                        className={`font-bold ${muscleDelta > 0 ? "text-red-600" : "text-blue-600"}`}
                      >
                        {muscleDelta > 0
                          ? `+${muscleDelta.toFixed(1)}kg`
                          : `-${Math.abs(muscleDelta).toFixed(1)}kg`}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">변화 없음</span>
                    )}
                  </p>
                </div>
                <div className="border border-border rounded-xl p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">체지방률</p>
                  <p className="text-base font-black text-foreground">
                    {hasBodyFat ? `${progress.bodyFat.toFixed(1)}%` : "미설정"}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between gap-1 overflow-hidden">
                    <span className="flex-1 min-w-0 truncate">
                      {progress.targetBodyFat != null
                        ? `목표 ${progress.targetBodyFat.toFixed(1)}%`
                        : "목표 미설정"}
                    </span>
                    {hasBodyFat && bodyFatDelta !== 0 ? (
                      <span
                        className={`font-bold ${bodyFatDelta < 0 ? "text-blue-600" : "text-red-600"}`}
                      >
                        {bodyFatDelta < 0
                          ? `-${Math.abs(bodyFatDelta).toFixed(1)}%`
                          : `+${bodyFatDelta.toFixed(1)}%`}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">변화 없음</span>
                    )}
                  </p>
                </div>

                {/* 2행: 현재 체중 / BMI */}
                <div className="border border-border rounded-xl p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">현재 체중</p>
                  <p className="text-base font-black text-foreground">
                    {hasWeight ? `${progress.weight.toFixed(1)}kg` : "미설정"}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1 overflow-hidden">
                    <span className="flex-1 min-w-0 truncate">
                      {progress.targetWeight != null
                        ? `목표 ${progress.targetWeight.toFixed(1)}kg`
                        : "목표 미설정"}
                    </span>
                  </p>
                </div>
                <div className="border border-border rounded-xl p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">BMI</p>
                  <p className="text-base font-black text-foreground">{bmi ? bmi.toFixed(1) : "-"}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {bmi
                      ? bmi < 18.5
                        ? "저체중"
                        : bmi < 23
                          ? "정상 범위"
                          : bmi < 25
                            ? "과체중"
                            : "비만"
                      : "키 · 몸무게 기준"}
                  </p>
                </div>

                {/* 3행: 완료한 운동 / 포인트 */}
                <div className="border border-border rounded-xl p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">완료한 운동</p>
                  <p className="text-base font-black text-foreground">{progress.workoutsCompleted}회</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">누적 완료한 운동 횟수</p>
                </div>
                <div className="border border-border rounded-xl p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">포인트</p>
                  <p className="text-base font-black text-foreground">{progress.points.toLocaleString()}P</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">스토어에서 사용 가능</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border">
            <div className="flex items-center justify-around py-2">
              <Link
                href="/"
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                  activeTab === "home" ? "opacity-100" : "opacity-40"
                }`}
              >
                <Home className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-medium whitespace-nowrap">홈</span>
              </Link>
              <Link
                href="/diet"
                onClick={() => setActiveTab("diet")}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                  activeTab === "diet" ? "opacity-100" : "opacity-40"
                }`}
              >
                <Utensils className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-medium whitespace-nowrap">식단</span>
              </Link>
              <Link
                href="/workout"
                onClick={() => setActiveTab("workout")}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                  activeTab === "workout" ? "opacity-100" : "opacity-40"
                }`}
              >
                <Dumbbell className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-medium whitespace-nowrap">운동</span>
              </Link>
              <Link
                href="/schedule"
                onClick={() => setActiveTab("schedule")}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                  activeTab === "schedule" ? "opacity-100" : "opacity-40"
                }`}
              >
                <Calendar className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-medium whitespace-nowrap">일정</span>
              </Link>
              <Link
                href="/hall-of-fame"
                onClick={() => setActiveTab("hall-of-fame")}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                  activeTab === "hall-of-fame" ? "opacity-100" : "opacity-40"
                }`}
              >
                <Trophy className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-medium whitespace-nowrap">명예</span>
              </Link>
              <Link
                href="/store"
                onClick={() => setActiveTab("store")}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
                  activeTab === "store" ? "opacity-100" : "opacity-40"
                }`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-medium whitespace-nowrap">스토어</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
