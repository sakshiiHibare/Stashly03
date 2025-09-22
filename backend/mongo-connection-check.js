const mongoose = require('mongoose');

// MongoDB connection function
async function checkMongoConnection() {
  try {
    console.log('Trying to connect to MongoDB...');
    
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/airattixDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Connection state:', mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Print connection details
    console.log('Connection details:');
    console.log(`- Host: ${conn.connection.host}`);
    console.log(`- Port: ${conn.connection.port}`);
    console.log(`- Database: ${conn.connection.name}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkMongoConnection(); 