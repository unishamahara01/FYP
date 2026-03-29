const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create initial users
    const users = [
      {
        fullName: "Admin User",
        email: "admin@meditrust.com",
        password: hashedPassword,
        role: "Admin",
        permissions: ["view_all", "edit_all", "delete_all", "manage_users", "view_reports", "manage_inventory"],
        authProvider: 'local'
      },
      {
        fullName: "John Doe",
        email: "john.doe@meditrust.com",
        password: hashedPassword,
        role: "Pharmacist",
        permissions: ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"],
        authProvider: 'local'
      },
      {
        fullName: "Ankita",
        email: "ankita01@gmail.com",
        password: hashedPassword,
        role: "Pharmacist",
        permissions: ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"],
        authProvider: 'local'
      },
      {
        fullName: "Prajita",
        email: "prajita01@gmail.com",
        password: hashedPassword,
        role: "Pharmacist",
        permissions: ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"],
        authProvider: 'local'
      },
      {
        fullName: "Unisha Mahara",
        email: "unishamahara01@gmail.com",
        password: hashedPassword,
        role: "Pharmacist",
        permissions: ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"],
        authProvider: 'local'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Successfully seeded users:');
    users.forEach(user => {
      console.log(`   - ${user.fullName} (${user.email}) - ${user.role}`);
    });

    console.log('\n📝 All users have password: password123');
    
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
