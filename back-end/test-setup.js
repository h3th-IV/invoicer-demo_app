const mongoose = require('mongoose');
const Staff = require('./models/staff');
const Client = require('./models/client');
const Item = require('./models/item');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === "production" 
      ? process.env.MONGO_URI 
      : "mongodb://invoicer:password1234@localhost:27017/invoicing?authSource=admin";
    await mongoose.connect(uri);
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    // Create sample staff
    const staff = new Staff({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    await staff.save();
    console.log('Staff created:', staff.email);

    // Create sample client
    const client = new Client({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone_number: '+1234567890',
      address: '123 Main St, City, State',
      billingAddress: '123 Main St, City, State'
    });
    await client.save();
    console.log('Client created:', client.email);

    // Create sample items
    const items = [
      {
        name: 'Web Development',
        quantity: 10,
        unitPrice: 100,
        status: 'in-stock'
      },
      {
        name: 'Logo Design',
        quantity: 5,
        unitPrice: 50,
        status: 'in-stock'
      },
      {
        name: 'Consultation',
        quantity: 20,
        unitPrice: 75,
        status: 'in-stock'
      }
    ];

    for (const itemData of items) {
      const item = new Item(itemData);
      await item.save();
      console.log('Item created:', item.name);
    }

    console.log('Sample data created successfully!');
    console.log('\nTest credentials:');
    console.log('Staff: admin@example.com / password123');
    console.log('Client: john@example.com / password123');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
};

// Run the setup
connectDB().then(createSampleData); 