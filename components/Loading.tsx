import { Spinner } from "./ui/spinner";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
                <Spinner size="large" className="mb-4" />
                <h2 className="text-2xl font-semibold text-foreground">กำลังโหลด...</h2>
                <p className="text-muted-foreground mt-2">กรุณารอสักครู่</p>
            </div>
        </div>
    )
}
