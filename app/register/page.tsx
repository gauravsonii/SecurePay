'use client'

import { useAccount } from 'wagmi';
import UserRegistory from '@/components/UserRegistory';

export default function Page() {
  const { isConnected } = useAccount();

  if (!isConnected) {
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
          <p className="text-slate-300 mb-6">Please connect your wallet to register</p>
          <p className="text-slate-400 text-sm">Connect your wallet using the button in the header</p>
        </div>
      </div>
    );
  }

  return <UserRegistory />;
}
