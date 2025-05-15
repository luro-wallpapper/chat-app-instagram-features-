import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface UsernameFormProps {
  onSubmit: (username: string) => void;
  isDarkMode: boolean;
}

export const UsernameForm: React.FC<UsernameFormProps> = ({ onSubmit, isDarkMode }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    onSubmit(username.trim());
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`max-w-md w-full p-8 rounded-2xl shadow-lg transition-all ${
        isDarkMode 
          ? 'bg-gray-800 shadow-gray-900/30' 
          : 'bg-white shadow-gray-200/60'
      }`}>
        <div className="flex flex-col items-center mb-8">
          <div className={`p-4 rounded-full mb-4 ${
            isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-100'
          }`}>
            <MessageCircle size={40} className="text-indigo-600" />
          </div>
          <h1 className={`text-2xl font-bold mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Welcome to Miles 4.3 TA
          </h1>
          <p className={`text-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Enter a username to start chatting
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="username" 
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your username"
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-indigo-500'
              }`}
            />
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Join Chat
          </button>
        </form>
        
        <p className={`mt-6 text-xs text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          No account needed. Your chat history will reset when you close the page.
        </p>
      </div>
    </div>
  );
};