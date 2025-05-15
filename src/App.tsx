import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/Toaster';
import { UsernameForm } from './components/UsernameForm';
import { ChatRoom } from './components/ChatRoom';
import { generateRoomId } from './utils/roomUtils';
import { v4 as uuidv4 } from 'uuid';
import { UserType } from './types';

function App() {
  const [username, setUsername] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check local storage or system preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Set user ID on first render
  useEffect(() => {
    setUserId(uuidv4());
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Check URL for room ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    
    if (roomParam) {
      setRoomId(roomParam);
    }
  }, []);

  const handleJoinChat = (name: string) => {
    setUsername(name);
    
    // If no room in URL, create a new one
    if (!roomId) {
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      
      // Update URL without refreshing
      const url = new URL(window.location.href);
      url.searchParams.set('room', newRoomId);
      window.history.pushState({}, '', url);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {!username ? (
        <UsernameForm onSubmit={handleJoinChat} isDarkMode={isDarkMode} />
      ) : (
        <ChatRoom 
          username={username} 
          roomId={roomId} 
          userId={userId}
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
      )}
      <Toaster />
    </div>
  );
}

export default App;