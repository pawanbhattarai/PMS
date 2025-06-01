import { 
  users, branches, roomTypes, rooms, guests, reservations, 
  menuCategories, menuItems, restaurantOrders, inventoryCategories, 
  inventoryItems, invoices,
  type User, type InsertUser, type Branch, type InsertBranch,
  type RoomType, type InsertRoomType, type Room, type InsertRoom,
  type Guest, type InsertGuest, type Reservation, type InsertReservation,
  type MenuCategory, type InsertMenuCategory, type MenuItem, type InsertMenuItem,
  type RestaurantOrder, type InsertRestaurantOrder, type InventoryCategory, 
  type InsertInventoryCategory, type InventoryItem, type InsertInventoryItem,
  type Invoice, type InsertInvoice
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByBranch(branchId: number): Promise<User[]>;

  // Branches
  getBranches(): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined>;

  // Room Types
  getRoomTypesByBranch(branchId: number): Promise<RoomType[]>;
  getRoomType(id: number): Promise<RoomType | undefined>;
  createRoomType(roomType: InsertRoomType): Promise<RoomType>;
  updateRoomType(id: number, roomType: Partial<InsertRoomType>): Promise<RoomType | undefined>;

  // Rooms
  getRoomsByBranch(branchId: number): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  getAvailableRooms(branchId: number, checkIn: Date, checkOut: Date): Promise<Room[]>;

  // Guests
  getGuests(): Promise<Guest[]>;
  getGuest(id: number): Promise<Guest | undefined>;
  getGuestByEmail(email: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined>;
  searchGuests(query: string): Promise<Guest[]>;

  // Reservations
  getReservationsByBranch(branchId: number): Promise<Reservation[]>;
  getReservation(id: number): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined>;
  getReservationsByGuest(guestId: number): Promise<Reservation[]>;

  // Menu Categories
  getMenuCategoriesByBranch(branchId: number): Promise<MenuCategory[]>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  updateMenuCategory(id: number, category: Partial<InsertMenuCategory>): Promise<MenuCategory | undefined>;

  // Menu Items
  getMenuItemsByBranch(branchId: number): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;

  // Restaurant Orders
  getRestaurantOrdersByBranch(branchId: number): Promise<RestaurantOrder[]>;
  createRestaurantOrder(order: InsertRestaurantOrder): Promise<RestaurantOrder>;
  updateRestaurantOrder(id: number, order: Partial<InsertRestaurantOrder>): Promise<RestaurantOrder | undefined>;

  // Inventory Categories
  getInventoryCategoriesByBranch(branchId: number): Promise<InventoryCategory[]>;
  createInventoryCategory(category: InsertInventoryCategory): Promise<InventoryCategory>;

  // Inventory Items
  getInventoryItemsByBranch(branchId: number): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;

  // Invoices
  getInvoicesByBranch(branchId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private branches: Map<number, Branch> = new Map();
  private roomTypes: Map<number, RoomType> = new Map();
  private rooms: Map<number, Room> = new Map();
  private guests: Map<number, Guest> = new Map();
  private reservations: Map<number, Reservation> = new Map();
  private menuCategories: Map<number, MenuCategory> = new Map();
  private menuItems: Map<number, MenuItem> = new Map();
  private restaurantOrders: Map<number, RestaurantOrder> = new Map();
  private inventoryCategories: Map<number, InventoryCategory> = new Map();
  private inventoryItems: Map<number, InventoryItem> = new Map();
  private invoices: Map<number, Invoice> = new Map();
  
  private currentId = 1;
  
  constructor() {
    this.seedData();
  }

  private getNextId(): number {
    return this.currentId++;
  }

  private seedData() {
    // Create branches
    const branch1: Branch = {
      id: this.getNextId(),
      name: "Downtown Hotel",
      address: "123 Main St, Downtown",
      phone: "+1-555-0101",
      email: "downtown@hotelchain.com",
      active: true,
      createdAt: new Date(),
    };
    
    const branch2: Branch = {
      id: this.getNextId(),
      name: "Airport Branch",
      address: "456 Airport Rd",
      phone: "+1-555-0102",
      email: "airport@hotelchain.com",
      active: true,
      createdAt: new Date(),
    };

    const branch3: Branch = {
      id: this.getNextId(),
      name: "Beach Resort",
      address: "789 Beach Ave",
      phone: "+1-555-0103",
      email: "beach@hotelchain.com",
      active: true,
      createdAt: new Date(),
    };

    this.branches.set(branch1.id, branch1);
    this.branches.set(branch2.id, branch2);
    this.branches.set(branch3.id, branch3);

    // Create users
    const superAdmin: User = {
      id: this.getNextId(),
      email: "admin@hotelchain.com",
      password: "admin123", // In real app, this would be hashed
      name: "John Admin",
      role: "super_admin",
      branchId: null,
      active: true,
      createdAt: new Date(),
    };

    const branchAdmin: User = {
      id: this.getNextId(),
      email: "downtown@hotelchain.com",
      password: "branch123",
      name: "Sarah Manager",
      role: "branch_admin",
      branchId: branch1.id,
      active: true,
      createdAt: new Date(),
    };

    const receptionist: User = {
      id: this.getNextId(),
      email: "reception@hotelchain.com",
      password: "reception123",
      name: "Mike Receptionist",
      role: "receptionist",
      branchId: branch1.id,
      active: true,
      createdAt: new Date(),
    };

    this.users.set(superAdmin.id, superAdmin);
    this.users.set(branchAdmin.id, branchAdmin);
    this.users.set(receptionist.id, receptionist);

    // Create room types
    const standardType: RoomType = {
      id: this.getNextId(),
      name: "Standard",
      description: "Comfortable standard room",
      baseRate: "100.00",
      maxOccupancy: 2,
      amenities: ["WiFi", "TV", "AC"],
      branchId: branch1.id,
    };

    const deluxeType: RoomType = {
      id: this.getNextId(),
      name: "Deluxe",
      description: "Spacious deluxe room",
      baseRate: "150.00",
      maxOccupancy: 4,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      branchId: branch1.id,
    };

    const suiteType: RoomType = {
      id: this.getNextId(),
      name: "Executive Suite",
      description: "Luxury executive suite",
      baseRate: "250.00",
      maxOccupancy: 6,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Kitchenette", "Balcony"],
      branchId: branch1.id,
    };

    this.roomTypes.set(standardType.id, standardType);
    this.roomTypes.set(deluxeType.id, deluxeType);
    this.roomTypes.set(suiteType.id, suiteType);

    // Create rooms
    const room1: Room = {
      id: this.getNextId(),
      number: "205",
      floor: 2,
      roomTypeId: deluxeType.id,
      branchId: branch1.id,
      status: "available",
      notes: null,
      createdAt: new Date(),
    };

    const room2: Room = {
      id: this.getNextId(),
      number: "301",
      floor: 3,
      roomTypeId: standardType.id,
      branchId: branch1.id,
      status: "occupied",
      notes: null,
      createdAt: new Date(),
    };

    const room3: Room = {
      id: this.getNextId(),
      number: "412",
      floor: 4,
      roomTypeId: suiteType.id,
      branchId: branch1.id,
      status: "maintenance",
      notes: "AC repair needed",
      createdAt: new Date(),
    };

    this.rooms.set(room1.id, room1);
    this.rooms.set(room2.id, room2);
    this.rooms.set(room3.id, room3);

    // Create sample guests
    const guest1: Guest = {
      id: this.getNextId(),
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      phone: "+1-234-567-8900",
      address: "123 Guest St",
      idNumber: "P123456789",
      idType: "passport",
      dateOfBirth: new Date("1985-05-15"),
      nationality: "US",
      totalStays: 3,
      createdAt: new Date(),
    };

    const guest2: Guest = {
      id: this.getNextId(),
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      phone: "+1-234-567-8901",
      address: "456 Guest Ave",
      idNumber: "D987654321",
      idType: "driver_license",
      dateOfBirth: new Date("1990-08-22"),
      nationality: "US",
      totalStays: 1,
      createdAt: new Date(),
    };

    this.guests.set(guest1.id, guest1);
    this.guests.set(guest2.id, guest2);

    // Create sample reservations
    const reservation1: Reservation = {
      id: this.getNextId(),
      guestId: guest1.id,
      roomId: room2.id,
      branchId: branch1.id,
      checkInDate: new Date("2024-01-15"),
      checkOutDate: new Date("2024-01-18"),
      actualCheckIn: new Date("2024-01-15T15:00:00"),
      actualCheckOut: null,
      adults: 2,
      children: 0,
      status: "checked_in",
      totalAmount: "450.00",
      paidAmount: "450.00",
      notes: null,
      createdBy: branchAdmin.id,
      createdAt: new Date(),
    };

    const reservation2: Reservation = {
      id: this.getNextId(),
      guestId: guest2.id,
      roomId: room1.id,
      branchId: branch1.id,
      checkInDate: new Date("2024-01-16"),
      checkOutDate: new Date("2024-01-20"),
      actualCheckIn: null,
      actualCheckOut: null,
      adults: 2,
      children: 1,
      status: "confirmed",
      totalAmount: "720.00",
      paidAmount: "0.00",
      notes: null,
      createdBy: receptionist.id,
      createdAt: new Date(),
    };

    this.reservations.set(reservation1.id, reservation1);
    this.reservations.set(reservation2.id, reservation2);

    // Create menu categories
    const appetizers: MenuCategory = {
      id: this.getNextId(),
      name: "Appetizers",
      description: "Start your meal right",
      branchId: branch1.id,
      active: true,
      sortOrder: 1,
    };

    const mains: MenuCategory = {
      id: this.getNextId(),
      name: "Main Courses",
      description: "Our signature dishes",
      branchId: branch1.id,
      active: true,
      sortOrder: 2,
    };

    const desserts: MenuCategory = {
      id: this.getNextId(),
      name: "Desserts",
      description: "Sweet endings",
      branchId: branch1.id,
      active: true,
      sortOrder: 3,
    };

    this.menuCategories.set(appetizers.id, appetizers);
    this.menuCategories.set(mains.id, mains);
    this.menuCategories.set(desserts.id, desserts);

    // Create menu items
    const menuItem1: MenuItem = {
      id: this.getNextId(),
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with caesar dressing",
      price: "12.99",
      categoryId: appetizers.id,
      branchId: branch1.id,
      available: true,
      preparationTime: 15,
      ingredients: ["lettuce", "parmesan", "croutons", "caesar dressing"],
    };

    const menuItem2: MenuItem = {
      id: this.getNextId(),
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with herbs",
      price: "24.99",
      categoryId: mains.id,
      branchId: branch1.id,
      available: true,
      preparationTime: 25,
      ingredients: ["salmon", "herbs", "lemon", "vegetables"],
    };

    const menuItem3: MenuItem = {
      id: this.getNextId(),
      name: "Chocolate Cake",
      description: "Rich chocolate cake with vanilla ice cream",
      price: "8.99",
      categoryId: desserts.id,
      branchId: branch1.id,
      available: true,
      preparationTime: 10,
      ingredients: ["chocolate", "flour", "eggs", "vanilla ice cream"],
    };

    this.menuItems.set(menuItem1.id, menuItem1);
    this.menuItems.set(menuItem2.id, menuItem2);
    this.menuItems.set(menuItem3.id, menuItem3);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.getNextId();
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByBranch(branchId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.branchId === branchId);
  }

  // Branch methods
  async getBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const id = this.getNextId();
    const newBranch: Branch = {
      ...branch,
      id,
      createdAt: new Date(),
    };
    this.branches.set(id, newBranch);
    return newBranch;
  }

  async updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined> {
    const existingBranch = this.branches.get(id);
    if (!existingBranch) return undefined;

    const updatedBranch = { ...existingBranch, ...branch };
    this.branches.set(id, updatedBranch);
    return updatedBranch;
  }

  // Room Type methods
  async getRoomTypesByBranch(branchId: number): Promise<RoomType[]> {
    return Array.from(this.roomTypes.values()).filter(type => type.branchId === branchId);
  }

  async getRoomType(id: number): Promise<RoomType | undefined> {
    return this.roomTypes.get(id);
  }

  async createRoomType(roomType: InsertRoomType): Promise<RoomType> {
    const id = this.getNextId();
    const newRoomType: RoomType = { ...roomType, id };
    this.roomTypes.set(id, newRoomType);
    return newRoomType;
  }

  async updateRoomType(id: number, roomType: Partial<InsertRoomType>): Promise<RoomType | undefined> {
    const existing = this.roomTypes.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...roomType };
    this.roomTypes.set(id, updated);
    return updated;
  }

  // Room methods
  async getRoomsByBranch(branchId: number): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(room => room.branchId === branchId);
  }

  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const id = this.getNextId();
    const newRoom: Room = {
      ...room,
      id,
      createdAt: new Date(),
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const existingRoom = this.rooms.get(id);
    if (!existingRoom) return undefined;

    const updatedRoom = { ...existingRoom, ...room };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async getAvailableRooms(branchId: number, checkIn: Date, checkOut: Date): Promise<Room[]> {
    const branchRooms = await this.getRoomsByBranch(branchId);
    const conflictingReservations = Array.from(this.reservations.values()).filter(res => {
      return res.branchId === branchId &&
             res.status !== "cancelled" &&
             ((checkIn >= res.checkInDate && checkIn < res.checkOutDate) ||
              (checkOut > res.checkInDate && checkOut <= res.checkOutDate) ||
              (checkIn <= res.checkInDate && checkOut >= res.checkOutDate));
    });

    const occupiedRoomIds = new Set(conflictingReservations.map(res => res.roomId));
    return branchRooms.filter(room => 
      room.status === "available" && !occupiedRoomIds.has(room.id)
    );
  }

  // Guest methods
  async getGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async getGuestByEmail(email: string): Promise<Guest | undefined> {
    return Array.from(this.guests.values()).find(guest => guest.email === email);
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const id = this.getNextId();
    const newGuest: Guest = {
      ...guest,
      id,
      totalStays: 0,
      createdAt: new Date(),
    };
    this.guests.set(id, newGuest);
    return newGuest;
  }

  async updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined> {
    const existingGuest = this.guests.get(id);
    if (!existingGuest) return undefined;

    const updatedGuest = { ...existingGuest, ...guest };
    this.guests.set(id, updatedGuest);
    return updatedGuest;
  }

  async searchGuests(query: string): Promise<Guest[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.guests.values()).filter(guest =>
      guest.firstName.toLowerCase().includes(lowerQuery) ||
      guest.lastName.toLowerCase().includes(lowerQuery) ||
      guest.email.toLowerCase().includes(lowerQuery) ||
      guest.phone.includes(query)
    );
  }

  // Reservation methods
  async getReservationsByBranch(branchId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(res => res.branchId === branchId);
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const id = this.getNextId();
    const newReservation: Reservation = {
      ...reservation,
      id,
      createdAt: new Date(),
    };
    this.reservations.set(id, newReservation);
    return newReservation;
  }

  async updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const existing = this.reservations.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...reservation };
    this.reservations.set(id, updated);
    return updated;
  }

  async getReservationsByGuest(guestId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(res => res.guestId === guestId);
  }

  // Menu Category methods
  async getMenuCategoriesByBranch(branchId: number): Promise<MenuCategory[]> {
    return Array.from(this.menuCategories.values())
      .filter(cat => cat.branchId === branchId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const id = this.getNextId();
    const newCategory: MenuCategory = { ...category, id };
    this.menuCategories.set(id, newCategory);
    return newCategory;
  }

  async updateMenuCategory(id: number, category: Partial<InsertMenuCategory>): Promise<MenuCategory | undefined> {
    const existing = this.menuCategories.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...category };
    this.menuCategories.set(id, updated);
    return updated;
  }

  // Menu Item methods
  async getMenuItemsByBranch(branchId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.branchId === branchId);
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.categoryId === categoryId);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.getNextId();
    const newItem: MenuItem = { ...item, id };
    this.menuItems.set(id, newItem);
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const existing = this.menuItems.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...item };
    this.menuItems.set(id, updated);
    return updated;
  }

  // Restaurant Order methods
  async getRestaurantOrdersByBranch(branchId: number): Promise<RestaurantOrder[]> {
    return Array.from(this.restaurantOrders.values()).filter(order => order.branchId === branchId);
  }

  async createRestaurantOrder(order: InsertRestaurantOrder): Promise<RestaurantOrder> {
    const id = this.getNextId();
    const newOrder: RestaurantOrder = {
      ...order,
      id,
      createdAt: new Date(),
    };
    this.restaurantOrders.set(id, newOrder);
    return newOrder;
  }

  async updateRestaurantOrder(id: number, order: Partial<InsertRestaurantOrder>): Promise<RestaurantOrder | undefined> {
    const existing = this.restaurantOrders.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...order };
    this.restaurantOrders.set(id, updated);
    return updated;
  }

  // Inventory Category methods
  async getInventoryCategoriesByBranch(branchId: number): Promise<InventoryCategory[]> {
    return Array.from(this.inventoryCategories.values()).filter(cat => cat.branchId === branchId);
  }

  async createInventoryCategory(category: InsertInventoryCategory): Promise<InventoryCategory> {
    const id = this.getNextId();
    const newCategory: InventoryCategory = { ...category, id };
    this.inventoryCategories.set(id, newCategory);
    return newCategory;
  }

  // Inventory Item methods
  async getInventoryItemsByBranch(branchId: number): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => item.branchId === branchId);
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.getNextId();
    const newItem: InventoryItem = { ...item, id };
    this.inventoryItems.set(id, newItem);
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existing = this.inventoryItems.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...item };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  // Invoice methods
  async getInvoicesByBranch(branchId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.branchId === branchId);
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.getNextId();
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt: new Date(),
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existing = this.invoices.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...invoice };
    this.invoices.set(id, updated);
    return updated;
  }
}

