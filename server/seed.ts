
import bcrypt from 'bcryptjs';
import { storage } from './storage-new';

async function seedUsers() {
  try {
    // Check if users already exist
    const existingAdmin = await storage.getUserByEmail('admin@hotelchain.com');
    if (existingAdmin) {
      console.log('Demo users already exist');
      return;
    }

    // Create demo branch first
    const branch = await storage.createBranch({
      name: 'Downtown Hotel',
      address: '123 Main St',
      phone: '+1234567890',
      email: 'downtown@hotelchain.com'
    });

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const branchPassword = await bcrypt.hash('branch123', 10);
    const receptionPassword = await bcrypt.hash('reception123', 10);

    // Create demo users
    await storage.createUser({
      email: 'admin@hotelchain.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'super_admin',
      branchId: branch.id,
      active: true
    });

    await storage.createUser({
      email: 'downtown@hotelchain.com',
      password: branchPassword,
      name: 'Branch Admin',
      role: 'branch_admin',
      branchId: branch.id,
      active: true
    });

    await storage.createUser({
      email: 'reception@hotelchain.com',
      password: receptionPassword,
      name: 'Reception Staff',
      role: 'receptionist',
      branchId: branch.id,
      active: true
    });

    // Create room types for the branch
    await storage.createRoomType({
      name: 'Standard Room',
      description: 'Comfortable standard room with basic amenities',
      baseRate: '100.00',
      maxOccupancy: 2,
      amenities: ['WiFi', 'TV', 'AC'],
      branchId: branch.id
    });

    await storage.createRoomType({
      name: 'Deluxe Room',
      description: 'Spacious deluxe room with premium amenities',
      baseRate: '150.00',
      maxOccupancy: 4,
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Room Service'],
      branchId: branch.id
    });

    await storage.createRoomType({
      name: 'Executive Suite',
      description: 'Luxury executive suite with all premium amenities',
      baseRate: '250.00',
      maxOccupancy: 6,
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Room Service', 'Kitchenette', 'Balcony'],
      branchId: branch.id
    });

    console.log('Demo users and room types created successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

export { seedUsers };
