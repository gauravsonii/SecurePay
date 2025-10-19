import mongoose from "mongoose";

// Cache global connection
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } =
  (global as any).mongoose || { conn: null, promise: null };

(global as any).mongoose = cached;

export async function connectMongoose() {
  if (cached.conn) {
    // Already connected
    return cached.conn;
  }

  try {
    if (!cached.promise) {
      cached.promise = mongoose
        .connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DB })
        .then((mongoose) => {
          console.log("✅ Mongoose connected successfully");
          return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    console.error("❌ Mongoose connection failed:", err);
    throw new Error("MongoDB connection failed");
  }
}
