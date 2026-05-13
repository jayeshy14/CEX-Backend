import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURL = process.env.MONGO_URI;

let retryAttempts = 0;
const maxRetries = 5;

const connectWithRetry = async (): Promise<void> => {
  if (!mongoURL) {
    console.error('MongoDB URI is not defined in the environment variables.');
    return;
  }

  try {
    await mongoose.connect(mongoURL);
    console.log('Successfully connected to MongoDB');
    retryAttempts = 0;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('MongoDB Connection Error:', msg);
    if (retryAttempts < maxRetries) {
      retryAttempts++;
      console.log(`Retrying connection in 5 seconds... Attempt ${retryAttempts}/${maxRetries}`);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.error('Max retry attempts reached. Could not connect to MongoDB.');
    }
  }
};

export default connectWithRetry;
