import mongoose from 'mongoose';

const MONGO_URL = 'mongodb://localhost:27017/ecommerce';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('🟢 Conectado a MongoDB');
  } catch (error) {
    console.error('🔴 Error conectando a MongoDB:', error);
  }
};
