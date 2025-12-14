"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, Settings, Home, Utensils, Dumbbell, ShoppingBag, Calendar, Trophy, Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { UserStore, type UserProgress } from "@/lib/user-store"
import Image from "next/image"
import { WEEKLY_PROGRAMS, type Exercise } from "@/lib/workout-data"
import { AICoachingModal } from "@/components/ai-coaching-modal"

type Tab = "home" | "diet" | "workout" | "schedule" | "hall-of-fame" | "store"

export default function WorkoutPage() {
  const [progress, setProgress] = useState<UserProgress>(UserStore.getDefaultProgress())
  const [useCustomProgram, setUseCustomProgram] = useState(false)
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>("")
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [completedSets, setCompletedSets] = useState(0)
  const [totalSets, setTotalSets] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [restTimeRemaining, setRestTimeRemaining] = useState(60)
  const [showCritical, setShowCritical] = useState(false)
  const [isHit, setIsHit] = useState(false)
  const [lastDamage, setLastDamage] = useState<number | null>(null)

  const [monsterLevel, setMonsterLevel] = useState(1)
  const [monsterCurrentHP, setMonsterCurrentHP] = useState(1000)
  const [monsterMaxHP, setMonsterMaxHP] = useState(1000)
  const [showVictory, setShowVictory] = useState(false)
  const [devMode, setDevMode] = useState(false)

  // 기본값으로 SSR/초기 렌더를 맞추고, 마운트 후에만 localStorage에서 복원
  const [currentWeight, setCurrentWeight] = useState(20)
  const [currentReps, setCurrentReps] = useState(12)
  const [showSettings, setShowSettings] = useState(false)
  const [customWeight, setCustomWeight] = useState<number | null>(null)
  const [customReps, setCustomReps] = useState<number | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>("workout")
  const router = useRouter()

  const [showAICoaching, setShowAICoaching] = useState(false)

  const [hiddenMissionTriggered, setHiddenMissionTriggered] = useState(false)
  const [hiddenMissionActive, setHiddenMissionActive] = useState(false)
  const [hiddenMissionCompleted, setHiddenMissionCompleted] = useState(false)
  const [showHiddenMission, setShowHiddenMission] = useState(false)
  const [bossRewards, setBossRewards] = useState({ xp: 0, points: 0 })
  const [showBossDefeatNotification, setShowBossDefeatNotification] = useState(false)
  const [sessionMonstersDefeated, setSessionMonstersDefeated] = useState(0)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<{ href: string; tab?: Tab } | null>(null)
  const [sessionSnapshot, setSessionSnapshot] = useState<{
    progress: UserProgress
    monsterLevel: number
    monsterCurrentHP: number
    monsterMaxHP: number
  } | null>(null)

  const [sessionIndex, setSessionIndex] = useState<1 | 2>(1)
  const [sessionCompletedSets, setSessionCompletedSets] = useState(0)
  const [sessionTotalSets, setSessionTotalSets] = useState(0)
  const [extraExercises, setExtraExercises] = useState<Exercise[]>([])
  const [showExtraSelector, setShowExtraSelector] = useState(false)
  const [selectedExtraExerciseIds, setSelectedExtraExerciseIds] = useState<string[]>([])
  const [lastCompletionKey, setLastCompletionKey] = useState<string | null>(null)
  const [hasCompletedBaseToday, setHasCompletedBaseToday] = useState(false)
  const [hasDoneExtraToday, setHasDoneExtraToday] = useState(false)
  const [showCycleCompleteGate, setShowCycleCompleteGate] = useState(false)
  const [showWorkoutIntro, setShowWorkoutIntro] = useState(false)
  const [isBeginner, setIsBeginner] = useState(false)
  const [beginnerChoseBasic, setBeginnerChoseBasic] = useState(false)

  const handleProgramSaved = (updatedProgress: UserProgress) => {
    // AI 코칭에서 새 프로그램을 저장한 직후, 운동 페이지 상태를 즉시 최신화
    setProgress(updatedProgress)

    const activeProgram = UserStore.getActiveProgram(updatedProgress)
    const isCustom = !!activeProgram
    setUseCustomProgram(isCustom)

    // 항상 오늘 요일 기준으로 커스텀/기본 루틴을 잡는다.
    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    const todayName = dayNames[new Date().getDay()]
    setSelectedWorkoutDay(todayName)
  }

  useEffect(() => {
    const loadedProgress = UserStore.loadProgress()
    setProgress(loadedProgress)
    const level = loadedProgress.monsterLevel || 1
    setMonsterLevel(level)

    // 레벨에 따라 보스 최대 HP를 고정: Lv1=1000, 이후 레벨마다 +200
    const maxHP = 1000 + (level - 1) * 200
    setMonsterMaxHP(maxHP)

    // 직전에 저장된 현재 HP가 있으면 그 값을 사용하고, 없으면 풀 HP로 시작
    if (typeof window !== "undefined") {
      const savedHP = localStorage.getItem("monsterCurrentHP")
      if (savedHP !== null) {
        const parsed = Number(savedHP)
        if (!Number.isNaN(parsed)) {
          const clamped = Math.min(Math.max(parsed, 0), maxHP)
          // 과거 데이터에 소수점이 남아 있어도 현재부터는 항상 정수 HP로 맞춘다
          setMonsterCurrentHP(Math.round(clamped))
        } else {
          setMonsterCurrentHP(maxHP)
        }
      } else {
        setMonsterCurrentHP(maxHP)
      }
    } else {
      setMonsterCurrentHP(maxHP)
    }
    const activeProgram = UserStore.getActiveProgram(loadedProgress)
    const isCustom = !!activeProgram

    setUseCustomProgram(isCustom)

    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    const todayName = dayNames[new Date().getDay()]

    if (isCustom && activeProgram && activeProgram.days.length > 0) {
      // 커스텀 루틴도 항상 "오늘 요일" 기준으로 진행
      setSelectedWorkoutDay(todayName)
    } else {
      // 기본 루틴 역시 오늘 요일에 맞춰서 진행
      setSelectedWorkoutDay(todayName)
    }

    const today = new Date().toDateString()
    const lastHiddenMission = localStorage.getItem("lastHiddenMission")
    if (lastHiddenMission === today) {
      setHiddenMissionTriggered(true)
    }

    // 오늘 날짜 기준으로 기본 사이클/추가 운동 완료 여부를 복원
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const todayKey = `${year}-${month}-${day}`

    if (loadedProgress.workoutDates?.includes(todayKey)) {
      setHasCompletedBaseToday(true)
      const extraFlag = localStorage.getItem(`extraWorkoutDone:${todayKey}`)
      const extraDone = extraFlag === "true"
      setHasDoneExtraToday(extraDone)
      setShowCycleCompleteGate(true)
    }

    // 처음 시작한 유저(운동 기록/AI 코칭 이력 없음)에게만 AI 코칭 안내를 보여준다.
    const hasWorkoutHistory = Array.isArray(loadedProgress.workoutDates) && loadedProgress.workoutDates.length > 0
    const hasCustomProgram = !!UserStore.getActiveProgram(loadedProgress)
    const isFirstBeginner = !hasWorkoutHistory && !hasCustomProgram

    setIsBeginner(isFirstBeginner)

    if (isFirstBeginner) {
      setShowWorkoutIntro(true)
    }
  }, [])

  // 마운트 후에만 저장된 무게/횟수 값을 복원하여 hydration 경고를 피함
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedWeight = localStorage.getItem("workoutWeight")
    const savedReps = localStorage.getItem("workoutReps")

    if (savedWeight !== null) {
      const parsed = Number(savedWeight)
      if (!Number.isNaN(parsed)) setCurrentWeight(parsed)
    }

    if (savedReps !== null) {
      const parsed = Number(savedReps)
      if (!Number.isNaN(parsed)) setCurrentReps(parsed)
    }
  }, [])

  const hasActiveSession =
    !showVictory && sessionTotalSets > 0 && sessionCompletedSets > 0 && sessionCompletedSets < sessionTotalSets

  // 운동 진행 중일 때는 새로고침/탭 닫기 시 브라우저 기본 경고를 띄워서
  // 실수로 세션이 초기화되는 것을 최대한 방지한다.
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasActiveSession) return
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasActiveSession])

  const requestNavigation = (href: string, tab?: Tab) => {
    if (hasActiveSession) {
      // 운동 세션이 진행 중일 때는 '운동' 탭을 눌러도 아무 반응을 하지 않도록 함
      // (같은 페이지로 router.push 되어 세션이 초기화되는 것을 방지)
      if (href === "/workout" || tab === "workout") {
        return
      }

      setPendingNavigation({ href, tab })
      setShowLeaveConfirm(true)
      return
    }

    if (tab) {
      setActiveTab(tab)
    }
    router.push(href)
  }

  const activeProgram = UserStore.getActiveProgram(progress)

  const todayProgram =
    useCustomProgram && activeProgram && selectedWorkoutDay
      ? (() => {
          const dayData = activeProgram.days.find((d) => d.day === selectedWorkoutDay)
          if (!dayData) {
            return {
              day: selectedWorkoutDay,
              restDay: true,
              exercises: [],
            }
          }
          return {
            day: dayData.day,
            restDay: false,
            exercises: dayData.exercises.map((ex, idx) => ({
              id: `custom-${idx}`,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: (ex as any).weight || 20,
              muscleGroup: ex.muscleGroup,
              difficulty: ex.difficulty as "초급" | "중급" | "고급",
            })),
          }
        })()
      : (() => {
          // 기본 주간 루틴은 WEEKLY_PROGRAMS.dayNumber(월=0~일=6)를 사용하고,
          // JS Date.getDay()(일=0~토=6)를 이에 맞게 변환한다.
          const jsDay = new Date().getDay() // 0(일)~6(토)
          const dayNumber = jsDay === 0 ? 6 : jsDay - 1 // 0(월)~6(일)
          const baseProgram = WEEKLY_PROGRAMS.find((p) => p.dayNumber === dayNumber) ?? WEEKLY_PROGRAMS[0]

          // AI 코칭으로 만든 커스텀 프로그램이 없는 유저가
          // 기본 루틴을 사용하는 경우에는, 휴식일(예: 일요일)이라도
          // 최소 한 가지 기본 프로그램은 항상 진행할 수 있도록 한다.
          // - activeProgram이 없고(useCustomProgram === false)
          // - 오늘 기본 루틴이 휴식일이면,
          //   다른 요일의 비-휴식 기본 루틴을 내용만 가져와 사용한다.
          if (!useCustomProgram && !activeProgram && baseProgram.restDay) {
            const fallbackProgram = WEEKLY_PROGRAMS.find((p) => !p.restDay) ?? baseProgram

            return {
              ...fallbackProgram,
              // 화면에는 여전히 "오늘 요일"을 표시하고,
              // 실제 운동 내용만 다른 요일의 기본 루틴을 사용한다.
              day: baseProgram.day,
              dayNumber: baseProgram.dayNumber,
            }
          }

          return baseProgram
        })()

  const isRestDay = todayProgram.restDay

  const baseExercises = todayProgram.exercises
  const activeExercises = sessionIndex === 1 ? baseExercises : extraExercises

  const defaultExercise: Exercise = baseExercises[0] ?? {
    id: "rest-placeholder",
    name: "휴식",
    sets: 1,
    reps: 1,
    weight: 0,
    muscleGroup: "휴식",
    difficulty: "초급",
  }

  const currentExercise = activeExercises[currentExerciseIndex] ?? defaultExercise

  const handleAICoachingClose = () => {
    setShowAICoaching(false)

    if (typeof window === "undefined") return

    const introSeen = localStorage.getItem("workoutIntroSeen")
    if (introSeen === "true") return

    const latestProgress = UserStore.loadProgress()
    const hasWorkoutHistory =
      Array.isArray(latestProgress.workoutDates) && latestProgress.workoutDates.length > 0
    const hasCustomProgram = !!UserStore.getActiveProgram(latestProgress)

    if (!hasWorkoutHistory && !hasCustomProgram) {
      setShowWorkoutIntro(true)
    }
  }

  useEffect(() => {
    const safeBaseExercises = Array.isArray(baseExercises) ? baseExercises : []
    const total = safeBaseExercises.reduce((sum, ex) => sum + ex.sets, 0)
    setTotalSets(total)

    // 기본 루틴(세션 1)일 때만 세션 총 세트를 초기화하고,
    // 추가 세션(세션 2)에서는 사용자가 선택한 종목 기준으로 설정한 값을 유지한다.
    if (sessionIndex === 1) {
      setSessionTotalSets(total)
    }
  }, [baseExercises, sessionIndex])

  useEffect(() => {
    if (!isResting || restTimeRemaining <= 0) return

    const timer = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsResting(false)
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isResting, restTimeRemaining])

  useEffect(() => {
    if (sessionTotalSets <= 0 || showVictory || hiddenMissionActive) return

    if (sessionCompletedSets >= sessionTotalSets) {
      const key = `${sessionIndex}-${sessionTotalSets}`
      if (lastCompletionKey === key) return
      setLastCompletionKey(key)

      setTimeout(() => {
        setShowVictory(true)

        if (sessionIndex === 1) {
          const dayKey = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`
          let newProgress = UserStore.addXP(progress, 500)
          newProgress = UserStore.completeWorkout(newProgress, dayKey)
          UserStore.saveProgress(newProgress)
          setProgress(newProgress)

          // 오늘 기본 루틴을 막 완료했으므로, 추가 운동 기회는 새로 열린 상태로 초기화한다.
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, "0")
          const day = String(now.getDate()).padStart(2, "0")
          const todayKey = `${year}-${month}-${day}`
          if (typeof window !== "undefined") {
            localStorage.setItem(`extraWorkoutDone:${todayKey}`, "false")
          }
          setHasDoneExtraToday(false)

          // 한 사이클을 완전히 끝냈으므로, 세션 스냅샷은 더 이상 필요 없다.
          setSessionSnapshot(null)
        } else {
          // 추가 세션 완료: 오늘 루틴 외에 선택한 운동까지 수행
          const { xp: extraXP, points: extraPoints } = getExtraSessionBonus(extraExercises.length)
          let newProgress = UserStore.addXP(progress, extraXP)
          newProgress.points += extraPoints
          UserStore.saveProgress(newProgress)
          setProgress(newProgress)

          // 오늘 추가 운동 완료 기록
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, "0")
          const day = String(now.getDate()).padStart(2, "0")
          const todayKey = `${year}-${month}-${day}`
          if (typeof window !== "undefined") {
            localStorage.setItem(`extraWorkoutDone:${todayKey}`, "true")
          }
          setHasDoneExtraToday(true)

          // 추가 세션까지 완전히 끝낸 경우에도, 더 이상 세션 스냅샷은 필요 없다.
          setSessionSnapshot(null)
        }
      }, 1500)
    }
  }, [
    sessionCompletedSets,
    sessionTotalSets,
    showVictory,
    hiddenMissionActive,
    sessionIndex,
    progress,
    selectedWorkoutDay,
    lastCompletionKey,
  ])

  useEffect(() => {
    localStorage.setItem("workoutWeight", String(currentWeight))
  }, [currentWeight])

  useEffect(() => {
    localStorage.setItem("workoutReps", String(currentReps))
  }, [currentReps])

  const calculateDamage = (weight: number, reps: number): number => {
    const baseDamage = weight * 0.5 + reps * 2
    const randomFactor = 0.9 + Math.random() * 0.2
    return Math.floor(baseDamage * randomFactor)
  }

  const checkHiddenMissionTrigger = () => {
    // Check if it's the last set of the current exercise
    const isLastSet = currentSet === currentExercise.sets
    // Check if hidden mission hasn't been triggered today
    const today = new Date().toDateString()
    const lastHiddenMission = localStorage.getItem("lastHiddenMission")

    // 30% chance to trigger on last set, once per day
    if (isLastSet && lastHiddenMission !== today && !hiddenMissionTriggered && Math.random() < 0.3) {
      setShowHiddenMission(true)
      setHiddenMissionTriggered(true)
      localStorage.setItem("lastHiddenMission", today)
      return true
    }
    return false
  }

  const acceptHiddenMission = () => {
    setShowHiddenMission(false)
    setHiddenMissionActive(true)
  }

  const rejectHiddenMission = () => {
    setShowHiddenMission(false)
  }

  const handleCompleteSet = () => {
    if (showVictory) return
    if (isResting && !devMode) return

    // 이번 세션에서 설정된 목표 세트를 모두 채운 경우에는 더 이상 세트를 진행할 수 없다.
    // 단, 히든 미션이 활성화된 상태에서는 예외적으로 한 세트 추가 수행을 허용한다.
    if (!hiddenMissionActive && sessionTotalSets > 0 && sessionCompletedSets >= sessionTotalSets) return

    // 첫 세트를 수행하는 시점에 현재 진행상황과 보스 상태를 스냅샷으로 저장해둔다.
    // 한 사이클(기본 루틴/추가 운동) 을 끝내기 전에 운동을 강제 종료할 경우
    // 이 값을 기준으로 유저 진행도와 보스 Lv/HP를 모두 롤백한다.
    if (!sessionSnapshot) {
      setSessionSnapshot({
        progress,
        monsterLevel,
        monsterCurrentHP,
        monsterMaxHP,
      })
    }

    const isCritical = Math.random() > 0.7
    const damage = calculateDamage(currentWeight, currentReps)
    // 크리티컬 배율을 적용한 뒤에도 항상 정수 데미지로 맞춘다
    const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage

    setLastDamage(finalDamage)

    if (isCritical) {
      setShowCritical(true)
      setTimeout(() => setShowCritical(false), 800)
    }

    setIsHit(true)
    setTimeout(() => setIsHit(false), 400)

    const newHP = Math.max(0, monsterCurrentHP - finalDamage)
    setMonsterCurrentHP(newHP)
    if (typeof window !== "undefined") {
      localStorage.setItem("monsterCurrentHP", String(newHP))
    }

    if (newHP <= 0) {
      setSessionMonstersDefeated((prev) => prev + 1)
      const bonusXP = monsterLevel * 50
      const bonusPoints = monsterLevel * 20

      let updatedProgress = UserStore.addXP(progress, bonusXP)
      updatedProgress.points += bonusPoints
      UserStore.saveProgress(updatedProgress)
      setProgress(updatedProgress)

      setBossRewards({ xp: bonusXP, points: bonusPoints })
      setShowBossDefeatNotification(true)
      setTimeout(() => setShowBossDefeatNotification(false), 3000)

      const newLevel = monsterLevel + 1
      const newMaxHP = 1000 + (newLevel - 1) * 200
      setTimeout(() => {
        setMonsterLevel(newLevel)
        const progressWithNewMonsterLevel = UserStore.updateMonsterLevel(updatedProgress, newLevel)
        UserStore.saveProgress(progressWithNewMonsterLevel)
        setProgress(progressWithNewMonsterLevel)
        setMonsterMaxHP(newMaxHP)
        setMonsterCurrentHP(newMaxHP)
        if (typeof window !== "undefined") {
          localStorage.setItem("monsterCurrentHP", String(newMaxHP))
        }
      }, 1000)
    }

    const hiddenMissionTriggeredNow = checkHiddenMissionTrigger()
    if (hiddenMissionTriggeredNow) {
      return // Wait for user's decision
    }

    if (hiddenMissionActive) {
      setHiddenMissionActive(false)
      setHiddenMissionCompleted(true)

      // Award bonus rewards
      const bonusXP = 150
      const bonusPoints = 50
      const newProgress = UserStore.addXP(progress, bonusXP)
      newProgress.points += bonusPoints
      UserStore.saveProgress(newProgress)
      setProgress(newProgress)

      // Show completion notification
      setTimeout(() => setHiddenMissionCompleted(false), 3000)
    }

    setSessionCompletedSets((prev) => prev + 1)
    if (sessionIndex === 1) {
      setCompletedSets((prev) => prev + 1)
    }

    if (currentSet < currentExercise.sets || hiddenMissionActive) {
      setCurrentSet((prev) => prev + 1)
      if (!devMode) {
        setIsResting(true)
        setRestTimeRemaining(60)
      }
    } else if (currentExerciseIndex < activeExercises.length - 1) {
      // 한 운동 종목(예: 4세트)을 모두 끝내고 다음 운동으로 넘어갈 때는
      // 무게/횟수를 앱 기본값(20kg, 12회)으로 초기화한다.
      setCurrentExerciseIndex((prev) => prev + 1)
      setCurrentSet(1)
      setCurrentWeight(20)
      setCurrentReps(12)
      setCustomWeight(null)
      setCustomReps(null)
      if (!devMode) {
        setIsResting(true)
        setRestTimeRemaining(60)
      }
    }
  }

  const skipRest = () => {
    setIsResting(false)
    setRestTimeRemaining(60)
  }

  const hpPercentage = monsterMaxHP > 0 ? (monsterCurrentHP / monsterMaxHP) * 100 : 0
  const isMonsterDefeated = monsterCurrentHP <= 0

  // 아직 한 번도 때리지 않았을 때 버튼에 보여줄 예상 데미지(랜덤 없음)
  const basePreviewDamage = currentWeight * 0.5 + currentReps * 2
  const previewDamage = Math.floor(basePreviewDamage)

  const getExtraSessionBonus = (exerciseCount: number): { xp: number; points: number } => {
    if (exerciseCount <= 1) {
      return { xp: 150, points: 30 }
    }
    if (exerciseCount === 2) {
      return { xp: 250, points: 50 }
    }
    if (exerciseCount === 3) {
      return { xp: 350, points: 70 }
    }
    return { xp: 450, points: 90 }
  }

  const getBossImage = () => {
    if (monsterLevel <= 1) return "/boss-level-1.jpg"
    if (monsterLevel <= 3) return "/boss-level-2.jpg"
    if (monsterLevel <= 5) return "/boss-level-3.jpg"
    if (monsterLevel <= 7) return "/boss-level-4.jpg"
    return "/boss-level-5.jpg"
  }

  const weakness = currentExercise ? currentExercise.name.toUpperCase() : ""
  const hasSelectedExtraExercises = selectedExtraExerciseIds.length > 0
  

  return (
  <div className="bg-background pb-20">
    <div className="mx-auto max-w-[430px]">
    <header className="bg-background border-b border-border sticky top-0 z-20">
          <div className="px-5 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  requestNavigation("/", "home")
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
                  {useCustomProgram ? "AI 맞춤 루틴" : "기본 루틴"} • {todayProgram.day}
                </p>
                <Link
                  href="/schedule"
                  onClick={(e) => {
                    e.preventDefault()
                    requestNavigation("/schedule", "schedule")
                  }}
                >
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
              <button
                onClick={() => setDevMode(!devMode)}
                className={`text-[10px] px-2 py-1 border font-bold transition-colors ${
                  devMode ? "bg-red-600 text-white border-red-600" : "bg-card text-muted-foreground border-border"
                }`}
              >
                DEV
              </button>
            </div>
            <h1 className="text-lg font-black tracking-tight mb-1.5">Lv.{monsterLevel} 지방이 킹</h1>
            <div className="relative">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF3B30] transition-all duration-500"
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground mt-1 flex items-center justify-between">
                <span>
                  HP: {monsterCurrentHP} / {monsterMaxHP}
                </span>
                <span className="font-bold">
                  {sessionIndex === 1
                    ? `완료 ${completedSets}/${totalSets} 세트`
                    : `오늘 목표 완료, (추가 목표 ${sessionCompletedSets}/${sessionTotalSets} 세트)`}
                </span>
              </p>
            </div>
          </div>
        </header>

        <div className="relative bg-background flex items-center justify-center border-t border-border py-4">
          <div
            className={`absolute top-2 left-4 px-3 py-1 bg-black text-white text-[10px] font-bold tracking-wider z-10 ${weakness ? "" : "hidden"}`}
          >
            WEAKNESS: {weakness}
          </div>

          {showCritical && (
            <div className="absolute top-1/3 right-10 z-20 animate-bounce">
              <p className="text-4xl font-black text-[#FF3B30]">PERFECT!</p>
            </div>
          )}

          {devMode && (
            <div className="absolute top-2 right-6 z-10 bg-red-600 text-white px-3 py-1.5 text-xs font-bold animate-pulse">
              DEV MODE: 무제한 공격
            </div>
          )}

          {showBossDefeatNotification && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 border-2 border-yellow-600 shadow-2xl animate-slide-down">
              <p className="text-xl font-black mb-2 text-center">🏆 BOSS DEFEATED!</p>
              <div className="space-y-1 text-center">
                <p className="text-sm font-bold">보너스 XP: +{bossRewards.xp}</p>
                <p className="text-sm font-bold">보너스 포인트: +{bossRewards.points}</p>
              </div>
            </div>
          )}

          {hiddenMissionCompleted && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 border-2 border-purple-700 shadow-2xl animate-slide-down">
              <p className="text-xl font-black mb-2 text-center">⚡ HIDDEN MISSION CLEAR!</p>
              <div className="space-y-1 text-center">
                <p className="text-white text-sm leading-relaxed mb-3">실패 지점을 극복할 절호의 기회입니다!</p>
                <p className="text-yellow-300 text-sm font-bold mb-2">🎯 미션: 1세트 추가 수행</p>
                <p className="text-green-400 text-sm font-bold">🎁 보상: +150 XP, +50 포인트</p>
              </div>
            </div>
          )}

          <div
            className={`relative w-64 h-64 transition-all duration-200 ${isHit ? "monster-hit" : ""} ${isMonsterDefeated ? "monster-defeated" : ""}`}
          >
            <Image
              src={getBossImage() || "/placeholder.svg"}
              alt="Boss Monster"
              width={400}
              height={400}
              className="object-contain opacity-90"
            />
          </div>
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-sm w-[calc(100%-3rem)] mx-auto max-h-[80vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>운동 설정</DialogTitle>
            </DialogHeader>

            <div className="mt-4 px-6">
              <div className="flex gap-3">
                <Card className="p-4 flex-1">
                  <label className="text-sm font-semibold mb-2 block">무게 (KG)</label>
                  <input
                    type="number"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(Number(e.target.value))}
				    className="w-full px-4 py-3 border border-border rounded-lg text-base focus:outline-none focus:border-foreground bg-background"
                    min="5"
                    max="200"
                    step="5"
                  />
                </Card>

                <Card className="p-4 flex-1">
                  <label className="text-sm font-semibold mb-2 block">횟수 (회)</label>
                  <input
                    type="number"
                    value={currentReps}
                    onChange={(e) => setCurrentReps(Number(e.target.value))}
				    className="w-full px-4 py-3 border border-border rounded-lg text-base focus:outline-none focus:border-foreground bg-background"
                    min="1"
                    max="30"
                  />
                </Card>
              </div>

              <button
                onClick={() => {
                  setCustomWeight(currentWeight)
                  setCustomReps(currentReps)
                  setShowSettings(false)
                }}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-4"
              >
                적용
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {showVictory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-card text-foreground rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 bg-card px-5 py-4 border-b border-border flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold">{sessionIndex === 1 ? "목표 완료" : "추가 운동 완료"}</h2>
                <button
                  onClick={() => {
                    setShowVictory(false)
                    router.push("/")
                  }}
        				  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-center mb-6">
                  <p className="text-4xl font-black mb-4 text-[#FFD700]">
                    {sessionIndex === 1 ? "VICTORY!" : "LEGEND!"}
                  </p>
                </div>

                <Card className="p-4">
                  <p className="text-lg font-bold mb-3">
                    {sessionIndex === 1 ? `${todayProgram.day} 목표 완료` : "추가 운동 세션 완료"}
                  </p>
                  {sessionIndex === 1 ? (
                    <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">+500 XP 획득</p>
                    <p className="text-sm text-muted-foreground">+100 포인트 획득</p>
                    <p className="text-sm text-muted-foreground">몬스터 {sessionMonstersDefeated}마리 처치</p>
                      <p className="text-sm font-bold text-yellow-600">보스 처치 보너스: +{monsterLevel * 50} XP</p>
                      <p className="text-sm font-bold text-yellow-600">보스 처치 보너스: +{monsterLevel * 20} 포인트</p>
                      {progress.currentStreak > 1 && (
                        <p className="text-sm font-bold text-blue-600">{progress.currentStreak}일 연속 달성!</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        오늘 루틴을 마친 뒤 선택한 운동까지 모두 완료했어요. 정말 대단해요!
                      </p>
                      <p className="text-sm font-bold text-yellow-600">
                        추가 운동 보너스: +{getExtraSessionBonus(extraExercises.length).xp} XP
                      </p>
                      <p className="text-sm font-bold text-yellow-600">
                        추가 운동 보너스: +{getExtraSessionBonus(extraExercises.length).points} 포인트
                      </p>
                    </div>
                  )}
                </Card>

                <div className="space-y-3">
                  {sessionIndex === 1 && (
                    <button
                      onClick={() => {
                        setShowVictory(false)
                        setSelectedExtraExerciseIds([])
                        setShowExtraSelector(true)
                      }}
                      className="w-full bg-black text-white px-6 py-3 text-sm font-bold hover:bg-gray-800 transition-colors rounded-lg"
                    >
                      계속 운동하기
                    </button>
                  )}
                  <Link
                    href="/"
                    className="block w-full bg-background text-foreground border border-border px-6 py-3 text-sm font-bold hover:bg-muted transition-colors rounded-lg text-center"
                  >
                    홈으로 돌아가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExtraSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
			<div className="bg-card text-foreground rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide p-5">
              <h2 className="text-lg font-bold mb-2">추가로 진행할 운동 선택</h2>
			  <p className="text-xs text-muted-foreground mb-4">
                오늘 루틴에서 한 번 더 진행하고 싶은 운동을 골라주세요.
              </p>

              <div className="space-y-1.5 mb-4">
                <div className="grid grid-cols-3 gap-1.5">
                  {baseExercises.slice(0, 3).map((ex) => {
                    const selected = selectedExtraExerciseIds.includes(ex.id)
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          setSelectedExtraExerciseIds((prev) =>
                            prev.includes(ex.id) ? prev.filter((id) => id !== ex.id) : [...prev, ex.id],
                          )
                        }}
                        className={`flex flex-col items-center justify-center text-[10px] py-2 px-1.5 rounded border ${
                          selected
                            ? "bg-black text-white font-bold border-black"
                          : "text-muted-foreground bg-card border-border"
                        }`}
                      >
                        <span className="text-center leading-tight mb-0.5">{ex.name}</span>
                        <span className="text-[9px] opacity-70">{ex.sets} 세트</span>
                      </button>
                    )
                  })}
                </div>

                {baseExercises.length > 3 && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {baseExercises.slice(3).map((ex) => {
                      const selected = selectedExtraExerciseIds.includes(ex.id)
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => {
                            setSelectedExtraExerciseIds((prev) =>
                              prev.includes(ex.id) ? prev.filter((id) => id !== ex.id) : [...prev, ex.id],
                            )
                          }}
                          className={`flex flex-col items-center justify-center text-[10px] py-2 px-1.5 rounded border ${
                            selected
                              ? "bg-black text-white font-bold border-black"
                            : "text-muted-foreground bg-card border-border"
                          }`}
                        >
                          <span className="text-center leading-tight mb-0.5">{ex.name}</span>
                          <span className="text-[9px] opacity-70">{ex.sets} 세트</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (!hasSelectedExtraExercises) return
                    const selected = baseExercises.filter((ex) => selectedExtraExerciseIds.includes(ex.id))

                    const total = selected.reduce((sum, ex) => sum + ex.sets, 0)
                    setExtraExercises(selected)
                    setSessionIndex(2)
                    setSessionCompletedSets(0)
                    setSessionTotalSets(total)
                    setCurrentExerciseIndex(0)
                    setCurrentSet(1)
                    setCurrentWeight(20)
                    setCurrentReps(12)
                    setCustomWeight(null)
                    setCustomReps(null)
                    setShowExtraSelector(false)
                  }}
                  disabled={!hasSelectedExtraExercises}
                  className={`w-full py-3 text-sm font-bold rounded-lg transition-colors ${
                    hasSelectedExtraExercises
                      ? "bg-black text-white hover:bg-gray-800"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  선택한 운동으로 계속하기
                </button>
                <button
                  onClick={() => {
                    setShowExtraSelector(false)
                    setSessionIndex(1)
                    setSelectedExtraExerciseIds([])
                    setShowVictory(true)
                  }}
                  className="w-full bg-muted text-foreground py-3 text-sm font-bold hover:bg-muted/80 transition-colors rounded-lg"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {showHiddenMission && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={(e) => e.stopPropagation()}
          >
			<div className="bg-card text-foreground p-8 border-4 border-black animate-scale-in shadow-2xl w-full max-w-sm my-auto">
              <div className="text-center mb-4">
                <p className="text-3xl font-black text-yellow-600 mb-2 animate-pulse">⚡ HIDDEN MISSION ⚡</p>
                <p className="text-xl font-bold mb-3">한계 돌파 도전!</p>
              </div>
              <div className="bg-muted p-4 mb-6 border border-border">
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">실패 지점을 극복할 절호의 기회입니다!</p>
                <p className="text-yellow-600 text-sm font-bold mb-2">🎯 미션: 1세트 추가 수행</p>
                <p className="text-green-600 text-sm font-bold">🎁 보상: +150 XP, +50 포인트</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={acceptHiddenMission}
                  className="w-full bg-yellow-600 text-white py-3 font-bold hover:bg-yellow-700 transition-colors"
                >
                  도전한다! 💪
                </button>
                <button
                  onClick={rejectHiddenMission}
                  className="w-full bg-gray-700 text-white py-3 font-bold hover:bg-gray-600 transition-colors"
                >
                  다음 기회에...
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-background px-5 py-3 border-t border-border">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black">{currentExercise.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-black text-white px-2 py-1 font-bold">
                  {currentExercise.muscleGroup}
                </span>
                {hiddenMissionActive && (
                  <span className="text-[10px] bg-purple-600 text-white px-2 py-1 font-bold animate-pulse">
                    ⚡ 히든미션
                  </span>
                )}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
              <span className="font-bold text-muted-foreground text-xs">Set</span>
                <span className="text-2xl font-black">{currentSet}</span>
              <span className="text-muted-foreground text-xs">
                  / {hiddenMissionActive ? currentExercise.sets + 1 : currentExercise.sets}
                </span>
              </div>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-1.5">
              <span className="font-bold text-muted-foreground text-xs">무게</span>
                <span className="text-2xl font-black">{currentWeight}</span>
                <span className="text-muted-foreground text-xs">KG</span>
              </div>
                <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-muted-foreground text-xs">목표</span>
                <span className="text-2xl font-black">{currentReps}</span>
                <span className="text-muted-foreground text-xs">회</span>
              </div>
              {isResting && !devMode && (
                <>
                  <div className="h-5 w-px bg-gray-300" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600 text-xs">휴식</span>
                    <span className="text-2xl font-black text-blue-600">{restTimeRemaining}</span>
                    <span className="text-blue-400 text-xs">초</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCompleteSet}
              disabled={showVictory || (isResting && !devMode)}
              className="w-full bg-black text-white py-4 text-base font-black tracking-wide hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showVictory
                ? "오늘 운동 완료!"
                : isResting && !devMode
                  ? "휴식 중..."
                  : hiddenMissionActive
                    ? lastDamage !== null
                      ? `⚡ 히든미션 세트 완료 (데미지: ~${lastDamage})`
                      : `⚡ 히든미션 세트 완료 (데미지: ~${previewDamage})`
                    : lastDamage !== null
                      ? `세트 완료 (데미지: ~${lastDamage})`
                      : `세트 완료 (데미지: ~${previewDamage})`}
            </button>

            {isResting && !devMode && (
              <button
                onClick={skipRest}
              className="w-full bg-background text-foreground py-3 text-sm font-bold border border-border hover:bg-muted transition-colors"
              >
                휴식 건너뛰기
              </button>
            )}
          </div>

          {/* 운동 진행 */}
          <div className="mt-2">
            <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">운동 진행</h3>
            </div>
            <div className="space-y-1.5">
              {isRestDay ? (
                <>
                  {/* 휴식일에는 빈 박스를 3개 + 2개로 표시 */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
						className="h-10 rounded border border-border bg-background"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Array.from({ length: 2 }).map((_, idx) => (
                      <div
                        key={idx}
						className="h-10 rounded border border-border bg-background"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* 처음 3개 아이템을 3열 그리드로 표시 */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {(sessionIndex === 1 ? baseExercises : extraExercises)
                      .slice(0, 3)
                      .map((ex, idx) => (
                        <div
                          key={ex.id}
                          className={`flex flex-col items-center justify-center text-[10px] py-2 px-1.5 rounded border ${
                          idx === currentExerciseIndex
                            ? "bg-black text-white font-bold border-black"
                            : idx < currentExerciseIndex
								  ? "text-muted-foreground line-through bg-background border-border"
								  : "text-muted-foreground bg-background border-border"
                          }`}
                        >
                          <span className="text-center leading-tight mb-0.5">{ex.name}</span>
                          <span className="text-[9px] opacity-70">{ex.sets} 세트</span>
                        </div>
                      ))}
                  </div>

                  {/* 나머지 아이템을 2열 그리드로 표시 */}
                  {(sessionIndex === 1 ? baseExercises : extraExercises).length > 3 && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {(sessionIndex === 1 ? baseExercises : extraExercises)
                        .slice(3)
                        .map((ex, idx) => {
                          const actualIdx = idx + 3
                          return (
                            <div
                              key={ex.id}
                              className={`flex flex-col items-center justify-center text-[10px] py-2 px-1.5 rounded border ${
                              actualIdx === currentExerciseIndex
                                ? "bg-black text-white font-bold border-black"
                                : actualIdx < currentExerciseIndex
									  ? "text-muted-foreground line-through bg-background border-border"
									  : "text-muted-foreground bg-background border-border"
                              }`}
                            >
                              <span className="text-center leading-tight mb-0.5">{ex.name}</span>
                              <span className="text-[9px] opacity-70">{ex.sets} 세트</span>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showCycleCompleteGate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-5" onClick={() => {}}>
          <div
			className="bg-card text-foreground rounded-2xl w-full max-w-sm mx-auto p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl font-black mb-3">✅</p>
            <p className="text-lg font-bold mb-2">오늘 한 사이클은 이미 끝났어요</p>
            {!hasDoneExtraToday ? (
              <>
				<p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                  오늘 루틴을 한 번 모두 완료했어요. 추가 운동을 한 번 더 진행할 수 있어요.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowCycleCompleteGate(false)
                      setSelectedExtraExerciseIds([])
                      setShowExtraSelector(true)
                    }}
                    className="w-full bg-black text-white py-3 text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    추가 운동하기
                  </button>
                  <button
                    onClick={() => {
                      setShowCycleCompleteGate(false)
                      router.push("/")
                    }}
        					className="w-full bg-background border border-border text-foreground py-3 text-sm font-bold rounded-lg hover:bg-muted transition-colors"
                  >
                    홈으로 돌아가기
                  </button>
                </div>
              </>
            ) : (
              <>
				<p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                  오늘 루틴과 추가 운동까지 모두 완료했어요. 오늘 운동은 마무리하고 내일 다시 도전해봐요.
                </p>
                <button
                  onClick={() => {
                    setShowCycleCompleteGate(false)
                    router.push("/")
                  }}
                  className="w-full bg-black text-white py-3 text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors"
                >
                  홈으로 돌아가기
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {isRestDay && !hasCompletedBaseToday && !hasDoneExtraToday && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-5" onClick={() => {}}>
          <div
			className="bg-card text-foreground rounded-2xl w-full max-w-sm mx-auto p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl font-black mb-3">🌴</p>
            <p className="text-lg font-bold mb-2">오늘은 휴식일입니다</p>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">몸을 충분히 휴식해주세요!</p>
            <button
              onClick={() => {
                requestNavigation("/", "home")
              }}
              className="w-full bg-black text-white py-3 text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors"
            >
              홈으로 이동하기
            </button>
          </div>
        </div>
      )}
      <Dialog
        open={showLeaveConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowLeaveConfirm(false)
            setPendingNavigation(null)
          }
        }}
      >
        <DialogContent className="max-w-sm w-[calc(100%-3rem)] mx-auto">
          <DialogHeader>
            <DialogTitle>운동을 종료할까요?</DialogTitle>
          </DialogHeader>
		  <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <p>나가면 현재 진행 중인 세트 정보는 사라집니다.</p>
            <p className="text-xs text-red-500 mt-1">이번 세션에서 얻은 포인트와 보스 HP·레벨 변화는 모두 취소됩니다.</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                if (!pendingNavigation) {
                  setShowLeaveConfirm(false)
                  return
                }

                // 아직 한 사이클(오늘 운동)을 끝내지 않은 상태에서 운동을 종료하면,
                // 세션 시작 시점의 진행상황과 보스 상태로 롤백한다.
                if (hasActiveSession && sessionSnapshot) {
                  UserStore.saveProgress(sessionSnapshot.progress)
                  setProgress(sessionSnapshot.progress)

                  // 보스 Lv/HP도 세션 시작 시점으로 되돌려,
                  // 기본 루틴/추가 운동 모두에서 중간 이탈로 인한 레벨 역이용을 막는다.
                  setMonsterLevel(sessionSnapshot.monsterLevel)
                  setMonsterMaxHP(sessionSnapshot.monsterMaxHP)
                  setMonsterCurrentHP(sessionSnapshot.monsterCurrentHP)
                  if (typeof window !== "undefined") {
                    localStorage.setItem("monsterCurrentHP", String(sessionSnapshot.monsterCurrentHP))
                  }

                  setSessionSnapshot(null)
                }

                const { href, tab } = pendingNavigation
                setShowLeaveConfirm(false)
                setPendingNavigation(null)

                if (tab) {
                  setActiveTab(tab)
                }
                router.push(href)
              }}
              className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors"
            >
              네, 그만할게요
            </button>
            <button
              onClick={() => {
                setShowLeaveConfirm(false)
                setPendingNavigation(null)
              }}
			  className="flex-1 bg-background border border-border text-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
            >
              아니요, 계속할게요
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {showWorkoutIntro && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-5" onClick={() => {}}>
          <div
			className="bg-card text-foreground rounded-2xl w-full max-w-sm mx-auto p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl mb-2">🏋️‍♀️</p>
            <p className="text-lg font-black mb-1">운동 시작 전에</p>
            <p className="text-sm text-muted-foreground mb-5">AI 코칭으로 맞춤 루틴을 먼저 받아볼까요?</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  // AI 코칭으로 시작은 "실제로 프로그램을 만들기 전" 상태이므로
                  // 인트로를 바로 끝난 것으로 표시하지 않는다.
                  setShowWorkoutIntro(false)
                  setShowAICoaching(true)
                }}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 text-sm font-bold rounded-lg hover:opacity-90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI 코칭으로 시작하기</span>
              </button>
              <button
                onClick={() => {
                  // 기본 프로그램으로 시작을 선택해도
                  // 아직 한 사이클을 완료하지 않았다면 다음 진입 시 다시 인트로를 보여주기 위해
                  // 별도의 플래그는 저장하지 않는다.
                  if (isBeginner) {
                    setBeginnerChoseBasic(true)
                  }
                  setShowWorkoutIntro(false)
                }}
                className="w-full bg-background text-foreground border border-border py-3 text-sm font-bold rounded-lg hover:bg-muted transition-colors"
              >
                일단 기본 프로그램으로 할래요
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Coaching Modal */}
      <AICoachingModal isOpen={showAICoaching} onClose={handleAICoachingClose} onProgramSaved={handleProgramSaved} />
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-card border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault()
              if (showSettings) {
                setShowSettings(false)
                return
              }
              if (showAICoaching) {
                setShowAICoaching(false)
                return
              }
              requestNavigation("/", "home")
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "home" ? "opacity-100" : "opacity-40"
            }`}
          >
            <Home className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">홈</span>
          </Link>
          <Link
            href="/diet"
            onClick={(e) => {
              e.preventDefault()
              if (showSettings) {
                setShowSettings(false)
                return
              }
              if (showAICoaching) {
                setShowAICoaching(false)
                return
              }
              requestNavigation("/diet", "diet")
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "diet" ? "opacity-100" : "opacity-40"
            }`}
          >
            <Utensils className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">식단</span>
          </Link>
          <Link
            href="/workout"
            onClick={(e) => {
              e.preventDefault()
              if (showSettings) {
                setShowSettings(false)
                return
              }
              if (showAICoaching) {
                setShowAICoaching(false)
                return
              }
              requestNavigation("/workout", "workout")
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "workout" ? "opacity-100" : "opacity-40"
            }`}
          >
            <Dumbbell className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">운동</span>
          </Link>
          <Link
            href="/schedule"
            onClick={(e) => {
              e.preventDefault()
              if (showSettings) {
                setShowSettings(false)
                return
              }
              if (showAICoaching) {
                setShowAICoaching(false)
                return
              }
              requestNavigation("/schedule", "schedule")
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "schedule" ? "opacity-100" : "opacity-40"
            }`}
          >
            <Calendar className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">일정</span>
          </Link>
          <Link
            href="/hall-of-fame"
            onClick={(e) => {
              e.preventDefault()
              if (showSettings) {
                setShowSettings(false)
                return
              }
              if (showAICoaching) {
                setShowAICoaching(false)
                return
              }
              requestNavigation("/hall-of-fame", "hall-of-fame")
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "hall-of-fame" ? "opacity-100" : "opacity-40"
            }`}
          >
            <Trophy className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">명예</span>
          </Link>
          <Link
            href="/store"
            onClick={(e) => {
              e.preventDefault()
              if (showSettings) {
                setShowSettings(false)
                return
              }
              if (showAICoaching) {
                setShowAICoaching(false)
                return
              }
              requestNavigation("/store", "store")
            }}
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
  )
}
