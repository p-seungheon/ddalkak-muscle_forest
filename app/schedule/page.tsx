"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  CalendarIcon,
  Sparkles,
  Home,
  Utensils,
  Dumbbell,
  ShoppingBag,
  CalendarDays as CalendarNav,
  Trophy,
  List,
  Grid3x3,
} from "lucide-react"
import Link from "next/link"
import { UserStore, type UserProgress } from "@/lib/user-store"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AICoachingModal } from "@/components/ai-coaching-modal"

type Tab = "home" | "diet" | "workout" | "schedule" | "hall-of-fame" | "store"

export default function SchedulePage() {
  const [progress, setProgress] = useState<UserProgress>(UserStore.getDefaultProgress())
  const [showManualWorkout, setShowManualWorkout] = useState(false)
  const [manualExercise, setManualExercise] = useState("")
  const [manualSets, setManualSets] = useState("3")
  const [manualReps, setManualReps] = useState("10")
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  const [showManualLogs, setShowManualLogs] = useState(false)
  const [logsDayKey, setLogsDayKey] = useState<string | null>(null)

  const [showAICoaching, setShowAICoaching] = useState(false)

  const [showAttendanceCalendar, setShowAttendanceCalendar] = useState(false)
  const [isCalendarClosing, setIsCalendarClosing] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const [activeTab, setActiveTab] = useState<Tab>("schedule")

  const [layoutMode, setLayoutMode] = useState<"list" | "grid">("list")

  useEffect(() => {
    setProgress(UserStore.loadProgress())
  }, [])

  const handleProgramSaved = (updatedProgress: UserProgress) => {
    // AI 코칭에서 새 프로그램을 저장하면 일정 탭의 진행상황/프로그램 정보도 즉시 갱신
    setProgress(updatedProgress)
  }

  const getDayKey = (dayIndex: number) => {
    // dayIndex: 0=월요일 ~ 6=일요일 (days 배열 인덱스와 동일)
    const today = new Date()
    const jsDay = today.getDay() // 0=일요일 ~ 6=토요일
    const monBasedToday = jsDay === 0 ? 6 : jsDay - 1 // 0=월요일 ~ 6=일요일

    // 이번 주 월요일 날짜를 기준으로 dayIndex만큼 더해서 해당 요일의 실제 날짜를 구한다.
    const monday = new Date(today)
    monday.setDate(today.getDate() - monBasedToday)
    monday.setHours(0, 0, 0, 0)

    const target = new Date(monday)
    target.setDate(monday.getDate() + dayIndex)

    return `${target.getFullYear()}-${target.getMonth()}-${target.getDate()}`
  }

  const addManualWorkout = () => {
    if (!manualExercise.trim()) return

    const dayKey = getDayKey(selectedDay)
    const currentCount = progress.manualWorkoutCounts?.[dayKey] ?? 0
    if (currentCount >= 5) {
      // 하루 최대 5개까지 기록 가능
      return
    }

    const updatedProgress = UserStore.addXP(progress, 50)
    // 최소 1개 이상 기록한 날은 completedDays 플래그를 켠다.
    updatedProgress.completedDays[dayKey] = true
    updatedProgress.workoutsCompleted += 1
    updatedProgress.points += 50

    const newCount = (updatedProgress.manualWorkoutCounts?.[dayKey] ?? 0) + 1
    updatedProgress.manualWorkoutCounts[dayKey] = newCount

    // 실제로 어떤 운동을 기록했는지도 로그로 남겨둔다.
    const sets = Number(manualSets) || 0
    const reps = Number(manualReps) || 0
    const logs = updatedProgress.manualWorkoutLogs ?? []
    updatedProgress.manualWorkoutLogs = [
      ...logs,
      {
        dateKey: dayKey,
        exercise: manualExercise.trim(),
        sets,
        reps,
      },
    ]

    // dayKey는 "YYYY-M-D" 형태이며, 여기서 실제 날짜 객체를 만들어
    // 해당 날짜를 운동 완료일로 기록(streak 계산에 포함)한다.
    const [yearStr, monthIndexStr, dayStr] = dayKey.split("-")
    const year = Number(yearStr)
    const monthIndex = Number(monthIndexStr)
    const day = Number(dayStr)
    const workoutDate = new Date(year, monthIndex, day)

    const withWorkoutDay = UserStore.registerWorkoutDay(updatedProgress, workoutDate)

    UserStore.saveProgress(withWorkoutDay)
    setProgress(withWorkoutDay)
    setShowManualWorkout(false)
    setManualExercise("")
    setManualSets("3")
    setManualReps("10")
  }

  const markAttendance = (date: Date) => {
    const updatedProgress = UserStore.markAttendance(progress, date)
    UserStore.saveProgress(updatedProgress)
    setProgress(updatedProgress)
  }

  const activeProgram = UserStore.getActiveProgram(progress)
  const programName = activeProgram ? activeProgram.name : "기본 프로그램"
  const programLevelText = activeProgram ? activeProgram.level || activeProgram.difficulty || "중급" : "해당없음"
  const programDaysText = activeProgram ? `${activeProgram.daysPerWeek}일` : "해당없음"
  const days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
  const today = (() => {
    const day = new Date().getDay()
    // Convert Sunday (0) to 6, and shift others down by 1
    return day === 0 ? 6 : day - 1
  })()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: Tab) => {
    if (showManualWorkout) {
      e.preventDefault()
      setShowManualWorkout(false)
    } else if (showAICoaching) {
      e.preventDefault()
      setShowAICoaching(false)
    } else {
      setActiveTab(tab)
    }
  }

  const handleCloseCalendar = () => {
    setIsCalendarClosing(true)
    setTimeout(() => {
      setShowAttendanceCalendar(false)
      setIsCalendarClosing(false)
      setDragStartY(0)
      setDragCurrentY(0)
      setIsDragging(false)
    }, 300)
  }

  const handleDragStart = (clientY: number) => {
    setDragStartY(clientY)
    setDragCurrentY(clientY)
    setIsDragging(true)
  }

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return
    const deltaY = clientY - dragStartY
    if (deltaY > 0) {
      setDragCurrentY(clientY)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    const deltaY = dragCurrentY - dragStartY
    if (deltaY > 100) {
      handleCloseCalendar()
    } else {
      setDragCurrentY(dragStartY)
    }
    setIsDragging(false)
  }

  return (
    <div className="min-h-screen bg-background pb-20 hide-scrollbar">
      <div className="mx-auto max-w-[430px]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="hover:opacity-70 transition-opacity">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <h1 className="text-lg font-black tracking-tight">운동 일정</h1>
            </div>
            <button
              onClick={() => setShowAICoaching(true)}
              className="flex items-center gap-1 text-xs font-bold hover:opacity-70 transition-opacity bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded"
            >
              <Sparkles className="w-4 h-4" />
              AI 코칭
            </button>
          </div>
        </header>

        {/* Attendance Calendar Button */}
        <div className="p-5 border-b border-border">
          <button
            onClick={() => setShowAttendanceCalendar(true)}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-sm font-bold tracking-wide hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-5 h-5" />
            출석 캘린더
          </button>
        </div>

        {/* Calendar View */}
        <div className="p-5">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <h2 className="text-sm font-black">이번 주</h2>
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setLayoutMode("grid")}
                  className={`p-2 rounded transition-all ${
                    layoutMode === "grid" ? "bg-background shadow-sm" : "hover:bg-muted/80"
                  }`}
                  aria-label="그리드 뷰"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode("list")}
                  className={`p-2 rounded transition-all ${
                    layoutMode === "list" ? "bg-background shadow-sm" : "hover:bg-muted/80"
                  }`}
                  aria-label="리스트 뷰"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 p-4 bg-muted rounded-xl">
              <h3 className="text-sm font-black mb-1.5">현재 프로그램</h3>
              <p className="text-sm text-foreground mb-3">{programName}</p>
              <div className="mt-1 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">난이도</span>
                  <span className="mx-0.5">:</span>
                  <span>{programLevelText}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">운동 일수</span>
                  <span className="mx-0.5">:</span>
                  <span>{programDaysText}</span>
                </div>
              </div>
            </div>
          </div>

          {layoutMode === "list" ? (
            <div className="space-y-3">
              {days.map((day, idx) => {
                const adjustedIdx = idx
                const dayKey = getDayKey(adjustedIdx)
                const isCompleted = progress.completedDays[dayKey] || false
                const isToday = adjustedIdx === today
                const dayInfo = activeProgram?.days.find((d) => d.day === day)
                const isFuture = adjustedIdx > today
                const manualCount = progress.manualWorkoutCounts?.[dayKey] ?? 0
                const hasManualLogs =
                  (progress.manualWorkoutLogs?.some((log) => log.dateKey === dayKey) ?? false) && !isFuture

                return (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-4 ${
                      isToday ? "border-black bg-background" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <div className="w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        ) : (
						  <div className="w-6 h-6 bg-zinc-100 dark:bg-zinc-700 rounded flex-shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black">{day}</p>
                          </div>
                          {dayInfo && <p className="text-xs text-muted-foreground mt-1 font-medium">{dayInfo.focus}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0">
                        {isFuture ? (
                          <span className="text-xs font-bold text-muted-foreground">수기 기록하기</span>
                        ) : manualCount >= 5 ? (
                          <span className="text-xs font-bold text-muted-foreground">수기 기록 불가</span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDay(adjustedIdx)
                              setShowManualWorkout(true)
                            }}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            {manualCount > 0 || isCompleted
                              ? `수기 추가 기록 (${manualCount}/5)`
                              : "수기 기록하기"}
                          </button>
                        )}
                        {hasManualLogs && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogsDayKey(dayKey)
                              setShowManualLogs(true)
                            }}
                            className="text-[11px] text-muted-foreground underline underline-offset-2"
                          >
                            수기 기록 보기
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {days.map((day, idx) => {
                const adjustedIdx = idx
                const dayKey = getDayKey(adjustedIdx)
                const isCompleted = progress.completedDays[dayKey] || false
                const isToday = adjustedIdx === today
                const dayInfo = activeProgram?.days.find((d) => d.day === day)
                const isFuture = adjustedIdx > today
                const manualCount = progress.manualWorkoutCounts?.[dayKey] ?? 0
                const hasManualLogs =
                  (progress.manualWorkoutLogs?.some((log) => log.dateKey === dayKey) ?? false) && !isFuture

                return (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-3 flex flex-col h-full min-h-[140px] ${
                      isToday ? "border-black bg-background" : "border-border bg-background"
                    }`}
                  >
                    {/* Top section: completion indicator */}
                    <div className="flex justify-center mb-2">
                      {isCompleted ? (
                        <div className="w-8 h-8 bg-green-600 text-white rounded-md flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : (
						<div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-md" />
                      )}
                    </div>

                    {/* Middle section: day and focus - takes up remaining space */}
                    <div className="flex-1 flex flex-col items-center text-center">
                      <p className="text-xs font-black mb-1">{day}</p>
                      {dayInfo && (
                        <p className="text-[10px] text-muted-foreground font-medium line-clamp-2">{dayInfo.focus}</p>
                      )}
                    </div>

                    {/* Bottom section: button - always at bottom */}
                    <div className="flex flex-col items-center gap-0">
                      {isFuture ? (
                        <span className="text-[10px] font-bold text-muted-foreground">수기 기록하기</span>
                      ) : manualCount >= 5 ? (
                        <span className="text-[10px] font-bold text-muted-foreground">수기 기록 불가</span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedDay(adjustedIdx)
                            setShowManualWorkout(true)
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          {manualCount > 0 || isCompleted
                            ? `수기 추가 기록 (${manualCount}/5)`
                            : "수기 기록하기"}
                        </button>
                      )}
                      {hasManualLogs && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogsDayKey(dayKey)
                            setShowManualLogs(true)
                          }}
                          className="text-[9px] text-muted-foreground underline underline-offset-2"
                        >
                          수기 기록 보기
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Program Info moved to header area above */}
        </div>
      </div>

      {showAttendanceCalendar && (
        <div
          className={`fixed inset-0 bg-black/50 z-50 flex items-end transition-opacity duration-300 ${
            isCalendarClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleCloseCalendar}
        >
          <div
            className={`bg-card w-full max-w-[430px] mx-auto rounded-t-2xl overflow-y-auto max-h-[90vh] pb-20 transition-transform duration-300 scrollbar-hide ${
              isCalendarClosing ? "translate-y-full" : "translate-y-0"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: isCalendarClosing ? "none" : "slideUp 0.3s ease-out",
              transform: isDragging ? `translateY(${Math.max(0, dragCurrentY - dragStartY)}px)` : undefined,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
          >
            {/* Header with Drag Handle */}
            <header
              className="relative z-10 bg-card border-b border-border cursor-grab active:cursor-grabbing"
              onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
              onMouseDown={(e) => {
                handleDragStart(e.clientY)
              }}
              onMouseMove={(e) => {
                if (e.buttons === 1) handleDragMove(e.clientY)
              }}
              onMouseUp={handleDragEnd}
              onMouseLeave={() => {
                if (isDragging) handleDragEnd()
              }}
            >
              {/* Drag indicator */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>
              <div className="flex items-center gap-4 px-5 py-4">
                <button onClick={handleCloseCalendar} className="hover:opacity-70 transition-opacity">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-black tracking-tight">출석 캘린더</h1>
              </div>
            </header>

            <div className="px-5 space-y-4 mt-5">
              {/* Streak Info */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm opacity-90 mb-1">연속 출석</p>
                    <p className="text-5xl font-black">{progress.attendanceStreak}일</p>
                  </div>
                  <div className="text-7xl">🔥</div>
                </div>
                <p className="text-sm opacity-90 mt-4">총 {progress.attendanceDates.length}일 출석했습니다</p>
              </div>

              {/* Attendance Button */}
              <button
                onClick={() => {
                  const today = new Date()
                  markAttendance(today)
                }}
                disabled={UserStore.isAttendanceMarked(progress, new Date())}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl text-base font-bold tracking-wide hover:bg-green-700 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {UserStore.isAttendanceMarked(progress, new Date()) ? (
                  <>
                    <span className="text-lg">✓</span>
                    오늘 출석 완료
                  </>
                ) : (
                  "오늘 출석하기"
                )}
              </button>

              {/* Calendar */}
              <div className="bg-card dark:bg-[#292929] border-2 border-border rounded-xl p-4">
                <Calendar
                  mode="single"
                  selected={undefined}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  modifiers={{
                    attended: (date) => UserStore.isAttendanceMarked(progress, date),
                  }}
                  modifiersClassNames={{
                    attended: "bg-green-600 text-white hover:bg-green-700 font-bold rounded-md",
                  }}
                  className="mx-auto"
                />
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 text-sm pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded-md" />
                  <span className="text-muted-foreground">출석한 날</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-background border border-border rounded-md" />
                  <span className="text-muted-foreground">출석 안 한 날</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AICoachingModal
        isOpen={showAICoaching}
        onClose={() => setShowAICoaching(false)}
        onProgramSaved={handleProgramSaved}
      />

      {/* Manual Workout Modal */}
      <Dialog open={showManualWorkout} onOpenChange={setShowManualWorkout}>
        <DialogContent className="max-w-[400px] w-[calc(100%-3rem)] mx-auto p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-lg font-black">운동 기록</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="mb-4 p-3 bg-muted rounded">
              <p className="text-xs text-muted-foreground">선택한 날짜</p>
              <p className="text-sm font-bold">{days[selectedDay]}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block">운동 이름</label>
                <input
                  type="text"
                  value={manualExercise}
                  onChange={(e) => setManualExercise(e.target.value)}
                  placeholder="예: 벤치프레스, 스쿼트..."
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:border-foreground outline-none bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">세트 수</label>
                  <input
                    type="number"
                    value={manualSets}
                    onChange={(e) => setManualSets(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:border-foreground outline-none bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">반복 횟수</label>
                  <input
                    type="number"
                    value={manualReps}
                    onChange={(e) => setManualReps(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:border-foreground outline-none bg-background"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowManualWorkout(false)}
                  className="flex-1 py-3 border border-border rounded-lg text-sm font-bold hover:bg-muted transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={addManualWorkout}
                  className="flex-1 py-3 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors"
                >
                  기록 완료
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Logs View Modal */}
      <Dialog open={showManualLogs} onOpenChange={setShowManualLogs}>
        <DialogContent className="max-w-[400px] w-[calc(100%-3rem)] mx-auto p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-lg font-black">수기로 기록한 운동</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            {logsDayKey && (
              <>
                <div className="mb-3 p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">선택한 날짜</p>
                  <p className="text-sm font-bold">
                    {(() => {
                      const parts = logsDayKey.split("-")
                      if (parts.length !== 3) return logsDayKey
                      const year = Number(parts[0])
                      const monthIndex = Number(parts[1]) // 0-based month index 저장됨
                      const day = Number(parts[2])
                      const date = new Date(year, monthIndex, day)
                      const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
                      const weekday = weekdays[date.getDay()] ?? ""
                      const displayMonth = monthIndex + 1
                      return `${year}.${String(displayMonth).padStart(2, "0")}.${String(day).padStart(2, "0")} (${weekday})`
                    })()}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded border border-border max-h-64 overflow-y-auto">
                  {(() => {
                    const logsForDay =
                      progress.manualWorkoutLogs?.filter((log) => log.dateKey === logsDayKey) ?? []
                    if (logsForDay.length === 0) {
                      return <p className="text-xs text-muted-foreground">수기로 기록한 운동이 없습니다.</p>
                    }
                    return (
                      <>
                        <p className="text-[11px] text-muted-foreground mb-2">총 {logsForDay.length}개 수기 기록</p>
                        <ul className="space-y-1">
                          {logsForDay.map((log, idx) => (
                            <li key={idx} className="flex items-center justify-between text-xs text-foreground">
                              <span className="font-semibold">
                                {idx + 1}. {log.exercise}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {log.sets}세트 · {log.reps}회
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )
                  })()}
                </div>
              </>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManualLogs(false)}
                className="px-4 py-2 text-xs font-bold text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-card border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "home" ? "opacity-100" : "opacity-40"
            }`}
            onClick={(e) => handleNavClick(e, "home")}
          >
            <Home className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">홈</span>
          </Link>
          <Link
            href="/diet"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "diet" ? "opacity-100" : "opacity-40"
            }`}
            onClick={(e) => handleNavClick(e, "diet")}
          >
            <Utensils className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">식단</span>
          </Link>
          <Link
            href="/workout"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "workout" ? "opacity-100" : "opacity-40"
            }`}
            onClick={(e) => handleNavClick(e, "workout")}
          >
            <Dumbbell className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">운동</span>
          </Link>
          <Link
            href="/schedule"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "schedule" ? "opacity-100" : "opacity-40"
            }`}
            onClick={(e) => handleNavClick(e, "schedule")}
          >
            <CalendarNav className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">일정</span>
          </Link>
          <Link
            href="/hall-of-fame"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "hall-of-fame" ? "opacity-100" : "opacity-40"
            }`}
            onClick={(e) => handleNavClick(e, "hall-of-fame")}
          >
            <Trophy className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">명예</span>
          </Link>
          <Link
            href="/store"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "store" ? "opacity-100" : "opacity-40"
            }`}
            onClick={(e) => handleNavClick(e, "store")}
          >
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">스토어</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
