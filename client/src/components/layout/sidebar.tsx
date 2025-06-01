import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { hasRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Hotel, X, BarChart3, Calendar, Bed, Users, 
  Utensils, Receipt, Package, PieChart, LogOut 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ["super_admin", "branch_admin", "receptionist", "restaurant_staff"] },
  { name: "Reservations", href: "/reservations", icon: Calendar, roles: ["super_admin", "branch_admin", "receptionist"] },
  { name: "Rooms", href: "/rooms", icon: Bed, roles: ["super_admin", "branch_admin", "receptionist", "housekeeping"] },
  { name: "Guests", href: "/guests", icon: Users, roles: ["super_admin", "branch_admin", "receptionist"] },
  { name: "Restaurant", href: "/restaurant", icon: Utensils, roles: ["super_admin", "branch_admin", "restaurant_staff"] },
  { name: "Billing", href: "/billing", icon: Receipt, roles: ["super_admin", "branch_admin", "receptionist"] },
  { name: "Inventory", href: "/inventory", icon: Package, roles: ["super_admin", "branch_admin"] },
  { name: "Reports", href: "/reports", icon: PieChart, roles: ["super_admin", "branch_admin"] },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  const { data: branches = [] } = useQuery({
    queryKey: ["/api/branches"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
  };

  const filteredNavigation = navigation.filter(item => 
    hasRole(user, item.roles)
  );

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Hotel className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="ml-3 text-lg font-semibold text-gray-900">HotelChain</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Branch Selector for Super Admin */}
      {user?.role === "super_admin" && branches.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Branch
          </label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch: any) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-300 text-gray-600">
              {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-4 flex-1">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "nav-item flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive && "active"
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
