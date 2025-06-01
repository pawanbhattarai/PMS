import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { hasRole } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { RoomWithType, RoomType } from "@/lib/types";

const roomSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  floor: z.number().min(1, "Floor must be at least 1"),
  roomTypeId: z.number(),
  status: z.enum(["available", "occupied", "maintenance", "cleaning"]),
  notes: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomWithType | null;
}

export default function RoomModal({ isOpen, onClose, room }: RoomModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const { data: roomTypes = [] } = useQuery<RoomType[]>({
    queryKey: ["/api/room-types", user?.branchId],
    enabled: isOpen && !!user,
  });

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      status: "available",
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data: RoomFormData & { branchId: number }) =>
      apiRequest("POST", "/api/rooms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      onClose();
      form.reset();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create room");
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: (data: Partial<RoomFormData>) =>
      apiRequest("PUT", `/api/rooms/${room?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to update room");
    },
  });

  useEffect(() => {
    if (room) {
      form.setValue("number", room.number);
      form.setValue("floor", room.floor);
      form.setValue("roomTypeId", room.roomTypeId);
      form.setValue("status", room.status as any);
      form.setValue("notes", room.notes || "");
    } else {
      form.reset();
    }
    setError("");
  }, [room, form]);

  const handleSubmit = async (data: RoomFormData) => {
    if (!user?.branchId) {
      setError("No branch selected");
      return;
    }

    try {
      if (room) {
        await updateRoomMutation.mutateAsync(data);
      } else {
        await createRoomMutation.mutateAsync({
          ...data,
          branchId: user.branchId,
        });
      }
    } catch (err) {
      // Error handled in mutation
    }
  };

  const canEdit = hasRole(user, ["super_admin", "branch_admin"]);
  const isViewMode = !!room && !canEdit;
  const selectedRoomType = roomTypes.find(rt => rt.id === form.watch("roomTypeId"));

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {room ? (isViewMode ? "Room Details" : "Edit Room") : "Add New Room"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="number">Room Number</Label>
              <Input
                {...form.register("number")}
                placeholder="e.g., 101, A-205"
                disabled={isViewMode}
              />
              {form.formState.errors.number && (
                <p className="text-sm text-red-600">{form.formState.errors.number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                type="number"
                min="1"
                {...form.register("floor", { valueAsNumber: true })}
                disabled={isViewMode}
              />
              {form.formState.errors.floor && (
                <p className="text-sm text-red-600">{form.formState.errors.floor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              {isViewMode ? (
                <Input
                  value={room?.roomType?.name || "Unknown Type"}
                  disabled
                />
              ) : (
                <Select
                  value={form.watch("roomTypeId")?.toString() || ""}
                  onValueChange={(value) => form.setValue("roomTypeId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} - ${type.baseRate}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.roomTypeId && (
                <p className="text-sm text-red-600">Room type is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isViewMode ? (
                <div>
                  {getStatusBadge(room?.status || "available")}
                </div>
              ) : (
                <Select
                  value={form.watch("status") || "available"}
                  onValueChange={(value) => form.setValue("status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Any special notes about this room..."
              disabled={isViewMode}
            />
          </div>

          {selectedRoomType && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Room Type Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Base Rate:</span> ${selectedRoomType.baseRate}/night
                </div>
                <div>
                  <span className="text-gray-500">Max Occupancy:</span> {selectedRoomType.maxOccupancy} guests
                </div>
                {selectedRoomType.description && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Description:</span> {selectedRoomType.description}
                  </div>
                )}
                {selectedRoomType.amenities && selectedRoomType.amenities.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Amenities:</span> {selectedRoomType.amenities.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button 
                type="submit" 
                disabled={createRoomMutation.isPending || updateRoomMutation.isPending}
              >
                {createRoomMutation.isPending || updateRoomMutation.isPending 
                  ? (room ? "Updating..." : "Creating...") 
                  : (room ? "Update Room" : "Create Room")
                }
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
