import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

export default function Error() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">
          <span aria-hidden="true" className="block text-6xl mb-2">⚠️</span>
          ข้อผิดพลาด
        </h1>
        <p className="text-xl">มีข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          รีเฟรช
        </Button>
      </div>
    </div>
  )
}