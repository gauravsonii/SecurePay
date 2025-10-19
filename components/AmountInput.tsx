import { TOKEN_SYMBOL } from "@/config";

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  currency?: string;
  placeholder?: string;
  min?: string;
  step?: string;
}

export default function AmountInput({ 
  amount, 
  onAmountChange, 
  currency = TOKEN_SYMBOL,
  placeholder = "0.00",
  min = "0",
  step = "0.001"
}: AmountInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Amount ({currency})
      </label>
      <div className="relative">
        <input
          type="number"
          step={step}
          min={min}
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        <div className="absolute right-3 top-3 text-slate-400 font-medium">
          {currency}
        </div>
      </div>
      
      {/* Quick Amount Buttons */}
      <div className="flex space-x-2 mt-3">
        {['0.1', '0.5', '1.0'].map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => onAmountChange(quickAmount)}
            className="px-3 py-1 bg-slate-600/50 text-slate-300 text-sm rounded-lg hover:bg-slate-500/50 hover:text-white transition-colors"
          >
            {quickAmount} {currency}
          </button>
        ))}
      </div>
    </div>
  );
}