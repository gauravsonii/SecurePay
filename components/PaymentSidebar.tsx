interface PaymentSidebarProps {
  activeTab: 'make' | 'view';
  onTabChange: (tab: 'make' | 'view') => void;
}

export default function PaymentSidebar({ activeTab, onTabChange }: PaymentSidebarProps) {
  return (
    <div className="w-80 bg-slate-800/50 border-r border-slate-700/50 p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-2">Payment Hub</h1>
        <p className="text-slate-400 text-sm">Manage your crypto payments</p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="space-y-2">
        <button
          onClick={() => onTabChange('make')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
            activeTab === 'make'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">Make Payment</span>
        </button>
        
        <button
          onClick={() => onTabChange('view')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
            activeTab === 'view'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium">View Payments</span>
        </button>
      </div>
    </div>
  );
}