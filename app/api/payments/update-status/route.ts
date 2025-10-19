import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Payment from "@/Models/PaymentModel";

// PUT - Update payment status
export async function PUT(request: NextRequest) {
  try {
    await connectMongoose();
    
    const body = await request.json();
    const { 
      paymentId, 
      status, 
      transactionHash 
    } = body;

    // Validate required fields
    if (!paymentId || !status) {
      return NextResponse.json(
        { success: false, error: "Payment ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update payment record
    const updateData: any = { status };
    if (transactionHash) {
      updateData.transactionHash = transactionHash;
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    );

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        senderAddress: payment.senderAddress,
        receiverAddress: payment.receiverAddress,
        receiverName: payment.receiverName,
        amount: payment.amount,
        amountInEth: payment.amountInEth,
        expirationTimestamp: payment.expirationTimestamp,
        status: payment.status,
        transactionHash: payment.transactionHash,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}

// PATCH - Update payment status by transaction hash
export async function PATCH(request: NextRequest) {
  try {
    await connectMongoose();
    
    const body = await request.json();
    const { 
      transactionHash, 
      status 
    } = body;

    // Validate required fields
    if (!transactionHash || !status) {
      return NextResponse.json(
        { success: false, error: "Transaction hash and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update payment record by transaction hash
    const payment = await Payment.findOneAndUpdate(
      { transactionHash },
      { status },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        senderAddress: payment.senderAddress,
        receiverAddress: payment.receiverAddress,
        receiverName: payment.receiverName,
        amount: payment.amount,
        amountInEth: payment.amountInEth,
        expirationTimestamp: payment.expirationTimestamp,
        status: payment.status,
        transactionHash: payment.transactionHash,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating payment status by transaction hash:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
