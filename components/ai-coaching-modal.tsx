"use client"
import { useEffect, useState } from "react"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { UserStore, type UserProgress, type AIWorkoutProgram } from "@/lib/user-store"

const MUSCLE_GROUPS = [
  { id: "chest", name: "가슴", icon: "💪" },
  { id: "back", name: "등", icon: "🔥" },
  { id: "shoulder", name: "어깨", icon: "⚡" },
  { id: "arms", name: "팔", icon: "💥" },
  { id: "legs", name: "하체", icon: "🦵" },
  { id: "core", name: "복근", icon: "✨" },
]

const WEEKDAYS = [
  { id: "mon", name: "월", fullName: "월요일" },
  { id: "tue", name: "화", fullName: "화요일" },
  { id: "wed", name: "수", fullName: "수요일" },
  { id: "thu", name: "목", fullName: "목요일" },
  { id: "fri", name: "금", fullName: "금요일" },
  { id: "sat", name: "토", fullName: "토요일" },
  { id: "sun", name: "일", fullName: "일요일" },
]

interface AICoachingModalProps {
  isOpen: boolean
  onClose: () => void
  // 새 AI 프로그램이 저장되었을 때 상위 컴포넌트에 알리기 위한 콜백 (선택 사항)
  onProgramSaved?: (progress: UserProgress) => void
}

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

export function AICoachingModal({ isOpen, onClose, onProgramSaved }: AICoachingModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [level, setLevel] = useState<string>("중급")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedDay[] | null>(null)
  const [progress, setProgress] = useState<UserProgress>(UserStore.getDefaultProgress())

  useEffect(() => {
    if (typeof window === "undefined") return
    setProgress(UserStore.loadProgress())
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setDragStartY(0)
      setDragCurrentY(0)
      setIsDragging(false)
      setGeneratedProgram(null)
      setSelectedMuscles([])
      setSelectedDays([])
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

  const toggleMuscle = (muscleId: string) => {
    if (selectedMuscles.includes(muscleId)) {
      setSelectedMuscles(selectedMuscles.filter((m) => m !== muscleId))
    } else {
      setSelectedMuscles([...selectedMuscles, muscleId])
    }
  }

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId))
    } else {
      setSelectedDays([...selectedDays, dayId])
    }
  }

  const isFormValid = selectedMuscles.length > 0 && selectedDays.length > 0

  const generateWorkout = async () => {
    if (selectedMuscles.length === 0) {
      alert("최소 1개 이상의 부위를 선택해주세요")
      return
    }
    if (selectedDays.length === 0) {
      alert("최소 1개 이상의 요일을 선택해주세요")
      return
    }

    setIsGenerating(true)
    try {
      const muscleNames = selectedMuscles.map((id) => MUSCLE_GROUPS.find((m) => m.id === id)?.name || id)

      // 요일 버튼(id)을 generate-workout API에서 기대하는 0~6 인덱스로 변환
      const weekdayIndexMap: Record<string, number> = {
        sun: 0,
        mon: 1,
        tue: 2,
        wed: 3,
        thu: 4,
        fri: 5,
        sat: 6,
      }

      const selectedWeekdays = selectedDays
        .map((id) => weekdayIndexMap[id])
        .filter((idx): idx is number => typeof idx === "number")

      const response = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusAreas: muscleNames,
          level,
          selectedWeekdays,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate workout: ${response.status}`)
      }

      const data = await response.json()

      // 생성된 프로그램을 요일 순(월→일)으로 정렬
      const dayOrder: Record<string, number> = {
        월요일: 0,
        화요일: 1,
        수요일: 2,
        목요일: 3,
        금요일: 4,
        토요일: 5,
        일요일: 6,
      }

      const sortedProgram = Array.isArray(data.program)
        ? [...data.program].sort((a: { day: string }, b: { day: string }) => {
            const aIdx = dayOrder[a.day as keyof typeof dayOrder] ?? 99
            const bIdx = dayOrder[b.day as keyof typeof dayOrder] ?? 99
            return aIdx - bIdx
          })
        : data.program

      setGeneratedProgram(sortedProgram)
    } catch (error) {
      alert("운동 루틴 생성에 실패했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsGenerating(false)
    }
  }

  const saveProgram = () => {
    if (!generatedProgram || generatedProgram.length === 0) return

    const program: AIWorkoutProgram = {
      id: `program-${Date.now()}`,
      name: `${selectedMuscles.map((id) => MUSCLE_GROUPS.find((m) => m.id === id)?.name).join(", ")} 집중 프로그램`,
      createdAt: new Date().toISOString(),
      focusAreas: selectedMuscles.map((id) => MUSCLE_GROUPS.find((m) => m.id === id)?.name || id),
      level,
      daysPerWeek: selectedDays.length || generatedProgram.length,
      days: generatedProgram,
    }

    const newProgress = UserStore.saveCustomProgram(progress, program)
    UserStore.saveProgress(newProgress)
    setProgress(newProgress)

    // 상위에서 진행상황/프로그램 정보를 즉시 반영할 수 있도록 콜백 호출
    if (onProgramSaved) {
      onProgramSaved(newProgress)
    }

    alert("운동 프로그램이 저장되었습니다! 이제 운동 페이지에서 사용할 수 있습니다.")
    handleClose()
  }

  if (!isOpen) return null

  return (
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
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleDragMove(e.clientY)
          }}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => {
            if (isDragging) handleDragEnd()
          }}
        >
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
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-lg font-black">AI 맞춤 루틴 생성</h2>
              </div>
              <p className="text-sm opacity-90">
                당신의 목표와 레벨에 맞는 최적의 운동 프로그램을 AI가 자동으로 생성해드립니다
              </p>
            </div>

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

            <div>
              <h3 className="text-sm font-black mb-3 tracking-wide">운동할 요일 선택</h3>
              <p className="text-xs text-muted-foreground mb-3">원하는 요일을 선택해주세요</p>
              <div className="flex gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`flex-1 py-3 border-2 rounded-xl text-sm font-bold transition-all ${
                      selectedDays.includes(day.id)
                        ? "border-black bg-black text-white"
                        : "border-border hover:border-foreground bg-background"
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateWorkout}
              disabled={isGenerating || !isFormValid}
              className={`w-full py-4 px-6 rounded-xl text-base font-bold tracking-wide transition-colors flex items-center justify-center gap-2 ${
                isFormValid && !isGenerating
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  루틴 생성중...
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
            <div className="bg-green-50 dark:bg-emerald-900 border-2 border-green-600 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-green-600" />
                <h2 className="text-sm font-black text-green-600">맞춤 루틴 생성 완료</h2>
              </div>
              <p className="text-xs text-green-700 dark:text-green-200">
                {selectedMuscles.map((id) => MUSCLE_GROUPS.find((m) => m.id === id)?.name).join(", ")} 집중 프로그램
              </p>
            </div>

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
  )
}
