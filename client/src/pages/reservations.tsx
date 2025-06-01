import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import ReservationModal from "@/components/modals/reservation-modal";
import { apiRequest } from "@/lib/queryClient";
import type { ReservationWithDetails } from "@/lib/types";

export default function Reservations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkInFilter, setCheckInFilter] = useState("");
  const [checkOutFilter, setCheckOutFilter] = useState("");

  const { data: reservations = [], isLoading } = useQuery<ReservationWithDetails[]>({
    queryKey: ["/api/reservations", user?.branchId],
    enabled: !!user,
  });

  const updateReservationMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<ReservationWithDetails>) =>
      apiRequest("PUT", `/api/reservations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
    },
  });

  const filteredReservations = reservations.filter(reservation => {
    if (statusFilter !== "all" && reservation.status !== statusFilter) return false;
    if (checkInFilter && new Date(reservation.checkInDate).toDateString() !== new Date(checkInFilter).toDateString()) return false;
    if (checkOutFilter && new Date(reservation.checkOutDate).toDateString() !== new Date(checkOutFilter).toDateString()) return false;
    return true;
  });

  const handleStatusUpdate = async (reservationId: number, newStatus: string) => {
    try {
      await updateReservationMutation.mutateAsync({ 
        id: reservationId, 
        status: newStatus as any 
      });
    } catch (error) {
      console.error('Failed to update reservation status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: "bg-blue-100 text-blue-800",
      checked_in: "bg-green-100 text-green-800",
      checked_out: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
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
        <h2 className="text-2xl font-bold text-gray-900">Reservations</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
              <Input
                type="date"
                value={checkInFilter}
                onChange={(e) => setCheckInFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
              <Input
                type="date"
                value={checkOutFilter}
                onChange={(e) => setCheckOutFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No reservations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {reservation.guest?.firstName} {reservation.guest?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.guest?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{reservation.room?.number}</TableCell>
                      <TableCell>
                        {new Date(reservation.checkInDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(reservation.checkOutDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                      <TableCell className="font-medium">
                        ${parseFloat(reservation.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setIsModalOpen(true);
                            }}
                          >
                            View
                          </Button>
                          {reservation.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(reservation.id, "checked_in")}
                            >
                              Check In
                            </Button>
                          )}
                          {reservation.status === "checked_in" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(reservation.id, "checked_out")}
                            >
                              Check Out
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
      />
    </div>
  );
}
