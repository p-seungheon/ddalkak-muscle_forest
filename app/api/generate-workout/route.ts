import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

interface WorkoutRequest {
  focusAreas: string[]
  level: string
  selectedWeekdays?: number[]
  daysPerWeek?: number
}

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

function normalizeProgramDifficulty(program: any, level: string) {
  if (!Array.isArray(program)) return program

  return program.map((day) => ({
    ...day,
    exercises: Array.isArray(day.exercises)
      ? day.exercises.map((exercise: any) => ({
          ...exercise,
          difficulty: level,
        }))
      : day.exercises,
  }))
}

function generateFallbackWorkout(focusAreas: string[], level: string, selectedWeekdays: number[]) {
  const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]

  const beginnerWorkouts = {
    전신: [
      { name: "푸시업", sets: 4, reps: 12, weight: 0, muscleGroup: "가슴", difficulty: "초급" },
      { name: "스쿼트", sets: 4, reps: 12, weight: 0, muscleGroup: "하체", difficulty: "초급" },
      { name: "플랭크", sets: 4, reps: 12, weight: 0, muscleGroup: "복근", difficulty: "초급" },
      { name: "런지", sets: 4, reps: 12, weight: 0, muscleGroup: "하체", difficulty: "초급" },
      { name: "버피", sets: 4, reps: 12, weight: 0, muscleGroup: "전신", difficulty: "초급" },
    ],
    가슴: [
      { name: "푸시업", sets: 4, reps: 12, weight: 0, muscleGroup: "가슴", difficulty: "초급" },
      { name: "와이드 푸시업", sets: 4, reps: 12, weight: 0, muscleGroup: "가슴", difficulty: "초급" },
      { name: "다이아몬드 푸시업", sets: 4, reps: 12, weight: 0, muscleGroup: "가슴", difficulty: "초급" },
      { name: "인클라인 푸시업", sets: 4, reps: 12, weight: 0, muscleGroup: "가슴", difficulty: "초급" },
      { name: "딥스", sets: 4, reps: 12, weight: 0, muscleGroup: "가슴", difficulty: "초급" },
    ],
    등: [
      { name: "풀업", sets: 4, reps: 12, weight: 0, muscleGroup: "등", difficulty: "초급" },
      { name: "턱걸이", sets: 4, reps: 12, weight: 0, muscleGroup: "등", difficulty: "초급" },
      { name: "슈퍼맨", sets: 4, reps: 12, weight: 0, muscleGroup: "등", difficulty: "초급" },
      { name: "백 익스텐션", sets: 4, reps: 12, weight: 0, muscleGroup: "등", difficulty: "초급" },
      { name: "암풀다운", sets: 4, reps: 12, weight: 0, muscleGroup: "등", difficulty: "초급" },
    ],
    하체: [
      { name: "스쿼트", sets: 4, reps: 12, weight: 0, muscleGroup: "하체", difficulty: "초급" },
      { name: "런지", sets: 4, reps: 12, weight: 0, muscleGroup: "하체", difficulty: "초급" },
      { name: "불가리안 스플릿 스쿼트", sets: 4, reps: 12, weight: 0, muscleGroup: "하체", difficulty: "초급" },
      { name: "카프 레이즈", sets: 4, reps: 12, weight: 0, muscleGroup: "하체", difficulty: "초급" },
      { name: "점프 스쿼트", sets: 4, reps: 12, weight: 0, muscleGroup: "하체", difficulty: "초급" },
    ],
  }

  const intermediateWorkouts = {
    전신: [
      { name: "바벨 스쿼트", sets: 4, reps: 12, weight: 20, muscleGroup: "하체", difficulty: "중급" },
      { name: "벤치프레스", sets: 4, reps: 12, weight: 20, muscleGroup: "가슴", difficulty: "중급" },
      { name: "데드리프트", sets: 4, reps: 12, weight: 20, muscleGroup: "등", difficulty: "중급" },
      { name: "밀리터리 프레스", sets: 4, reps: 12, weight: 20, muscleGroup: "어깨", difficulty: "중급" },
      { name: "바벨 로우", sets: 4, reps: 12, weight: 20, muscleGroup: "등", difficulty: "중급" },
    ],
    가슴: [
      { name: "벤치프레스", sets: 4, reps: 12, weight: 20, muscleGroup: "가슴", difficulty: "중급" },
      { name: "인클라인 벤치프레스", sets: 4, reps: 12, weight: 20, muscleGroup: "가슴", difficulty: "중급" },
      { name: "덤벨 플라이", sets: 4, reps: 12, weight: 20, muscleGroup: "가슴", difficulty: "중급" },
      { name: "케이블 크로스오버", sets: 4, reps: 12, weight: 20, muscleGroup: "가슴", difficulty: "중급" },
      { name: "딥스", sets: 4, reps: 12, weight: 20, muscleGroup: "가슴", difficulty: "중급" },
    ],
    등: [
      { name: "데드리프트", sets: 4, reps: 12, weight: 20, muscleGroup: "등", difficulty: "중급" },
      { name: "바벨 로우", sets: 4, reps: 12, weight: 20, muscleGroup: "등", difficulty: "중급" },
      { name: "풀업", sets: 4, reps: 12, weight: 20, muscleGroup: "등", difficulty: "중급" },
      { name: "시티드 로우", sets: 4, reps: 12, weight: 20, muscleGroup: "등", difficulty: "중급" },
      { name: "랫풀다운", sets: 4, reps: 12, weight: 20, muscleGroup: "등", difficulty: "중급" },
    ],
    하체: [
      { name: "바벨 스쿼트", sets: 4, reps: 12, weight: 20, muscleGroup: "하체", difficulty: "중급" },
      { name: "레그프레스", sets: 4, reps: 12, weight: 20, muscleGroup: "하체", difficulty: "중급" },
      { name: "루마니안 데드리프트", sets: 4, reps: 12, weight: 20, muscleGroup: "하체", difficulty: "중급" },
      { name: "레그 컬", sets: 4, reps: 12, weight: 20, muscleGroup: "하체", difficulty: "중급" },
      { name: "레그 익스텐션", sets: 4, reps: 12, weight: 20, muscleGroup: "하체", difficulty: "중급" },
    ],
  }

  const workoutLibrary = level === "초급" ? beginnerWorkouts : intermediateWorkouts
  const primaryFocus = focusAreas[0] || "전신"
  const exercises = workoutLibrary[primaryFocus as keyof typeof workoutLibrary] || workoutLibrary["전신"]

  const program = selectedWeekdays.map((dayIdx) => ({
    day: dayNames[dayIdx],
    focus: primaryFocus,
    exercises: exercises,
  }))

  return { program }
}

