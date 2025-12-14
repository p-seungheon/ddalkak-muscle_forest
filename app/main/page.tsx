"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronRight, Trophy, Calendar, ShoppingBag, ChevronLeft } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

const MAIN_FEATURE_CARDS = [
  {
    title: "성장형 캐릭터",
    description: "운동을 하면 할수록 시바견이 점점 더 강해져요. 헬린이에서 근육신으로 변신하는 모습을 지켜보세요!",
    emoji: "🐕",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    title: "부위별 피커",
    description: "LLM AI가 당신이 원하는 부위를 집중적으로 단련할 수 있는 맞춤 운동 프로그램을 제공합니다.",
    emoji: "🏋️",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    title: "식단 코칭",
    description: "LLM AI 기반 식단 추천으로 목표 달성을 도와드려요. 칼로리와 영양소를 자동으로 계산해드립니다.",
    emoji: "🍽️",
    gradient: "from-green-400 to-green-600",
  },
  {
    title: "맞춤형 방문",
    description: "사용자의 운동 히스토리와 선호도를 분석해 매일 새로운 운동과 챌린지를 추천해드립니다.",
    emoji: "✨",
    gradient: "from-purple-400 to-purple-600",
  },
]

const ADDITIONAL_FEATURE_CARDS = [
  {
    title: "명예의 전당",
    description: "내가 달성한 업적을 한눈에 확인하세요. 나만의 성장 기록을 쌓아보세요!",
    icon: Trophy,
    gradient: "from-amber-400 to-amber-600",
  },
  {
    title: "운동 일정 관리",
    description: "나만의 운동 스케줄을 만들고 관리하세요. 규칙적인 운동 습관을 만들어드립니다.",
    icon: Calendar,
    gradient: "from-indigo-400 to-indigo-600",
  },
  {
    title: "포인트 스토어",
    description: "운동으로 획득한 포인트로 아이템을 구매하고 시바견을 꾸며보세요.",
    icon: ShoppingBag,
    gradient: "from-pink-400 to-pink-600",
  },
]

