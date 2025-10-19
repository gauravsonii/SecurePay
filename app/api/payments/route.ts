import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Payment from "@/Models/PaymentModel";

// POST - Create a new payment record
export async function POST(request: NextRequest) {
  try {
    await connectMongoose();
    
    const body = await request.json();
    const { 
      senderAddress, 
      senderName,
      receiverAddress, 
      receiverName, 
      amount, 
      amountInEth, 
      expirationTimestamp 
    } = body;

    // Validate required fields
    if (!senderAddress || !senderName || !receiverAddress || !receiverName || !amount || !amountInEth || !expirationTimestamp) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = new Payment({
      senderAddress: senderAddress.toLowerCase(),
      senderName,
      receiverAddress: receiverAddress.toLowerCase(),
      receiverName,
      amount,
      amountInEth,
      expirationTimestamp,
      status: 'pending'
    });

    await payment.save();

    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        senderAddress: payment.senderAddress,
        senderName: payment.senderName,
        receiverAddress: payment.receiverAddress,
        receiverName: payment.receiverName,
        amount: payment.amount,
        amountInEth: payment.amountInEth,
        expirationTimestamp: payment.expirationTimestamp,
        status: payment.status,
        createdAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating payment record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment record" },
      { status: 500 }
    );
  }
}

// GET - Fetch payment records for a user
export async function GET(request: NextRequest) {
  try {
    await connectMongoose();
    
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');
    const status = searchParams.get('status');

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: "User address is required" },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {
      $or: [
        { senderAddress: userAddress.toLowerCase() },
        { receiverAddress: userAddress.toLowerCase() }
      ]
    };

    if (status) {
      query.status = status;
    }

    // Fetch payments sorted by creation date (newest first)
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        senderAddress: payment.senderAddress,
        senderName: payment.senderName,
        receiverAddress: payment.receiverAddress,
        receiverName: payment.receiverName,
        amount: payment.amount,
        amountInEth: payment.amountInEth,
        expirationTimestamp: payment.expirationTimestamp,
        status: payment.status,
        transactionHash: payment.transactionHash,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }))
    });

  } catch (error) {
    console.error("Error fetching payment records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment records" },
      { status: 500 }
    );
  }
}
