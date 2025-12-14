import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userMessage, currentCalories, targetCalories, currentProtein, targetProtein } = body

    const caloriesRemaining = targetCalories - currentCalories
    const proteinRemaining = targetProtein - currentProtein

    // 1순위: Gemini를 사용해 Gordon Ramsay 스타일 응답 + 분석 JSON 생성
    if (genAI) {
      try {
        const prompt = `너는 고든 램지 스타일로 말하는 한국어 트레이너야.
사용자가 오늘 먹은 음식을 설명하면, 그 내용을 바탕으로 식단을 평가하고 피드백을 줘.

다음 정보를 참고해서 답변해:
- 사용자가 쓴 원문: "${userMessage}"
- 현재까지 섭취한 칼로리: ${currentCalories} kcal / 목표: ${targetCalories} kcal
- 현재까지 섭취한 단백질: ${currentProtein} g / 목표: ${targetProtein} g

JSON 형식으로만 응답해. Markdown, 설명 텍스트는 절대 넣지 마.

형식은 정확히 아래처럼:
{
  "response": "고든 램지 톤의 한글 피드백 한 문단",
  "analysis": {
    "foodName": "한글 음식 이름 요약 (예: 치킨, 샐러드)",
    "isHealthy": true,
    "rating": "Excellent" | "Good" | "Mediocre" | "Terrible",
    "calories": 350,
    "protein": 25,
    "xpChange": 10
  }
}

- rating은 위 네 가지 중 하나만 사용해.
- response는 고든 램지처럼 직설적으로, 하지만 한국어로 작성해.
- xpChange는 건강할수록 높게(예: Excellent=+25, Good≈+10),
  최악일수록 음수(예: Terrible=-20 정도)로 설정해.`

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
        const result = await model.generateContent(prompt)
        const aiResponse = await result.response
        const text = aiResponse.text()

        

        let parsed: any
        try {
          parsed = JSON.parse(text)
        } catch {
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
          if (!jsonMatch) {
            throw new Error("Failed to parse Gemini response JSON")
          }
          parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
        }

        if (!parsed.response || !parsed.analysis) {
          throw new Error("Gemini response missing required fields")
        }

        return Response.json(parsed)
      } catch (aiError) {
        
      }
    }

    // 2순위: 기존 키워드 기반 분석 + Gordon Ramsay 스타일 로컬 응답
    const foodAnalysis = analyzeFoodMessage(userMessage)
    const gordonResponse = generateGordonResponse(foodAnalysis, caloriesRemaining, proteinRemaining)

    const response = {
      response: gordonResponse,
      analysis: {
        foodName: foodAnalysis.foodName,
        isHealthy: foodAnalysis.isHealthy,
        rating: foodAnalysis.rating,
        calories: foodAnalysis.calories,
        protein: foodAnalysis.protein,
        xpChange: foodAnalysis.xpChange,
      },
    }

    return Response.json(response)
  } catch (error: any) {
    const fallbackResponse = {
      response:
        "지금 시스템이 좀 바쁘네! 하지만 내가 봐주지. 음식을 먹었으면 제대로 기록해야지! 건강한 선택을 하고 있길 바라!",
      analysis: {
        foodName: "입력한 음식",
        isHealthy: true,
        rating: "Good" as const,
        calories: 300,
        protein: 20,
        xpChange: 10,
      },
    }

    return Response.json(fallbackResponse, { status: 200 })
  }
}

function analyzeFoodMessage(message: string) {
  const lowerMessage = message.toLowerCase()

  // Healthy foods database
  const healthyFoods = {
    닭가슴살: { calories: 165, protein: 31, rating: "Excellent" },
    연어: { calories: 206, protein: 22, rating: "Excellent" },
    계란: { calories: 155, protein: 13, rating: "Excellent" },
    샐러드: { calories: 150, protein: 8, rating: "Excellent" },
    고구마: { calories: 180, protein: 4, rating: "Good" },
    현미: { calories: 370, protein: 8, rating: "Good" },
    채소: { calories: 80, protein: 3, rating: "Excellent" },
    과일: { calories: 100, protein: 1, rating: "Good" },
    두부: { calories: 140, protein: 15, rating: "Excellent" },
    요거트: { calories: 120, protein: 10, rating: "Good" },
    견과류: { calories: 200, protein: 6, rating: "Good" },
    생선: { calories: 180, protein: 20, rating: "Excellent" },
    소고기: { calories: 250, protein: 26, rating: "Good" },
  }

  // Unhealthy foods database
  const unhealthyFoods = {
    치킨: { calories: 800, protein: 45, rating: "Terrible" },
    피자: { calories: 700, protein: 30, rating: "Terrible" },
    햄버거: { calories: 650, protein: 28, rating: "Terrible" },
    라면: { calories: 500, protein: 10, rating: "Terrible" },
    과자: { calories: 450, protein: 5, rating: "Terrible" },
    아이스크림: { calories: 350, protein: 6, rating: "Mediocre" },
    케이크: { calories: 400, protein: 5, rating: "Terrible" },
    탄산음료: { calories: 150, protein: 0, rating: "Terrible" },
    술: { calories: 200, protein: 0, rating: "Terrible" },
    맥주: { calories: 180, protein: 2, rating: "Terrible" },
    소주: { calories: 240, protein: 0, rating: "Terrible" },
    튀김: { calories: 450, protein: 15, rating: "Mediocre" },
    bbq: { calories: 600, protein: 40, rating: "Mediocre" },
    삼겹살: { calories: 550, protein: 35, rating: "Mediocre" },
  }

  // Check for healthy foods
  for (const [food, data] of Object.entries(healthyFoods)) {
    if (lowerMessage.includes(food)) {
      return {
        foodName: food,
        isHealthy: true,
        rating: data.rating as "Excellent" | "Good",
        calories: data.calories,
        protein: data.protein,
        xpChange: data.rating === "Excellent" ? 25 : 15,
      }
    }
  }

  // Check for unhealthy foods
  for (const [food, data] of Object.entries(unhealthyFoods)) {
    if (lowerMessage.includes(food)) {
      return {
        foodName: food,
        isHealthy: false,
        rating: data.rating as "Terrible" | "Mediocre",
        calories: data.calories,
        protein: data.protein,
        xpChange: data.rating === "Terrible" ? -20 : -10,
      }
    }
  }

  // Default for unknown foods
  return {
    foodName: message,
    isHealthy: true,
    rating: "Good" as const,
    calories: 300,
    protein: 15,
    xpChange: 10,
  }
}

