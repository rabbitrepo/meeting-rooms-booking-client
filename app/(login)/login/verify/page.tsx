'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyOtp } from '@/lib/AppWrite'; // Import the verifyOtp function

export default function Page() {
    const [otpValue, setOtpValue] = useState("");
    const [error, setError] = useState<string | null>(null); // State for error messages
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const router = useRouter();
    const searchParams = useSearchParams(); // Get the query parameters

    // Extract userId and email from query parameters
    const userId = searchParams.get('userId');
    console.log('userId:', userId);
    const email = searchParams.get('email');
    console.log('email:', email);

    useEffect(() => {
        const verifyOtpHandler = async () => {
            if (otpValue.length === 6) {
                setIsLoading(true); // Set loading state
                try {
                    const result = await verifyOtp(userId as string, otpValue);
                    console.log("OTP verification success:", result);
                    
                    // Redirect to home or other page upon success
                    router.push('/');
                } catch (error) {
                    // Handle OTP verification failure
                    setError('Invalid OTP. Please try again.'); // Display error
                    console.error("OTP verification failed:", error);
                } finally {
                    setIsLoading(false); // Reset loading state
                }
            }
        };

        // Call the OTP handler only when OTP is 6 digits
        if (otpValue.length === 6) {
            verifyOtpHandler();
        }
    }, [otpValue, userId, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                {/* Heading */}
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    ลงชื่อเข้าใช้
                </h1>

                {/* Subheading */}
                <p className="text-sm text-gray-600">
                    กรุณากรอก OTP จาก Email ของคุณ ({email})
                </p>

                {/* OTP Input */}
                <div className="flex flex-col items-center space-y-6">
                    <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={(value) => setOtpValue(value)}
                        className="w-full max-w-xs"
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>

                    {/* Display Error */}
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <p className="text-sm text-gray-500">กำลังตรวจสอบ OTP...</p>
                    )}
                </div>
            </div>
        </div>
    )
}
