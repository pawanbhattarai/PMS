import { Menu, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitle: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/reservations": "Reservations",
  "/rooms": "Rooms",
  "/guests": "Guests",
  "/restaurant": "Restaurant",
  "/billing": "Billing & Invoices",
  "/inventory": "Inventory",
  "/reports": "Reports",
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const title = pageTitle[location] || "Dashboard";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-4"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
