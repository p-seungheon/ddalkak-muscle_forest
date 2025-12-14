"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  History,
  Home,
  Utensils,
  Dumbbell,
  ShoppingBag,
  Calendar,
  Trophy,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { UserStore, type DietMeal } from "@/lib/user-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface FoodAnalysis {
  foodName: string
  isHealthy: boolean
  rating: string
  calories: number
  protein: number
  xpChange: number
}

type Tab = "home" | "diet" | "workout" | "schedule" | "hall-of-fame" | "store"

export default function DietPage() {
  const [progress, setProgress] = useState(UserStore.getDefaultProgress())
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("diet_messages")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return [
            {
              role: "assistant",
              content: "안녕! 나는 고든 램지다! 오늘 뭘 먹었는지 말해봐. 내가 평가해주지! 🔥",
            },
          ]
        }
      }
    }
    return [
      {
        role: "assistant",
        content: "안녕! 나는 고든 램지다! 오늘 뭘 먹었는지 말해봐. 내가 평가해주지! 🔥",
      },
    ]
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("diet")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [textareaHeight, setTextareaHeight] = useState(48)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    const loaded = UserStore.loadProgress()
    setProgress(loaded)

    const lastDate = localStorage.getItem("last_diet_date")
    const today = new Date().toDateString()
    if (lastDate !== today) {
      const reset = UserStore.resetDailyMeals(loaded)
      UserStore.saveProgress(reset)
      setProgress(reset)
      localStorage.setItem("last_diet_date", today)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("diet_messages", JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    if (typeof window === "undefined") return

    const savedInput = sessionStorage.getItem("diet_input")
    if (savedInput && savedInput.length > 0) {
      setInput(savedInput)

      if (textareaRef.current) {
        const target = textareaRef.current
        target.style.height = "auto"
        const newHeight = Math.min(target.scrollHeight, 120)
        target.style.height = `${newHeight}px`
        setTextareaHeight(newHeight)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    sessionStorage.setItem("diet_input", input)
  }, [input])

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && isAtBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
      }
    }

    setTimeout(scrollToBottom, 100)
  }, [messages, isLoading, textareaHeight, isAtBottom])

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      const atBottom = distanceFromBottom < 50

      setIsAtBottom(atBottom)
      setShowScrollButton(!atBottom)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
      setIsAtBottom(true)
      setShowScrollButton(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      setTextareaHeight(48)
    }

    setIsAtBottom(true)

    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/diet-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          currentCalories: progress.dailyCalories,
          targetCalories: progress.targetCalories,
          currentProtein: progress.dailyProtein,
          targetProtein: progress.targetProtein,
        }),
      })

      const data = await response.json()

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])

      if (data.analysis) {
        const analysis: FoodAnalysis = data.analysis

        const meal: DietMeal = {
          id: Date.now().toString(),
          name: analysis.foodName,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: 0,
          fat: 0,
          time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
          date: new Date().toLocaleDateString("ko-KR"),
          evaluation: data.response,
        }

        let updated = UserStore.addMeal(progress, meal)
        updated = UserStore.addXP(updated, analysis.xpChange)

        UserStore.saveProgress(updated)
        setProgress(updated)
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "이런! 오류가 발생했어. 다시 말해봐!" }])
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleDeleteMeal = (mealId: string) => {
    const mealToDelete = progress.mealHistory.find((m) => m.id === mealId)
    if (!mealToDelete) return

    const updatedHistory = progress.mealHistory.filter((m) => m.id !== mealId)
    const todayLabel = new Date().toLocaleDateString("ko-KR")
    const isTodayMeal = mealToDelete.date === todayLabel

    const updatedProgress = {
      ...progress,
      mealHistory: updatedHistory,
      // 오늘 먹은 식단을 삭제하는 경우에만 오늘 칼로리/단백질을 줄이고, 과거 기록은 오늘 합계에 영향을 주지 않도록 분리
      ...(isTodayMeal
        ? {
            dailyCalories: Math.max(0, progress.dailyCalories - mealToDelete.calories),
            dailyProtein: Math.max(0, progress.dailyProtein - mealToDelete.protein),
            mealsToday: progress.mealsToday.filter((m) => m.id !== mealId),
          }
        : {}),
    }

    UserStore.saveProgress(updatedProgress)
    setProgress(updatedProgress)
  }

  const calorieProgress = (progress.dailyCalories / progress.targetCalories) * 100
  const proteinProgress = (progress.dailyProtein / progress.targetProtein) * 100

  const groupedHistory = progress.mealHistory.reduce(
    (acc, meal) => {
      const date = meal.date || "날짜 미상"
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(meal)
      return acc
    },
    {} as Record<string, DietMeal[]>,
  )

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto max-w-[430px] w-full flex flex-col h-screen">
        {/* Header */}
        <header className="flex-shrink-0 bg-background border-b border-border">
          <div className="flex items-center gap-4 px-5 py-4">
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-black tracking-tight flex-1">식단 관리</h1>
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <History className="w-4 h-4" />
                  기록
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm w-[calc(100%-3rem)] mx-auto max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>식단 기록</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4 overflow-y-auto flex-1 scrollbar-hide">
                  {sortedDates.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">아직 기록된 식단이 없습니다.</p>
                  ) : (
                    sortedDates.map((date) => (
                      <div key={date} className="space-y-2">
                        <h3 className="font-bold text-sm sticky top-0 z-10 bg-card dark:bg-[#292929] text-card-foreground dark:text-white py-2 border-b border-border">
                          {date}
                        </h3>
                        <div className="space-y-2">
                          {groupedHistory[date].map((meal) => (
                            <Card key={meal.id} className="p-3 pr-12 relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="absolute top-2 right-2 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                              <div className="mb-2">
                                <p className="font-semibold text-foreground">{meal.name}</p>
                                <p className="text-xs text-muted-foreground mb-1">{meal.time}</p>
                                <div className="flex gap-3 text-xs font-mono text-muted-foreground">
                                  <span>{meal.calories} kcal</span>
                                  <span>{meal.protein}g 단백질</span>
                                </div>
                              </div>
                              {meal.evaluation && (
                                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border leading-relaxed">
                                  {meal.evaluation.substring(0, 150)}
                                  {meal.evaluation.length > 150 ? "..." : ""}
                                </p>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Daily Progress */}
        <div className="flex-shrink-0 bg-background border-b border-border p-5">
          <Card className="p-4">
            <h2 className="font-bold text-sm mb-3">오늘의 목표</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>칼로리</span>
                  <span className="font-mono">
                    {progress.dailyCalories} / {progress.targetCalories} kcal
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>단백질</span>
                  <span className="font-mono">
                    {progress.dailyProtein}g / {progress.targetProtein}g
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div
          ref={chatContainerRef}
          className="overflow-y-auto px-5 pt-5 pb-5 scrollbar-hide relative"
          style={{
            height: `calc(100vh - 180px - ${textareaHeight}px)`,
          }}
        >
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
                      : "bg-zinc-800 text-zinc-50 dark:bg-zinc-900 dark:text-zinc-50"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-50 dark:bg-zinc-900 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed left-1/2 -translate-x-1/2 bg-card border-2 border-border text-foreground rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-muted transition-all z-10"
              style={{
                bottom: `${textareaHeight + 100}px`, // Increased from 85px to 100px to move button higher
              }}
              aria-label="맨 아래로 스크롤"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-background border-t border-border p-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="먹은 음식을 말해주세요..."
              className="flex-1 px-4 py-3 border border-border rounded-3xl text-sm focus:outline-none focus:border-foreground resize-none min-h-[48px] max-h-[120px] scrollbar-hide bg-background"
              disabled={isLoading}
              rows={1}
              style={{
                height: "auto",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                const newHeight = Math.min(target.scrollHeight, 120)
                target.style.height = `${newHeight}px`
                setTextareaHeight(newHeight)
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-full w-12 h-12 p-0 flex-shrink-0"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="flex-shrink-0 bg-card border-t border-border">
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
