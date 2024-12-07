const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/enterprise_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'john.doe@example.com' });
    if (existingUser) {
      console.log('User already exists');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('TestPass123!', salt);

    // Create new user
    const newUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: 'user'
    });

    // Save user
    await newUser.save();
    console.log('User created successfully');

    // Close connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating user:', error);
    await mongoose.connection.close();
  }
}

createUser();
