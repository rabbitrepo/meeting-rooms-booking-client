"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"
import { EllipsisVertical, Pencil, X } from "lucide-react"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
    }
  },
  {
    accessorKey: "date",
    header: "วันที่",
  },
  {
    accessorKey: "time",
    header: "เวลา",
  },
  {
    accessorKey: "topic",
    header: "หัวข้อ",
  },
  {
    accessorKey: "description",
    header: "รายละเอียด",
    cell: ({ cell }) => (
      <div className="truncate">{cell.getValue()}</div>
    )
  },
  {
    accessorKey: "email",
    header: "ผู้จอง",
    cell: ({ cell }) => (
      <Badge variant="outline" className="text-gray-700">
        {cell.getValue()}
      </Badge>
    )
  },
  {
    accessorKey: "participants",
    header: "ผู้เข้าร่วม",
    cell: ({ cell }) => (
      <div className="flex gap-1">
        {cell.getValue().map((participant: string, index: number) => (
          <Badge key={index} variant="outline" className="text-gray-700">
            {participant}
          </Badge>
        ))}
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original
      const { status } = data
      return (
        status === "canceled" ? <></> : (
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Pencil className="h-4 w-4 pr-1" />
                  แก้ไข
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>แก้ไขรายการ</DialogTitle>
                  <DialogDescription>
                    ...form
                    <Button className="w-full">ยืนยัน</Button>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <X className="h-4 w-4" />
                  ยกเลิก
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการยกเลิกรายการ</AlertDialogTitle>
                  <AlertDialogDescription>
                    โปรดตรวจสอบรายละเอียดอีกครั้ง เมื่อยกเลิกรายการแล้วจะไม่สามารถย้อนกลับได้
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 hover:bg-red-700">
                    ยืนยัน
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

        )
      )
    },
  },
]
