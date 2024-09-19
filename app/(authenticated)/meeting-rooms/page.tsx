import React from 'react'
import { DataTable } from './data-table'
import { columns } from "./columns"
import { Button } from "@/components/ui/button" // Ensure you have this import or the correct path
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  const bookings = [
    {
      id: 'booking_1',
      user_id: 'me',
      status: "confirmed",
      date: '11 ส.ค. 2567',
      time: "10.30 - 11.30",
      email: "john",
      topic: 'ประชุม 1',
      description: 'รายละเอียดการประชุม',
      participants: ["john", "jane"],
    },
    {
      id: 'booking_2',
      user_id: 'me',
      status: "canceled",
      date: '11 ส.ค. 2567',
      time: "10.30 - 11.30",
      email: "john",
      topic: 'ประชุม 2',
      description: 'รายละเอียดการประชุม',
      participants: ["john", "jane", "jack", "jill"],
    },
  ]

  // fetch data with React Query

  return (
    <>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">ห้องประชุม</h1>
      </div>

      <div className='flex justify-between items-center'>
        <h2 className="text-xl text-gray-600">ประวัติการจอง</h2>
        <Link href="/meeting-rooms/new" passHref>
          <Button size="lg">
            <PlusIcon className="mr-2 h-4 w-4" />
            จองห้องประชุม
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={bookings} />
    </>
  )
}
