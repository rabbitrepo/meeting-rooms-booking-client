'use client';

import { logout } from "@/lib/AppWrite";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await logout(); // Wait for logout to complete
                router.push('/login'); // Redirect to home page after successful logout
            } catch (error) {
                console.error('Logout error:', error);
                // Optionally handle the error, e.g., show an error message
            }
        };

        performLogout(); // Call the async function
    }, [router]);

    return (
        <div className="flex justify-center items-center h-screen">กำลังโหลด...</div>
    );
}
