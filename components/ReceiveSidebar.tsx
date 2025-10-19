interface ReceiveSidebarProps {
  activeTab: 'claim';
  onTabChange: (tab: 'claim') => void;
}

export default function ReceiveSidebar({ activeTab, onTabChange }: ReceiveSidebarProps) {
  return (
    <div className="w-80 bg-slate-800/50 border-r border-slate-700/50 p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-2">Receive Hub</h1>
        <p className="text-slate-400 text-sm">Claim your pending payments</p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="space-y-2">
        <button
          onClick={() => onTabChange('claim')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
            activeTab === 'claim'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="font-medium">Claim Payments</span>
        </button>
      </div>
    </div>
  );
}
