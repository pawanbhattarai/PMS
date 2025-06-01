export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'branch_admin' | 'receptionist' | 'restaurant_staff' | 'housekeeping';
  branchId?: number;
  active: boolean;
}

export interface DashboardStats {
  totalRooms: number;
  occupied: number;
  checkins: number;
  revenue: number;
}

export interface RoomWithType {
  id: number;
  number: string;
  floor: number;
  roomTypeId: number;
  branchId: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  notes?: string;
  roomType?: {
    id: number;
    name: string;
    description?: string;
    baseRate: string;
    maxOccupancy: number;
    amenities: string[];
  };
}

export interface ReservationWithDetails {
  id: number;
  guestId: number;
  roomId: number;
  branchId: number;
  checkInDate: string;
  checkOutDate: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  adults: number;
  children: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  totalAmount: string;
  paidAmount: string;
  notes?: string;
  createdBy: number;
  createdAt: string;
  guest?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  room?: {
    id: number;
    number: string;
    floor: number;
  };
}

export interface MenuItemWithCategory {
  id: number;
  name: string;
  description?: string;
  price: string;
  categoryId: number;
  branchId: number;
  available: boolean;
  preparationTime?: number;
  ingredients: string[];
  category?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface RoomType {
  id: number;
  name: string;
  description?: string;
  baseRate: string;
  maxOccupancy: number;
  amenities: string[];
  branchId: number;
}

export interface InvoiceWithGuest {
  id: number;
  invoiceNumber: string;
  reservationId?: number;
  guestId: number;
  branchId: number;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: string;
  tax: string;
  total: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdBy: number;
  createdAt: string;
  guest?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
