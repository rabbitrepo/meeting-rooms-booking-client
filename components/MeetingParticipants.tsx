"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from './ui/button';

export interface Participant {
    id: string;
    name: string;
    employeeId: string;
    email: string;
}

export interface MeetingParticipantsProps {
    participants: Participant[];
    featuredParticipant?: Participant;
    selectedParticipants: Participant[];
    onSelectionChange: (selectedParticipants: Participant[]) => void;
}

const ITEMS_PER_PAGE = 9; // Number of participants to show per page

export default function MeetingParticipants({
    participants,
    featuredParticipant,
    selectedParticipants,
    onSelectionChange
}: MeetingParticipantsProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(selectedParticipants.map(p => p.id))
    );

    const [currentPage, setCurrentPage] = useState(1);

    // Effect to update the selectedIds state when selectedParticipants prop changes
    useEffect(() => {
        setSelectedIds(new Set(selectedParticipants.map(p => p.id)));
    }, [selectedParticipants]);

    useEffect(() => {
        // Reset to first page when participants or selectedParticipants change
        setCurrentPage(1);
    }, [participants, selectedParticipants]);

    const toggleSelection = (participant: Participant) => {
        if (featuredParticipant?.id === participant.id) return; // Prevent toggling for featuredParticipant

        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(participant.id)) {
            newSelectedIds.delete(participant.id);
        } else {
            newSelectedIds.add(participant.id);
        }
        setSelectedIds(newSelectedIds);
        onSelectionChange(participants.filter(p => newSelectedIds.has(p.id)));
    };

    // Create an array with remaining participants (excluding featuredParticipant and selectedParticipants)
    const participantsToRender = participants.filter(p => 
        p.id !== featuredParticipant?.id && !selectedParticipants.find(sp => sp.id === p.id)
    );

    // Calculate the participants to display on the current page
    const totalPages = Math.ceil(participantsToRender.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedParticipants = participantsToRender.slice(startIndex, endIndex);

    if (!paginatedParticipants || paginatedParticipants.length === 0) {
        return (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-600">ไม่พบบุคคลที่คุณค้นหา กรุณาลองใหม่อีกครั้ง</p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedParticipants.map((participant) => (
                    <Card
                        key={participant.id}
                        className={`cursor-pointer transition-all relative ${selectedIds.has(participant.id)
                            ? 'border-primary bg-primary/10'
                            : 'hover:border-primary/50 hover:bg-primary/5'
                            } ${featuredParticipant?.id === participant.id ? 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed' : ''}`}
                        onClick={() => featuredParticipant?.id !== participant.id && toggleSelection(participant)}
                    >
                        {selectedIds.has(participant.id) && (
                            <div
                                className={`absolute top-2 right-2 text-primary-foreground rounded-full p-1 ${featuredParticipant?.id === participant.id ? "bg-gray-400" : "bg-primary"}`}
                            >
                                <Check size={8} />
                            </div>
                        )}
                        <div className="flex flex-col p-4">
                            <p className="text-sm font-medium break-words">{participant.name}</p>
                            <p className="text-sm text-muted-foreground break-words">ID: {participant.employeeId}</p>
                            <p className="text-sm text-muted-foreground break-words">{participant.email}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between items-center">
                <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    ย้อนกลับ
                </Button>
                <span>หน้าที่ {currentPage} จาก {totalPages}</span>
                <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    ต่อไป
                </Button>
            </div>
        </div>
    );
}
