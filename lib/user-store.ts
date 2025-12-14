export interface UserProgress {
  level: 1 | 2 | 3 | 4 | 5
  currentXP: number
  totalXP: number
  muscleMass: number
  bodyFat: number
  baseMuscleMass: number
  baseBodyFat: number
  height: number // in cm
  weight: number // in kg
  // 선택 입력: 목표 값들 (없을 수 있음)
  targetWeight?: number | null
  targetMuscleMass?: number | null
  targetBodyFat?: number | null
  points: number
  workoutsCompleted: number
  currentStreak: number
  // 연속 출석 일수 (출석 기준)
  attendanceStreak: number
  // 사용자가 실제로 운동을 완료한 날짜들 (YYYY-MM-DD)
  workoutDates: string[]
  completedDays: Record<string, boolean>
  // 요일별 수동 운동 기록 횟수 (일정 탭의 "기록하기" 버튼 사용 횟수, 최대 5회 권장)
  manualWorkoutCounts: Record<string, number>
  // 사용자가 수동으로 기록한 운동 내역 (날짜/운동명/세트/반복)
  manualWorkoutLogs: {
    dateKey: string
    exercise: string
    sets: number
    reps: number
  }[]
  lastWorkoutDate: string | null
  dailyCalories: number
  targetCalories: number
  dailyProtein: number
  targetProtein: number
  mealsToday: DietMeal[]
  mealHistory: DietMeal[] // Added meal history to store all past meals
  inventory: InventoryItem[]
  customPrograms: AIWorkoutProgram[]
  activeProgram: string | null // program ID
  currentWorkoutDay: string | null
  orders: Order[]
  shippingAddress: ShippingAddress | null
  attendanceDates: string[] // Array of date strings in format YYYY-MM-DD
  achievements: Achievement[] // Added achievements array
  monsterLevel: number
}

export interface DietMeal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  date: string // Added date field to track when meal was eaten
  evaluation?: string // Added evaluation field to store AI's feedback
}

export interface InventoryItem {
  id: string
  name: string
  type: "equipment" | "supplement" | "avatar"
  description: string
  effect: string
  owned: boolean
  equipped: boolean
}

export interface AIWorkoutProgram {
  id: string
  name: string
  createdAt: string
  focusAreas: string[]
  level: string
  // 과거/다른 코드에서 사용할 수 있는 난이도 별칭을 위해 선택적으로 남겨둔 필드
  difficulty?: string
  daysPerWeek: number
  days: {
    day: string
    focus: string
    exercises: {
      name: string
      sets: number
      reps: number
      muscleGroup: string
      difficulty: string
    }[]
  }[]
}

export interface ShippingAddress {
  name: string
  phone: string
  zipCode: string
  address: string
  detailAddress: string
}

export interface Order {
  id: string
  itemId: string
  itemName: string
  itemImage: string
  points: number
  status: "preparing" | "shipping" | "delivered"
  orderedAt: string
  deliveredAt: string | null
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "workout" | "diet" | "streak" | "level" | "special"
  requirement: number
  currentProgress: number
  completed: boolean
  completedAt: string | null
  reward: {
    xp: number
    points: number
  }
}

const XP_PER_LEVEL = [0, 1000, 2500, 5000, 10000, 20000]

export class UserStore {
  private static STORAGE_KEY = "deukgeun_user_progress"

  static getDefaultProgress(): UserProgress {
    return {
      level: 1,
      currentXP: 0,
      totalXP: 0,
      muscleMass: 25.0,
      bodyFat: 22.0,
      baseMuscleMass: 25.0,
      baseBodyFat: 22.0,
      height: 170, // default 170cm
      weight: 70, // default 70kg
      points: 0,
      workoutsCompleted: 0,
      currentStreak: 0,
      attendanceStreak: 0,
      workoutDates: [],
      completedDays: {},
      manualWorkoutCounts: {},
      manualWorkoutLogs: [],
      lastWorkoutDate: null,
      dailyCalories: 0,
      targetCalories: 2500,
      dailyProtein: 0,
      targetProtein: 150,
      mealsToday: [],
      mealHistory: [], // Initialize meal history array
      inventory: [],
      customPrograms: [],
      activeProgram: null,
      currentWorkoutDay: null,
      orders: [],
      shippingAddress: null,
      attendanceDates: [],
      achievements: this.getDefaultAchievements(), // Initialize achievements
      monsterLevel: 1,
    }
  }

