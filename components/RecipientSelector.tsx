import { useState, useEffect } from "react";
import { User } from "@/types/models";

interface RecipientSelectorProps {
  users?: User[];
  currentUserAddress?: string;
  onRecipientSelect: (user: User) => void;
  selectedRecipient: User | null;
}

export default function RecipientSelector({ 
  users, 
  currentUserAddress, 
  onRecipientSelect, 
  selectedRecipient 
}: RecipientSelectorProps) {
  const [recipientName, setRecipientName] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch users when typing
  useEffect(() => {
    const fetchUsers = async () => {
      if (recipientName.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await fetch("/api/users");
          const data = await res.json();
          if (data.success) {
            // filter out logged-in user from the list
            const filtered = data.users.filter(
              (u: User) => u.walletAddress.toLowerCase() !== currentUserAddress?.toLowerCase()
            );
            setAllUsers(filtered);
          }
        } catch (err) {
          console.error("Error fetching users:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [recipientName, currentUserAddress]);

  // Filter users based on recipient name input
  useEffect(() => {
    if (recipientName.trim() && allUsers.length > 0) {
      // Remove @ prefix for searching
      const searchTerm = recipientName.startsWith('@') ? recipientName.slice(1) : recipientName;
      const filtered = allUsers
        .filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5); // Show max 5 results
      setFilteredUsers(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredUsers([]);
      setShowDropdown(false);
    }
  }, [recipientName, allUsers]);

  const handleRecipientSelect = (user: User) => {
    onRecipientSelect(user);
    setRecipientName(`@${user.name}`);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientName(value);
    if (selectedRecipient) {
      onRecipientSelect(null as any); // Clear selection when typing
    }
  };

  return (
    <div className="space-y-4">
      {/* Recipient Search Input */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Recipient Name
        </label>
        <input
          type="text"
          value={recipientName}
          onChange={handleInputChange}
          placeholder="@username or wallet address..."
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        
        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-center text-slate-400">
                Loading users...
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.walletAddress}
                  onClick={() => handleRecipientSelect(user)}
                  className="px-4 py-3 hover:bg-slate-600 cursor-pointer transition-colors border-b border-slate-600/30 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-slate-400 text-xs font-mono">{user.walletAddress}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-slate-400">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Recipient Display */}
      {selectedRecipient && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {selectedRecipient.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-green-400 font-semibold">@{selectedRecipient.name}</p>
              <p className="text-slate-400 text-sm font-mono">{selectedRecipient.walletAddress}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}