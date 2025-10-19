"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/types/models";
import { useAccount} from "wagmi";
import { depositForReceiver, getPaymentDetails } from "@/utils/contractUtil";
import { waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/config';
import { toast } from 'react-toastify';

// Import all the components
import PaymentSidebar from "@/components/PaymentSidebar";
import MakePaymentForm from "@/components/MakePaymentForm";
import PaymentHistory from "@/components/PaymentHistory";
import UserRegistrationModal from "@/components/UserRegistrationModal";

export default function PayPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"make" | "view">("make");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const fetchCurrentUser = async (isRetry = false) => {
    console.log('Fetching current user...', { address, isConnected, hasCheckedUser, isRetry });
    if (!address || !isConnected || hasCheckedUser) return;
    
    // Only show spinner on first attempt, not on retries
    if (!isRetry) {
      setCheckingUser(true);
    }
    
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      if (data.success) {
        const user = data.users.find((u: any) => u.walletAddress.toLowerCase() === address.toLowerCase());
        setCurrentUser(user);
        setHasCheckedUser(true);
        setRetryCount(0); // Reset retry count on success
        
        if (!user) {
          // User not found, show registration modal
          setShowRegistrationModal(true);
        } else {
          // User found, close registration modal if it's open
          setShowRegistrationModal(false);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      if (!isRetry) {
        setCheckingUser(false);
      }
    } finally {
      if (!isRetry) {
        setCheckingUser(false);
      }
    }
  };

  useEffect(() => {
    if (isConnected && address && !hasCheckedUser) {
      console.log('PayUsers: Wallet connected with address, fetching user...');
      fetchCurrentUser();
    }
  }, [isConnected, address, hasCheckedUser]);

  // Reset hasCheckedUser when address changes (wallet switch)
  useEffect(() => {
    if (address) {
      console.log('PayUsers: Address changed, resetting user check flag');
      setHasCheckedUser(false);
      setRetryCount(0);
      // Close registration modal when switching wallets
      setShowRegistrationModal(false);
    }
  }, [address]);

  // Retry mechanism for when address might be undefined initially
  useEffect(() => {
    if (isConnected && !address && !hasCheckedUser && retryCount < maxRetries) {
      const retryTimer = setTimeout(() => {
        console.log(`Retrying user check (attempt ${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        // Try to fetch user again
        if (address) {
          fetchCurrentUser(true);
        }
      }, 1000 * (retryCount + 1)); // Increasing delay: 1s, 2s, 3s, 4s, 5s

      return () => clearTimeout(retryTimer);
    }
  }, [isConnected, address, hasCheckedUser, retryCount, maxRetries]);

  const handleRegistrationComplete = async () => {
    setShowRegistrationModal(false);
    // Reset the check flag and refresh user data
    setHasCheckedUser(false);
    setRetryCount(0); // Reset retry count
    
    // Dispatch event to refresh Header user data
    window.dispatchEvent(new CustomEvent('refreshHeaderUser'));
    
    if (address) {
      console.log('Registration completed, fetching user again...');
      await fetchCurrentUser();
      
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">SecurePay</h2>
          <p className="text-slate-300 mb-6">Please connect your wallet using the button in the navbar above</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking user (only on first attempt)
  if (checkingUser && retryCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Checking user status...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar with tab switching */}
      <PaymentSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
        {activeTab === "make" ? (
          <div className="flex items-center justify-center h-full w-full">
            <MakePaymentForm
              currentUserAddress={address}
              onPaymentComplete={async (recipient: User, amount: string, expirationHours: string) => {
                let paymentId: string | null = null;
                
                try {
                  
                  const hours = parseFloat(expirationHours);
                  
                  // Validate expiration hours
                  if (!Number.isFinite(hours) || hours <= 0) {
                    throw new Error(`Invalid expiration hours: ${expirationHours}. Please enter a positive number.`);
                  }
                  
                  // Convert hours to seconds and add to current timestamp
                  const expirationTimestamp = Math.floor(Date.now() / 1000) + Math.floor(hours * 60 * 60);

                  
                  // Convert token amount to wei (BigInt)
                  const ethAmount = parseFloat(amount);
                  const weiAmount = BigInt(Math.floor(ethAmount * 1e18));

                  // Check if there's already an active payment between sender and receiver using smart contract
                  try {
                    const existingPayment = await getPaymentDetails(address, recipient.walletAddress);

                    console.log('Existing payment:', existingPayment);
                    
                    // Check if there's an existing payment that hasn't been withdrawn
                    // Case 1: withdrawn is false AND amount > 0 (active unclaimed payment)
                    if (existingPayment.amount !== "0" && !existingPayment.withdrawn) {
                      const now = Math.floor(Date.now() / 1000); // Convert to seconds
                      const expiryTime = parseInt(existingPayment.expiry);

                      console.log('Existing payment:', existingPayment);
                      console.log('Now:', now);
                      console.log('Expiry time:', expiryTime);
                      console.log('Amount:', existingPayment.amount);
                      console.log('Withdrawn:', existingPayment.withdrawn);
                      
                      // If payment exists and hasn't been withdrawn, check if it's still valid (not expired)
                      if (now < expiryTime) {
                        toast.error(`Cannot create payment. You already have an active unclaimed payment to @${recipient.name}. Please wait for them to claim it first or for it to expire.`);
                        return;
                      }
                    }
                  } catch (error) {
                    console.log('No existing payment found or error checking contract:', error);
                    // Continue with payment creation if no existing payment or error
                  }

                  console.log('Current user:', JSON.stringify({
                    senderAddress: address,
                    senderName: currentUser?.name || 'Unknown',
                    receiverAddress: recipient.walletAddress,
                    receiverName: recipient.name,
                    amount: weiAmount.toString(),
                    amountInEth: amount,
                    expirationTimestamp
                  }));
                  
                  // Save payment record to database first
                  const paymentResponse = await fetch('/api/payments', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      senderAddress: address,
                      senderName: currentUser?.name || 'Unknown',
                      receiverAddress: recipient.walletAddress,
                      receiverName: recipient.name,
                      amount: weiAmount.toString(),
                      amountInEth: amount,
                      expirationTimestamp
                    }),
                  });

                  const paymentData = await paymentResponse.json();
                  
                  if (!paymentData.success) {
                    throw new Error('Failed to save payment record');
                  }
                  
                  paymentId = paymentData.payment.id;

                  // Send the transaction
                  console.log('Attempting to send transaction...', {
                    recipient: recipient.walletAddress,
                    expirationTimestamp,
                    weiAmount: weiAmount.toString()
                  });
                  
                  const txResult = await depositForReceiver(recipient.walletAddress, expirationTimestamp, weiAmount.toString());
                  const receipt = await waitForTransactionReceipt(config, {
                    hash: txResult,
                    confirmations: 3,
                  })
                  
                  console.log('Mined in block:', receipt.blockNumber)
                  console.log('Confirmed with 3 confirmations:', receipt.transactionHash)
                  console.log('Transaction hash:', txResult);
                  
                  // Check if transaction was successful and has a hash
                  if (txResult) {
                    console.log('Transaction successful with hash:', txResult);
                    
                    // Update payment status to pending with transaction hash
                    await fetch('/api/payments/update-status', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        paymentId,
                        status: 'pending',
                        transactionHash: txResult
                      }),
                    });
                    
                            toast.success("Payment sent successfully!");
                  } else {
                    // No transaction hash means transaction failed
                    console.error('Transaction failed - no hash received. Transaction result:', txResult);
                    throw new Error('Transaction failed - no hash received');
                  }
                } catch (err) {
                  console.error("Payment failed with detailed error:", {
                    error: err,
                    errorMessage: err instanceof Error ? err.message : 'Unknown error',
                    errorStack: err instanceof Error ? err.stack : undefined,
                    errorName: err instanceof Error ? err.name : 'Unknown',
                    paymentId,
                    recipient: recipient?.walletAddress,
                    amount: amount,
                    expirationHours
                  });
                  
                  // Update payment status to failed if we have a payment ID
                  if (paymentId) {
                    try {
                      console.log('Updating payment status to failed for payment ID:', paymentId);
                      await fetch('/api/payments/update-status', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          paymentId,
                          status: 'failed'
                        }),
                      });
                      console.log('Payment status updated to failed successfully');
                    } catch (updateErr) {
                      console.error("Failed to update payment status:", {
                        updateError: updateErr,
                        updateErrorMessage: updateErr instanceof Error ? updateErr.message : 'Unknown update error',
                        paymentId
                      });
                    }
                  }
                  
                          toast.error("Payment failed. Check console for details.");
                }
              }}
            />
          </div>
        ) : (
          <PaymentHistory userAddress={address} />
        )}
      </div>

      {/* User Registration Modal */}
      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onComplete={handleRegistrationComplete}
        walletAddress={address}
      />
    </div>
  );
}
