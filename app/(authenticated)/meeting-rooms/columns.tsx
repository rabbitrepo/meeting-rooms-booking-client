import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Info, X } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import ParticipantBadge from "@/components/ParticipantsBadge";
import { getSession, getUser } from '@/lib/AppWrite';
import axios from 'axios';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingButton } from '@/components/ui/loading-button';

export const columns = [
  {
    accessorKey: "status",
    header: "สถานะ",
    cell: ({ row }) => {
      const status = row.original.status
      return status === "confirmed" ? (
        <Badge>ยืนยัน</Badge>
      ) : status === "canceled" ? (
        <Badge variant="outline">ยกเลิก</Badge>
      ) : null
    },
  },
  {
    accessorKey: "startTime",
    header: "วันที่",
    cell: ({ row }) => {
      const { startTime } = row.original;
      const date = new Date(startTime);
      const day = date.toLocaleString('th-TH', { day: 'numeric' });
      const month = date.toLocaleString('th-TH', { month: 'short' });
      const year = date.getUTCFullYear(); // Convert to Buddhist year
      return <p className="text-sm">{`${day} ${month} ${year}`}</p>;
    },
  },
  {
    accessorKey: "startTime",
    header: "เวลา",
    cell: ({ row }) => {
      const { startTime, endTime } = row.original;
      const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleString('th-TH', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'UTC' });
      };
      return <p className="text-sm">{`${formatTime(startTime)} - ${formatTime(endTime)}`}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "หัวข้อ",
    cell: ({ row }) => {
      const { name, details } = row.original;
      return (
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex items-center space-x-1 cursor-pointer">
              <span className="text-sm font-medium">{name}</span>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-sm">{details}</p>
          </HoverCardContent>
        </HoverCard>
      );
    },
    className: "min-w-[200px]",
  },
  {
    accessorKey: "user",
    header: "ผู้จอง",
    cell: ({ row }) => {
      const { user } = row.original;
      return <ParticipantBadge participant={user} variant="secondary" className="text-xs" />;
    },
    className: "w-32",
  },
  {
    accessorKey: "participants",
    header: "ผู้เข้าร่วม",
    cell: ({ row }) => {
      const { participants } = row.original;
      return (
        <div className="flex flex-wrap gap-1">
          {participants.map((participant, index) => (
            <ParticipantBadge
              key={index}
              participant={participant}
              variant="secondary"
              className="text-xs"
            />
          ))}
        </div>
      );
    },
    className: "min-w-[200px]",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { status, _id } = row.original;
      const [loading, setLoading] = useState(false)

      async function removeBooking(id: string) {
        try {
          setLoading(true)
          const credentials = await getSession();
          const { userId, $id: sessionId } = credentials;

          const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/bookings/${id}`, {
            status: 'canceled' // Change this line to use PATCH and update status
          }, {
            headers: {
              'x-user-id': userId,
              'x-session-id': sessionId
            }
          });

          const axiosData = response.data;
          alert("สำเร็จ!")
          setLoading(false)
          window.location.reload();
          // Optionally handle the updated data here
          return axiosData; // Return the updated booking data if needed
        } catch (error) {
          console.error('Error canceling booking:', error);
          alert("พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
          setLoading(false)
          // Optionally, handle errors, show notifications, etc.
        }
      }

      return status === "canceled" ? null : (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="px-2 py-1 text-xs">
                <X className="h-3 w-3 mr-1" />
                ยกเลิก
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ยืนยันการยกเลิกรายการ</DialogTitle>
                <DialogDescription>
                  <p>โปรดตรวจสอบรายละเอียดอีกครั้ง เมื่อยกเลิกรายการแล้วจะไม่สามารถย้อนกลับได้</p>
                  <div className='flex space-x-4 pt-4 w-full'>
                    <DialogClose asChild>
                      <Button variant="secondary" className='w-full'>ย้อนกลับ</Button>
                    </DialogClose>
                    <LoadingButton
                      loading={loading}
                      className='w-full'
                      onClick={async () => {
                        await removeBooking(_id);
                        // Optionally, refresh data or update state to reflect cancellation
                      }}
                    >
                      ยืนยัน
                    </LoadingButton>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  }
];