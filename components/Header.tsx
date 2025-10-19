"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  const { address, isConnected } = useAccount();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const pathname = usePathname();
  const maxRetries = 5;

  const fetchCurrentUser = async (isRetry = false) => {
    if (!address) {
      console.log('No address available for user fetch');
      return;
    }
    
    // Only show retry indicator on actual retries, not initial attempts
    if (isRetry) {
      setIsRetrying(true);
    }
    
    try {
      console.log('Fetching current user...', { address, isRetry, retryCount });
      const res = await fetch('/api/users');
      const data = await res.json();
      
      if (data.success) {
        console.log('Users data received:', data.users);
        const user = data.users.find((u: any) => u.walletAddress.toLowerCase() === address.toLowerCase());
        setCurrentUser(user);
        console.log('Current user found:', user);
        
        // Reset retry count on success
        setRetryCount(0);
        setIsRetrying(false);
      } else {
        console.log('API call failed:', data.error);
        if (isRetry) {
          setIsRetrying(false);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      if (isRetry) {
        setIsRetrying(false);
      }
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      console.log('Header: Wallet connected with address, fetching user...');
      fetchCurrentUser();
    } else if (isConnected && !address) {
      console.log('Header: Wallet connected but address is undefined, will retry...');
    }
  }, [isConnected, address]);

  // Retry mechanism for when address might be undefined initially
  useEffect(() => {
    if (isConnected && !address && retryCount < maxRetries) {
      const retryTimer = setTimeout(() => {
        console.log(`Header: Retrying user fetch (attempt ${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        // Try to fetch user again if address becomes available
        if (address) {
          fetchCurrentUser(true);
        }
      }, 1000 * (retryCount + 1)); // Increasing delay: 1s, 2s, 3s, 4s, 5s

      return () => clearTimeout(retryTimer);
    }
  }, [isConnected, address, retryCount, maxRetries]);

  // Listen for user registration completion to refetch user data
  useEffect(() => {
    const handleHeaderRefresh = () => {
      console.log('Header refreshing user data after registration...');
      // Reset retry count when manually refreshing
      setRetryCount(0);
      setIsRetrying(false);
      if (isConnected && address) {
        fetchCurrentUser();
      }
    };

    window.addEventListener('refreshHeaderUser', handleHeaderRefresh);
    
    return () => {
      window.removeEventListener('refreshHeaderUser', handleHeaderRefresh);
    };
  }, [isConnected, address]);

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <Link href="/">
            <h1 className="text-xl font-bold text-white">SecurePay</h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Retry indicator */}
          {isRetrying && (
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading user data...</span>
            </div>
          )}
          
          {(pathname === '/pay' || pathname === '/receive') ? (
            <>
              {isConnected && currentUser && (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-700/50 rounded-xl px-4 py-2 border border-slate-600/50">
                    <p className="text-white font-semibold text-base">@{currentUser.name}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`@${currentUser.name}`);
                        // You could add a toast notification here
                      }}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
              <ConnectButton />
            </>
          ) : isConnected && currentUser ? (
            <>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-700/50 rounded-xl px-4 py-2 border border-slate-600/50">
                <p className="text-white font-semibold text-base">@{currentUser.name}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`@${currentUser.name}`);
                    // You could add a toast notification here
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