export async function POST(req: Request) {
  try {
    const body: WorkoutRequest = await req.json()
    const { focusAreas, level, selectedWeekdays = [], daysPerWeek } = body

    const workoutTypeGuidance =
      level === "초급"
        ? "초급이므로 맨몸 운동 위주로 추천해주세요. 예: 푸시업, 풀업, 스쿼트, 런지, 플랭크, 버피, 마운틴 클라이머, 레그레이즈 등. 기구가 필요 없는 맨몸 운동으로만 구성하세요."
        : "중급 또는 고급이므로 헬스장 기구를 활용한 운동을 추천해주세요. 예: 바벨, 덤벨, 머신을 사용하는 운동들. 벤치프레스, 데드리프트, 스쿼트, 레그프레스, 케이블 운동, 머신 운동 등을 포함하세요."

    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    const effectiveSelectedWeekdays: number[] =
      selectedWeekdays.length > 0
        ? selectedWeekdays
        : typeof daysPerWeek === "number" && daysPerWeek > 0
          ? Array.from({ length: daysPerWeek }, (_, i) => i % 7)
          : [0]

    const selectedDayNames = effectiveSelectedWeekdays.map((idx) => dayNames[idx]).join(", ")

    const prompt = `당신은 전문 피트니스 코치입니다. 다음 조건에 맞는 ${selectedWeekdays.length}일치 운동 루틴을 JSON 형식으로 생성해주세요.

조건:
- 강조할 부위: ${focusAreas.join(", ")}
- 운동 레벨: ${level}
- 운동 요일: ${selectedDayNames} (총 ${selectedWeekdays.length}일)
- 운동 타입: ${workoutTypeGuidance}

각 운동일마다 정확히 5가지 메인 운동을 추천하고, 각 운동은 4세트, 기본 무게 20KG, 12회를 기준으로 해주세요.
강조 부위는 더 자주, 더 많은 운동으로 구성해주세요.

응답 형식 (JSON):
{
  "program": [
    {
      "day": "${dayNames[effectiveSelectedWeekdays[0] ?? 0]}",
      "focus": "가슴, 삼두",
      "exercises": [
        {
          "name": "벤치프레스",
          "sets": 4,
          "reps": 12,
          "weight": 20,
          "muscleGroup": "가슴",
          "difficulty": "중급"
        },
        {
          "name": "인클라인 벤치프레스",
          "sets": 4,
          "reps": 12,
          "weight": 20,
          "muscleGroup": "가슴",
          "difficulty": "중급"
        },
        {
          "name": "덤벨 플라이",
          "sets": 4,
          "reps": 12,
          "weight": 20,
          "muscleGroup": "가슴",
          "difficulty": "중급"
        },
        {
          "name": "트라이셉 익스텐션",
          "sets": 4,
          "reps": 12,
          "weight": 20,
          "muscleGroup": "삼두",
          "difficulty": "초급"
        },
        {
          "name": "딥스",
          "sets": 4,
          "reps": 12,
          "weight": 20,
          "muscleGroup": "가슴",
          "difficulty": "중급"
        }
      ]
    }
  ]
}

중요: 
- day 필드에는 선택된 요일 이름(${selectedDayNames})을 순서대로 사용하세요.
- 각 운동일마다 정확히 5개의 운동을 포함해야 합니다.
- 각 운동은 4세트, 12회, 20KG를 기본값으로 설정하세요.
- 운동 레벨이 초급이면 맨몸 운동만, 중급/고급이면 헬스장 기구 운동으로 구성하세요.
- 운동 난이도는 "초급", "중급", "고급" 중 하나로 설정하고, 모든 텍스트는 한국어로 작성해주세요. 
- JSON만 응답하세요.`

    try {
      if (!genAI) {
        throw new Error("GEMINI_API_KEY is not configured")
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      let workoutPlan
      try {
        workoutPlan = JSON.parse(text)
      } catch {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error("Failed to parse AI response - no JSON found")
        }
        workoutPlan = JSON.parse(jsonMatch[1] || jsonMatch[0])
      }

      const normalizedProgram = normalizeProgramDifficulty(workoutPlan.program, level)

      return Response.json({
        ...workoutPlan,
        program: normalizedProgram,
      })
    } catch (aiError: any) {
      const fallbackPlan = generateFallbackWorkout(focusAreas, level, selectedWeekdays)
      const normalizedFallbackProgram = normalizeProgramDifficulty(fallbackPlan.program, level)

      return Response.json({
        ...fallbackPlan,
        program: normalizedFallbackProgram,
        fallback: true,
        message: "AI 할당량이 초과되어 기본 템플릿으로 생성되었습니다. 내일 다시 시도해주세요.",
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate workout plan"
    return Response.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}
