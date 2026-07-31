"use client"

import { useRef, useState, type DragEvent } from "react"
import { Camera, ImageUp, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type UploadAreaProps = {
  imageUrl: string | null
  isAnalyzing: boolean
  onFileSelected: (file: File) => void
  onClear: () => void
}

export function UploadArea({ imageUrl, isAnalyzing, onFileSelected, onClear }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file && file.type.startsWith("image/")) {
      onFileSelected(file)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  if (imageUrl) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="アップロードした伝票画像"
          className="max-h-80 w-full object-contain"
        />
        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">AIが伝票を解析中...</p>
          </div>
        )}
        {!isAnalyzing && (
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="画像を削除"
            onClick={onClear}
            className="absolute right-2 top-2 shadow-sm"
          >
            <X />
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/40 hover:bg-muted"
        }`}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ImageUp className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">伝票画像をアップロード</p>
          <p className="text-xs text-muted-foreground text-pretty">
            タップして選択、またはここにドラッグ＆ドロップ
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button type="button" variant="default" size="lg" onClick={() => cameraInputRef.current?.click()}>
          <Camera />
          カメラで撮影
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
          <ImageUp />
          画像を選択
        </Button>
      </div>
    </>
  )
}