export default function MainPage() {
  const mainScrollRef = useRef<HTMLDivElement>(null)
  const additionalScrollRef = useRef<HTMLDivElement>(null)
  const [isMainInteracting, setIsMainInteracting] = useState(false)
  const [isAdditionalInteracting, setIsAdditionalInteracting] = useState(false)
  const isMainMouseDownRef = useRef(false)
  const isAdditionalMouseDownRef = useRef(false)

  const [showCredits, setShowCredits] = useState(false)
  const [sheetOffset, setSheetOffset] = useState(0)
  const sheetDragRef = useRef({ startY: 0, currentY: 0, isDragging: false })

  const mainScrollPositionRef = useRef(0)
  const additionalScrollPositionRef = useRef(0)
  const mainDragStateRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0, lastX: 0, lastTime: 0, velocity: 0 })
  const additionalDragStateRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  })

  useEffect(() => {
    const scrollContainer = mainScrollRef.current
    if (!scrollContainer) return

    const firstCard = scrollContainer.querySelector(".feature-card") as HTMLElement
    if (!firstCard) return

    const cardWidth = firstCard.offsetWidth
    const gap = 16 // gap-4 = 16px
    const oneSetWidth = (cardWidth + gap) * MAIN_FEATURE_CARDS.length

    const scrollSpeed = 0.5
    let animationId: number

    const animate = () => {
      if (!isMainInteracting) {
        mainScrollPositionRef.current += scrollSpeed

        if (mainScrollPositionRef.current >= oneSetWidth) {
          mainScrollPositionRef.current = 0
        }

        scrollContainer.scrollLeft = mainScrollPositionRef.current
      } else {
        mainScrollPositionRef.current = scrollContainer.scrollLeft
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isMainInteracting])

  useEffect(() => {
    const scrollContainer = additionalScrollRef.current
    if (!scrollContainer) return

    const firstCard = scrollContainer.querySelector(".additional-card") as HTMLElement
    if (!firstCard) return

    const cardWidth = firstCard.offsetWidth
    const gap = 16
    const oneSetWidth = (cardWidth + gap) * ADDITIONAL_FEATURE_CARDS.length

    if (additionalScrollPositionRef.current === 0) {
      additionalScrollPositionRef.current = oneSetWidth
      scrollContainer.scrollLeft = oneSetWidth
    }

    const scrollSpeed = 0.5
    let animationId: number

    const animate = () => {
      if (!isAdditionalInteracting) {
        additionalScrollPositionRef.current -= scrollSpeed

        if (additionalScrollPositionRef.current <= 0) {
          additionalScrollPositionRef.current = oneSetWidth
        }

        scrollContainer.scrollLeft = additionalScrollPositionRef.current
      } else {
        additionalScrollPositionRef.current = scrollContainer.scrollLeft
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isAdditionalInteracting])

  const handleMainStart = (clientX: number) => {
    const container = mainScrollRef.current
    if (!container) return

    mainDragStateRef.current = {
      isDragging: true,
      startX: clientX,
      scrollLeft: container.scrollLeft,
      lastX: clientX,
      lastTime: Date.now(),
      velocity: 0,
    }
    setIsMainInteracting(true)
  }

  const handleMainMove = (clientX: number) => {
    if (!mainDragStateRef.current.isDragging) return

    const container = mainScrollRef.current
    if (!container) return

    const currentTime = Date.now()
    const deltaX = clientX - mainDragStateRef.current.lastX
    const deltaTime = currentTime - mainDragStateRef.current.lastTime

    if (deltaTime > 0) {
      mainDragStateRef.current.velocity = deltaX / deltaTime
    }

    mainDragStateRef.current.lastX = clientX
    mainDragStateRef.current.lastTime = currentTime

    const walk = (mainDragStateRef.current.startX - clientX) * 1.5
    container.scrollLeft = mainDragStateRef.current.scrollLeft + walk
  }

  const handleMainEnd = () => {
    mainDragStateRef.current.isDragging = false
    setIsMainInteracting(false)
  }

  const handleAdditionalStart = (clientX: number) => {
    const container = additionalScrollRef.current
    if (!container) return

    additionalDragStateRef.current = {
      isDragging: true,
      startX: clientX,
      scrollLeft: container.scrollLeft,
      lastX: clientX,
      lastTime: Date.now(),
      velocity: 0,
    }
    setIsAdditionalInteracting(true)
  }

  const handleAdditionalMove = (clientX: number) => {
    if (!additionalDragStateRef.current.isDragging) return

    const container = additionalScrollRef.current
    if (!container) return

    const currentTime = Date.now()
    const deltaX = clientX - additionalDragStateRef.current.lastX
    const deltaTime = currentTime - additionalDragStateRef.current.lastTime

    if (deltaTime > 0) {
      additionalDragStateRef.current.velocity = deltaX / deltaTime
    }

    additionalDragStateRef.current.lastX = clientX
    additionalDragStateRef.current.lastTime = currentTime

    const walk = (additionalDragStateRef.current.startX - clientX) * 1.5
    container.scrollLeft = additionalDragStateRef.current.scrollLeft + walk
  }

  const handleAdditionalEnd = () => {
    additionalDragStateRef.current.isDragging = false
    setIsAdditionalInteracting(false)
  }

  const handleSheetDragStart = (clientY: number) => {
    sheetDragRef.current = {
      startY: clientY,
      currentY: clientY,
      isDragging: true,
    }
  }

  const handleSheetDragMove = (clientY: number) => {
    if (!sheetDragRef.current.isDragging) return
    sheetDragRef.current.currentY = clientY

    const dragDistance = sheetDragRef.current.currentY - sheetDragRef.current.startY
    const clampedDistance = dragDistance > 0 ? dragDistance : 0
    setSheetOffset(clampedDistance)
  }

  const handleSheetDragEnd = () => {
    const dragDistance = sheetDragRef.current.currentY - sheetDragRef.current.startY
    if (dragDistance > 100) {
      setShowCredits(false)
    }
    sheetDragRef.current.isDragging = false
    setSheetOffset(0)
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[430px] flex-1 flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-5 py-4">
          {/* Title Section */}
          <div className="text-center mb-6 pt-2">
            <h2 className="text-3xl font-black mb-2 leading-tight text-balance">득근의 숲</h2>
            <p className="text-[16px] text-gray-600 font-medium mb-3">내 손 안의 AI 헬스 파트너</p>
            <p className="text-xl text-gray-700 font-black font-sans">이런 것을 할 수 있어요</p>
          </div>

          {/* Main Features - Horizontal Scrolling Cards (Right to Left) */}
          <div className="relative -mx-5 overflow-hidden mb-4">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none" />

            <div
              ref={mainScrollRef}
              className="flex gap-4 px-5 overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing select-none"
              style={{ scrollBehavior: "auto" }}
              onTouchStart={(e) => handleMainStart(e.touches[0].clientX)}
              onTouchMove={(e) => handleMainMove(e.touches[0].clientX)}
              onTouchEnd={handleMainEnd}
              onMouseDown={(e) => {
                e.preventDefault()
                handleMainStart(e.clientX)
              }}
              onMouseMove={(e) => handleMainMove(e.clientX)}
              onMouseUp={handleMainEnd}
              onMouseLeave={handleMainEnd}
            >
              {[...MAIN_FEATURE_CARDS, ...MAIN_FEATURE_CARDS].map((feature, idx) => (
                <div
                  key={idx}
                  className="feature-card flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 p-5 flex flex-col min-h-[200px]"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 flex-shrink-0 text-3xl`}
                  >
                    {feature.emoji}
                  </div>
                  <h3 className="text-xl font-black mb-3 leading-tight">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Features - Horizontal Scrolling Cards (Left to Right) */}
          <div className="relative -mx-5 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none" />

            <div
              ref={additionalScrollRef}
              className="flex gap-4 px-5 overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing select-none"
              style={{ scrollBehavior: "auto" }}
              onTouchStart={(e) => handleAdditionalStart(e.touches[0].clientX)}
              onTouchMove={(e) => handleAdditionalMove(e.touches[0].clientX)}
              onTouchEnd={handleAdditionalEnd}
              onMouseDown={(e) => {
                e.preventDefault()
                handleAdditionalStart(e.clientX)
              }}
              onMouseMove={(e) => handleAdditionalMove(e.clientX)}
              onMouseUp={handleAdditionalEnd}
              onMouseLeave={handleAdditionalEnd}
            >
              {[...ADDITIONAL_FEATURE_CARDS, ...ADDITIONAL_FEATURE_CARDS].map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div
                    key={idx}
                    className="additional-card flex-shrink-0 w-72 bg-white rounded-2xl shadow-lg border border-gray-200 p-5 flex flex-col min-h-[200px]"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 flex-shrink-0`}
                    >
                      <Icon className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                    <h3 className="text-lg font-black mb-2 leading-tight">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed flex-1">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer with Start Button */}
        <footer className="py-2 px-5 flex flex-col items-center gap-3">
          <Link href="/onboarding" className="w-full max-w-sm">
            <button className="w-full bg-black text-white py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors">
              시작하기
              <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
          <button onClick={() => setShowCredits(true)} className="hover:opacity-70 transition-opacity">
            <p className="text-xs text-gray-400 font-medium text-center leading-snug">
              2025년 동양미래대학교 정보통신공학과
              <br />
              IT 캡스톤 디자인 2 [J7] 팀 프로젝트 3조
            </p>
          </button>
        </footer>
      </div>

      <Sheet open={showCredits} onOpenChange={setShowCredits}>
        <SheetContent
          side="bottom"
          showClose={false}
          className="h-[85vh] overflow-hidden flex flex-col p-0 rounded-t-3xl border-t-0 inset-x-auto left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-transparent"
        >
          <div
            className="flex h-full flex-col bg-white text-black rounded-t-3xl"
            style={{
              transform: `translateY(${sheetOffset}px)`,
              transition: sheetOffset === 0 ? "transform 0.25s ease-out" : "none",
            }}
          >
            <SheetTitle className="sr-only">팀 크레딧</SheetTitle>
            <div
              className="flex-shrink-0 pt-2 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
              onTouchStart={(e) => handleSheetDragStart(e.touches[0].clientY)}
              onTouchMove={(e) => handleSheetDragMove(e.touches[0].clientY)}
              onTouchEnd={handleSheetDragEnd}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSheetDragStart(e.clientY)
              }}
              onMouseMove={(e) => {
                if (sheetDragRef.current.isDragging) {
                  handleSheetDragMove(e.clientY)
                }
              }}
              onMouseUp={handleSheetDragEnd}
              onMouseLeave={() => {
                if (sheetDragRef.current.isDragging) {
                  handleSheetDragEnd()
                }
              }}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex-shrink-0 px-5 py-2 flex items-center border-b border-gray-200">
              <button
                onClick={() => setShowCredits(false)}
                className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="ml-2 text-lg font-black">팀 크레딧</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-3">
                <div className="mb-3">
                  <p className="text-2xl font-black tracking-tight text-center">딸깍</p>
                  <div className="mt-2 h-px w-full bg-gray-300" />
                </div>

                {/* Team Member 1 */}
                <div className="bg-white rounded-xl p-4 flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl flex-shrink-0">
                    👨‍💻
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg mb-1">박승헌</h3>
                    <p className="text-sm text-gray-600 mb-2">psh2003120@dongyang.ac.kr</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-700">• 인터페이스 구성, 최적화 및 마무리</p>
                      <p className="text-xs text-gray-700">• PPT/포스터 제작 및 발표</p>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-300" />

                {/* Team Member 2 */}
                <div className="bg-white rounded-xl p-4 flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-5xl flex-shrink-0">
                    🏋️‍♂️
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg mb-1">김준우</h3>
                    <p className="text-sm text-gray-600 mb-2">jw.kim@azwell.co.kr</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-700">• 아이디어 구상</p>
                      <p className="text-xs text-gray-700">• 인터페이스 구성</p>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-300" />

                {/* Team Member 3 */}
                <div className="bg-white rounded-xl p-4 flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-5xl flex-shrink-0">
                    👨‍🔧
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg mb-1">정민호</h3>
                    <p className="text-sm text-gray-600 mb-2">qhkfk1@naver.com</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-700">• 아이디어 구상</p>
                      <p className="text-xs text-gray-700">• 인터페이스 구성</p>
                    </div>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-300" />
              </div>
            </div>

            <div className="px-5 pt-1 pb-3 text-center">
              <p className="text-xl font-black text-gray-800 leading-tight">
                고민은 AI가, 당신은 딸깍.
              </p>
            </div>

            <div className="px-5 pb-4 pt-2 text-center text-[11px] text-gray-400 space-y-0">
              <p>COPYRIGHT 2025. TEAM_딸깍. ALL RIGHTS RESERVED.</p>
              <p className="text-[10px] text-gray-400 mt-[-2px] leading-none">Some images are generated by AI.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
