"use client";
import React, { useEffect, useState } from "react";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconCalendarTime,
  IconCar,
  IconHome,
  IconLogout,
  IconSettings,
  IconTable,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { getUser } from "@/lib/AppWrite";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";

export default function MySidebar({ children }: Readonly<{ children: React.ReactNode }>) {
  const [email, setEmail] = useState<string>("...@dohome.co.th" ?? ""); // State to store email
  const [error, setError] = useState<string | null>(""); // State to store any error

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const user = await getUser(); // Fetch user data
        setEmail(user.email); // Set email state
      } catch (error) {
        console.error('Error fetching user email:', error);
        setError('Failed to fetch user email.'); // Set error state
      }
    };

    getUserEmail(); // Call the async function
  }, []); // Empty dependency array to run once on component mount

  const links = [
    {
      label: "หน้าแรก",
      href: "/",
      icon: (
        <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "ห้องประชุม",
      href: "/meeting-rooms",
      icon: (
        <IconCalendarTime className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "รถ",
      href: "/cars",
      icon: (
        <IconCar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "ออกจากระบบ",
      href: "/logout",
      icon: (
        <IconLogout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen" // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: email,
                href: "",
                icon: (
                  // <Avatar style={{ backgroundColor: '#f06526' }}>
                  //   <AvatarFallback>DH</AvatarFallback>
                  // </Avatar>
                  <Image
                    src="/user.png" // Update the path as needed
                    alt="User Logo"
                    width={40} // Adjust the width as needed
                    height={40} // Adjust the height as needed
                    className="flex-shrink-0"
                  />
                ),
                // onClick={() => alert("Manu Arora clicked!")} // Example onClick handler
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        {children}
      </div>
      {/* <Dashboard /> */}
    </div>
  );
}
export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      {/* <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" /> */}
      <Image
        src="/dohome.png" // Update the path as needed
        alt="Dohome Logo"
        width={40} // Adjust the width as needed
        height={40} // Adjust the height as needed
        className="flex-shrink-0"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Dohome
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      {/* <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" /> */}
      <Image
        src="/dohome.png" // Update the path as needed
        alt="Dohome Logo"
        width={40} // Adjust the width as needed
        height={40} // Adjust the height as needed
        className="flex-shrink-0"
      />
    </Link>
  );
};

// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2">
          {[...new Array(4)].map((i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
