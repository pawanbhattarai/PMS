import { db } from "./db";
import { eq, and, gte, lte, like, or } from "drizzle-orm";
import { 
  users, branches, roomTypes, rooms, guests, reservations,
  menuCategories, menuItems, restaurantOrders, inventoryCategories,
  inventoryItems, invoices,
  type User, type InsertUser, type Branch, type InsertBranch,
  type RoomType, type InsertRoomType, type Room, type InsertRoom,
  type Guest, type InsertGuest, type Reservation, type InsertReservation,
  type MenuCategory, type InsertMenuCategory, type MenuItem, type InsertMenuItem,
  type RestaurantOrder, type InsertRestaurantOrder, type InventoryCategory, type InsertInventoryCategory,
  type InventoryItem, type InsertInventoryItem, type Invoice, type InsertInvoice
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
    // For simplicity, return all rooms for the branch
    return await db.select().from(rooms).where(eq(rooms.branchId, branchId));
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