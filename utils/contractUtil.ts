import { readContract, writeContract } from '@wagmi/core';
import { config } from "@/config";

import {ABI , contractAddress} from "@/lib/contract";

// Utility function to normalize data (same as in your existing code)
function normalizeProxyData(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
}

// Interface for payment data
interface PaymentData {
  amount: string;
  expiry: string;
  withdrawn: boolean;
}

// Deposit tokens for a receiver with expiry timestamp
export async function depositForReceiver(
  receiverAddress: string, 
  expiryTimestamp: number, 
  ethAmount: string
): Promise<any> {
  try {
    console.log('DepositForReceiver called with parameters:', {
      receiverAddress,
      expiryTimestamp,
      ethAmount,
      contractAddress,
      functionName: 'depositFor'
    });

    const result = await writeContract(config, {
      abi: ABI,
      address: contractAddress,
      functionName: 'depositFor',
      args: [receiverAddress, BigInt(expiryTimestamp)],
      value: BigInt(ethAmount), // Token amount in wei
    });

    console.log('DepositForReceiver transaction result:', result);
    return result;
  } catch (error) {
    console.error('Error depositing for receiver - detailed error:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : 'Unknown',
      receiverAddress,
      expiryTimestamp,
      ethAmount,
      contractAddress
    });
    throw error;
  }
}

// Get current timestamp from contract
export async function getCurrentTimestamp(): Promise<string> {
  try {
    const result: any = await readContract(config, {
      abi: ABI,
      address: contractAddress,
      functionName: 'getNow',
    });
    return result.toString();
  } catch (error) {
    console.error('Error getting current timestamp:', error);
    throw error;
  }
}

// Get payment details between sender and receiver
export async function getPaymentDetails(
  senderAddress: string, 
  receiverAddress: string
): Promise<PaymentData> {
  try {
    const result: any = await readContract(config, {
      abi: ABI,
      address: contractAddress,
      functionName: 'payments',
      args: [senderAddress, receiverAddress],
    });
    
    return normalizeProxyData({
      amount: result[0].toString(),
      expiry: result[1].toString(),
      withdrawn: result[2]
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    throw error;
  }
}

// View payment details (alternative to getPaymentDetails)
export async function viewPayment(
  senderAddress: string, 
  receiverAddress: string
): Promise<PaymentData> {
  try {
    const result: any = await readContract(config, {
      abi: ABI,
      address: contractAddress,
      functionName: 'viewPayment',
      args: [senderAddress, receiverAddress],
    });
    
    return normalizeProxyData({
      amount: result[0].toString(),
      expiry: result[1].toString(),
      withdrawn: result[2]
    });
  } catch (error) {
    console.error('Error viewing payment:', error);
    throw error;
  }
}

// Refund payment to a receiver (only sender can call)
export async function refundPayment(receiverAddress: string): Promise<any> {
  try {
    return await writeContract(config, {
      abi: ABI,
      address: contractAddress,
      functionName: 'refund',
      args: [receiverAddress],
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
}

// Withdraw payment from a sender (only receiver can call)
export async function withdrawFromSender(senderAddress: string): Promise<any> {
  try {
    return await writeContract(config, {
      abi: ABI,
      address: contractAddress,
      functionName: 'withdrawFrom',
      args: [senderAddress],
    });
  } catch (error) {
    console.error('Error withdrawing from sender:', error);
    throw error;
  }
}

// Helper function to check if payment is expired
export async function isPaymentExpired(
  senderAddress: string, 
  receiverAddress: string
): Promise<boolean> {
  try {
    const currentTime = await getCurrentTimestamp();
    const paymentDetails = await getPaymentDetails(senderAddress, receiverAddress);
    
    return parseInt(currentTime) > parseInt(paymentDetails.expiry);
  } catch (error) {
    console.error('Error checking if payment is expired:', error);
    throw error;
  }
}

// Helper function to get time until expiry (in seconds)
export async function getTimeUntilExpiry(
  senderAddress: string, 
  receiverAddress: string
): Promise<number> {
  try {
    const currentTime = await getCurrentTimestamp();
    const paymentDetails = await getPaymentDetails(senderAddress, receiverAddress);
    
    const timeUntilExpiry = parseInt(paymentDetails.expiry) - parseInt(currentTime);
    return Math.max(0, timeUntilExpiry); // Return 0 if already expired
  } catch (error) {
    console.error('Error calculating time until expiry:', error);
    throw error;
  }
}