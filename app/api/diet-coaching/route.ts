import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { currentCalories, targetCalories, currentProtein, targetProtein, mealsToday, level } = body

    const caloriesRemaining = targetCalories - currentCalories
    const proteinRemaining = targetProtein - currentProtein

    const prompt = `당신은 전문 영양사이자 피트니스 코치입니다. 
사용자의 오늘 식단을 분석하고 남은 목표를 달성하기 위한 맞춤 조언을 제공해주세요.

**현재 상태:**
- 레벨: ${level}
- 섭취 칼로리: ${currentCalories}kcal / 목표: ${targetCalories}kcal (남은 칼로리: ${caloriesRemaining}kcal)
- 섭취 단백질: ${currentProtein}g / 목표: ${targetProtein}g (남은 단백질: ${proteinRemaining}g)
- 오늘 먹은 음식: ${mealsToday.length > 0 ? mealsToday.map((m: any) => m.name).join(", ") : "아직 없음"}

**요청사항:**
1. 현재 식단 분석 및 피드백
2. 남은 칼로리와 단백질을 채우기 위한 구체적인 음식 추천 3가지
3. 운동 효과를 높이기 위한 식사 타이밍 조언
4. 간단한 격려 메시지

한국어로 친근하고 격려하는 톤으로 답변해주세요.`

    if (!genAI) {
      throw new Error("GEMINI_API_KEY is not configured")
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return Response.json({ recommendation: text })
  } catch (error: any) {
    return Response.json({ error: "Failed to generate diet recommendation" }, { status: 500 })
  }
}
