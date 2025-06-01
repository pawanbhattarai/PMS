import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-new";
import { authenticateUser } from "./auth";
import { 
  insertUserSchema, insertBranchSchema, insertRoomSchema, insertGuestSchema,
  insertReservationSchema, insertMenuCategorySchema, insertMenuItemSchema,
  insertRestaurantOrderSchema, insertInventoryItemSchema, insertInvoiceSchema
} from "@shared/schema";
import { z } from "zod";
import "./types";

// Authentication middleware
async function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication required" });
  }
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

function getBranchFilter(user: any, requestedBranchId?: number) {
  if (user.role === "super_admin") {
    return requestedBranchId || null;
  }
  return user.branchId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.active) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // Branch routes
  app.get("/api/branches", requireAuth, async (req, res) => {
    try {
      if (req.user.role === "super_admin") {
        const branches = await storage.getBranches();
        res.json(branches);
      } else {
        const branch = await storage.getBranch(req.user.branchId);
        res.json(branch ? [branch] : []);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.post("/api/branches", requireAuth, requireRole(["super_admin"]), async (req, res) => {
    try {
      const validatedData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(validatedData);
      res.status(201).json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create branch" });
      }
    }
  });

  // Room routes
  app.get("/api/rooms", requireAuth, async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (branchId) {
        const rooms = await storage.getRoomsByBranch(branchId);
        // Get room types for additional info
        const roomTypes = await storage.getRoomTypesByBranch(branchId);
        const roomTypeMap = new Map(roomTypes.map(rt => [rt.id, rt]));
        
        const roomsWithTypes = rooms.map(room => ({
          ...room,
          roomType: roomTypeMap.get(room.roomTypeId)
        }));
        
        res.json(roomsWithTypes);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", requireAuth, requireRole(["super_admin", "branch_admin"]), async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      
      // Ensure branch access
      const branchId = getBranchFilter(req.user, validatedData.branchId);
      if (!branchId || (req.user.role !== "super_admin" && branchId !== req.user.branchId)) {
        return res.status(403).json({ message: "Cannot create room for this branch" });
      }

      const room = await storage.createRoom({ ...validatedData, branchId });
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create room" });
      }
    }
  });

  app.put("/api/rooms/:id", requireAuth, requireRole(["super_admin", "branch_admin", "receptionist"]), async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const updates = req.body;
      
      // Check if room exists and user has access
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const branchId = getBranchFilter(req.user, room.branchId);
      if (!branchId || room.branchId !== branchId) {
        return res.status(403).json({ message: "Cannot update this room" });
      }

      const updatedRoom = await storage.updateRoom(roomId, updates);
      res.json(updatedRoom);
    } catch (error) {
      res.status(500).json({ message: "Failed to update room" });
    }
  });

  // Room types routes
  app.get("/api/room-types", requireAuth, async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (branchId) {
        const roomTypes = await storage.getRoomTypesByBranch(branchId);
        res.json(roomTypes);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room types" });
    }
  });

  // Guest routes
  app.get("/api/guests", requireAuth, async (req, res) => {
    try {
      const { search } = req.query;
      
      if (search) {
        const guests = await storage.searchGuests(search as string);
        res.json(guests);
      } else {
        const guests = await storage.getGuests();
        res.json(guests);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  app.post("/api/guests", requireAuth, async (req, res) => {
    try {
      const validatedData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(validatedData);
      res.status(201).json(guest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create guest" });
      }
    }
  });

  app.put("/api/guests/:id", requireAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedGuest = await storage.updateGuest(guestId, updates);
      if (!updatedGuest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      res.json(updatedGuest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update guest" });
    }
  });

  // Reservation routes
  app.get("/api/reservations", requireAuth, async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (branchId) {
        const reservations = await storage.getReservationsByBranch(branchId);
        
        // Enrich with guest and room data
        const enrichedReservations = await Promise.all(
          reservations.map(async (reservation) => {
            const guest = await storage.getGuest(reservation.guestId);
            const room = await storage.getRoom(reservation.roomId);
            return {
              ...reservation,
              guest,
              room
            };
          })
        );
        
        res.json(enrichedReservations);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  app.post("/api/reservations", requireAuth, async (req, res) => {
    try {
      const validatedData = insertReservationSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      // Ensure branch access
      const branchId = getBranchFilter(req.user, validatedData.branchId);
      if (!branchId || (req.user.role !== "super_admin" && branchId !== req.user.branchId)) {
        return res.status(403).json({ message: "Cannot create reservation for this branch" });
      }

      const reservation = await storage.createReservation({ ...validatedData, branchId });
      res.status(201).json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create reservation" });
      }
    }
  });

  app.put("/api/reservations/:id", requireAuth, async (req, res) => {
    try {
      const reservationId = parseInt(req.params.id);
      const updates = req.body;
      
      // Check access
      const reservation = await storage.getReservation(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      const branchId = getBranchFilter(req.user, reservation.branchId);
      if (!branchId || reservation.branchId !== branchId) {
        return res.status(403).json({ message: "Cannot update this reservation" });
      }

      const updatedReservation = await storage.updateReservation(reservationId, updates);
      res.json(updatedReservation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reservation" });
    }
  });

  // Available rooms route
  app.get("/api/rooms/available", requireAuth, async (req, res) => {
    try {
      const { branchId: requestedBranchId, checkIn, checkOut } = req.query;
      
      if (!checkIn || !checkOut) {
        return res.status(400).json({ message: "Check-in and check-out dates are required" });
      }

      const branchId = getBranchFilter(req.user, parseInt(requestedBranchId as string));
      if (!branchId) {
        return res.json([]);
      }

      const availableRooms = await storage.getAvailableRooms(
        branchId,
        new Date(checkIn as string),
        new Date(checkOut as string)
      );

      // Enrich with room type data
      const roomTypes = await storage.getRoomTypesByBranch(branchId);
      const roomTypeMap = new Map(roomTypes.map(rt => [rt.id, rt]));
      
      const roomsWithTypes = availableRooms.map(room => ({
        ...room,
        roomType: roomTypeMap.get(room.roomTypeId)
      }));

      res.json(roomsWithTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available rooms" });
    }
  });

  // Restaurant menu routes
  app.get("/api/menu-categories", requireAuth, async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (branchId) {
        const categories = await storage.getMenuCategoriesByBranch(branchId);
        res.json(categories);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });

  app.get("/api/menu-items", requireAuth, async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (branchId) {
        const items = await storage.getMenuItemsByBranch(branchId);
        const categories = await storage.getMenuCategoriesByBranch(branchId);
        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
        
        const itemsWithCategories = items.map(item => ({
          ...item,
          category: categoryMap.get(item.categoryId)
        }));
        
        res.json(itemsWithCategories);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  // Restaurant orders routes
  app.get("/api/restaurant-orders", requireAuth, async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (branchId) {
        const orders = await storage.getRestaurantOrdersByBranch(branchId);
        res.json(orders);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant orders" });
    }
  });

  // Inventory routes
  app.get("/api/inventory-items", requireAuth, requireRole(["super_admin", "branch_admin"]), async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (branchId) {
        const items = await storage.getInventoryItemsByBranch(branchId);
        res.json(items);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (branchId) {
        const invoices = await storage.getInvoicesByBranch(branchId);
        
        // Enrich with guest data
        const enrichedInvoices = await Promise.all(
          invoices.map(async (invoice) => {
            const guest = await storage.getGuest(invoice.guestId);
            return {
              ...invoice,
              guest
            };
          })
        );
        
        res.json(enrichedInvoices);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const branchId = getBranchFilter(req.user, parseInt(req.query.branchId as string));
      
      if (!branchId) {
        return res.json({
          totalRooms: 0,
          occupied: 0,
          checkins: 0,
          revenue: 0
        });
      }

      const rooms = await storage.getRoomsByBranch(branchId);
      const reservations = await storage.getReservationsByBranch(branchId);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCheckIns = reservations.filter(res => {
        const checkInDate = new Date(res.checkInDate);
        return checkInDate >= today && checkInDate < tomorrow;
      });

      const occupiedRooms = rooms.filter(room => room.status === "occupied");
      
      const todayRevenue = reservations
        .filter(res => {
          const createdDate = new Date(res.createdAt);
          return createdDate >= today && createdDate < tomorrow;
        })
        .reduce((sum, res) => sum + parseFloat(res.totalAmount), 0);

      res.json({
        totalRooms: rooms.length,
        occupied: occupiedRooms.length,
        checkins: todayCheckIns.length,
        revenue: todayRevenue
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Development route to reseed data (only in development)
  if (process.env.NODE_ENV === "development") {
    app.post("/api/dev/reseed", async (req, res) => {
      try {
        const { seedUsers } = await import("./seed");
        await seedUsers();
        res.json({ message: "Data reseeded successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to reseed data" });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
