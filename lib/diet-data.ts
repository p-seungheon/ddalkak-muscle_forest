export interface FoodItem {
  id: string
  name: string
  category: "단백질" | "탄수화물" | "채소" | "지방" | "간식"
  calories: number
  protein: number
  carbs: number
  fat: number
  serving: string
}

export const FOOD_DATABASE: FoodItem[] = [
  // 단백질
  { id: "1", name: "닭가슴살", category: "단백질", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
  { id: "2", name: "계란", category: "단백질", calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: "2개" },
  { id: "3", name: "연어", category: "단백질", calories: 206, protein: 22, carbs: 0, fat: 13, serving: "100g" },
  { id: "4", name: "소고기", category: "단백질", calories: 250, protein: 26, carbs: 0, fat: 17, serving: "100g" },
  {
    id: "5",
    name: "프로틴 쉐이크",
    category: "단백질",
    calories: 120,
    protein: 25,
    carbs: 3,
    fat: 1,
    serving: "1스쿱",
  },

  // 탄수화물
  { id: "6", name: "현미밥", category: "탄수화물", calories: 370, protein: 7.5, carbs: 77, fat: 2.7, serving: "1공기" },
  { id: "7", name: "고구마", category: "탄수화물", calories: 140, protein: 2, carbs: 32, fat: 0.2, serving: "중 1개" },
  { id: "8", name: "오트밀", category: "탄수화물", calories: 150, protein: 5, carbs: 27, fat: 3, serving: "40g" },
  { id: "9", name: "바나나", category: "탄수화물", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: "1개" },

  // 채소
  { id: "10", name: "브로콜리", category: "채소", calories: 55, protein: 4, carbs: 11, fat: 0.6, serving: "1컵" },
  { id: "11", name: "시금치", category: "채소", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: "1컵" },
  { id: "12", name: "샐러드", category: "채소", calories: 50, protein: 2, carbs: 8, fat: 1.5, serving: "1그릇" },

  // 지방
  { id: "13", name: "아보카도", category: "지방", calories: 234, protein: 3, carbs: 12, fat: 21, serving: "1개" },
  { id: "14", name: "견과류", category: "지방", calories: 170, protein: 6, carbs: 6, fat: 15, serving: "30g" },
  { id: "15", name: "올리브오일", category: "지방", calories: 119, protein: 0, carbs: 0, fat: 13.5, serving: "1스푼" },
]
