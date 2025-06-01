import bcrypt from 'bcryptjs';
import { storage } from './storage-new';

export async function seedUsers() {
  // Check if users already exist
  const existingUsers = await storage.getUsers();
  if (existingUsers.length > 0) {
    console.log("Demo users already exist");
    return;
  }

  // Create super admin
  const superAdmin = await storage.createUser({
    email: "admin@hotelchain.com",
    password: "admin123",
    name: "Super Admin",
    role: "super_admin",
    branchId: null,
    active: true,
  });

  // Create a branch
  const branch = await storage.createBranch({
    name: "Downtown Hotel",
    address: "123 Main Street, Downtown",
    phone: "+1-555-0123",
    email: "downtown@hotelchain.com",
    active: true,
  });

  // Create branch admin
  const branchAdmin = await storage.createUser({
    email: "downtown@hotelchain.com",
    password: "branch123",
    name: "Branch Manager",
    role: "branch_admin",
    branchId: branch.id,
    active: true,
  });

  // Create receptionist
  const receptionist = await storage.createUser({
    email: "reception@hotelchain.com",
    password: "reception123",
    name: "Mike Receptionist",
    role: "receptionist",
    branchId: branch.id,
    active: true,
  });

  // Create room types for the branch
  console.log(`Creating room types for branch ${branch.id}`);
  
  const standardType = await storage.createRoomType({
    name: "Standard",
    description: "Comfortable standard room with essential amenities",
    baseRate: "100.00",
    maxOccupancy: 2,
    amenities: ["WiFi", "TV", "AC", "Private Bathroom"],
    branchId: branch.id,
  });

  const deluxeType = await storage.createRoomType({
    name: "Deluxe",
    description: "Spacious deluxe room with premium amenities",
    baseRate: "150.00",
    maxOccupancy: 4,
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Room Service", "Balcony"],
    branchId: branch.id,
  });

  const suiteType = await storage.createRoomType({
    name: "Executive Suite",
    description: "Luxury executive suite with separate living area",
    baseRate: "250.00",
    maxOccupancy: 6,
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Kitchenette", "Balcony", "Living Room", "Premium Toiletries"],
    branchId: branch.id,
  });

  console.log(`Created room types: ${standardType.id}, ${deluxeType.id}, ${suiteType.id}`);

  // Create some sample rooms
  await storage.createRoom({
    number: "101",
    floor: 1,
    roomTypeId: standardType.id,
    status: "available",
    branchId: branch.id,
    notes: "Recently renovated",
  });

  await storage.createRoom({
    number: "102",
    floor: 1,
    roomTypeId: standardType.id,
    status: "available",
    branchId: branch.id,
  });

  await storage.createRoom({
    number: "201",
    floor: 2,
    roomTypeId: deluxeType.id,
    status: "available",
    branchId: branch.id,
    notes: "City view",
  });

  await storage.createRoom({
    number: "301",
    floor: 3,
    roomTypeId: suiteType.id,
    status: "available",
    branchId: branch.id,
    notes: "Premium suite with ocean view",
  });

  console.log("Demo users and data seeded successfully");
}

export async function clearAndReseedData() {
  // This function can be used to clear and reseed data for testing
  console.log("Clearing and reseeding data...");

  // Note: In a real application, you'd want proper data migration scripts
  // For now, we'll just seed new data if none exists
  await seedUsers();
}