import { User } from "@/types/models";
import { TOKEN_SYMBOL } from "@/config";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
  amount: string;
  expirationHours?: string;
  currency?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  recipient, 
  amount, 
  expirationHours = "24",
  currency = TOKEN_SYMBOL,
  isLoading = false, 
  onConfirm 
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-2">Confirm Payment</h3>
          <p className="text-slate-300 mb-6">Review your payment details</p>
          
          {/* Payment Details */}
          <div className="bg-slate-700/50 rounded-2xl p-6 mb-6">
            {/* Recipient Info */}
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-xl">
                    {recipient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-white text-lg">{recipient.name}</p>
                <p className="text-slate-400 text-sm font-mono break-all">{recipient.walletAddress}</p>
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-slate-600 my-4"></div>
            
            {/* Amount */}
            <div className="text-center mb-4">
              <p className="text-slate-300 text-sm mb-1">Amount</p>
              <p className="font-bold text-3xl text-white">{amount} {currency}</p>
            </div>
            
            {/* Additional Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Expires:</span>
              <span className="text-white font-medium">{expirationHours} hours</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg transform hover:scale-102 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Confirm & Send'
              )}
            </button>
            
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-4 bg-slate-600 text-white rounded-2xl font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}