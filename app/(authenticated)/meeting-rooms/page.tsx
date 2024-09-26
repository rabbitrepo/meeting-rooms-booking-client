'use client'

import React, { useState } from 'react'
import { DataTable } from './data-table'
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getSession } from '@/lib/AppWrite'
import axios from 'axios'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Spinner } from '@/components/ui/spinner'
import Loading from '@/components/Loading'
import Error from '@/components/Error'

export default function Page() {

  // Credentials
  const { data: credentials, isLoading: L1, isError: E1 } = useQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      const session = await getSession();
      return {
        userId: session.userId,
        sessionId: session.$id
      }
    }
  })

  // Get current month and construct date strings
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)); // Start of current month
  const startOfNextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1)); // Start of next month

  const startOfMonthString = startOfMonth.toISOString(); // 2024-09-01T00:00:00.000Z
  const startOfNextMonthString = startOfNextMonth.toISOString(); // 2024-10-01T00:00:00.000Z

  const [startRange, setStartRange] = useState(startOfMonthString)
  const [endRange, setEndRange] = useState(startOfNextMonthString)

  // Bookings
  const { data: fetchedBookings, isLoading: L2, isError: E2 } = useQuery({
    queryKey: ['branches', 'startOfMonth'],
    queryFn: async () => {
      // console.log("start:", startOfMonthString); // Correct UTC string
      // console.log("end:", startOfNextMonthString); // Correct UTC string
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/${credentials?.userId}/bookings`, {
        headers: {
          'x-user-id': credentials?.userId,
          'x-session-id': credentials?.sessionId
        },
        params: {
          start: startRange,
          end: endRange
        }
      });
      const axiosData = response.data;
      const bookings = axiosData.data.bookings
      return bookings;
    },
    enabled: !!credentials && !!startRange && !!endRange
  })
  console.log("bookings:", fetchedBookings)

  // if (L1) { return <Loading /> }

  const error = E1 || E2
  if (error) { return <Error /> }

  return (
    <>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className='flex justify-between items-center'>
          <h1 className="text-3xl font-bold">ห้องประชุม</h1>
        </div>
        <Link href="/meeting-rooms/new" passHref>
          <Button size="lg">
            <PlusIcon className="mr-2 h-4 w-4" />
            จองห้องประชุม
          </Button>
        </Link>
      </div>
      <div className='flex justify-between items-center'>
        {fetchedBookings ?
          <>
            <h2 className="text-xl text-gray-600">ประวัติการจอง</h2>
            <DateRangePicker
              onUpdate={({ range }) => {
                const { from, to } = range;

                // Create new date objects to avoid mutating the original dates
                const utcFrom = new Date(from);
                const utcTo = new Date(to);

                // Set hours and minutes for from
                utcFrom.setHours(from.getHours());
                utcFrom.setMinutes(from.getMinutes());
                utcFrom.setSeconds(from.getSeconds());

                // Adjust the "To" date to be the end of the day in local time (GMT+7)
                utcTo.setDate(to.getDate() + 1); // Move to the next day

                // Convert to UTC
                const offsetMinutes = from.getTimezoneOffset(); // This will give you -420 for GMT+7
                const adjustedTo = new Date(utcTo.getTime() - offsetMinutes * 60 * 1000); // Adjust to UTC

                console.log(`From (UTC): ${utcFrom.toISOString()}`);
                console.log(`To (UTC): ${adjustedTo.toISOString()}`);

                // Set as ISO strings
                // setStartRange(utcFrom.toISOString());
                // setEndRange(adjustedTo.toISOString());
              }}
              initialDateFrom={startOfMonth}
              initialDateTo={startOfNextMonth}
              align="center"
              locale="UT"
              showCompare={false}
            />
          </>
          :
          <></>
        }
      </div>
      {fetchedBookings
        ?
        <DataTable columns={columns} data={fetchedBookings} />
        :
        <div className='flex justify-center items-center h-screen'>
          <Spinner size={'large'} />
        </div>
      }
    </>
  )
}