function generateGordonResponse(
  food: ReturnType<typeof analyzeFoodMessage>,
  caloriesRemaining: number,
  proteinRemaining: number,
): string {
  const { foodName, isHealthy, rating, calories, protein } = food

  // Gordon Ramsay style responses
  if (rating === "Excellent") {
    const excellentResponses = [
      `환상적이야! ${foodName}는 완벽한 선택이지! ${calories}kcal에 단백질 ${protein}g... 이게 바로 진짜 운동인의 식단이야! 계속 이렇게만 해! 남은 목표는 칼로리 ${caloriesRemaining}kcal, 단백질 ${proteinRemaining}g이니까 이대로 가자고!`,
      `브라보! ${foodName}... 이건 제대로 된 음식이야! ${calories}kcal, 단백질 ${protein}g로 몸을 챙기는 거, 완벽해! 계속 이런 식으로 먹으면 너의 목표는 금방 달성될 거야!`,
      `이거야! ${foodName}는 최고의 선택이지! 깨끗한 ${calories}kcal와 탄탄한 단백질 ${protein}g! 이게 진짜 챔피언의 식단이라고! 남은 ${caloriesRemaining}kcal도 이렇게만 채워!`,
    ]
    return excellentResponses[Math.floor(Math.random() * excellentResponses.length)]
  }

  if (rating === "Good") {
    const goodResponses = [
      `좋아, ${foodName}... 나쁘지 않아! ${calories}kcal에 단백질 ${protein}g. 괜찮은 선택이야. 하지만 단백질을 좀 더 챙겨야 해! 남은 목표 ${caloriesRemaining}kcal, 단백질 ${proteinRemaining}g 잊지 마!`,
      `오케이! ${foodName}로 ${calories}kcal를 챙겼구나. 단백질 ${protein}g도 괜찮아. 이 정도면 합격이야! 계속 이런 식으로 균형을 맞춰봐!`,
      `음, ${foodName}... 합격점이야! ${calories}kcal와 단백질 ${protein}g. 나쁘지 않지만 더 나은 선택도 있다는 걸 잊지 마! 남은 목표 열심히 채워!`,
    ]
    return goodResponses[Math.floor(Math.random() * goodResponses.length)]
  }

  if (rating === "Mediocre") {
    const mediocreResponses = [
      `아... ${foodName}? 진짜야? ${calories}kcal나 되는 걸 먹고... 단백질 ${protein}g은 그나마 다행이지만, 이건 좋은 선택이 아니야! 다음엔 더 신경 써서 먹어! 남은 칼로리 ${caloriesRemaining}kcal는 제대로 채우라고!`,
      `${foodName}라고? 세상에... ${calories}kcal에 단백질은 겨우 ${protein}g? 이건 그냥 그런 선택이야. 더 나은 음식도 많은데 왜 이걸 골랐어? 정신 차리고 다음엔 제대로 먹어!`,
      `이봐, ${foodName}는 최악은 아니지만... ${calories}kcal 치고는 영양이 별로야! 단백질 ${protein}g으로는 부족해! 다음엔 더 똑똑한 선택을 해봐!`,
    ]
    return mediocreResponses[Math.floor(Math.random() * mediocreResponses.length)]
  }

  // Terrible
  const terribleResponses = [
    `뭐? ${foodName}?! 너 지금 장난해?! ${calories}kcal나 되는 쓰레기 음식을 먹다니! 단백질 ${protein}g도 형편없어! 이런 식으로 먹으면 절대 목표 달성 못 해! 정신 차려! 남은 목표가 칼로리 ${caloriesRemaining}kcal, 단백질 ${proteinRemaining}g인데 제발 제대로 된 음식 좀 먹어!`,
    `이게 뭐야?! ${foodName}?! ${calories}kcal의 재앙이잖아! 단백질 ${protein}g으로는 아무것도 안 돼! 이건 음식이 아니라 독약이야! 다음엔 뇌를 좀 써서 먹어라!`,
    `${foodName}... 최악이야! ${calories}kcal나 때려 넣고 단백질은 겨우 ${protein}g? 이건 운동인의 식단이 아니야! 완전히 엉망진창이지! 당장 고쳐!`,
    `세상에! ${foodName}를 먹었다고?! ${calories}kcal의 끔찍한 선택이야! 이렇게 먹으면 몸이 망가질 거야! 제발 다음엔 제대로 된 음식을 먹어! 이건 실패야!`,
  ]
  return terribleResponses[Math.floor(Math.random() * terribleResponses.length)]
}
