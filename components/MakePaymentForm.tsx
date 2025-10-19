import { useState } from "react";
import { User } from "@/types/models";
import RecipientSelector from "./RecipientSelector";
import AmountInput from "./AmountInput";
import PaymentModal from "./PaymentModal";
import { toast } from 'react-toastify';

interface MakePaymentFormProps {
  users?: User[];
  currentUserAddress?: string;
  onPaymentComplete: (recipient: User, amount: string, expirationHours: string) => void;
}

export default function MakePaymentForm({ 
  users, 
  currentUserAddress, 
  onPaymentComplete 
}: MakePaymentFormProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [expirationHours, setExpirationHours] = useState("24");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleMakePayment = () => {
    if (!selectedRecipient || !amount) return;
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedRecipient || !amount) return;
    
    // Validate expiration hours before proceeding
    const hours = parseFloat(expirationHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      toast.error(`Invalid expiration hours: ${expirationHours}. Please enter a positive number.`);
      return;
    }
    
    setPaymentLoading(true);
    try {
      await onPaymentComplete(selectedRecipient, amount, expirationHours);
      
      // Reset form
      setSelectedRecipient(null);
      setAmount("");
      setExpirationHours("24");
      setShowPaymentModal(false);
      
    } catch (error) {
      console.error("Payment failed:", error);
      // Error handling can be improved with toast notifications
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Send Payment</h2>
          
          <div className="space-y-6">
            {/* Recipient Selector */}
            <RecipientSelector
              users={users || []}
              currentUserAddress={currentUserAddress}
              onRecipientSelect={setSelectedRecipient}
              selectedRecipient={selectedRecipient}
            />

            {/* Amount Input */}
            <AmountInput
              amount={amount}
              onAmountChange={setAmount}
            />

            {/* Expiration Time Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Expiration Time
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0.1"
                  max="168"
                  step="0.1"
                  value={expirationHours}
                  onChange={(e) => setExpirationHours(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="24"
                />
                <span className="text-slate-300 font-medium">hours</span>
              </div>
              <p className="text-xs text-slate-400">Payment will expire after this time (0.1-168 hours)</p>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleMakePayment}
              disabled={!selectedRecipient || !amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-102 active:scale-95 shadow-lg"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRecipient && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          recipient={selectedRecipient}
          amount={amount}
          expirationHours={expirationHours}
          isLoading={paymentLoading}
          onConfirm={confirmPayment}
        />
      )}
    </>
  );
}