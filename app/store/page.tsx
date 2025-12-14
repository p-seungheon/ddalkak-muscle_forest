"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Truck,
  MapPin,
  Home,
  Utensils,
  Dumbbell,
  Calendar,
  Trophy,
  Grid3x3,
  List,
} from "lucide-react"
import Link from "next/link"
import { UserStore, type ShippingAddress, type Order } from "@/lib/user-store"
import { STORE_ITEMS, type StoreItem } from "@/lib/store-data"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SortOption = "recommended" | "name" | "price"
type ViewMode = "grid" | "list"

export default function StorePage() {
  const [progress, setProgress] = useState(UserStore.getDefaultProgress())
  const [selectedTab, setSelectedTab] = useState<"products" | "orders">("products")
  const [activeTab, setActiveTab] = useState<"home" | "diet" | "workout" | "schedule" | "hall-of-fame" | "store">(
    "store",
  )
  const [sortBy, setSortBy] = useState<SortOption>("recommended")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [shippingForm, setShippingForm] = useState<ShippingAddress>({
    name: "",
    phone: "",
    zipCode: "",
    address: "",
    detailAddress: "",
  })

  useEffect(() => {
    const loaded = UserStore.loadProgress()
    setProgress(loaded)
    if (loaded.shippingAddress) {
      setShippingForm(loaded.shippingAddress)
    }
  }, [])

  const getSortedItems = () => {
    const items = [...STORE_ITEMS]
    switch (sortBy) {
      case "name":
        return items.sort((a, b) => a.name.localeCompare(b.name))
      case "price":
        return items.sort((a, b) => a.price - b.price)
      case "recommended":
      default:
        return items
    }
  }

  const handlePurchaseClick = (item: StoreItem) => {
    if (progress.points < item.price) {
      alert("포인트가 부족합니다")
      return
    }

    const addr = progress.shippingAddress
    if (!addr || !addr.name || !addr.phone || !addr.zipCode || !addr.address) {
      alert("상품을 주문하기 전에 배송지를 먼저 입력해주세요.")
      setShowAddressDialog(true)
      return
    }

    setSelectedItem(item)
    setShowPurchaseDialog(true)
  }

  const confirmPurchase = () => {
    if (!selectedItem) return

    const updated = UserStore.createOrder(
      progress,
      {
        id: selectedItem.id,
        name: selectedItem.name,
        image: selectedItem.image,
      },
      selectedItem.price,
    )
    UserStore.saveProgress(updated)
    setProgress(updated)
    setShowPurchaseDialog(false)
    setSelectedItem(null)
  }

  const saveShippingAddress = () => {
    if (!shippingForm.name || !shippingForm.phone || !shippingForm.zipCode || !shippingForm.address) {
      alert("필수 항목을 모두 입력해주세요")
      return
    }

    const phoneDigits = shippingForm.phone.replace(/\D/g, "") // 숫자만 추출
    let formattedPhone = phoneDigits

    if (phoneDigits.length === 11) {
      // 010-1234-5678
      formattedPhone = `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3, 7)}-${phoneDigits.slice(7)}`
    } else if (phoneDigits.length === 10) {
      // 010-123-5678
      formattedPhone = `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`
    }

    const formattedShippingForm = {
      ...shippingForm,
      phone: formattedPhone,
    }

    const updated = UserStore.updateShippingAddress(progress, formattedShippingForm)
    UserStore.saveProgress(updated)
    setProgress(updated)
    setShowAddressDialog(false)
    alert("배송지가 저장되었습니다")
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "preparing":
        return "배송 준비중"
      case "shipping":
        return "배송중"
      case "delivered":
        return "배송 완료"
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800 dark:bg-amber-900 dark:text-amber-200"
      case "shipping":
        return "bg-blue-100 text-blue-800 dark:bg-sky-900 dark:text-sky-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-emerald-900 dark:text-emerald-200"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 scrollbar-hide">
      <div className="mx-auto max-w-[430px]">
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="flex items-center gap-4 px-5 py-4">
            <Link href="/">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <h1 className="text-lg font-black tracking-tight">스토어</h1>
            <div className="ml-auto flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="font-mono font-bold">{progress.points.toLocaleString()}P</span>
            </div>
          </div>
        </header>

        <div className="border-b border-border px-5">
          <div className="flex gap-6">
            <button
              onClick={() => setSelectedTab("products")}
              className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                selectedTab === "products" ? "border-black text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              상품
            </button>
            <button
              onClick={() => setSelectedTab("orders")}
              className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                selectedTab === "orders" ? "border-black text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              주문/배송
            </button>
          </div>
        </div>

        {selectedTab === "products" ? (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("recommended")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    sortBy === "recommended" ? "bg-black text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  추천순
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    sortBy === "name" ? "bg-black text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  이름순
                </button>
                <button
                  onClick={() => setSortBy("price")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    sortBy === "price" ? "bg-black text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  가격순
                </button>
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-muted/80"
                  }`}
                  aria-label="그리드 뷰"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-muted/80"
                  }`}
                  aria-label="리스트 뷰"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-4">
                {getSortedItems().map((item) => (
                  <Card key={item.id} className="p-4 flex flex-col">
                    <div className="relative aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>

                    <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{item.description}</p>

                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handlePurchaseClick(item)}
                      disabled={progress.points < item.price}
                    >
                      {item.price.toLocaleString()}P 구매
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getSortedItems().map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handlePurchaseClick(item)}
                          disabled={progress.points < item.price}
                        >
                          {item.price.toLocaleString()}P 구매
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-5">
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <h3 className="font-bold text-sm">배송지 정보</h3>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowAddressDialog(true)}>
                  {progress.shippingAddress ? "수정" : "등록"}
                </Button>
              </div>
              {progress.shippingAddress ? (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">{progress.shippingAddress.name}</p>
                  <p>{progress.shippingAddress.phone}</p>
                  <p>
                    ({progress.shippingAddress.zipCode}) {progress.shippingAddress.address}
                  </p>
                  <p>{progress.shippingAddress.detailAddress}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">배송지를 등록해주세요</p>
              )}
            </Card>

            <div className="space-y-3">
              {progress.orders.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">주문 내역이 없습니다</p>
                </Card>
              ) : (
                progress.orders
                  .slice()
                  .reverse()
                  .map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={order.itemImage || "/placeholder.svg"}
                            alt={order.itemName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-sm">{order.itemName}</h4>
                            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{order.points.toLocaleString()}P</p>
                          <p className="text-xs text-muted-foreground">
                            주문일: {new Date(order.orderedAt).toLocaleDateString()}
                          </p>
                          {order.status === "shipping" && (
                            <div className="flex items-center gap-1 mt-2 text-blue-600 dark:text-sky-300">
                              <Truck className="w-3 h-3" />
                              <span className="text-xs font-medium">배송중입니다</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>상품 구매</DialogTitle>
            <DialogDescription>포인트로 실제 상품을 구매하시겠습니까?</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4">
              <div className="flex gap-3 mb-4">
                <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={selectedItem.image || "/placeholder.svg"}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{selectedItem.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{selectedItem.description}</p>
                  <p className="font-bold text-sm">{selectedItem.price.toLocaleString()}P</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 dark:bg-amber-900 dark:border-amber-800 rounded-lg p-3 text-xs text-yellow-800 dark:text-amber-100">
                등록된 배송지로 상품이 배송됩니다. 배송지 변경이 필요하면 주문 전 먼저 수정해주세요.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
              취소
            </Button>
            <Button onClick={confirmPurchase}>구매하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-sm w-[calc(100%-3rem)] mx-auto">
          <DialogHeader>
            <DialogTitle>배송지 정보</DialogTitle>
            <DialogDescription>상품을 받으실 주소를 입력해주세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="mb-1.5 block">
                받는 분 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={shippingForm.name}
                onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                placeholder="딸깍"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-1.5 block">
                연락처 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={shippingForm.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "") // 숫자만 허용
                  setShippingForm({ ...shippingForm, phone: value })
                }}
                placeholder="01012345678"
                maxLength={11}
              />
            </div>
            <div>
              <Label htmlFor="zipCode" className="mb-1.5 block">
                우편번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                type="tel"
                value={shippingForm.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "") // 숫자만 허용
                  setShippingForm({ ...shippingForm, zipCode: value })
                }}
                placeholder="08221"
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="address" className="mb-1.5 block">
                주소 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={shippingForm.address}
                onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                placeholder="서울시 구로구 경인로 445"
              />
            </div>
            <div>
              <Label htmlFor="detailAddress" className="mb-1.5 block">
                상세주소
              </Label>
              <Input
                id="detailAddress"
                value={shippingForm.detailAddress}
                onChange={(e) => setShippingForm({ ...shippingForm, detailAddress: e.target.value })}
                placeholder="3호관 302호"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">*</span> = 필수 정보
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
              취소
            </Button>
            <Button onClick={saveShippingAddress}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "home" ? "opacity-100" : "opacity-40"
            }`}
            onClick={() => setActiveTab("home")}
          >
            <Home className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">홈</span>
          </Link>
          <Link
            href="/diet"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "diet" ? "opacity-100" : "opacity-40"
            }`}
            onClick={() => setActiveTab("diet")}
          >
            <Utensils className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">식단</span>
          </Link>
          <Link
            href="/workout"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "workout" ? "opacity-100" : "opacity-40"
            }`}
            onClick={() => setActiveTab("workout")}
          >
            <Dumbbell className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">운동</span>
          </Link>
          <Link
            href="/schedule"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "schedule" ? "opacity-100" : "opacity-40"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium whitespace-nowrap">일정</span>
          </Link>
          <Link
            href="/hall-of-fame"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-opacity w-full ${
              activeTab === "hall-of-fame" ? "opacity-100" : "opacity-40"
            }`}
            onClick={() => setActiveTab("hall-of-fame")}
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
  )
}
