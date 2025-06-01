import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and role management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // super_admin, branch_admin, receptionist, restaurant_staff, housekeeping
  branchId: integer("branch_id"), // null for super_admin
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Branches table
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Room types
export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  baseRate: decimal("base_rate", { precision: 10, scale: 2 }).notNull(),
  maxOccupancy: integer("max_occupancy").notNull(),
  amenities: json("amenities").$type<string[]>().default([]),
  branchId: integer("branch_id").notNull(),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  floor: integer("floor").notNull(),
  roomTypeId: integer("room_type_id").notNull(),
  branchId: integer("branch_id").notNull(),
  status: text("status").notNull().default("available"), // available, occupied, maintenance, cleaning
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guests table
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  idNumber: text("id_number"),
  idType: text("id_type"), // passport, driver_license, national_id
  dateOfBirth: timestamp("date_of_birth"),
  nationality: text("nationality"),
  totalStays: integer("total_stays").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reservations table
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull(),
  roomId: integer("room_id").notNull(),
  branchId: integer("branch_id").notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  actualCheckIn: timestamp("actual_check_in"),
  actualCheckOut: timestamp("actual_check_out"),
  adults: integer("adults").notNull().default(1),
  children: integer("children").default(0),
  status: text("status").notNull().default("confirmed"), // confirmed, checked_in, checked_out, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Restaurant menu categories
export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  branchId: integer("branch_id").notNull(),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Restaurant menu items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull(),
  branchId: integer("branch_id").notNull(),
  available: boolean("available").default(true),
  preparationTime: integer("preparation_time"), // in minutes
  ingredients: json("ingredients").$type<string[]>().default([]),
});

// Restaurant orders
export const restaurantOrders = pgTable("restaurant_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  guestId: integer("guest_id"),
  roomId: integer("room_id"), // for room service
  branchId: integer("branch_id").notNull(),
  orderType: text("order_type").notNull(), // room_service, dine_in, takeaway
  status: text("status").notNull().default("pending"), // pending, preparing, ready, served, cancelled
  items: json("items").$type<Array<{itemId: number, quantity: number, price: number, notes?: string}>>().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory categories
export const inventoryCategories = pgTable("inventory_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // hotel_supplies, restaurant_supplies
  branchId: integer("branch_id").notNull(),
});

// Inventory items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  branchId: integer("branch_id").notNull(),
  currentStock: integer("current_stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  maxStock: integer("max_stock").notNull().default(100),
  unit: text("unit").notNull(), // pieces, kg, liters, etc.
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  lastRestocked: timestamp("last_restocked"),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  reservationId: integer("reservation_id"),
  guestId: integer("guest_id").notNull(),
  branchId: integer("branch_id").notNull(),
  items: json("items").$type<Array<{description: string, quantity: number, rate: number, amount: number}>>().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  paymentMethod: text("payment_method"), // cash, card, digital_wallet
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

export const insertRoomTypeSchema = createInsertSchema(roomTypes).omit({
  id: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  totalStays: true,
  createdAt: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
});

export const insertMenuCategorySchema = createInsertSchema(menuCategories).omit({
  id: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

export const insertRestaurantOrderSchema = createInsertSchema(restaurantOrders).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryCategorySchema = createInsertSchema(inventoryCategories).omit({
  id: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

// Types
// Relations
export const userRelations = relations(users, ({ one }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
}));

export const branchRelations = relations(branches, ({ many }) => ({
  users: many(users),
  roomTypes: many(roomTypes),
  rooms: many(rooms),
  reservations: many(reservations),
  menuCategories: many(menuCategories),
  menuItems: many(menuItems),
  restaurantOrders: many(restaurantOrders),
  inventoryCategories: many(inventoryCategories),
  inventoryItems: many(inventoryItems),
  invoices: many(invoices),
}));

export const roomTypeRelations = relations(roomTypes, ({ one, many }) => ({
  branch: one(branches, {
    fields: [roomTypes.branchId],
    references: [branches.id],
  }),
  rooms: many(rooms),
}));

export const roomRelations = relations(rooms, ({ one, many }) => ({
  branch: one(branches, {
    fields: [rooms.branchId],
    references: [branches.id],
  }),
  roomType: one(roomTypes, {
    fields: [rooms.roomTypeId],
    references: [roomTypes.id],
  }),
  reservations: many(reservations),
}));

export const guestRelations = relations(guests, ({ many }) => ({
  reservations: many(reservations),
  restaurantOrders: many(restaurantOrders),
  invoices: many(invoices),
}));

export const reservationRelations = relations(reservations, ({ one }) => ({
  branch: one(branches, {
    fields: [reservations.branchId],
    references: [branches.id],
  }),
  guest: one(guests, {
    fields: [reservations.guestId],
    references: [guests.id],
  }),
  room: one(rooms, {
    fields: [reservations.roomId],
    references: [rooms.id],
  }),
  createdByUser: one(users, {
    fields: [reservations.createdBy],
    references: [users.id],
  }),
}));

export const menuCategoryRelations = relations(menuCategories, ({ one, many }) => ({
  branch: one(branches, {
    fields: [menuCategories.branchId],
    references: [branches.id],
  }),
  menuItems: many(menuItems),
}));

export const menuItemRelations = relations(menuItems, ({ one }) => ({
  branch: one(branches, {
    fields: [menuItems.branchId],
    references: [branches.id],
  }),
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
}));

export const restaurantOrderRelations = relations(restaurantOrders, ({ one }) => ({
  branch: one(branches, {
    fields: [restaurantOrders.branchId],
    references: [branches.id],
  }),
  guest: one(guests, {
    fields: [restaurantOrders.guestId],
    references: [guests.id],
  }),
  createdByUser: one(users, {
    fields: [restaurantOrders.createdBy],
    references: [users.id],
  }),
}));

export const inventoryCategoryRelations = relations(inventoryCategories, ({ one, many }) => ({
  branch: one(branches, {
    fields: [inventoryCategories.branchId],
    references: [branches.id],
  }),
  inventoryItems: many(inventoryItems),
}));

export const inventoryItemRelations = relations(inventoryItems, ({ one }) => ({
  branch: one(branches, {
    fields: [inventoryItems.branchId],
    references: [branches.id],
  }),
  category: one(inventoryCategories, {
    fields: [inventoryItems.categoryId],
    references: [inventoryCategories.id],
  }),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
  branch: one(branches, {
    fields: [invoices.branchId],
    references: [branches.id],
  }),
  guest: one(guests, {
    fields: [invoices.guestId],
    references: [guests.id],
  }),
  createdByUser: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type RoomType = typeof roomTypes.$inferSelect;
export type InsertRoomType = z.infer<typeof insertRoomTypeSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type RestaurantOrder = typeof restaurantOrders.$inferSelect;
export type InsertRestaurantOrder = z.infer<typeof insertRestaurantOrderSchema>;
export type InventoryCategory = typeof inventoryCategories.$inferSelect;
export type InsertInventoryCategory = z.infer<typeof insertInventoryCategorySchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
