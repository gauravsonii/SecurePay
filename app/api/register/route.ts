import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { User } from "@/Models/UserModel";

export async function POST(req: Request) {
  try {
    // ✅ Ensure Mongoose is connected
    await connectMongoose();

    const { walletAddress, name } = await req.json();

    if (!walletAddress || !name) {
      return NextResponse.json(
        { success: false, error: "Missing wallet or name" },
        { status: 400 }
      );
    }

    // ✅ Check if user already exists (case-insensitive)
    let existingUser;
    try {
      existingUser = await User.findOne({
        walletAddress: { $regex: `^${walletAddress}$`, $options: "i" },
      });
    } catch (err) {
      console.error("Error checking existing user:", err);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already registered" },
        { status: 400 }
      );
    }

    // ✅ Create new user
    try {
      await User.create({ walletAddress, name, createdAt: new Date() });
    } catch (err) {
      console.error("Error creating user:", err);
      return NextResponse.json(
        { success: false, error: "Failed to register user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in registration:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
