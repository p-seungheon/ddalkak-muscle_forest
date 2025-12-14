"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"

interface InteractiveShibaProps {
  level: number
}

export function InteractiveShiba({ level }: InteractiveShibaProps) {
  const [emotion, setEmotion] = useState<"idle" | "happy" | "excited" | "tired">("idle")
  const [isAnimating, setIsAnimating] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  // 렌더링 될 때마다 멘트가 바뀌지 않고, emotion이 바뀔 때만 멘트를 랜덤하게 뽑기 위해 useMemo 사용
  // (또는 클릭 시점에 텍스트 state를 별도로 두는 방법도 있지만, 여기서는 간단하게 처리)
  const [currentText, setCurrentText] = useState("")

  // 멘트 목록 정의
  const messages = {
    happy: [
      "회원님, 자세가 아주 좋습니다! 👍",
      "오늘 득근 냄새가 나는데? 킁킁 🐶",
      "지방은 태우고 근육은 꽉 채워! 🔥",
      "닭가슴살은 챙겨 드셨나요? 🍗",
      "오늘따라 어깨가 넓어 보이시네요! 💪",
    ],
    excited: [
      "무게가 너무 가벼워! 더 올려! 🏋️‍♂️",
      "가즈아!! 오늘 3대 500 뚫어!! 🚀",
      "멈추지 마! 지금 근육이 자라고 있어! ⚡",
      "도파민 팡팡 터진다멍!!! 🤪",
      "한 개만 더! 딱 한 개만 더!! ☝️",
    ],
    tired: [
      "으어... 근손실 올 것 같아... 😱",
      "단백질... 쉐이크 좀 줘... 🥤",
      "휴식도 훈련인 거 알지...? 🛌",
      "하얗게 불태웠다멍... 💤",
      "내일은 하체 하는 날... 맞지? 🦵",
    ],
  }

  // Auto reset emotion after 2 seconds
  useEffect(() => {
    if (emotion !== "idle") {
      const timer = setTimeout(() => {
        setEmotion("idle")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [emotion])

  // Auto breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (emotion === "idle") {
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [emotion])

  // no-op: rely on CSS dark: classes for styling

  const handleClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)

    let newEmotion: "happy" | "excited" | "tired" = "happy"

    if (newCount % 5 === 0) {
      newEmotion = "excited"
    } else if (newCount % 3 === 0) {
      newEmotion = "tired"
    } else {
      newEmotion = "happy"
    }

    setEmotion(newEmotion)

    // 감정에 맞는 멘트 중 하나를 랜덤으로 선택해서 설정
    const msgList = messages[newEmotion]
    const randomMsg = msgList[Math.floor(Math.random() * msgList.length)]
    setCurrentText(randomMsg)
    // retrigger pop animation once
    setAnimKey((k) => k + 1)
  }

  const getShibaStyle = () => {
    const baseScale = 0.7 + level * 0.05
    // remove extra scaling for 'excited' — pop should not change size
    const excitedScale = baseScale
    const rotate = emotion === "happy" ? -10 : emotion === "tired" ? 5 : 0

    const style: React.CSSProperties = {
      // set CSS variables so keyframe animation can preserve scale/rotation
      ['--shiba-scale' as any]: `${excitedScale}`,
      ['--shiba-rotate' as any]: `${rotate}deg`,
      transform: `scale(${excitedScale}) rotate(${rotate}deg)`,
    }

    return style
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Interactive Shiba Character */}
      <div
        onClick={handleClick}
        className="relative w-full max-w-[320px] aspect-square cursor-pointer select-none transition-all duration-300 ease-out"
        style={getShibaStyle()}
      >
        <Image
          key={animKey}
          src={`/images/siba${level}.png`}
          alt={`Level ${level} Shiba Inu`}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className={`object-contain drop-shadow-2xl ${isAnimating && emotion === "idle" ? "animate-shiba-pop" : ""} ${animKey > 0 ? "animate-shiba-pop" : ""}`}
          draggable={false}
          priority
          onAnimationEnd={() => setAnimKey(0)}
        />

        {/* Level badge on character */}
        <div className="absolute top-0 right-0 rounded-full w-12 h-12 flex items-center justify-center font-black text-lg border-4 shadow-lg z-20 bg-black text-white border-white dark:bg-white dark:text-black dark:border-black">
          {level}
        </div>

        {/* Sparkles for level 5 */}
        {level === 5 && (
          <>
            <div className="absolute top-10 right-10 animate-ping text-2xl z-20">✨</div>
            <div className="absolute top-20 left-10 animate-ping delay-150 text-2xl z-20">⭐</div>
            <div className="absolute bottom-20 right-20 animate-ping delay-300 text-2xl z-20">💫</div>
          </>
        )}

        </div>

      {emotion !== "idle" && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold animate-bounce shadow-lg whitespace-nowrap z-30 bg-white border-2 border-black text-black dark:bg-[#0f1720] dark:border-[#2b2b2b] dark:text-white">
          {currentText}
        </div>
      )}

      {/* Interaction hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm z-30 bg-white/50 text-black/60 dark:bg-black/40 dark:text-white/80">
        시바견을 클릭해보세요!
      </div>
    </div>
  )
}