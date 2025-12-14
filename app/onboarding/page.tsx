"use client"

import { useEffect, useState } from "react"
import { ChevronRight, Ruler, Weight, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserStore, type UserProgress } from "@/lib/user-store"

export default function OnboardingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [height, setHeight] = useState("170")
  const [weight, setWeight] = useState("70")
  const [muscle, setMuscle] = useState("25.0")
  const [bodyFat, setBodyFat] = useState("22.0")
  const [targetWeight, setTargetWeight] = useState("")
  const [targetMuscle, setTargetMuscle] = useState("")
  const [targetBodyFat, setTargetBodyFat] = useState("")
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    const loaded = UserStore.loadProgress()
    setProgress(loaded)

    setHeight((loaded.height ?? 170).toString())
    setWeight((loaded.weight ?? 70).toFixed(1))
    setMuscle((loaded.muscleMass ?? 25.0).toFixed(1))
    setBodyFat((loaded.bodyFat ?? 22.0).toFixed(1))

    if (loaded.targetWeight != null) {
      setTargetWeight(loaded.targetWeight.toString())
    }
    if (loaded.targetMuscleMass != null) {
      setTargetMuscle(loaded.targetMuscleMass.toFixed(1))
    }
    if (loaded.targetBodyFat != null) {
      setTargetBodyFat(loaded.targetBodyFat.toFixed(1))
    }

    const completedFlag =
      typeof window !== "undefined" ? localStorage.getItem("onboarding_completed") === "true" : false
    const hasWorkoutHistory = loaded.workoutsCompleted > 0
    const hasCustomStats =
      loaded.height !== 170 ||
      loaded.weight !== 70 ||
      loaded.muscleMass !== 25.0 ||
      loaded.bodyFat !== 22.0

    if (completedFlag || hasWorkoutHistory || hasCustomStats) {
      setIsExistingUser(true)
      if (typeof window !== "undefined") {
        localStorage.setItem("has_visited", "true")
      }
    }
  }, [])

  const handleComplete = () => {
    if (!progress || isCompleting) return

    const parsedHeight = Number.parseFloat(height)
    const parsedWeight = Number.parseFloat(weight)
    const parsedMuscle = Number.parseFloat(muscle)
    const parsedBodyFat = Number.parseFloat(bodyFat)

    if (
      Number.isNaN(parsedHeight) ||
      Number.isNaN(parsedWeight) ||
      Number.isNaN(parsedMuscle) ||
      Number.isNaN(parsedBodyFat)
    ) {
      alert("올바른 숫자를 입력해주세요")
      return
    }

    if (parsedHeight < 100 || parsedHeight > 250) {
      alert("키는 100~250cm 범위로 입력해주세요")
      return
    }

    if (parsedWeight < 30 || parsedWeight > 200) {
      alert("몸무게는 30~200kg 범위로 입력해주세요")
      return
    }

    if (parsedMuscle < 0 || parsedMuscle > 100) {
      alert("골격근량은 0~100kg 범위로 입력해주세요")
      return
    }

    if (parsedBodyFat < 0 || parsedBodyFat > 100) {
      alert("체지방률은 0~100% 범위로 입력해주세요")
      return
    }

    if (parsedMuscle < 0 || parsedMuscle > 100) {
      alert("골격근량은 0~100kg 범위로 입력해주세요")
      return
    }

    if (parsedBodyFat < 0 || parsedBodyFat > 100) {
      alert("체지방률은 0~100% 범위로 입력해주세요")
      return
    }

    const updatedBase = UserStore.updateBodyStats(
      progress,
      parsedMuscle,
      parsedBodyFat,
      parsedHeight,
      parsedWeight,
    )

    const trimmedTargetWeight = targetWeight.trim()
    const trimmedTargetMuscle = targetMuscle.trim()
    const trimmedTargetBodyFat = targetBodyFat.trim()

    const tWeight = trimmedTargetWeight ? Number.parseFloat(trimmedTargetWeight) : null
    const tMuscle = trimmedTargetMuscle ? Number.parseFloat(trimmedTargetMuscle) : null
    const tBodyFat = trimmedTargetBodyFat ? Number.parseFloat(trimmedTargetBodyFat) : null

    if (tWeight !== null && (tWeight < 30 || tWeight > 200)) {
      alert("목표 체중은 30~200kg 범위로 입력해주세요")
      return
    }

    if (tMuscle !== null && (tMuscle < 0 || tMuscle > 100)) {
      alert("목표 골격근량은 0~100kg 범위로 입력해주세요")
      return
    }

    if (tBodyFat !== null && (tBodyFat < 0 || tBodyFat > 100)) {
      alert("목표 체지방률은 0~100% 범위로 입력해주세요")
      return
    }

    const updated: UserProgress = {
      ...updatedBase,
      // 목표 값을 비워두면 기존 값으로 복원하지 않고 "미설정(null)"로 저장
      targetWeight: tWeight,
      targetMuscleMass: tMuscle,
      targetBodyFat: tBodyFat,
    }

    UserStore.saveProgress(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true")
      localStorage.setItem("has_visited", "true")
    }

    setIsCompleting(true)
    setTimeout(() => {
      router.push("/")
    }, 900)
  }

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
        <div className="max-w-[430px] w-full text-center">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
              <span className="text-4xl">👏</span>
            </div>
            <p className="text-lg font-black text-gray-900">좋아요, 바로 시작해볼까요?</p>
          </div>
          <p className="text-sm text-gray-600">잠시 후 홈으로 이동합니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white text-black flex flex-col p-4 pb-6">
      <div className="flex-1 flex flex-col justify-center max-w-[430px] w-full mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black mb-1">기본 정보 입력</h1>
          <p className="text-xs text-gray-600">맞춤 운동을 위해 키, 몸무게, 골격근량, 체지방률을 알려주세요.</p>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="w-11 aspect-square rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-700 mb-1">
                키 <span className="text-red-500">*</span>
              </p>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none py-0.5"
                  placeholder="170"
                />
                <span className="text-xs font-semibold text-gray-700">cm</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="w-11 aspect-square rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shrink-0">
              <Weight className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-700 mb-1">
                몸무게 <span className="text-red-500">*</span>
              </p>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none py-0.5"
                  placeholder="70"
                />
                <span className="text-xs font-semibold text-gray-700">kg</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="w-11 aspect-square rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-700 mb-1">
                골격근량 <span className="text-red-500">*</span>
              </p>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={muscle}
                  onChange={(e) => setMuscle(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none py-0.5"
                  placeholder="25.0"
                />
                <span className="text-xs font-semibold text-gray-700">kg</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="w-11 aspect-square rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-700 mb-1">
                체지방률 <span className="text-red-500">*</span>
              </p>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none py-0.5"
                  placeholder="22.0"
                />
                <span className="text-xs font-semibold text-gray-700">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex flex-col items-stretch">
              <p className="text-xs text-gray-600 mb-2 leading-tight">목표 체중</p>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none py-0.5 min-w-0"
                  placeholder="65"
                />
                <span className="text-xs font-medium text-gray-600">kg</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex flex-col items-stretch">
              <p className="text-xs text-gray-600 mb-2 leading-tight">목표 골격근량</p>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={targetMuscle}
                  onChange={(e) => setTargetMuscle(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none py-0.5 min-w-0"
                  placeholder="30"
                />
                <span className="text-xs font-medium text-gray-600">kg</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex flex-col items-stretch">
              <p className="text-xs text-gray-600 mb-2 leading-tight">목표 체지방률</p>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={targetBodyFat}
                  onChange={(e) => setTargetBodyFat(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none py-0.5 min-w-0"
                  placeholder="18"
                />
                <span className="text-xs font-medium text-gray-600">%</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 mt-1">
            <span className="text-red-500">*</span> = 필수 항목입니다. 별도 입력이 없으면 필수 항목은 기본값으로 시작해요.
          </p>
        </div>
      </div>

      <div className="max-w-[430px] w-full mx-auto mt-4">
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className="w-full bg-black text-white py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          이 정보로 시작하기
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isExistingUser && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[430px] px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5">
              <div className="text-center mb-4">
                <h1 className="text-2xl font-black mb-2">이미 기본 정보가 입력되었어요</h1>
                <p className="text-xs text-gray-600">
                  정보를 수정하고 싶다면 MY 페이지에서 키 · 몸무게와 몸 상태를 변경할 수 있어요.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/my")}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-black text-base hover:bg-gray-900 transition-colors"
                >
                  MY 페이지로 이동
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-white text-gray-900 py-3.5 rounded-xl font-black text-base border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  메인 페이지로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
