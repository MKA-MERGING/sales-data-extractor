"use client"

import { useState } from "react"
import { CheckCircle2, ReceiptText, Send, Sparkles, TableProperties } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadArea } from "@/components/upload-area"
import { ResultForm, type SalesData } from "@/components/result-form"

const emptyData: SalesData = {
  date: "",
  serviceType: null,
  totalSales: "",
  customerCount: "",
  payment: { cash: "", credit: "", qr: "", other: "" },
}

export function SalesEntryApp() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [data, setData] = useState<SalesData>(emptyData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleFileSelected(file: File) {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setSubmitted(false)
    setIsAnalyzing(true)

    // AI解析のシミュレーション（実際はここでOCR/AI APIを呼び出します）
    setTimeout(() => {
      setData({
        date: new Date().toISOString().slice(0, 10),
        serviceType: "lunch",
        totalSales: "1890",
        customerCount: "2",
        payment: { cash: "", credit: "1890", qr: "", other: "" },
      })
      setIsAnalyzing(false)
      setHasResult(true)
    }, 1800)
  }

  function handleClear() {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setHasResult(false)
    setData(emptyData)
    setSubmitted(false)
  }

  function handleSubmit() {
    setIsSubmitting(true)
    // スプレッドシート送信のシミュレーション
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-28">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 -mx-4 mb-6 border-b border-border bg-background/90 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ReceiptText className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-foreground text-balance">店舗売上AI記帳</h1>
            <p className="text-xs text-muted-foreground">伝票を撮るだけで、売上をかんたん記録</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* アップロード */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">1. 伝票を読み取る</h2>
          </div>
          <UploadArea
            imageUrl={imageUrl}
            isAnalyzing={isAnalyzing}
            onFileSelected={handleFileSelected}
            onClear={handleClear}
          />
        </section>

        {/* 解析結果フォーム */}
        {hasResult && (
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">2. 解析結果を確認・修正</h2>
            </div>
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p className="text-pretty">
                AIが読み取った内容です。誤りがあれば修正してから送信してください。
              </p>
            </div>
            <ResultForm data={data} setData={setData} />
          </section>
        )}
      </div>

      {/* 送信バー（固定） */}
      {hasResult && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto w-full max-w-lg px-4 py-3">
            {submitted ? (
              <div className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary/10 text-sm font-medium text-primary">
                <CheckCircle2 className="size-5" />
                スプレッドシートへ送信しました
              </div>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-12 w-full text-base"
              >
                {isSubmitting ? (
                  <>送信中...</>
                ) : (
                  <>
                    <Send />
                    Googleスプレッドシートへ送信
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 未読込み時の案内 */}
      {!hasResult && !isAnalyzing && (
        <div className="mt-8 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <TableProperties className="size-8 opacity-40" />
          <p className="text-sm text-pretty">
            伝票画像を読み取ると、ここに売上フォームが表示されます。
          </p>
        </div>
      )}
    </main>
  )
}
