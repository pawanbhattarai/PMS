import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, CheckCircle, Clock, DollarSign } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", user?.branchId],
    enabled: !!user,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/reservations", user?.branchId],
    enabled: !!user,
    select: (data: any[]) => data?.slice(0, 5) || [],
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Bed className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalRooms || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Occupied</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.occupied || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Check-ins Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.checkins || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${stats?.revenue?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const heights = [60, 80, 90, 70, 95, 100, 85];
                const percentages = [75, 85, 92, 71, 98, 100, 87];
                
                return (
                  <div key={day} className="flex-1 relative">
                    <div 
                      className="bg-primary rounded-t w-full"
                      style={{ height: `${heights[index]}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                        {percentages[index]}%
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                        {day}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((reservation: any) => (
                  <div key={reservation.id} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      reservation.status === 'checked_in' ? 'bg-green-500' :
                      reservation.status === 'confirmed' ? 'bg-blue-500' :
                      reservation.status === 'checked_out' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {reservation.guest?.firstName} {reservation.guest?.lastName} - Room {reservation.room?.number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
