import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  name: string;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid recompiling model
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