  static getDefaultAchievements(): Achievement[] {
    return [
      {
        id: "first-workout",
        title: "첫 운동 완료",
        description: "첫 번째 운동을 완료하세요",
        icon: "💪",
        category: "workout",
        requirement: 1,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 50, points: 100 },
      },
      {
        id: "workout-10",
        title: "운동 10회 달성",
        description: "총 10회의 운동을 완료하세요",
        icon: "🔥",
        category: "workout",
        requirement: 10,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 200, points: 500 },
      },
      {
        id: "workout-50",
        title: "운동 마니아",
        description: "총 50회의 운동을 완료하세요",
        icon: "⚡",
        category: "workout",
        requirement: 50,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 500, points: 1000 },
      },
      {
        id: "workout-100",
        title: "운동의 신",
        description: "총 100회의 운동을 완료하세요",
        icon: "👑",
        category: "workout",
        requirement: 100,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 1000, points: 2000 },
      },
      {
        id: "streak-3",
        title: "3일 연속 출석",
        description: "3일 연속으로 출석하세요",
        icon: "🎯",
        category: "streak",
        requirement: 3,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 100, points: 200 },
      },
      {
        id: "streak-7",
        title: "일주일 챌린지",
        description: "7일 연속으로 출석하세요",
        icon: "🌟",
        category: "streak",
        requirement: 7,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 300, points: 500 },
      },
      {
        id: "streak-30",
        title: "한 달 챌린지",
        description: "30일 연속으로 출석하세요",
        icon: "🏆",
        category: "streak",
        requirement: 30,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 1000, points: 2000 },
      },
      {
        id: "level-2",
        title: "초보 탈출",
        description: "레벨 2에 도달하세요",
        icon: "🎖️",
        category: "level",
        requirement: 2,
        currentProgress: 1,
        completed: false,
        completedAt: null,
        reward: { xp: 100, points: 300 },
      },
      {
        id: "level-3",
        title: "중급자 등극",
        description: "레벨 3에 도달하세요",
        icon: "🥈",
        category: "level",
        requirement: 3,
        currentProgress: 1,
        completed: false,
        completedAt: null,
        reward: { xp: 300, points: 500 },
      },
      {
        id: "level-5",
        title: "근육의 신",
        description: "최고 레벨인 레벨 5에 도달하세요",
        icon: "🥇",
        category: "level",
        requirement: 5,
        currentProgress: 1,
        completed: false,
        completedAt: null,
        reward: { xp: 1000, points: 3000 },
      },
      {
        id: "healthy-meal-10",
        title: "건강한 식습관",
        description: "건강한 음식을 10번 먹으세요",
        icon: "🥗",
        category: "diet",
        requirement: 10,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 200, points: 400 },
      },
      {
        id: "protein-goal-7",
        title: "단백질 마스터",
        description: "일일 단백질 목표를 7일 달성하세요",
        icon: "🍗",
        category: "diet",
        requirement: 7,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 300, points: 600 },
      },
      {
        id: "perfect-week",
        title: "완벽한 한 주",
        description: "일주일 동안 매일 운동하고 출석하세요",
        icon: "✨",
        category: "special",
        requirement: 7,
        currentProgress: 0,
        completed: false,
        completedAt: null,
        reward: { xp: 500, points: 1000 },
      },
    ]
  }

  static loadProgress(): UserProgress {
    if (typeof window === "undefined") return this.getDefaultProgress()

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return this.getDefaultProgress()

    try {
      const parsed = JSON.parse(stored)
      const defaultProgress = this.getDefaultProgress()

      const attendanceDates = parsed.attendanceDates || []
      const workoutDates = parsed.workoutDates || []

      return {
        ...defaultProgress,
        ...parsed,
        height: parsed.height ?? 170,
        weight: parsed.weight ?? 70,
        baseMuscleMass: parsed.baseMuscleMass ?? parsed.muscleMass ?? 25.0,
        baseBodyFat: parsed.baseBodyFat ?? parsed.bodyFat ?? 22.0,
        customPrograms: parsed.customPrograms || [],
        activeProgram: parsed.activeProgram || null,
        currentWorkoutDay: parsed.currentWorkoutDay || null,
        mealsToday: parsed.mealsToday || [],
        mealHistory: parsed.mealHistory || [], // Load meal history
        inventory: parsed.inventory || [],
          completedDays: parsed.completedDays || {},
          manualWorkoutCounts: parsed.manualWorkoutCounts || {},
          manualWorkoutLogs: parsed.manualWorkoutLogs || [],
        orders: parsed.orders || [],
        shippingAddress: parsed.shippingAddress || null,
        attendanceDates,
        workoutDates,
        // 과거 데이터에도 맞춰서, 출석/운동 streak 를 각각 다시 계산
        attendanceStreak:
          typeof parsed.attendanceStreak === "number"
            ? parsed.attendanceStreak
            : this.calculateAttendanceStreak(attendanceDates),
        currentStreak:
          typeof parsed.currentStreak === "number"
            ? parsed.currentStreak
            : this.calculateAttendanceStreak(workoutDates),
        achievements: parsed.achievements || this.getDefaultAchievements(), // Load achievements
        monsterLevel: parsed.monsterLevel || 1,
      }
    } catch {
      return this.getDefaultProgress()
    }
  }

  static saveProgress(progress: UserProgress): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress))
  }

  static addXP(progress: UserProgress, xp: number): UserProgress {
    const newProgress = { ...progress }
    newProgress.currentXP += xp
    newProgress.totalXP += xp

    // Check for level up
    while (newProgress.level < 5 && newProgress.currentXP >= XP_PER_LEVEL[newProgress.level + 1]) {
      newProgress.currentXP -= XP_PER_LEVEL[newProgress.level + 1]
      newProgress.level = (newProgress.level + 1) as 1 | 2 | 3 | 4 | 5
    }

    return this.checkAchievements(newProgress) // Check achievements after XP change
  }

  static getXPForNextLevel(progress: UserProgress): number {
    if (progress.level >= 5) return 0
    return XP_PER_LEVEL[progress.level + 1]
  }

  static getXPProgress(progress: UserProgress): number {
    if (progress.level >= 5) return 100
    const nextLevelXP = XP_PER_LEVEL[progress.level + 1]
    return (progress.currentXP / nextLevelXP) * 100
  }

  static completeWorkout(progress: UserProgress, dayKey: string): UserProgress {
    let newProgress = { ...progress }
    newProgress.workoutsCompleted += 1
    newProgress.completedDays[dayKey] = true
    newProgress.points += 100

    // 운동을 완료한 날짜를 기준으로 연속 일수(currentStreak)를 계산한다.
    // 출석 버튼과는 별도로, 실제 운동 완료일만 streak에 반영된다.
    newProgress = this.registerWorkoutDay(newProgress, new Date())

    newProgress = this.advanceToNextWorkoutDay(newProgress)

    // 운동 관련 업적은 streak와 workoutsCompleted를 기반으로 하므로, 여기서 체크한다.
    newProgress = this.checkAchievements(newProgress)

    return newProgress
  }

  static addMeal(progress: UserProgress, meal: DietMeal): UserProgress {
    const newProgress = { ...progress }
    newProgress.mealsToday.push(meal)
    newProgress.mealHistory.push(meal) // Also add to meal history
    newProgress.dailyCalories += meal.calories
    newProgress.dailyProtein += meal.protein
    return newProgress
  }

  static checkAchievements(progress: UserProgress): UserProgress {
    let newProgress = { ...progress }
    let hasNewAchievement = false

    newProgress.achievements = newProgress.achievements.map((achievement) => {
      if (achievement.completed) return achievement

      let currentProgress = achievement.currentProgress

      // Update progress based on achievement type
      switch (achievement.category) {
        case "workout":
          currentProgress = progress.workoutsCompleted
          break
        case "streak":
          // streak 업적은 "연속 출석" 기준으로 계산
          currentProgress = progress.attendanceStreak
          break
        case "level":
          currentProgress = progress.level
          break
        case "diet":
          if (achievement.id === "healthy-meal-10") {
            // Count healthy meals from meal history
            currentProgress = progress.mealHistory.filter(
              (meal) =>
                meal.evaluation?.includes("좋은") ||
                meal.evaluation?.includes("훌륭") ||
                meal.evaluation?.includes("완벽"),
            ).length
          } else if (achievement.id === "protein-goal-7") {
            // This would need a separate tracker, for now use a simple count
            currentProgress = achievement.currentProgress
          }
          break
        case "special":
          if (achievement.id === "perfect-week") {
            // 완벽한 한 주: 7일 연속 출석 + 7회 이상 운동
            const hasPerfectWeek =
              progress.attendanceStreak >= 7 && progress.workoutsCompleted >= 7
            currentProgress = hasPerfectWeek ? 7 : progress.attendanceStreak
          }
          break
      }

      // Check if achievement is completed
      if (currentProgress >= achievement.requirement && !achievement.completed) {
        hasNewAchievement = true
        return {
          ...achievement,
          currentProgress,
          completed: true,
          completedAt: new Date().toISOString(),
        }
      }

      return {
        ...achievement,
        currentProgress,
      }
    })

    // Award rewards for newly completed achievements
    if (hasNewAchievement) {
      newProgress.achievements.forEach((achievement) => {
        if (achievement.completed && achievement.completedAt) {
          const completedTime = new Date(achievement.completedAt).getTime()
          const now = Date.now()
          // If completed within last second, it's new
          if (now - completedTime < 1000) {
            newProgress = this.addXP(newProgress, achievement.reward.xp)
            newProgress.points += achievement.reward.points
          }
        }
      })
    }

    return newProgress
  }

  static resetDailyMeals(progress: UserProgress): UserProgress {
    return {
      ...progress,
      dailyCalories: 0,
      dailyProtein: 0,
      mealsToday: [],
    }
  }

  static createOrder(
    progress: UserProgress,
    item: { id: string; name: string; image: string },
    cost: number,
  ): UserProgress {
    if (progress.points < cost) return progress

    const newProgress = { ...progress }
    newProgress.points -= cost

    const order: Order = {
      id: `order-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      itemImage: item.image,
      points: cost,
      status: "preparing",
      orderedAt: new Date().toISOString(),
      deliveredAt: null,
    }

    newProgress.orders.push(order)
    return newProgress
  }

  static updateShippingAddress(progress: UserProgress, address: ShippingAddress): UserProgress {
    return {
      ...progress,
      shippingAddress: address,
    }
  }

  static updateOrderStatus(progress: UserProgress, orderId: string, status: Order["status"]): UserProgress {
    const newProgress = { ...progress }
    newProgress.orders = newProgress.orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status,
            deliveredAt: status === "delivered" ? new Date().toISOString() : order.deliveredAt,
          }
        : order,
    )
    return newProgress
  }

  static setActiveProgram(progress: UserProgress, programId: string | null): UserProgress {
    return {
      ...progress,
      activeProgram: programId,
    }
  }

  static getActiveProgram(progress: UserProgress): AIWorkoutProgram | null {
    if (!progress.activeProgram) return null
    return progress.customPrograms.find((p) => p.id === progress.activeProgram) || null
  }

  static advanceToNextWorkoutDay(progress: UserProgress): UserProgress {
    const newProgress = { ...progress }
    const activeProgram = this.getActiveProgram(progress)

    if (!activeProgram) return newProgress

    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    const currentDayIndex = dayNames.indexOf(newProgress.currentWorkoutDay || "")

    // Find next workout day
    for (let i = 1; i <= 7; i++) {
      const nextIndex = (currentDayIndex + i) % 7
      const nextDay = dayNames[nextIndex]
      if (activeProgram.days.some((d) => d.day === nextDay)) {
        newProgress.currentWorkoutDay = nextDay
        break
      }
    }

    return newProgress
  }

  static updateBodyStats(
    progress: UserProgress,
    muscleMass: number,
    bodyFat: number,
    height: number,
    weight: number,
  ): UserProgress {
    // 직전 값은 기준값(base*)으로 남기고, 새로 입력한 값으로 현재를 갱신
    return {
      ...progress,
      baseMuscleMass: progress.muscleMass,
      baseBodyFat: progress.bodyFat,
      muscleMass,
      bodyFat,
      height,
      weight,
    }
  }

  static calculateBMI(progress: UserProgress): number {
    if (!progress.height || !progress.weight) return 0
    const heightInMeters = progress.height / 100
    return progress.weight / (heightInMeters * heightInMeters)
  }

  static saveCustomProgram(progress: UserProgress, program: AIWorkoutProgram): UserProgress {
    const newProgress = { ...progress }

    // Initialize customPrograms array if it doesn't exist
    if (!newProgress.customPrograms) {
      newProgress.customPrograms = []
    }

    // Add the new program
    newProgress.customPrograms.push(program)

    // Set as active program
    newProgress.activeProgram = program.id

    // Set the first workout day from the program
    if (program.days && program.days.length > 0) {
      newProgress.currentWorkoutDay = program.days[0].day
    }

    return newProgress
  }

  static markAttendance(progress: UserProgress, date: Date): UserProgress {
    const newProgress = { ...progress }
    const dateString = this.formatDate(date)

    // Check if already marked
    if (!newProgress.attendanceDates.includes(dateString)) {
      newProgress.attendanceDates.push(dateString)
      newProgress.points += 10 // Reward for attendance
    }

    // 출석 기준 연속 일수(attendanceStreak)를 갱신한다.
    newProgress.attendanceStreak = this.calculateAttendanceStreak(newProgress.attendanceDates)

    return this.checkAchievements(newProgress)
  }

  static formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  static calculateAttendanceStreak(attendanceDates: string[]): number {
    if (attendanceDates.length === 0) return 0

    // Sort dates in descending order
    const sortedDates = [...attendanceDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)

      const expectedDateString = this.formatDate(checkDate)

      if (sortedDates.includes(expectedDateString)) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  // 운동을 완료한 날짜를 기록하고, 이를 기준으로 연속 운동 일수를 계산한다.
  static registerWorkoutDay(progress: UserProgress, date: Date): UserProgress {
    const newProgress = { ...progress }
    const dateString = this.formatDate(date)

    if (!newProgress.workoutDates.includes(dateString)) {
      newProgress.workoutDates.push(dateString)
    }

    newProgress.currentStreak = this.calculateAttendanceStreak(newProgress.workoutDates)

    return newProgress
  }

  static isAttendanceMarked(progress: UserProgress, date: Date): boolean {
    const dateString = this.formatDate(date)
    return progress.attendanceDates.includes(dateString)
  }

  static updateMonsterLevel(progress: UserProgress, level: number): UserProgress {
    return {
      ...progress,
      monsterLevel: level,
    }
  }
}
