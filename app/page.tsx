'use client'
import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import WelcomeSection from '@/components/WelcomeSection';
import ActionCards from '@/components/ActionCards';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const hasCheckedUser = useRef(false);

  const fetchCurrentUser = async () => {
    if (!address || !isConnected || hasCheckedUser.current) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      if (data.success) {
        const user = data.users.find((u: any) => u.walletAddress.toLowerCase() === address.toLowerCase());
        setCurrentUser(user);
        hasCheckedUser.current = true;
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && !hasCheckedUser.current) {
      fetchCurrentUser();
    }
  }, [isConnected, address]);

  return (
    <div className=''>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <WelcomeSection />
        <ActionCards />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
