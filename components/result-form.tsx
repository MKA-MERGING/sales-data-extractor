"use client"

import type { Dispatch, SetStateAction } from "react"
import { Banknote, CalendarDays, CreditCard, QrCode, Sun, Moon, Users, Wallet, MoreHorizontal } from "lucide-react"

export type ServiceType = "lunch" | "dinner" | null

export type SalesData = {
  date: string
  serviceType: ServiceType
  totalSales: string
  customerCount: string
  payment: {
    cash: string
    credit: string
    qr: string
    other: string
  }
}

type ResultFormProps = {
  data: SalesData
  setData: Dispatch<SetStateAction<SalesData>>
}

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

export function ResultForm({ data, setData }: ResultFormProps) {
  function updateField<K extends keyof SalesData>(key: K, value: SalesData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function updatePayment(key: keyof SalesData["payment"], value: string) {
    setData((prev) => ({ ...prev, payment: { ...prev.payment, [key]: value } }))
  }

  return (
    <div className="space-y-6">
      {/* 日付 */}
      <div className="space-y-2">
        <label htmlFor="date" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <CalendarDays className="size-4 text-muted-foreground" />
          日付
        </label>
        <input
          id="date"
          type="date"
          value={data.date}
          onChange={(e) => updateField("date", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* 区分 */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-foreground">区分</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={data.serviceType === "lunch"}
            onClick={() => updateField("serviceType", "lunch")}
            className={`flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
              data.serviceType === "lunch"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground hover:bg-muted"
            }`}
          >
            <Sun className="size-4" />
            ランチ
          </button>
          <button
            type="button"
            aria-pressed={data.serviceType === "dinner"}
            onClick={() => updateField("serviceType", "dinner")}
            className={`flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
              data.serviceType === "dinner"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground hover:bg-muted"
            }`}
          >
            <Moon className="size-4" />
            ディナー
          </button>
        </div>
      </div>

      {/* 総売上・客数 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="total" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Wallet className="size-4 text-muted-foreground" />
            総売上金額
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ¥
            </span>
            <input
              id="total"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              value={data.totalSales}
              onChange={(e) => updateField("totalSales", e.target.value)}
              className={`${inputClass} pl-7`}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="customers" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Users className="size-4 text-muted-foreground" />
            客数
          </label>
          <div className="relative">
            <input
              id="customers"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              value={data.customerCount}
              onChange={(e) => updateField("customerCount", e.target.value)}
              className={`${inputClass} pr-9`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              人
            </span>
          </div>
        </div>
      </div>

      {/* 決済内訳 */}
      <div className="space-y-3">
        <span className="block text-sm font-medium text-foreground">決済内訳</span>
        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
          <PaymentRow
            icon={<Banknote className="size-4" />}
            label="現金"
            value={data.payment.cash}
            onChange={(v) => updatePayment("cash", v)}
          />
          <PaymentRow
            icon={<CreditCard className="size-4" />}
            label="クレジットカード"
            value={data.payment.credit}
            onChange={(v) => updatePayment("credit", v)}
          />
          <PaymentRow
            icon={<QrCode className="size-4" />}
            label="QR決済"
            value={data.payment.qr}
            onChange={(v) => updatePayment("qr", v)}
          />
          <PaymentRow
            icon={<MoreHorizontal className="size-4" />}
            label="その他"
            value={data.payment.other}
            onChange={(v) => updatePayment("other", v)}
          />
        </div>
      </div>
    </div>
  )
}

function PaymentRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = `pay-${label}`
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="flex flex-1 items-center gap-2 text-sm text-foreground">
        <span className="flex size-8 items-center justify-center rounded-md bg-background text-muted-foreground">
          {icon}
        </span>
        {label}
      </label>
      <div className="relative w-32">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-background pl-7 pr-3 text-right text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>
    </div>
  )
}
