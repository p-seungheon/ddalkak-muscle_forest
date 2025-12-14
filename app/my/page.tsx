"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Trophy,
  Flame,
  Dumbbell,
  TrendingUp,
  Ruler,
  Weight,
  Activity,
  Award,
  Zap,
  Home,
  Utensils,
  Dumbbell as DumbbellNav,
  ShoppingBag,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { UserStore, type UserProgress } from "@/lib/user-store"
import { useTheme } from "next-themes"

type Tab = "home" | "diet" | "workout" | "schedule" | "hall-of-fame" | "store"

export default function MyPage() {
  const [progress, setProgress] = useState<UserProgress>(UserStore.getDefaultProgress())
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [editMuscleMass, setEditMuscleMass] = useState("")
  const [editBodyFat, setEditBodyFat] = useState("")
  const [editHeight, setEditHeight] = useState("")
  const [editWeight, setEditWeight] = useState("")
  const [editTargetWeight, setEditTargetWeight] = useState("")
  const [editTargetMuscle, setEditTargetMuscle] = useState("")
  const [editTargetBodyFat, setEditTargetBodyFat] = useState("")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProgress(UserStore.loadProgress())
    setMounted(true)
  }, [])

  const resetProgress = () => {
    if (!confirm("정말 진행상황을 완전히 초기화하고 처음부터 다시 시작할까요?")) return

    if (typeof window !== "undefined") {
      try {
        // 현재 도메인에 저장된 모든 앱 상태(HP, 채팅 기록, 포인트 등)를 제거
        window.localStorage.clear()
        if (window.sessionStorage) {
          window.sessionStorage.clear()
        }
      } catch {
        // 일부 환경에서 스토리지 접근이 막혀도 앱이 죽지 않도록 방어
      }

      // 홈으로 바로 가지 않고, 최초 진입 플로우인 /main부터 다시 시작
      window.location.href = "/main"
    }
  }

  const startEditing = () => {
    setEditMuscleMass(progress.muscleMass.toFixed(1))
    setEditBodyFat(progress.bodyFat.toFixed(1))
    setEditHeight(progress.height.toString())
    setEditWeight(progress.weight.toFixed(1))
    setEditTargetWeight(progress.targetWeight != null ? progress.targetWeight.toFixed(1) : "")
    setEditTargetMuscle(progress.targetMuscleMass != null ? progress.targetMuscleMass.toFixed(1) : "")
    setEditTargetBodyFat(progress.targetBodyFat != null ? progress.targetBodyFat.toFixed(1) : "")
    setIsEditing(true)
  }

  const saveBodyStats = () => {
    const muscleMass = Number.parseFloat(editMuscleMass)
    const bodyFat = Number.parseFloat(editBodyFat)
    const height = Number.parseFloat(editHeight)
    const weight = Number.parseFloat(editWeight)

    if (isNaN(muscleMass) || isNaN(bodyFat) || isNaN(height) || isNaN(weight)) {
      alert("올바른 숫자를 입력해주세요")
      return
    }

    if (muscleMass < 0 || muscleMass > 100 || bodyFat < 0 || bodyFat > 100) {
      alert("올바른 범위의 값을 입력해주세요 (골격근량, 체지방률: 0-100)")
      return
    }

    if (height < 100 || height > 250) {
      alert("키는 100~250cm 범위로 입력해주세요")
      return
    }

    if (weight < 30 || weight > 200) {
      alert("몸무게는 30~200kg 범위로 입력해주세요")
      return
    }

    const trimmedTargetWeight = editTargetWeight.trim()
    const trimmedTargetMuscle = editTargetMuscle.trim()
    const trimmedTargetBodyFat = editTargetBodyFat.trim()

    const tWeight = trimmedTargetWeight ? Number.parseFloat(trimmedTargetWeight) : null
    const tMuscle = trimmedTargetMuscle ? Number.parseFloat(trimmedTargetMuscle) : null
    const tBodyFat = trimmedTargetBodyFat ? Number.parseFloat(trimmedTargetBodyFat) : null

    if (tWeight !== null && (tWeight < 30 || tWeight > 200)) {
      alert("목표 체중은 30~200kg 범위로 입력해주세요")
      return
    }

    if (tMuscle !== null && (tMuscle < 0 || tMuscle > 100)) {
      alert("목표 골격근량은 0-100kg 범위로 입력해주세요")
      return
    }

    if (tBodyFat !== null && (tBodyFat < 0 || tBodyFat > 100)) {
      alert("목표 체지방률은 0-100% 범위로 입력해주세요")
      return
    }

    const baseUpdated = UserStore.updateBodyStats(progress, muscleMass, bodyFat, height, weight)
    const newProgress: UserProgress = {
      ...baseUpdated,
      // 목표 인풋을 비워두면 이전 값을 유지하지 않고 미설정(null)로 저장
      targetWeight: tWeight,
      targetMuscleMass: tMuscle,
      targetBodyFat: tBodyFat,
    }

    UserStore.saveProgress(newProgress)
    setProgress(newProgress)
    setIsEditing(false)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const bmiRaw = UserStore.calculateBMI(progress)
  const hasBMI = Number.isFinite(bmiRaw) && bmiRaw > 0
  const bmiValue = hasBMI ? bmiRaw.toFixed(1) : "-"
  const bmiLabel = hasBMI
    ? bmiRaw < 18.5
      ? "저체중"
      : bmiRaw < 23
        ? "정상"
        : bmiRaw < 25
          ? "과체중"
          : "비만"
    : "키 · 몸무게 기준"

  const currentTheme = theme ?? "system"

  return (
    <div className="min-h-screen bg-background pb-24 scrollbar-hide">
      <div className="mx-auto max-w-[430px]">
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="flex items-center gap-4 px-5 py-4">
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-black tracking-tight">MY</h1>
          </div>
        </header>

        <div className="p-5 space-y-4">
          {/* 나의 정보 요약 */}
          <div className="border-2 border-border rounded-2xl p-5 bg-card space-y-3">
            {/* 레벨 */}
            <div className="border border-border rounded-xl p-3 mb-1 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">레벨</p>
                <p className="text-base font-black text-foreground">Lv.{progress.level}</p>
              </div>
              <Award className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* 2열 그리드 */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* 현재 경험치 / 총 경험치 */}
              <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">현재 경험치</p>
                  <p className="text-base font-black text-foreground">
                    {progress.currentXP.toLocaleString()}XP
                  </p>
                </div>
                <Zap className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">총 경험치</p>
                  <p className="text-base font-black text-foreground">
                    {progress.totalXP.toLocaleString()}XP
                  </p>
                </div>
                <Zap className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* 완료한 운동 / 연속 출석 */}
              <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">완료한 운동</p>
                  <p className="text-base font-black text-foreground">{progress.workoutsCompleted}회</p>
                </div>
                <Trophy className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">연속 출석</p>
                  <p className="text-base font-black text-foreground">{progress.attendanceStreak}일</p>
                </div>
                <Flame className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* 키 / 몸무게 */}
              <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">키</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      className="w-full text-sm font-semibold border-b border-black focus:outline-none bg-transparent"
                      placeholder="cm"
                    />
                  ) : (
                    <p className="text-base font-black text-foreground">{progress.height}cm</p>
                  )}
                </div>
                <Ruler className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              </div>
              <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">체중</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-full text-sm font-semibold border-b border-black focus:outline-none bg-transparent"
                      placeholder="kg"
                    />
                  ) : (
                    <p className="text-base font-black text-foreground">{progress.weight.toFixed(1)}kg</p>
                  )}
                </div>
                <Weight className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              </div>

              {/* 골격근량 / 체지방률 */}
              <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">골격근량</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editMuscleMass}
                      onChange={(e) => setEditMuscleMass(e.target.value)}
                      className="w-full text-sm font-semibold border-b border-black focus:outline-none bg-transparent"
                      placeholder="kg"
                    />
                  ) : (
                    <p className="text-base font-black text-foreground">{progress.muscleMass.toFixed(1)}kg</p>
                  )}
                </div>
                <Dumbbell className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              </div>
              <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">체지방률</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editBodyFat}
                      onChange={(e) => setEditBodyFat(e.target.value)}
                      className="w-full text-sm font-semibold border-b border-black focus:outline-none bg-transparent"
                      placeholder="%"
                    />
                  ) : (
                    <p className="text-base font-black text-foreground">{progress.bodyFat.toFixed(1)}%</p>
                  )}
                </div>
                <TrendingUp className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              </div>

              {/* 목표 체중 / 목표 골격근량 */}
              <div className="border border-border rounded-xl p-3 flex items-center justify-between overflow-hidden">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">목표 체중</p>
                  {isEditing ? (
                    <div className="flex items-baseline gap-1 min-w-0">
                      <input
                        type="number"
                        step="0.1"
                        value={editTargetWeight}
                        onChange={(e) => setEditTargetWeight(e.target.value)}
                        className="flex-1 min-w-0 text-sm font-semibold border-b border-black focus:outline-none bg-transparent text-left"
                        placeholder="예: 65"
                      />
                    </div>
                  ) : (
                    <p className="text-base font-black text-foreground">
                      {progress.targetWeight != null ? `${progress.targetWeight.toFixed(1)}kg` : "미설정"}
                    </p>
                  )}
                </div>
                <Weight className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              </div>
              <div className="border border-border rounded-xl p-3 flex items-center justify-between overflow-hidden">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">목표 골격근량</p>
                  {isEditing ? (
                    <div className="flex items-baseline gap-1 min-w-0">
                      <input
                        type="number"
                        step="0.1"
                        value={editTargetMuscle}
                        onChange={(e) => setEditTargetMuscle(e.target.value)}
                        className="flex-1 min-w-0 text-sm font-semibold border-b border-black focus:outline-none bg-transparent text-left"
                        placeholder="예: 30"
                      />
                    </div>
                  ) : (
                    <p className="text-base font-black text-foreground">
                      {progress.targetMuscleMass != null
                        ? `${progress.targetMuscleMass.toFixed(1)}kg`
                        : "미설정"}
                    </p>
                  )}
                </div>
                <Dumbbell className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              </div>

              {/* 목표 체지방률 / BMI */}
              <div className="border border-border rounded-xl p-3 flex items-center justify-between overflow-hidden">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">목표 체지방률</p>
                  {isEditing ? (
                    <div className="flex items-baseline gap-1 min-w-0">
                      <input
                        type="number"
                        step="0.1"
                        value={editTargetBodyFat}
                        onChange={(e) => setEditTargetBodyFat(e.target.value)}
                        className="flex-1 min-w-0 text-sm font-semibold border-b border-black focus:outline-none bg-transparent text-left"
                        placeholder="예: 18"
                      />
                    </div>
                  ) : (
                    <p className="text-base font-black text-foreground">
                      {progress.targetBodyFat != null ? `${progress.targetBodyFat.toFixed(1)}%` : "미설정"}
                    </p>
                  )}
                </div>
                <TrendingUp className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
              </div>
              <div className="border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-muted-foreground">BMI</span>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-base font-black text-foreground">{bmiValue}</p>
                  <p className="text-[11px] text-muted-foreground">{bmiLabel}</p>
                </div>
              </div>

              {/* 포인트 (2열 전체 사용) */}
              <div className="border border-border rounded-xl p-3 col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">포인트</p>
                  <p className="text-base font-black text-foreground">{progress.points.toLocaleString()}P</p>
                </div>
                <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* 화면 모드 */}
          <div className="border border-border rounded-2xl p-5 bg-card">
            <p className="text-xs font-bold tracking-wider text-muted-foreground mb-2">
              화면 모드 <span className="text-[10px] text-muted-foreground">(시스템 · 라이트 · 다크)</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex-1 py-2 text-xs font-bold rounded-full border transition-colors ${
                  mounted && currentTheme === "system"
                    ? "bg-black text-white border-black"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                시스템
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex-1 py-2 text-xs font-bold rounded-full border transition-colors ${
                  mounted && currentTheme === "light"
                    ? "bg-black text-white border-black"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                라이트
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex-1 py-2 text-xs font-bold rounded-full border transition-colors ${
                  mounted && currentTheme === "dark"
                    ? "bg-black text-white border-black"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                다크
              </button>
            </div>
          </div>

          {/* 저장 / 취소 버튼 */}
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={saveBodyStats}
                className="flex-1 bg-black text-white py-3 text-sm font-bold hover:bg-gray-800 transition-colors rounded-xl"
              >
                저장
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 bg-gray-300 text-black py-3 text-sm font-bold hover:bg-gray-400 transition-colors rounded-xl"
              >
                취소
              </button>
            </div>
          )}

          {/* 내 정보 수정하기 */}
          {!isEditing && (
            <button
              onClick={startEditing}
              className="w-full bg-gray-900 text-white py-3 text-sm font-bold hover:bg-black transition-colors rounded-xl"
            >
              내 정보 수정하기
            </button>
          )}

          {/* 내 정보 초기화 */}
          <button
            onClick={resetProgress}
            className="w-full bg-red-600 text-white py-3 text-sm font-bold hover:bg-red-700 transition-colors rounded-xl"
          >
            내 정보 초기화
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-card border-t border-border z-50">
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
            <DumbbellNav className="w-5 h-5 stroke-[2]" />
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
  )
}
