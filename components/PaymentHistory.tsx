import { useState, useEffect } from "react";
import { refundPayment } from "@/utils/contractUtil";
import { waitForTransactionReceipt } from '@wagmi/core';
import { config, TOKEN_SYMBOL } from '@/config';
import { toast } from 'react-toastify';

interface Payment {
  id: string;
  senderName?: string;
  senderAddress?: string;
  recipientName: string;
  recipientAddress: string;
  amount: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed' | 'expired';
  expiryTimestamp?: string;
  currency?: string;
  transactionHash?: string;
}

interface PaymentHistoryProps {
  userAddress?: string;
}

export default function PaymentHistory({ userAddress }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'expired'>('all');
  const [reversing, setReversing] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!userAddress) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/payments?address=${userAddress}`);
      const data = await res.json();
      
      if (data.success) {
        const formattedPayments: Payment[] = data.payments.map((payment: any) => {
          // Check if payment is expired
          const now = Math.floor(Date.now() / 1000); // Convert to seconds
          const isExpired = payment.status === 'pending' && payment.expirationTimestamp && now > payment.expirationTimestamp;
          
          return {
            id: payment.id,
            recipientName: payment.receiverName,
            recipientAddress: payment.receiverAddress,
            amount: payment.amountInEth,
            timestamp: payment.createdAt,
            status: isExpired ? 'expired' : payment.status,
            expiryTimestamp: payment.expirationTimestamp?.toString(),
            currency: TOKEN_SYMBOL,
            transactionHash: payment.transactionHash
          };
        });
        
        setPayments(formattedPayments);
      } else {
        console.error('Error fetching payments:', data.error);
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userAddress]);

  const handleReversePayment = async (paymentId: string, recipientAddress: string) => {
    if (!userAddress) return;
    
    setReversing(paymentId);
    try {
      console.log('Reversing payment:', {
        paymentId,
        senderAddress: userAddress,
        recipientAddress,
      });
      
      // Call the smart contract function to reverse the payment
      const txResult = await refundPayment(recipientAddress);
      
      console.log('Refund transaction submitted:', txResult);
      
      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(config, {
        hash: txResult,
        confirmations: 3,
      });
      
      console.log('Transaction confirmed:', {
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.transactionHash
      });
      
      // Update payment status to completed (reversed)
      await fetch('/api/payments/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          status: 'completed',
          transactionHash: receipt.transactionHash
        }),
      });
      
      // Refresh payments
      await fetchPayments();
      
      toast.success(`Payment reversed successfully! Transaction: ${receipt.transactionHash}`);
    } catch (error) {
      console.error('Error reversing payment:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        paymentId,
        senderAddress: userAddress,
        recipientAddress
      });
      
      
      
      toast.error('Failed to reverse payment. Check console for details.');
    } finally {
      setReversing(null);
    }
  };

  // Refresh payments every minute to check for expired payments
  useEffect(() => {
    const interval = setInterval(() => {
      if (payments.length > 0) {
        // Force re-render by updating state
        setPayments([...payments]);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [payments]);

  // Check for expired payments in real-time
  const getActualStatus = (payment: Payment) => {
    if (payment.status === 'pending' && payment.expiryTimestamp) {
      const now = Math.floor(Date.now() / 1000); // Convert to seconds
      const isExpired = now > parseInt(payment.expiryTimestamp);
      return isExpired ? 'expired' : payment.status;
    }
    return payment.status;
  };

  const filteredPayments = payments
    .map(payment => ({
      ...payment,
      status: getActualStatus(payment)
    }))
    .filter(payment => 
      filter === 'all' || payment.status === filter
    );

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'expired':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTimeUntilExpiry = (expiryTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const timeLeft = expiryTimestamp - now;
  
    if (timeLeft <= 0) {
      return 'Expired';
    }
  
    const hours = Math.floor(timeLeft / 3600); // convert seconds -> hours
    const minutes = Math.floor((timeLeft % 3600) / 60); // remaining seconds -> minutes
  
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="pt-12">
        <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Payment History</h2>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {(['all', 'completed', 'pending', 'failed', 'expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        </div>
        
        {filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === 'all' ? 'No payments found' : `No ${filter} payments found`}
          </h3>
          <p className="text-slate-400">
            {filter === 'all' 
              ? "You haven't made any payments yet" 
              : `You don't have any ${filter} payments`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {payment.recipientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">to : {payment.recipientName}</h3>
                            <p className="text-slate-400 font-mono text-sm">{payment.recipientAddress}</p>
                            <p className="text-slate-500 text-sm">
                              {new Date(payment.timestamp).toLocaleDateString()} at {new Date(payment.timestamp).toLocaleTimeString()}
                            </p>
                            {/* Transaction hash on the left side */}
                            {payment.transactionHash && (
                              <p className="text-xs text-slate-400 font-mono break-all mt-1">
                                TX: {payment.transactionHash}
                              </p>
                            )}
                          </div>
                        </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {payment.amount} {payment.currency || TOKEN_SYMBOL}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                  
                  {/* Expiration time for pending payments */}
                  {payment.status === 'pending' && payment.expiryTimestamp && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-400">
                        Expires in: {getTimeUntilExpiry(parseInt(payment.expiryTimestamp))}
                      </p>
                      <p className="text-xs text-yellow-400 mt-1">
                        ⏳ Receiver still needs to claim this payment
                      </p>
                    </div>
                  )}
                  
                  {/* Expired payment message and reverse button */}
                  {payment.status === 'expired' && (
                    <div className="mt-2">
                      <p className="text-xs text-orange-400 mb-2">
                        ⏰ Payment has expired
                      </p>
                      <button
                        onClick={() => handleReversePayment(payment.id, payment.recipientAddress)}
                        disabled={reversing === payment.id}
                        className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reversing === payment.id ? 'Reversing...' : 'Reverse Payment'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="text-center mt-8">
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="px-6 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 hover:text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      </div>
    </div>
  );
}