import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import RoomModal from "@/components/modals/room-modal";
import type { RoomWithType } from "@/lib/types";

export default function Rooms() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithType | null>(null);

  const { data: rooms = [], isLoading } = useQuery<RoomWithType[]>({
    queryKey: ["/api/rooms", user?.branchId],
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      occupied: "bg-red-100 text-red-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      cleaning: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
        {(user?.role === "super_admin" || user?.role === "branch_admin") && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No rooms found
          </div>
        ) : (
          rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Room {room.number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {room.roomType?.name || 'No Type'}
                    </p>
                  </div>
                  {getStatusBadge(room.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rate:</span>
                    <span className="text-gray-900 font-medium">
                      ${room.roomType?.baseRate || '0'}/night
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="text-gray-900">
                      {room.roomType?.maxOccupancy || 0} guests
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Floor:</span>
                    <span className="text-gray-900">{room.floor}</span>
                  </div>
                  {room.notes && (
                    <div className="text-sm text-gray-500 mt-2">
                      <span className="font-medium">Notes:</span> {room.notes}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsModalOpen(true);
                    }}
                  >
                    {(user?.role === "super_admin" || user?.role === "branch_admin") ? 'Edit' : 'View'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsModalOpen(true);
                    }}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
      />
    </div>
  );
}
