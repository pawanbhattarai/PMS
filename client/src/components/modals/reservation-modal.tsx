import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ReservationWithDetails, Guest, RoomWithType } from "@/lib/types";

const reservationSchema = z.object({
  guestId: z.number(),
  roomId: z.number(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  adults: z.number().min(1),
  children: z.number().min(0),
  totalAmount: z.string(),
  notes: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: ReservationWithDetails | null;
}

export default function ReservationModal({ isOpen, onClose, reservation }: ReservationModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
    enabled: isOpen,
  });

  const { data: availableRooms = [] } = useQuery<RoomWithType[]>({
    queryKey: ["/api/rooms/available", user?.branchId, checkInDate, checkOutDate],
    enabled: isOpen && !!checkInDate && !!checkOutDate && !reservation,
  });

  const { data: allRooms = [] } = useQuery<RoomWithType[]>({
    queryKey: ["/api/rooms", user?.branchId],
    enabled: isOpen && !!reservation,
  });

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      notes: "",
    },
  });

  const createReservationMutation = useMutation({
    mutationFn: (data: ReservationFormData & { branchId: number }) =>
      apiRequest("POST", "/api/reservations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      onClose();
      form.reset();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create reservation");
    },
  });

  useEffect(() => {
    if (reservation) {
      const guest = guests.find(g => g.id === reservation.guestId);
      setSelectedGuest(guest || null);
      
      form.setValue("guestId", reservation.guestId);
      form.setValue("roomId", reservation.roomId);
      form.setValue("checkInDate", reservation.checkInDate.split('T')[0]);
      form.setValue("checkOutDate", reservation.checkOutDate.split('T')[0]);
      form.setValue("adults", reservation.adults);
      form.setValue("children", reservation.children);
      form.setValue("totalAmount", reservation.totalAmount);
      form.setValue("notes", reservation.notes || "");
      
      setCheckInDate(reservation.checkInDate.split('T')[0]);
      setCheckOutDate(reservation.checkOutDate.split('T')[0]);
    } else {
      form.reset();
      setSelectedGuest(null);
      setCheckInDate("");
      setCheckOutDate("");
    }
    setError("");
  }, [reservation, guests, form]);

  const handleSubmit = async (data: ReservationFormData) => {
    if (!user?.branchId) {
      setError("No branch selected");
      return;
    }

    if (reservation) {
      // View mode - close modal
      onClose();
      return;
    }

    try {
      await createReservationMutation.mutateAsync({
        ...data,
        branchId: user.branchId,
      });
    } catch (err) {
      // Error handled in mutation
    }
  };

  const calculateTotal = () => {
    const roomId = form.watch("roomId");
    const checkIn = form.watch("checkInDate");
    const checkOut = form.watch("checkOutDate");
    
    if (!roomId || !checkIn || !checkOut) return "0.00";
    
    const room = (reservation ? allRooms : availableRooms).find(r => r.id === roomId);
    if (!room?.roomType) return "0.00";
    
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const total = parseFloat(room.roomType.baseRate) * nights;
    return total.toFixed(2);
  };

  useEffect(() => {
    const total = calculateTotal();
    form.setValue("totalAmount", total);
  }, [form.watch("roomId"), form.watch("checkInDate"), form.watch("checkOutDate")]);

  const isViewMode = !!reservation;
  const rooms = reservation ? allRooms : availableRooms;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? "Reservation Details" : "New Reservation"}
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
              <Label htmlFor="guest">Guest</Label>
              {isViewMode ? (
                <Input
                  value={selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : "Unknown Guest"}
                  disabled
                />
              ) : (
                <Select
                  value={form.watch("guestId")?.toString() || ""}
                  onValueChange={(value) => {
                    const guestId = parseInt(value);
                    const guest = guests.find(g => g.id === guestId);
                    setSelectedGuest(guest || null);
                    form.setValue("guestId", guestId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id.toString()}>
                        {guest.firstName} {guest.lastName} - {guest.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              {isViewMode ? (
                <Input
                  value={rooms.find(r => r.id === reservation?.roomId)?.number || "Unknown Room"}
                  disabled
                />
              ) : (
                <Select
                  value={form.watch("roomId")?.toString() || ""}
                  onValueChange={(value) => form.setValue("roomId", parseInt(value))}
                  disabled={!checkInDate || !checkOutDate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!checkInDate || !checkOutDate ? "Select dates first" : "Select room"} />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        Room {room.number} - {room.roomType?.name} (${room.roomType?.baseRate}/night)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Input
                type="date"
                {...form.register("checkInDate")}
                onChange={(e) => {
                  setCheckInDate(e.target.value);
                  form.setValue("checkInDate", e.target.value);
                }}
                disabled={isViewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <Input
                type="date"
                {...form.register("checkOutDate")}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  form.setValue("checkOutDate", e.target.value);
                }}
                disabled={isViewMode}
                min={checkInDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adults">Adults</Label>
              <Input
                type="number"
                min="1"
                {...form.register("adults", { valueAsNumber: true })}
                disabled={isViewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="children">Children</Label>
              <Input
                type="number"
                min="0"
                {...form.register("children", { valueAsNumber: true })}
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              {...form.register("totalAmount")}
              disabled
              className="font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Any special requests or notes..."
              disabled={isViewMode}
            />
          </div>

          {selectedGuest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Guest Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span> {selectedGuest.email}
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span> {selectedGuest.phone}
                </div>
                <div>
                  <span className="text-gray-500">Total Stays:</span> {selectedGuest.totalStays}
                </div>
                {selectedGuest.nationality && (
                  <div>
                    <span className="text-gray-500">Nationality:</span> {selectedGuest.nationality}
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
                disabled={createReservationMutation.isPending}
              >
                {createReservationMutation.isPending ? "Creating..." : "Create Reservation"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
