import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, User } from "lucide-react";
import GuestModal from "@/components/modals/guest-modal";
import type { Guest } from "@shared/schema";

export default function Guests() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ["/api/guests", searchQuery],
    enabled: !!user,
  });

  const filteredGuests = guests.filter(guest => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      guest.firstName.toLowerCase().includes(query) ||
      guest.lastName.toLowerCase().includes(query) ||
      guest.email.toLowerCase().includes(query) ||
      guest.phone.includes(query)
    );
  });

  const getGuestStatus = (guest: Guest) => {
    // This would typically check current reservations
    // For now, we'll show a simple status based on total stays
    if (guest.totalStays === 0) return "New";
    if (guest.totalStays > 5) return "VIP";
    return "Regular";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "New": "bg-blue-100 text-blue-800",
      "Regular": "bg-green-100 text-green-800",
      "VIP": "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
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
        <h2 className="text-2xl font-bold text-gray-900">Guests</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuests.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No guests found
          </div>
        ) : (
          filteredGuests.map((guest) => (
            <Card key={guest.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-300 text-gray-600">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">Guest ID: #G{guest.id.toString().padStart(3, '0')}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900 truncate ml-2">{guest.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-900">{guest.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Stays:</span>
                    <span className="text-gray-900">{guest.totalStays}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    {getStatusBadge(getGuestStatus(guest))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedGuest(guest);
                      setIsModalOpen(true);
                    }}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedGuest(guest);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <GuestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGuest(null);
        }}
        guest={selectedGuest}
      />
    </div>
  );
}
