import mongoose from "mongoose"

export const connectMongoDB = async () => {
    try {
      const result = await mongoose.connect(process.env.MONGODB_URL);
      console.log(`mongodb connected on host: ${result.connection.host}`);
      console.log(`mongodb connected database: ${result.connection.name}`);
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
    }
  };
  