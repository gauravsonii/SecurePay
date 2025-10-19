'use client'
import { useAccount } from 'wagmi';

export default function WelcomeSection() {
  const { address, isConnected } = useAccount();

  return (
    <div className="text-center mb-16">
      <h1 className="text-5xl font-bold text-white mb-6">
        <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Reversible</span> Crypto Payments
      </h1>
      <p className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
        Send crypto using <span className="text-orange-400 font-semibold">usernames</span> instead of complex wallet addresses. 
        Your payments are secured with <span className="text-green-400 font-semibold">expiration times</span> for 
        <span className="text-purple-400 font-semibold"> reversible transactions</span>.
      </p>

      {/* Feature highlights */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          <span className="text-slate-300 text-sm font-medium">Username Payments</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-slate-300 text-sm font-medium">Secure Payments</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span className="text-slate-300 text-sm font-medium">Reversible</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-slate-300 text-sm font-medium">Expiration Times</span>
        </div>
      </div>

      {isConnected && address && (
        <div className="inline-flex items-center space-x-3 bg-green-500/20 border border-green-500/30 rounded-full px-6 py-3 mb-8">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 font-medium">Wallet Connected</span>
          <span className="text-green-200 font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
      )}
    </div>
  );
}
