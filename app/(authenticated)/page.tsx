'use client'
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/AppWrite";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function Home() {

  return (
    <div className="flex justify-center items-center h-screen">ยินดีต้อนรับ 🙂</div>
  );
}
