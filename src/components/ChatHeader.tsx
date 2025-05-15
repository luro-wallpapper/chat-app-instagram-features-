import React, { useState } from 'react';
import { UserType } from '../types';
import { Share2, Users, Moon, Sun, Copy, CheckCheck } from 'lucide-react';
import { toast } from './ui/Toaster';

interface ChatHeaderProps {
  users: UserType[];
  isConnected: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  shareUrl: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  users,
  isConnected,
  isDarkMode,
  toggleDarkMode,
  shareUrl
}) => {
  const [showUserList, setShowUserList] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: 'Link copied',
          description: 'Share this link with others to invite them to this chat'
        });
      })
      .catch(err => {
        toast({
          title: 'Failed to copy',
          description: 'Please copy the link manually',
          variant: 'destructive'
        });
      });
  };

  return (
    <header className={`p-4 border-b shadow-sm flex items-center justify-between ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">ChatRoom</h1>
        <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <span className={`w-2 h-2 rounded-full mr-1 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setShowUserList(prev => !prev)}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            <Users size={20} />
          </button>
          
          {showUserList && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="py-1">
                <div className={`px-4 py-2 text-sm font-medium border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  Users Online ({users.length})
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {users.map(user => (
                    <div 
                      key={user.id} 
                      className={`px-4 py-2 text-sm ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      {user.username}
                      {user.typing && (
                        <span className="ml-2 text-xs italic text-green-500">
                          typing...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleCopyLink}
          className={`p-2 rounded-full transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-700' 
              : 'hover:bg-gray-100'
          }`}
          title="Share chat link"
        >
          {copied ? <CheckCheck size={20} className="text-green-500" /> : <Share2 size={20} />}
        </button>
        
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-700' 
              : 'hover:bg-gray-100'
          }`}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};