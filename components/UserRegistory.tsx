"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

interface UserRegistoryProps {
  onRegistrationComplete?: () => void;
}

export default function UserRegistory({ onRegistrationComplete }: UserRegistoryProps) {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!name) return setMessage("Name is required");
    if (!address) return setMessage("Wallet not connected");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, name }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Registered successfully!");
        setTimeout(() => {
          if (onRegistrationComplete) {
            onRegistrationComplete();
          } else {
            router.push("/pay");
          }
        }, 1000);
      } else setMessage(`❌ ${data.error}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected)
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Connect Your Wallet</h2>
          <p className="text-slate-400 leading-relaxed">
            To get started with registration, please connect your wallet first.
          </p>
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <p className="text-sm text-slate-300">
              🔐 Your wallet connection is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Register to start making payments</p>
        </div>

        {/* Wallet Address Display */}
        <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
          <p className="text-sm text-slate-400 mb-2">Connected Wallet</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-mono text-sm text-slate-200 break-all">{address}</span>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={loading || !name.trim()}
          className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Registering...</span>
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-xl text-center font-medium ${
            message.startsWith("✅") 
              ? "bg-green-500/20 border border-green-500/30 text-green-400" 
              : "bg-red-500/20 border border-red-500/30 text-red-400"
          }`}>
            {message}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-xs text-slate-500">
            By registering, you agree to our terms and conditions
          </p>  
        </div>
      </div>
    </div>
  );
}