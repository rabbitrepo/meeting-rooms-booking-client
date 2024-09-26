'use client'

import { useEffect, useState } from 'react';
import moment from 'moment';
import Calendar from '@/components/Calendar';
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
import { useQuery } from '@tanstack/react-query';
import { getSession, getUser } from '@/lib/AppWrite';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { AutosizeTextarea } from '@/components/ui/autoresize-text-area';
import { MultiSelect } from '@/components/ui/multi-select';
import { Cat, Dog, Fish, Info, Pencil, Plus, Rabbit, Search, Turtle } from "lucide-react";
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import ParticipantCard from '@/components/ParticipantCard';
import MeetingParticipants, { Participant } from '@/components/MeetingParticipants';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import ParticipantBadge from '@/components/ParticipantsBadge';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator';
import MiniSearch from 'minisearch'
import { Button } from '@/components/ui/button';
import Error from '@/components/Error';
import Loading from '@/components/Loading';
import { Spinner } from '@/components/ui/spinner';
import { LoadingButton } from '@/components/ui/loading-button';

interface Branch {
    id: string;
    name: string;
}

interface Room {
    id: string;
    name: string;
    branch_id: string;
}

interface Event {
    isActive: boolean; // Indicates if the event is currently active.
    isNew: boolean; // Indicates if the event is new.
    start: Date; // Represents the start date and time of the event.
    end: Date; // Represents the date of the event, example format provided.
    title: string; // The title or description of the event.
}

interface User {
    id: string,
    name: string,
    email: string,
    employeeId: string
}

