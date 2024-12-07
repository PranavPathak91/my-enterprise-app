const mongoose = require('mongoose');
const User = require('../models/User');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/enterprise_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB successfully');

    // Find all users
    const users = await User.find({});
    console.log('Users in the database:', users);

    // Find specific user
    const user = await User.findOne({ email: 'john.doe@example.com' });
    console.log('John Doe user details:', user);

    // Close connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

checkDatabase();
