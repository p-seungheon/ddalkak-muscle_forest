import type { InventoryItem } from "./user-store"

export interface StoreItem extends InventoryItem {
  price: number
  image: string
}

export const STORE_ITEMS: StoreItem[] = [
  {
    id: "item-1",
    name: "트레이닝 헤드밴드",
    type: "equipment",
    description: "운동 시 땀을 효과적으로 흡수",
    effect: "운동 XP +5%",
    price: 500,
    image: "/red-workout-headband.jpg",
    owned: false,
    equipped: false,
  },
  {
    id: "item-2",
    name: "리프팅 스트랩",
    type: "equipment",
    description: "데드리프트와 풀업에 필수",
    effect: "운동 XP +10%",
    price: 800,
    image: "/lifting-straps-gym.jpg",
    owned: false,
    equipped: false,
  },
  {
    id: "item-3",
    name: "프로틴 부스터",
    type: "supplement",
    description: "하루 단백질 목표 +20g",
    effect: "단백질 목표 +20g",
    price: 300,
    image: "/protein-powder.png",
    owned: false,
    equipped: false,
  },
  {
    id: "item-4",
    name: "골드 헬스장 패스",
    type: "equipment",
    description: "제휴 헬스장 1달 패스권",
    effect: "전체 운동 접근권",
    price: 5000,
    image: "/gold-gym-membership-card.jpg",
    owned: false,
    equipped: false,
  },
]