export default function Page() {

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

    // ...
    // [ ] get user details from AppWrite
    // [ ] set participant to user detail
    // ----------------------------------------------

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
    // ----------------------------------------------

    // Branches
    const { data: branches, isLoading: L2, isError: E2 } = useQuery({
        queryKey: ['branches'],
        queryFn: async () => {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/branches`, {
                headers: {
                    'x-user-id': credentials?.userId,
                    'x-session-id': credentials?.sessionId
                }
            });
            const axiosData = response.data;
            const branches = axiosData.data.branches;
            const formattedBranches = branches.map((branch: any) => ({
                id: branch._id,
                name: branch.name
            }));
            return formattedBranches;
        },
        enabled: !!credentials
    })

    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    // ----------------------------------------------

    // Meeting Rooms
    const { data: rooms, isLoading: L3, isError: E3 } = useQuery({
        queryKey: ['meeting-rooms', selectedBranch],
        queryFn: async () => {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/branches/${selectedBranch?.id}/meeting-rooms`, {
                headers: {
                    'x-user-id': credentials?.userId,
                    'x-session-id': credentials?.sessionId
                }
            });
            const axiosData = response.data;
            const meetingRooms = axiosData.data.meetingRooms
            const formattedMeetingRooms = meetingRooms.map((meetingRoom: any) => ({
                id: meetingRoom._id,
                name: meetingRoom.name,
                branchId: meetingRoom.branchId,
                isAvailable: meetingRoom.isAvailable
            }));
            return formattedMeetingRooms;
        },
        enabled: !!selectedBranch
    })

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    // ----------------------------------------------

    // Date & Time
    // Set local timezone offset (e.g., GMT+7)
    const localTimezone = 'Asia/Bangkok'; // Use your local timezone
    // Function to convert local date to UTC
    const convertLocalToUTC = (date: Date) => {
        return moment.tz(date, localTimezone).utc().toDate();
    };
    // Function to convert UTC to local date
    const convertUTCToLocal = (date: Date) => {
        return moment.utc(date).tz(localTimezone).toDate();
    };

    const [selectedDate, setSelectedDate] = useState(() => convertUTCToLocal(new Date()));
    // Handle date input change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const localDate = moment(e.target.value).toDate(); // Input is in local timezone
        const utcDate = convertLocalToUTC(localDate); // Convert to UTC
        setSelectedDate(utcDate);
    };

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [events, setEvents] = useState([]);

    const { data: fetchedEvents, isLoading: L4, isError: E4 } = useQuery({
        queryKey: ['bookings', selectedRoom, selectedDate],
        queryFn: async () => {

            const formattedSelectedDate = moment(selectedDate).format('YYYY-MM-DD');
            const start = formattedSelectedDate + 'T00:00:00Z';
            const end = formattedSelectedDate + 'T23:59:59Z';

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/meeting-rooms/${selectedRoom?.id}/bookings`, {
                headers: {
                    'x-user-id': credentials?.userId,
                    'x-session-id': credentials?.sessionId
                },
                params: {
                    start,
                    end
                }
            });

            const axiosData = response.data;
            // const bookings = axiosData.data.bookings;
            const bookings = axiosData.data.bookings.filter((booking: any) => booking.status === 'confirmed');

            // Format bookings
            const formattedBookings = bookings.map((booking: any) => ({
                start: moment.utc(booking.startTime).toDate(),
                end: moment.utc(booking.endTime).toDate(),
                title: "จองแล้ว",
                isNew: false,
                isActive: booking.isActive
            }));

            // setEvents(formattedBookings)

            return formattedBookings;
        },
        enabled: !!selectedRoom && !!selectedDate // Ensure all parameters are set
    });
    // find update events with fetchedEvents, if event.isNew = true don't touch it 
    useEffect(() => {
        if (fetchedEvents) {
            // Merge new events with fetched events
            const updatedEvents = events.map(event => {
                if (event.isNew) {
                    return event; // Preserve new events
                }
                const matchingFetchedEvent = fetchedEvents.find(fetchedEvent =>
                    moment(event.start).isSame(moment(fetchedEvent.start)) &&
                    moment(event.end).isSame(moment(fetchedEvent.end))
                );
                return matchingFetchedEvent ? matchingFetchedEvent : event;
            });

            // Add any new events fetched from the server
            const newFetchedEvents = fetchedEvents.filter(fetchedEvent =>
                !events.some(event =>
                    moment(event.start).isSame(moment(fetchedEvent.start)) &&
                    moment(event.end).isSame(moment(fetchedEvent.end))
                )
            );

            setEvents([...updatedEvents, ...newFetchedEvents]);
        }
    }, [fetchedEvents]);

    // ----------------------------------------------

    // ...
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // ----------------------------------------------

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

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStartTime = e.target.value;
        const startMoment = moment(newStartTime, 'h:mm A');

        // Combine the selected date with the new start time
        const newStartLocal = moment(selectedDate).set({
            hour: startMoment.hour(),
            minute: startMoment.minute(),
            second: 0,
            millisecond: 0
        });

        // Set endTime to 1 hour after startTime
        const newEndTime = startMoment.clone().add(1, 'hour').format('h:mm A');
        const endMoment = moment(newEndTime, 'h:mm A');
        const newEndLocal = moment(selectedDate).set({
            hour: endMoment.hour(),
            minute: endMoment.minute(),
            second: 0,
            millisecond: 0
        });

        // Hard conversion to UTC (keep local time, but convert to UTC time zone)
        const newEventStart = moment.tz(newStartLocal, localTimezone).utc().toDate();
        const newEventEnd = moment.tz(newEndLocal, localTimezone).utc().toDate();

        console.log("start:", newEventStart);
        console.log("end:", newEventEnd);

        // Check for overlap with existing events
        const hasOverlap = events.some(event =>
            !event.isNew && (newEventStart < event.end && newEventEnd > event.start)
        );

        if (hasOverlap) {
            alert('ห้องประชุมไม่ว่างในช่วงที่คุณเลือก กรุณาเลือกเวลาอื่น');
            return;
        }

        // Update or create the new event
        const existingNewEventIndex = events.findIndex(event => event.isNew);

        if (existingNewEventIndex === -1) {
            // Create a new event
            const newEvent = {
                isActive: true,
                isNew: true,
                start: newEventStart,
                end: newEventEnd,
                title: newEventTitle,
            };
            setEvents([...events, newEvent]);
        } else {
            // Update existing new event
            const updatedEvents = [...events];
            updatedEvents[existingNewEventIndex] = {
                ...updatedEvents[existingNewEventIndex],
                start: newEventStart,
                end: newEventEnd
            };
            setEvents(updatedEvents);
        }

        // Update state
        setStartTime(newStartTime);
        setEndTime(newEndTime);
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEndTime = e.target.value;
        const endMoment = moment(newEndTime, 'h:mm A');

        // Combine the selected date with the new end time
        const newEndLocal = moment(selectedDate).set({
            hour: endMoment.hour(),
            minute: endMoment.minute(),
            second: 0,
            millisecond: 0
        });

        // Find the existing new event with isNew = true
        const existingNewEvent = events.find(event => event.isNew);

        if (!existingNewEvent) {
            // Handle this case if needed, or assume the event always exists
            return;
        }

        // Extract the start time from the existing new event
        const newStartLocal = moment(existingNewEvent.start).local();

        // Hard conversion to UTC (keep local time, but convert to UTC time zone)
        const newEventEnd = moment.tz(newEndLocal, localTimezone).utc().toDate();
        const newEventStart = moment.tz(newStartLocal, localTimezone).utc().toDate();

        // // Check for overlap with existing events
        const hasOverlap = events.some(event =>
            !event.isNew && (newStartLocal.toDate() < event.end && newEventEnd > event.start)
        );

        if (hasOverlap) {
            alert('ห้องประชุมไม่ว่างในช่วงที่คุณเลือก กรุณาเลือกเวลาอื่น');
            return;
        }

        // // Update or create the new event
        const existingNewEventIndex = events.findIndex(event => event.isNew);

        if (existingNewEventIndex === -1) {
            // Handle this case if needed, or assume the event always exists
        } else {
            // Update existing new event
            const updatedEvents = [...events];
            updatedEvents[existingNewEventIndex] = {
                ...updatedEvents[existingNewEventIndex],
                end: newEventEnd
            };
            setEvents(updatedEvents);
        }

        // // Update state
        setEndTime(newEndTime);
    };

    // id = Appwrite User Id (manually created with UUIDV4)
    // name => name
    // employeeId = pref.employeeId
    // email = AppWrite email

    const participants = [
        { id: "4617a859-b567-44ee-90e1-f02850f908ca", name: 'Mond', employeeId: '1063877', email: 'contact.jaruphop@gmail.com' },
        { id: '2', name: 'ฟอร์ด สรจักร HR HQ', employeeId: '1063876', email: 'sorajak.k@dohome.co.th' },
        { id: '3', name: 'John Smith', employeeId: '1063878', email: 'john.smith@dohome.co.th' },
        { id: '4', name: 'Alice Johnson', employeeId: '1063879', email: 'alice.johnson@dohome.co.th' },
        { id: '5', name: 'Bob Williams', employeeId: '1063880', email: 'bob.williams@dohome.co.th' },
        { id: '6', name: 'Emma Brown', employeeId: '1063881', email: 'emma.brown@dohome.co.th' },
        { id: '7', name: 'Liam Davis', employeeId: '1063882', email: 'liam.davis@dohome.co.th' },
        { id: '8', name: 'Olivia Miller', employeeId: '1063883', email: 'olivia.miller@dohome.co.th' },
        { id: '9', name: 'Noah Wilson', employeeId: '1063884', email: 'noah.wilson@dohome.co.th' },
        { id: '10', name: 'Ava Anderson', employeeId: '1063885', email: 'ava.anderson@dohome.co.th' },
        { id: '11', name: 'Isabella Martinez', employeeId: '1063886', email: 'isabella.martinez@dohome.co.th' },
        { id: '12', name: 'James Taylor', employeeId: '1063887', email: 'james.taylor@dohome.co.th' },
        { id: '13', name: 'Sophia Hernandez', employeeId: '1063888', email: 'sophia.hernandez@dohome.co.th' },
        { id: '14', name: 'Benjamin Clark', employeeId: '1063889', email: 'benjamin.clark@dohome.co.th' },
        { id: '15', name: 'Charlotte Lewis', employeeId: '1063890', email: 'charlotte.lewis@dohome.co.th' },
        { id: '16', name: 'Mia Walker', employeeId: '1063891', email: 'mia.walker@dohome.co.th' },
        { id: '17', name: 'Ethan Hall', employeeId: '1063892', email: 'ethan.hall@dohome.co.th' },
        { id: '18', name: 'Amelia Young', employeeId: '1063893', email: 'amelia.young@dohome.co.th' },
        { id: '19', name: 'Alexander King', employeeId: '1063894', email: 'alexander.king@dohome.co.th' },
        { id: '20', name: 'Harper Scott', employeeId: '1063895', email: 'harper.scott@dohome.co.th' },
        { id: '21', name: 'Jackson Adams', employeeId: '1063896', email: 'jackson.adams@dohome.co.th' },
        { id: '22', name: 'Ella Carter', employeeId: '1063897', email: 'ella.carter@dohome.co.th' },
        { id: '23', name: 'Michael Murphy', employeeId: '1063898', email: 'michael.murphy@dohome.co.th' },
        { id: '24', name: 'Grace Evans', employeeId: '1063899', email: 'grace.evans@dohome.co.th' },
        { id: '25', name: 'William Collins', employeeId: '1063900', email: 'william.collins@dohome.co.th' },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Participant[]>([]);

    // Initialize MiniSearch
    const [searchIndex, setSearchIndex] = useState<MiniSearch<Participant> | null>(null);

    useEffect(() => {
        // Create MiniSearch instance
        const index = new MiniSearch({
            fields: ["name", "email", "employeeId"],
            storeFields: ["name", "email", "employeeId"],
            searchOptions: {
                boost: { name: 3, email: 2, employeeId: 1 },
                prefix: true,
                fuzzy: 0.25
            }
        });

        // Add participants to the search index
        index.addAll(participants);
        setSearchIndex(index);

        // Initialize the search results with all participants
        setSearchResults(participants);
    }, []);

    const performSearch = (query: string) => {
        if (searchIndex) {
            return searchIndex.search(query);
        }
        return [];
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);

        // Perform search and update results
        const results = performSearch(query);
        setSearchResults(results);
    };

    const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
    const handleSelectionChange = (participants: Participant[]) => {
        setSelectedParticipants(participants);
    };
    const handleRemoveParticipant = (id: string) => {
        setSelectedParticipants(prev => prev.filter(p => p.id !== id));
    };

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const validation = () => {
        // Validate that all required fields exist
        if (!selectedRoom?.id) {
            alert(`โปรดเลือก 'ห้องประชุม'`);
            return false;
        }
        if (!selectedDate || isNaN(new Date(selectedDate).getTime())) {
            alert("โปรดเลือก 'วันที่'");
            return false;
        }
        if (!startTime || !endTime) {
            alert("โปรดเลือก 'เวลา'");
            return false;
        }
        if (!name) {
            alert("โปรดระบุ 'วาระการประชุม'");
            return false;
        }
        if (!participants[0]?.id) {
            alert("โปรดเลือก 'ผู้เข้่าร่วม'");
            return false;
        }
        return true;
    }

    const handleValidationAndOpenDialog = () => {
        if (validation()) {
            setIsDialogOpen(true);
        }
    }

    const [submitLoading, setSubmitLoading] = useState(false)
    const onSubmit = () => {
        setSubmitLoading(true)
        validation()
        // Convert time strings to Date objects
        function timeStringToDate(date, timeString) {
            const [time, period] = timeString.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes));
        }

        const parsedSelectedDate = new Date(selectedDate);

        const startDate = timeStringToDate(parsedSelectedDate, startTime);
        const endDate = timeStringToDate(parsedSelectedDate, endTime);

        // Check if the conversion resulted in valid dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            alert("รูปแบบเวลาเริ่มต้นหรือเวลาสิ้นสุดไม่ถูกต้อง");
            return;
        }

        // Check if end time is after start time
        if (endDate <= startDate) {
            alert("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น");
            return;
        }

        const formattedSelectedParticipants = selectedParticipants.map(participant => ({
            id: participant.id,
            name: participant.name,
            email: participant.email,
            employeeId: participant.employeeId
        }));

        const allParticipants = [ // update here!
            {
                id: participants[0].id,
                name: participants[0].name,
                email: participants[0].email,
                employeeId: participants[0].employeeId
            },
            ...formattedSelectedParticipants
        ];

        const payload = {
            meetingRoomId: selectedRoom?.id,
            user: participants[0], // update here!
            participants: allParticipants, // update here!
            name,
            details: description || "", // Default to empty string if description is not provided
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
        };

        async function createBooking() {
            console.log("credentials:", credentials);
            console.log("payload:", payload);

            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/bookings`,
                    payload, // This is the request body
                    { // This is where headers should be specified
                        headers: {
                            'x-user-id': credentials?.userId,
                            'x-session-id': credentials?.sessionId
                        }
                    }
                );

                const axiosData = response.data;
                console.log("res:", axiosData);
                setSubmitLoading(false)
                // Success alert and redirection
                alert("จองสำเร็จ!");
                window.location.href = '/meeting-rooms'; // Redirect to meeting rooms

            } catch (error) {
                console.error("Error creating booking:", error);
                alert('มีข้อผิดผลาด กรุณาลองใหม่อีกครั้ง')
                setSubmitLoading(false)
                // // Display an error alert based on the error response
                // if (error.response) {
                //     alert(`Error: ${error.response.data.message || "Something went wrong!"}`);
                // } else {
                //     alert("Network error: Unable to connect to the server.");
                // }
            }
        }

        createBooking();
    };


    const isLoading = L1
    const isError = E1 || E2 || E3 || E4

    if (isLoading) return <Loading />;
    if (isError) return <Error />;

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
                                        <SelectValue placeholder="เลือกสาขา" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches?.length ? (
                                            branches.map((branch: Branch) => (
                                                <SelectItem key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <Spinner size="small" />
                                            </div>
                                        )}
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
                                        <SelectValue placeholder="เลือกห้อง" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms?.length ? (
                                            rooms.map((room: Room) => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    {room.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <Spinner size="small" />
                                            </div>
                                        )}
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
                                    onChange={handleDateChange}
                                    disabled={!selectedRoom}
                                    min={moment().format('YYYY-MM-DD')}
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
                                {!selectedRoom || !selectedDate ? null : (
                                    L4 ? (
                                        <div className="flex items-center justify-center">
                                            <Spinner size="small" />
                                        </div>
                                    ) : (
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
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>3. รายละเอียดการประชุม</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <p className='text-nowrap font-bold'>วาระการประชุม:</p>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="กรอกวาระการประชุม"
                                />
                            </div>
                            <div className='flex items-center space-x-2'>
                                <p className='text-nowrap font-bold'>รายละเอียด:</p>
                                <div className="w-full">
                                    <AutosizeTextarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="กรอกรายละเอียด"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>4. เลือกผู้เข้าร่วมประชุม</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <p className='text-wrap font-bold'>ผู้จอง:</p>
                                <ParticipantBadge
                                    participant={participants[0]} // <== update here
                                    variant='secondary'
                                />
                            </div>
                            <div className='flex items-center space-x-2'>
                                <p className='text-wrap font-bold'>ผู้เข้าร่วม:</p>
                                <ParticipantBadge
                                    participant={participants[0]} // <== update here
                                    variant='secondary'
                                />
                                {selectedParticipants.map((participant) => {
                                    return <ParticipantBadge
                                        participant={participant}
                                        variant='secondary'
                                        isRemovable={true}
                                        onRemove={handleRemoveParticipant}
                                    />
                                })}
                                <Dialog>
                                    <DialogTrigger>
                                        <Badge
                                            variant="outline"
                                            className="transition-colors duration-300 hover:bg-gray-100 hover:text-gray-800"
                                        >
                                            เพิ่มผู้เข้าร่วม
                                            <Plus className="ml-2 h-4 w-4" />
                                        </Badge>
                                    </DialogTrigger>
                                    <DialogContent className=' min-w-[calc(100%-4rem)] h-[calc(100%-4rem)] '>
                                        <DialogHeader>
                                            <DialogTitle>เพิ่มผู้เข้าร่วม</DialogTitle>
                                            {/* selected */}
                                            <div className='flex items-center space-x-2 py-4'>
                                                <p className='text-wrap'>ผู้เข้าร่วม:</p>
                                                <ParticipantBadge
                                                    participant={participants[0]} // <== update here
                                                    variant='secondary'
                                                />
                                                {selectedParticipants.map((participant) => {
                                                    return <ParticipantBadge
                                                        participant={participant}
                                                        variant='secondary'
                                                        isRemovable={true}
                                                        onRemove={handleRemoveParticipant}
                                                    />
                                                })}
                                            </div>
                                            <Separator />
                                            {/* seperator */}
                                            <DialogDescription className='space-y-4 pt-4'>
                                                <div className='flex items-center space-x-2'>
                                                    <Search className="h-4 w-4" />
                                                    <p className='text-gray-900 text-wrap font-bold'>ค้นหา:</p>
                                                    <Input
                                                        value={searchQuery}
                                                        onChange={handleSearchInputChange}
                                                        placeholder="ค้นหาด้วย ชื่อ รหัสพนักงาน หรือ email"
                                                    />
                                                </div>
                                                <MeetingParticipants
                                                    participants={searchResults}
                                                    selectedParticipants={selectedParticipants}
                                                    featuredParticipant={participants[0]}
                                                    onSelectionChange={(ps: Participant[]) => setSelectedParticipants(ps)}
                                                />
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                    <div className='flex space-x-4 pt-2 h-full'>

                        <Link href="/meeting-rooms" className='w-full' >
                            <Button
                                variant="secondary"
                                className='w-full'
                            >
                                ยกเลิก
                            </Button>
                        </Link>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            {/* <DialogTrigger asChild> */}
                            <Button
                                className='w-full'
                                onClick={handleValidationAndOpenDialog}
                            >
                                ตรวจสอบข้อมูล
                            </Button>
                            {/* </DialogTrigger> */}
                            <DialogContent className=' min-w-[calc(100%-16rem)] h-[calc(100%-16rem)] '>
                                <DialogHeader>
                                    <DialogTitle>ยืนยันการจอง</DialogTitle>
                                    <DialogDescription className='space-y-2 pt-2'>
                                        <p className='text-nowrap'>
                                            <span className='font-bold'>สาขา:</span> {selectedBranch?.name}
                                        </p>
                                        <p className='text-nowrap'>
                                            <span className='font-bold'>ห้องประชุม:</span> {selectedRoom?.name}
                                        </p>
                                        <p className='text-nowrap'>
                                            <span className='font-bold'>วันที่:</span> {formatDateThai(selectedDate)}
                                        </p>
                                        <p className='text-nowrap'>
                                            <span className='font-bold'>เวลา:</span> {startTime} ถึง {endTime}
                                        </p>

                                        <div className='flex items-center space-x-2'>
                                            <p className='text-nowrap font-bold'>วาระการประชุม:</p>
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="กรอกวาระการประชุม"
                                                disabled
                                            />
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <p className='text-nowrap font-bold'>รายละเอียด:</p>
                                            <div className="w-full">
                                                <AutosizeTextarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="กรอกรายละเอียด"
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div className='flex items-center space-x-2'>
                                            <p className='text-nowrap font-bold'>ผู้จอง:</p>
                                            <ParticipantBadge
                                                participant={participants[0]} // <== update here
                                                variant='secondary'
                                            />
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <p className='text-nowrap font-bold'>ผู้เข้าร่วม:</p>
                                            <ParticipantBadge
                                                participant={participants[0]} // <== update here
                                                variant='secondary'
                                            />
                                            {selectedParticipants.map((participant) => {
                                                return <ParticipantBadge
                                                    participant={participant}
                                                    variant='secondary'
                                                />
                                            })}
                                        </div>
                                        <div className='flex space-x-4 pt-4 w-full'>
                                            <DialogClose asChild>
                                                <Button variant="secondary" className='w-full'>ย้อนกลับ</Button>
                                            </DialogClose>
                                            <LoadingButton
                                                loading={submitLoading}
                                                className='w-full'
                                                onClick={() => onSubmit()}
                                            >
                                                ยืนยัน
                                            </LoadingButton>
                                        </div>
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

            </ScrollArea>
        </>
    );
}
