'use client'

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import ReceivePayments from '@/components/ReceivePayments';
import ReceiveSidebar from '@/components/ReceiveSidebar';
import UserRegistrationModal from "@/components/UserRegistrationModal";

export default function ReceivePage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"claim">("claim");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const fetchCurrentUser = async (isRetry = false) => {
    if (!address || !isConnected || hasCheckedUser) return;
    
    // Only show spinner on first attempt, not on retries
    if (!isRetry) {
      setCheckingUser(true);
    }
    
    try {
      console.log('Fetching current user (receive page)...', { address, isConnected, hasCheckedUser, isRetry });
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
      } else {
        console.log('API call failed:', data.error);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      if (!isRetry) {
        setCheckingUser(false);
      }
    }
  };

  useEffect(() => {
    if (isConnected && address && !hasCheckedUser) {
      console.log('useEffect triggered - fetching user (receive page)');
      fetchCurrentUser();
    }
  }, [isConnected, address, hasCheckedUser]);

  // Reset hasCheckedUser when address changes (wallet switch)
  useEffect(() => {
    if (address) {
      console.log('Receive page: Address changed, resetting user check flag');
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
        console.log(`Retrying user check (receive page) (attempt ${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        // Try to fetch user again if address becomes available
        if (address) {
          fetchCurrentUser(true);
        }
      }, 1000 * (retryCount + 1)); // Increasing delay: 1s, 2s, 3s, 4s, 5s

      return () => clearTimeout(retryTimer);
    }
  }, [isConnected, address, hasCheckedUser, retryCount, maxRetries]);

  const handleRegistrationComplete = () => {
    setShowRegistrationModal(false);
    // Reset the check flag and refresh user data
    setHasCheckedUser(false);
    setRetryCount(0); // Reset retry count
    
    // Dispatch event to refresh Header user data
    window.dispatchEvent(new CustomEvent('refreshHeaderUser'));
    
    if (address) {
      fetchCurrentUser();
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

  // Show loading state while checking user
  if (checkingUser) {
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
      <ReceiveSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
        <ReceivePayments userAddress={address} />
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
