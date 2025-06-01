import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { hasRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Calendar, TrendingUp, Users, Bed, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { ReservationWithDetails, RoomWithType, Guest } from "@/lib/types";

export default function Reports() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [reportType, setReportType] = useState("occupancy");

  if (!hasRole(user, ["super_admin", "branch_admin"])) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view reports.</p>
        </div>
      </div>
    );
  }

  const { data: reservations = [] } = useQuery<ReservationWithDetails[]>({
    queryKey: ["/api/reservations", user?.branchId],
    enabled: !!user,
  });

  const { data: rooms = [] } = useQuery<RoomWithType[]>({
    queryKey: ["/api/rooms", user?.branchId],
    enabled: !!user,
  });

  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
    enabled: !!user,
  });

  // Calculate report data based on selected period
  const periodDays = parseInt(selectedPeriod);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  const periodReservations = reservations.filter(res => {
    const resDate = new Date(res.createdAt);
    return resDate >= startDate && resDate <= endDate;
  });

  // Occupancy Report Data
  const totalRoomNights = rooms.length * periodDays;
  const occupiedNights = periodReservations.reduce((sum, res) => {
    const checkIn = new Date(res.checkInDate);
    const checkOut = new Date(res.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return sum + nights;
  }, 0);
  const occupancyRate = totalRoomNights > 0 ? (occupiedNights / totalRoomNights) * 100 : 0;

  // Revenue Report Data
  const totalRevenue = periodReservations.reduce((sum, res) => sum + parseFloat(res.totalAmount), 0);
  const averageDaily = totalRevenue / periodDays;
  const revenuePerRoom = rooms.length > 0 ? totalRevenue / rooms.length : 0;

  // Guest Report Data
  const newGuests = guests.filter(guest => {
    const guestDate = new Date(guest.createdAt);
    return guestDate >= startDate && guestDate <= endDate;
  });

  const repeatGuests = guests.filter(guest => guest.totalStays > 1);

  // Room Type Performance
  const roomTypePerformance = rooms.reduce((acc, room) => {
    const typeName = room.roomType?.name || 'Unknown';
    if (!acc[typeName]) {
      acc[typeName] = {
        name: typeName,
        totalRooms: 0,
        reservations: 0,
        revenue: 0,
      };
    }
    acc[typeName].totalRooms++;
    
    const roomReservations = periodReservations.filter(res => res.roomId === room.id);
    acc[typeName].reservations += roomReservations.length;
    acc[typeName].revenue += roomReservations.reduce((sum, res) => sum + parseFloat(res.totalAmount), 0);
    
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="occupancy">Occupancy Report</SelectItem>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="guest">Guest Report</SelectItem>
                  <SelectItem value="room-type">Room Type Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Bed className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{occupancyRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Daily Average</p>
                <p className="text-2xl font-semibold text-gray-900">${averageDaily.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">New Guests</p>
                <p className="text-2xl font-semibold text-gray-900">{newGuests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      {reportType === "occupancy" && (
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Report - Last {selectedPeriod} days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{occupancyRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Average Occupancy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{occupiedNights}</div>
                <div className="text-sm text-gray-500">Total Room Nights</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{periodReservations.length}</div>
                <div className="text-sm text-gray-500">Total Reservations</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recent Reservations</h4>
              {periodReservations.slice(0, 10).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {reservation.guest?.firstName} {reservation.guest?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Room {reservation.room?.number} • {new Date(reservation.checkInDate).toLocaleDateString()} - {new Date(reservation.checkOutDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={reservation.status === "checked_in" ? "default" : "secondary"}>
                    {reservation.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "revenue" && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Report - Last {selectedPeriod} days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">${averageDaily.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Daily Average</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">${revenuePerRoom.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Revenue per Room</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "room-type" && (
        <Card>
          <CardHeader>
            <CardTitle>Room Type Performance - Last {selectedPeriod} days</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Total Rooms</TableHead>
                  <TableHead>Reservations</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Avg Revenue per Room</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(roomTypePerformance).map((type: any) => (
                  <TableRow key={type.name}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.totalRooms}</TableCell>
                    <TableCell>{type.reservations}</TableCell>
                    <TableCell>${type.revenue.toFixed(2)}</TableCell>
                    <TableCell>${(type.revenue / type.totalRooms).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportType === "guest" && (
        <Card>
          <CardHeader>
            <CardTitle>Guest Report - Last {selectedPeriod} days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{newGuests.length}</div>
                <div className="text-sm text-gray-500">New Guests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{repeatGuests.length}</div>
                <div className="text-sm text-gray-500">Repeat Guests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{guests.length}</div>
                <div className="text-sm text-gray-500">Total Guests</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Guest Activity</h4>
              {newGuests.slice(0, 10).map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {guest.email} • Joined {new Date(guest.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={guest.totalStays > 1 ? "default" : "secondary"}>
                    {guest.totalStays} stays
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
