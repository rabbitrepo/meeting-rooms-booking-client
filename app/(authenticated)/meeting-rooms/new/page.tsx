'use client'

import { useEffect, useState } from 'react';
import moment from 'moment';
import Calendar from '@/components/Calendat';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';

interface Branch {
    id: string;
    name: string;
}

interface Room {
    id: string;
    name: string;
    branch_id: string;
}

function formatDateThai(date: Date) {
    const day = moment(date).format('D');
    const month = moment(date).format('M');
    const year = moment(date).year() + 543; // Convert AD year to Thai Buddhist year

    const monthMap = {
        1: 'ม.ค.',
        2: 'ก.พ.',
        3: 'มี.ค.',
        4: 'เม.ย.',
        5: 'พ.ค.',
        6: 'มิ.ย.',
        7: 'ก.ค.',
        8: 'ส.ค.',
        9: 'ก.ย.',
        10: 'ต.ค.',
        11: 'พ.ย.',
        12: 'ธ.ค.'
    };

    return `${day} ${monthMap[month]} ${year}`;
}

export default function Page() {
    const [branches, setBranches] = useState<Branch[]>([
        { id: 'b1', name: 'สำนักงานใหญ่' },
        { id: 'b2', name: 'บางบัวทอง' },
    ]);

    const [rooms, setRooms] = useState<Room[]>([
        { id: 'r1', name: 'ห้องประชุม F (สำหรับ 7-10 คน)', branch_id: 'b1' },
        { id: 'r2', name: 'ห้องประชุม G (สำหรับ 7-10 คน)', branch_id: 'b1' },
        { id: 'r3', name: 'ห้องประชุม H (สำหรับ 10-12 คน)', branch_id: 'b1' },
        { id: 'r4', name: 'ห้องประชุม I (สำหรับ 10-12 คน)', branch_id: 'b1' },
        { id: 'r5', name: 'ห้องประชุม J (สำหรับ 11-15 คน)', branch_id: 'b1' },
        { id: 'r6', name: 'ห้องประชุม K (สำหรับ 15-20 คน)', branch_id: 'b1' },
        { id: 'r7', name: 'ห้องประชุม F (สำหรับ 7-10 คน)', branch_id: 'b2' },
        { id: 'r8', name: 'ห้องประชุม G (สำหรับ 7-10 คน)', branch_id: 'b2' },
        { id: 'r9', name: 'ห้องประชุม H (สำหรับ 10-12 คน)', branch_id: 'b2' },
    ]);

    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedDate, setSelectedDate] = useState(moment().startOf('day').toDate());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [events, setEvents] = useState([
        {
            start: moment("2024-08-07T10:00:00").toDate(),
            end: moment("2024-08-07T11:00:00").toDate(),
            title: "จองแล้ว",
            isNew: false
        },
        {
            start: moment("2024-08-07T14:00:00").toDate(),
            end: moment("2024-08-07T15:30:00").toDate(),
            title: "จองแล้ว",
            isNew: false
        }
    ]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // email
    // participants: string[]

    const min = moment("2024-08-05T06:00:00").toDate();
    const max = moment("2024-08-05T22:00:00").toDate();
    const step = 30;
    const timeslot = 60 / step;

    const newEventTitle = "เลือกอยู่";

    const handleCreateEvent = () => {
        if (!startTime || !endTime) {
            alert('Please select both start and end times.');
            return;
        }

        const start = moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${startTime}`).format('YYYY-MM-DDTHH:mm:ss').toDate();
        const end = moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${endTime}`).format('YYYY-MM-DDTHH:mm:ss').toDate();

        // Check for overlapping events that are not new
        const hasOverlap = events.some(event =>
            !event.isNew && (start < event.end && end > event.start)
        );

        if (hasOverlap) {
            alert('The selected time slot is already occupied. Please choose another time.');
            return;
        }

        // If no overlap, add the new event
        const newEvent = {
            start,
            end,
            title: newEventTitle,
            isNew: true
        };

        setEvents([...events, newEvent]);
    };

    const generateTimeSlots = (start: string, end: string, interval: number) => {
        const slots = [];
        const current = moment(start, 'h:mm A');
        const endMoment = moment(end, 'h:mm A');

        while (current <= endMoment) {
            slots.push(current.format('h:mm A'));
            current.add(interval, 'minutes');
        }

        return slots;
    };

    const timeSlots = generateTimeSlots('7:00 AM', '8:00 PM', 30);

    // Handle startTime selection
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStartTime = e.target.value;
        const startMoment = moment(newStartTime, 'h:mm A');

        // Set endTime to 1 hour after startTime
        const newEndTime = startMoment.clone().add(1, 'hour').format('h:mm A');
        const newEventStart = moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${newStartTime}`, 'YYYY-MM-DDTHH:mm A').toDate();
        const newEventEnd = moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${newEndTime}`, 'YYYY-MM-DDTHH:mm A').toDate();

        // Check for overlap with all non-new events
        const hasOverlap = events.some(event =>
            !event.isNew && (newEventStart < event.end && newEventEnd > event.start)
        );

        if (hasOverlap) {
            alert('The selected time slot is already occupied. Please choose another time.');
            return;
        }

        const existingNewEventIndex = events.findIndex(event => event.isNew);

        if (existingNewEventIndex !== -1) {
            // Update existing new event
            const updatedEvents = [...events];
            updatedEvents[existingNewEventIndex] = {
                ...updatedEvents[existingNewEventIndex],
                start: newEventStart,
                end: newEventEnd
            };
            setEvents(updatedEvents);
        } else {
            // Create a new event
            const newEvent = {
                start: newEventStart,
                end: newEventEnd,
                title: newEventTitle,
                isNew: true
            };
            setEvents([...events, newEvent]);
        }

        // Update state only if validation passed
        setStartTime(newStartTime);
        setEndTime(newEndTime);
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEndTime = e.target.value;
        setEndTime(newEndTime);

        // Check if endTime is after startTime
        if (startTime) {
            const startMoment = moment(startTime, 'h:mm A');
            const endMoment = moment(newEndTime, 'h:mm A');

            if (endMoment.isBefore(startMoment)) {
                alert('End time must be later than start time.');
                return;
            }

            // Create new start and end time
            const newEventStart = moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${startTime}`, 'YYYY-MM-DDTHH:mm A').toDate();
            const newEventEnd = moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${newEndTime}`, 'YYYY-MM-DDTHH:mm A').toDate();

            // Check for overlap with all non-new events
            const hasOverlap = events.some(event =>
                !event.isNew && (newEventStart < event.end && newEventEnd > event.start)
            );

            if (hasOverlap) {
                alert('The selected time slot is already occupied. Please choose another time.');
                return;
            }

            const existingNewEventIndex = events.findIndex(event => event.isNew);

            if (existingNewEventIndex !== -1) {
                // Update existing new event
                const updatedEvents = [...events];
                updatedEvents[existingNewEventIndex] = {
                    ...updatedEvents[existingNewEventIndex],
                    end: newEventEnd
                };
                setEvents(updatedEvents);
            }
        }
    };

    const formattedSelectedDate = formatDateThai(selectedDate);

    return (
        <>
            <ScrollArea className="h-screen">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">จองห้องประชุม</h1>
                </div>

                <div className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle>1. เลือกห้องประชุม</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <p className='text-wrap font-bold'>สาขา:</p>
                                <Select
                                    value={selectedBranch?.id || ""}
                                    onValueChange={(value: string) => {
                                        const branch = branches.find(b => b.id === value);
                                        setSelectedBranch(branch || null);
                                        // Reset selected room when branch changes
                                        setSelectedRoom(null);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="สาขา" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <p className='text-nowrap font-bold'>ห้องประชุม:</p>
                                <Select
                                    value={selectedRoom?.id || ""}
                                    onValueChange={(value: string) => {
                                        const room = rooms.find(r => r.id === value);
                                        setSelectedRoom(room || null);
                                    }}
                                    disabled={!selectedBranch}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="ห้อง" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.filter(room => room.branch_id === selectedBranch?.id).map((room) => (
                                            <SelectItem key={room.id} value={room.id}>
                                                {room.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>2. เลือกวันที่และเวลา</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <p className='font-bold'>วันที่:</p>
                                <input
                                    type='date'
                                    className='border px-2 py-1 rounded'
                                    value={moment(selectedDate).format('YYYY-MM-DD')}
                                    onChange={(e) => setSelectedDate(moment(e.target.value).toDate())}
                                    disabled={!selectedRoom}
                                />
                            </div>
                            <div className='flex items-center space-x-2'>
                                <p className='font-bold'>เวลา:</p>
                                <select
                                    className='border px-2 py-1 rounded'
                                    value={startTime}
                                    onChange={handleStartTimeChange}
                                    disabled={!selectedRoom}
                                >
                                    <option value="" disabled>เริ่มต้น</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                                <p>-</p>
                                <select
                                    className='border px-2 py-1 rounded'
                                    value={endTime}
                                    onChange={handleEndTimeChange}
                                    disabled={!startTime} // Disable if startTime is not selected
                                >
                                    <option value="" disabled>สิ้นสุด</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="h-auto">
                                <Calendar
                                    toolbar={false}
                                    defaultView="day"
                                    date={selectedDate}
                                    min={min}
                                    max={max}
                                    events={events}
                                    step={step}
                                    timeslots={timeslot}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>3. รายละเอียดการประชุม</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            ...
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>4. เลือกผู้เข้าร่วมประชุม</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            ...
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>5. ตรวจสอบและยืนยัน</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            ...
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </>
    );
}