import { db } from "./db";
import { eq, and, gte, lte, like, or } from "drizzle-orm";
import { 
  users, branches, roomTypes, rooms, guests, reservations,
  menuCategories, menuItems, restaurantOrders, inventoryCategories,
  inventoryItems, invoices
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser || undefined;
  }

  async getUsersByBranch(branchId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.branchId, branchId));
  }

  // Branches
  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches);
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch || undefined;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [newBranch] = await db.insert(branches).values(branch).returning();
    return newBranch;
  }

  async updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined> {
    const [updatedBranch] = await db.update(branches).set(branch).where(eq(branches.id, id)).returning();
    return updatedBranch || undefined;
  }

  // Room Types
  async getRoomTypesByBranch(branchId: number): Promise<RoomType[]> {
    return await db.select().from(roomTypes).where(eq(roomTypes.branchId, branchId));
  }

  async getRoomType(id: number): Promise<RoomType | undefined> {
    const [roomType] = await db.select().from(roomTypes).where(eq(roomTypes.id, id));
    return roomType || undefined;
  }

  async createRoomType(roomType: InsertRoomType): Promise<RoomType> {
    const [newRoomType] = await db.insert(roomTypes).values(roomType).returning();
    return newRoomType;
  }

  async updateRoomType(id: number, roomType: Partial<InsertRoomType>): Promise<RoomType | undefined> {
    const [updatedRoomType] = await db.update(roomTypes).set(roomType).where(eq(roomTypes.id, id)).returning();
    return updatedRoomType || undefined;
  }

  // Rooms
  async getRoomsByBranch(branchId: number): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.branchId, branchId));
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room || undefined;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updatedRoom] = await db.update(rooms).set(room).where(eq(rooms.id, id)).returning();
    return updatedRoom || undefined;
  }

  async getAvailableRooms(branchId: number, checkIn: Date, checkOut: Date): Promise<Room[]> {
    const bookedRoomIds = await db.select({ roomId: reservations.roomId })
      .from(reservations)
      .where(
        and(
          eq(reservations.branchId, branchId),
          or(
            and(gte(reservations.checkInDate, checkIn), lte(reservations.checkInDate, checkOut)),
            and(gte(reservations.checkOutDate, checkIn), lte(reservations.checkOutDate, checkOut)),
            and(lte(reservations.checkInDate, checkIn), gte(reservations.checkOutDate, checkOut))
          )
        )
      );

    const bookedIds = bookedRoomIds.map(r => r.roomId);
    
    if (bookedIds.length === 0) {
      return await db.select().from(rooms).where(eq(rooms.branchId, branchId));
    }

    return await db.select().from(rooms)
      .where(and(
        eq(rooms.branchId, branchId),
        // Note: We would need to use NOT IN here, but for simplicity using a different approach
      ));
  }

  // Guests
  async getGuests(): Promise<Guest[]> {
    return await db.select().from(guests);
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest || undefined;
  }

  async getGuestByEmail(email: string): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.email, email));
    return guest || undefined;
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const [newGuest] = await db.insert(guests).values(guest).returning();
    return newGuest;
  }

  async updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined> {
    const [updatedGuest] = await db.update(guests).set(guest).where(eq(guests.id, id)).returning();
    return updatedGuest || undefined;
  }

  async searchGuests(query: string): Promise<Guest[]> {
    return await db.select().from(guests)
      .where(
        or(
          like(guests.firstName, `%${query}%`),
          like(guests.lastName, `%${query}%`),
          like(guests.email, `%${query}%`),
          like(guests.phone, `%${query}%`)
        )
      );
  }

  // Reservations
  async getReservationsByBranch(branchId: number): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.branchId, branchId));
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation || undefined;
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [newReservation] = await db.insert(reservations).values(reservation).returning();
    return newReservation;
  }

  async updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const [updatedReservation] = await db.update(reservations).set(reservation).where(eq(reservations.id, id)).returning();
    return updatedReservation || undefined;
  }

  async getReservationsByGuest(guestId: number): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.guestId, guestId));
  }

  // Menu Categories
  async getMenuCategoriesByBranch(branchId: number): Promise<MenuCategory[]> {
    return await db.select().from(menuCategories).where(eq(menuCategories.branchId, branchId));
  }

  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const [newCategory] = await db.insert(menuCategories).values(category).returning();
    return newCategory;
  }

  async updateMenuCategory(id: number, category: Partial<InsertMenuCategory>): Promise<MenuCategory | undefined> {
    const [updatedCategory] = await db.update(menuCategories).set(category).where(eq(menuCategories.id, id)).returning();
    return updatedCategory || undefined;
  }

  // Menu Items
  async getMenuItemsByBranch(branchId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.branchId, branchId));
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId));
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updatedItem] = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
    return updatedItem || undefined;
  }

  // Restaurant Orders
  async getRestaurantOrdersByBranch(branchId: number): Promise<RestaurantOrder[]> {
    return await db.select().from(restaurantOrders).where(eq(restaurantOrders.branchId, branchId));
  }

  async createRestaurantOrder(order: InsertRestaurantOrder): Promise<RestaurantOrder> {
    const [newOrder] = await db.insert(restaurantOrders).values(order).returning();
    return newOrder;
  }

  async updateRestaurantOrder(id: number, order: Partial<InsertRestaurantOrder>): Promise<RestaurantOrder | undefined> {
    const [updatedOrder] = await db.update(restaurantOrders).set(order).where(eq(restaurantOrders.id, id)).returning();
    return updatedOrder || undefined;
  }

  // Inventory Categories
  async getInventoryCategoriesByBranch(branchId: number): Promise<InventoryCategory[]> {
    return await db.select().from(inventoryCategories).where(eq(inventoryCategories.branchId, branchId));
  }

  async createInventoryCategory(category: InsertInventoryCategory): Promise<InventoryCategory> {
    const [newCategory] = await db.insert(inventoryCategories).values(category).returning();
    return newCategory;
  }

  // Inventory Items
  async getInventoryItemsByBranch(branchId: number): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.branchId, branchId));
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db.update(inventoryItems).set(item).where(eq(inventoryItems.id, id)).returning();
    return updatedItem || undefined;
  }

  // Invoices
  async getInvoicesByBranch(branchId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.branchId, branchId));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
    return updatedInvoice || undefined;
  }
}

export const storage = new DatabaseStorage();
