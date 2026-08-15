import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { LoadingSettings } from "../types"

export function LoadingScreenTab({
  loadingSettings,
  setLoadingSettings,
}: {
  loadingSettings: LoadingSettings
  setLoadingSettings: (settings: LoadingSettings) => void
}) {
  return (
    <Card className="rounded-none border-slate-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-lg font-black uppercase">Màn hình Loading Chờ Trang</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold">Bật hiệu ứng Loading</Label>
          <Switch
            checked={loadingSettings.enabled}
            onCheckedChange={(val) => setLoadingSettings({ ...loadingSettings, enabled: val })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
