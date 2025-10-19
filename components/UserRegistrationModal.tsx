"use client";

import { useState, useEffect } from "react";

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  walletAddress: string;
}

export default function UserRegistrationModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  walletAddress 
}: UserRegistrationModalProps) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");

  const validateUsername = (usernameToCheck: string) => {
    // Only allow letters (a-z, A-Z), no spaces, numbers, or special characters
    const validUsernameRegex = /^[a-zA-Z]+$/;
    return validUsernameRegex.test(usernameToCheck);
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck.trim() || usernameToCheck.trim().length < 3) {
      setIsUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    // Check if username contains only letters
    if (!validateUsername(usernameToCheck)) {
      setIsUsernameAvailable(false);
      setUsernameError("Username must contain only letters (a-z, A-Z)");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");

    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      if (data.success) {
        const existingUser = data.users.find((u: any) => 
          u.name.toLowerCase() === usernameToCheck.trim().toLowerCase()
        );
        
        if (existingUser) {
          setIsUsernameAvailable(false);
          setUsernameError("Username already taken");
        } else {
          setIsUsernameAvailable(true);
          setUsernameError("");
        }
      } else {
        setIsUsernameAvailable(null);
        setUsernameError("Error checking username");
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setIsUsernameAvailable(null);
      setUsernameError("Error checking username");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    
    // Filter out invalid characters (only allow letters)
    const filteredUsername = newUsername.replace(/[^a-zA-Z]/g, '');
    
    setUsername(filteredUsername);
    setMessage(""); // Clear any previous messages
  };

  // Debounce username checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim()) {
        checkUsernameAvailability(username);
      } else {
        setIsUsernameAvailable(null);
        setUsernameError("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleRegister = async () => {
    if (!username.trim()) return setMessage("Username is required");
    if (!walletAddress) return setMessage("Wallet not connected");
    if (isUsernameAvailable !== true) return setMessage("Please choose an available username");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: username.trim(),
          walletAddress: walletAddress,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Registration successful!");
        console.log('Registration successful, calling onComplete...');
        
        // Dispatch event to refresh Header user data
        window.dispatchEvent(new CustomEvent('refreshHeaderUser'));
        
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setMessage(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-3">Complete Registration</h3>
          <p className="text-slate-300 mb-8">Please register with a unique username to continue</p>
          
          {/* Wallet Address Display */}
          <div className="bg-slate-700/50 rounded-xl p-5 mb-8">
            <p className="text-slate-400 text-sm mb-3 text-center font-medium">Connected Wallet</p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
              <p className="text-white font-mono text-xs text-center break-all leading-relaxed select-all">{walletAddress}</p>
            </div>
          </div>
          
          {/* Username Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3 text-left">
                Username
              </label>
              <p className="text-xs text-slate-400 mb-3">Only letters allowed (a-z, A-Z), no spaces, numbers, or special characters</p>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Enter username (letters only)"
                  className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isUsernameAvailable === true 
                      ? 'border-green-500/50' 
                      : isUsernameAvailable === false 
                      ? 'border-red-500/50' 
                      : 'border-slate-600/50'
                  }`}
                  disabled={loading}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {isUsernameAvailable === true && !isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {isUsernameAvailable === false && !isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Username validation message */}
              {usernameError && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {usernameError}
                </p>
              )}
              {isUsernameAvailable === true && !isCheckingUsername && (
                <p className="text-green-400 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Username is available
                </p>
              )}
            </div>
            
            {/* Message */}
            {message && (
              <div className={`p-4 rounded-xl text-sm text-center ${
                message.includes("successful") 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {message}
              </div>
            )}
            
            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={loading || !username.trim() || isUsernameAvailable !== true || isCheckingUsername}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-102 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </div>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
