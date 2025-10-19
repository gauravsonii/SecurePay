import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  senderAddress: string;
  senderName: string;
  receiverAddress: string;
  receiverName: string;
  amount: string; // in wei
  amountInEth: string; // in token units for display
  expirationTimestamp: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  senderAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  senderName: {
    type: String,
    required: true
  },
  receiverAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  receiverName: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  amountInEth: {
    type: String,
    required: true
  },
  expirationTimestamp: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
PaymentSchema.index({ senderAddress: 1, receiverAddress: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
