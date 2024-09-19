"use client";

import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ParticipantCardProps {
    participant: {
        id: string;
        name: string;
        employeeId: string;
        email: string;
    };
    selected: boolean; // Indicates if this participant is selected (booker)
}

export default function ParticipantCard({
    participant,
    selected
}: ParticipantCardProps) {
    return (
        <Card
            className={`w-full max-w-sm relative transition-all ${selected
                ? 'border-primary bg-primary/10' // Styles when selected
                : 'hover:border-primary/50 hover:bg-primary/5'
            }`}
        >
            {selected && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check size={8} />
                </div>
            )}
            <div className="flex flex-col p-4">
                <p className="text-sm font-medium">{participant.name}</p>
                <p className="text-sm text-muted-foreground">ID: {participant.employeeId}</p>
                <p className="text-sm text-muted-foreground">{participant.email}</p>
            </div>
        </Card>
    );
}
