"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { UserStore, type UserProgress, type AIWorkoutProgram } from "@/lib/user-store"

const MUSCLE_GROUPS = [
  { id: "chest", name: "가슴", icon: "💪" },
  { id: "back", name: "등", icon: "🔥" },
  { id: "shoulder", name: "어깨", icon: "⚡" },
  { id: "arms", name: "팔", icon: "💥" },
  { id: "legs", name: "하체", icon: "🦵" },
  { id: "core", name: "복근", icon: "✨" },
]

interface GeneratedExercise {
  name: string
  sets: number
  reps: number
  muscleGroup: string
  difficulty: string
}

interface GeneratedDay {
  day: string
  focus: string
  exercises: GeneratedExercise[]
}

export default function CoachingPage() {
  const [showModal, setShowModal] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [level, setLevel] = useState<string>("중급")
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedDay[] | null>(null)
  const [progress, setProgress] = useState<UserProgress>(UserStore.getDefaultProgress())

  useEffect(() => {
    setProgress(UserStore.loadProgress())
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowModal(false)
      setIsClosing(false)
      setDragStartY(0)
      setDragCurrentY(0)
      setIsDragging(false)
      window.history.back()
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
      handleClose()
    } else {
      setDragCurrentY(dragStartY)
    }
    setIsDragging(false)
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    handleClose()
  }

  const toggleMuscle = (muscleId: string) => {
    if (selectedMuscles.includes(muscleId)) {
      setSelectedMuscles(selectedMuscles.filter((m) => m !== muscleId))
    } else {
      setSelectedMuscles([...selectedMuscles, muscleId])
    }
  }

  const generateWorkout = async () => {
    if (selectedMuscles.length === 0) {
      alert("최소 1개 이상의 부위를 선택해주세요")
      return
    }

    setIsGenerating(true)
    try {
      const muscleNames = selectedMuscles.map((id) => MUSCLE_GROUPS.find((m) => m.id === id)?.name || id)

      const response = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusAreas: muscleNames,
          level,
          daysPerWeek,
        }),
      })

      const data = await response.json()
      setGeneratedProgram(data.program)
    } catch (error) {
      alert("운동 루틴 생성에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsGenerating(false)
    }
  }

  const saveProgram = () => {
    if (!generatedProgram) return

    const program: AIWorkoutProgram = {
      id: `program-${Date.now()}`,
      name: `${selectedMuscles.map((id) => MUSCLE_GROUPS.find((m) => m.id === id)?.name).join(", ")} 집중 프로그램`,
      createdAt: new Date().toISOString(),
      focusAreas: selectedMuscles.map((id) => MUSCLE_GROUPS.find((m) => m.id === id)?.name || id),
      level,
      daysPerWeek,
      days: generatedProgram,
    }

    const newProgress = UserStore.saveCustomProgram(progress, program)
    UserStore.saveProgress(newProgress)
    setProgress(newProgress)

    alert("운동 프로그램이 저장되었습니다! 이제 운동 페이지에서 사용할 수 있습니다.")
  }

  if (!showModal) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 flex items-end transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-card text-foreground w-full max-w-[430px] mx-auto rounded-t-2xl overflow-y-auto max-h-[90vh] pb-20 transition-transform duration-300 scrollbar-hide ${
            isClosing ? "translate-y-full" : "translate-y-0"
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: isClosing ? "none" : "slideUp 0.3s ease-out",
            transform: isDragging ? `translateY(${Math.max(0, dragCurrentY - dragStartY)}px)` : undefined,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
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
              <button onClick={handleClose} className="hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-black tracking-tight">AI 운동 코칭</h1>
            </div>
          </header>

          {!generatedProgram ? (
            <div className="px-5 space-y-4 mt-5">
              {/* AI Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-lg font-black">AI 맞춤 루틴 생성</h2>
                </div>
                <p className="text-sm opacity-90">
                  당신의 목표와 레벨에 맞는 최적의 운동 프로그램을 AI가 자동으로 생성해드립니다
                </p>
              </div>

              {/* Select Focus Areas */}
              <div>
                <h3 className="text-sm font-black mb-3 tracking-wide">강조할 부위 선택</h3>
                <div className="grid grid-cols-3 gap-2">
                  {MUSCLE_GROUPS.map((muscle) => (
                    <button
                      key={muscle.id}
                      onClick={() => toggleMuscle(muscle.id)}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        selectedMuscles.includes(muscle.id)
                          ? "border-black bg-black text-white"
                          : "border-border hover:border-foreground bg-background"
                      }`}
                    >
                      <div className="text-2xl mb-1">{muscle.icon}</div>
                      <div className="text-xs font-bold">{muscle.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Level */}
              <div>
                <h3 className="text-sm font-black mb-3 tracking-wide">운동 레벨</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["초급", "중급", "고급"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`py-3 px-4 border-2 rounded-xl text-sm font-bold transition-all ${
                        level === lvl
                          ? "border-black bg-black text-white"
                          : "border-border hover:border-foreground bg-background"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Days Per Week */}
              <div>
                <h3 className="text-sm font-black mb-3 tracking-wide">운동할 요일 선택</h3>
                <p className="text-xs text-muted-foreground mb-2">원하는 요일을 선택해주세요</p>
                <div className="flex gap-2 justify-between pb-4">
                  {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                    <button
                      key={day}
                      onClick={() => setDaysPerWeek(daysPerWeek === 5 ? 3 : 5)}
                      className={`flex-1 py-3 px-2 border-2 rounded-xl text-sm font-bold transition-all ${
                        daysPerWeek >= 5
                          ? "border-black bg-black text-white"
                          : "border-border hover:border-foreground bg-background"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">선택된 일수: {daysPerWeek}일</p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateWorkout}
                disabled={isGenerating || selectedMuscles.length === 0}
                className="w-full bg-black text-white py-4 px-6 rounded-xl text-base font-bold tracking-wide hover:bg-gray-800 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    루틴 생성하기
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    루틴 생성하기
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="px-5 space-y-4 mt-5">
              {/* Success Banner */}
              <div className="bg-green-50 dark:bg-emerald-900 border-2 border-green-600 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h2 className="text-sm font-black text-green-600">맞춤 루틴 생성 완료</h2>
                </div>
                <p className="text-xs text-green-700 dark:text-green-200">
                  {selectedMuscles.map((id) => MUSCLE_GROUPS.find((m) => m.id === id)?.name).join(", ")} 집중 프로그램
                </p>
              </div>

              {/* Generated Program */}
              <div className="space-y-3">
                {generatedProgram.map((day, idx) => (
                  <div key={idx} className="border-2 border-border rounded-xl overflow-hidden bg-card">
                    <div className="bg-muted px-4 py-3 border-b-2 border-border">
                      <h3 className="text-sm font-black">{day.day}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">목표: {day.focus}</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {day.exercises.map((exercise, exIdx) => (
                        <div key={exIdx} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.muscleGroup} • {exercise.difficulty}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black">
                              {exercise.sets} x {exercise.reps}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 pb-4">
                <button
                  onClick={saveProgram}
                  className="w-full bg-black text-white py-4 rounded-xl text-base font-bold tracking-wide hover:bg-gray-800 transition-colors"
                >
                  프로그램 저장하기
                </button>
                <button
                  onClick={() => setGeneratedProgram(null)}
                  className="w-full bg-background text-foreground py-4 rounded-xl text-sm font-bold border-2 border-border hover:bg-muted transition-colors"
                >
                  다시 생성하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card border-t border-border z-40">
        <div className="flex items-center justify-around h-14 px-4">
          <Link href="/" onClick={handleNavClick} className="flex flex-col items-center justify-center gap-0.5 flex-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-[10px]">홈</span>
          </Link>
          <Link
            href="/diet"
            onClick={handleNavClick}
            className="flex flex-col items-center justify-center gap-0.5 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-[10px]">식단</span>
          </Link>
          <Link
            href="/workout"
            onClick={handleNavClick}
            className="flex flex-col items-center justify-center gap-0.5 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[10px]">운동</span>
          </Link>
          <Link
            href="/schedule"
            onClick={handleNavClick}
            className="flex flex-col items-center justify-center gap-0.5 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 0v4m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px]">일정</span>
          </Link>
          <Link
            href="/hall-of-fame"
            onClick={handleNavClick}
            className="flex flex-col items-center justify-center gap-0.5 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <span className="text-[10px]">명예</span>
          </Link>
          <Link
            href="/store"
            onClick={handleNavClick}
            className="flex flex-col items-center justify-center gap-0.5 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-[10px]">스토어</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
