import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Info, X } from "lucide-react"; // Import the X icon

interface Participant {
    id: string;
    name: string;
    employeeId: string;
    email: string;
}

interface ParticipantBadgeProps {
    participant: Participant;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive'; // Updated variants
    isRemovable?: boolean; // New prop to conditionally render the x icon
    onRemove?: (id: string) => void; // Callback to handle removal
}

const ParticipantBadge: React.FC<ParticipantBadgeProps> = ({
    participant,
    variant = 'default',
    isRemovable = false,
    onRemove
}) => {
    return (
        <HoverCard>
            <HoverCardTrigger>
                <Badge
                    variant={variant}
                    className="transition-colors duration-300 hover:bg-gray-200 hover:text-gray-700 flex items-center"
                >
                    {participant.name}
                    <Info className="ml-2 h-4 w-4" />
                    {isRemovable && (
                        <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering HoverCard content on click
                                if (onRemove) onRemove(participant.id);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </Badge>
            </HoverCardTrigger>
            <HoverCardContent>
                <div className="flex flex-col">
                    <p className="text-sm font-medium">{participant.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {participant.employeeId}</p>
                    <p className="text-sm text-muted-foreground">{participant.email}</p>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export default ParticipantBadge;
