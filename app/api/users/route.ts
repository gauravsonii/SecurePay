import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { User } from "@/Models/UserModel";

export async function GET() {
  try {
    await connectMongoose(); // Ensure connection

    let users;
    try {
      // Fetch all users (walletAddress + name)
      users = await User.find({}, { walletAddress: 1, name: 1, _id: 0 }).lean();
    } catch (err) {
      console.error("Error fetching users from DB:", err);
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error("Unexpected error in GET users:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
