import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { socket } from '../utils/socket';
import { Message, UserType } from '../types';
import { toast } from '../components/ui/Toaster';
import { playMessageSound } from '../utils/sounds';

interface ChatRoomProps {
  username: string;
  roomId: string;
  userId: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ 
  username, 
  roomId, 
  userId,
  isDarkMode, 
  toggleDarkMode 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    setShareUrl(url.toString());
    
    socket.connect();
    socket.emit('join-room', { roomId, username });
    
    socket.on('connect', () => {
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socket.on('room-history', ({ messages, users }) => {
      setMessages(messages);
      setUsers(users);
    });
    
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      playMessageSound();
      
      // Send delivery receipt
      socket.emit('message-delivered', {
        messageId: message.id,
        roomId
      });
    });
    
    socket.on('message-status-update', ({ messageId, status }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    });
    
    socket.on('message-reaction', ({ messageId, userId, emoji }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [userId]: emoji
              }
            }
          : msg
      ));
    });
    
    socket.on('user-joined', ({ username, users }) => {
      setUsers(users);
      toast({
        title: 'User joined',
        description: `${username} has joined the chat`,
      });
    });
    
    socket.on('user-left', ({ username, users }) => {
      setUsers(users);
      toast({
        title: 'User left',
        description: `${username} has left the chat`,
        variant: 'destructive',
      });
    });
    
    socket.on('user-typing', ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return { ...prev, [userId]: username };
        } else {
          const newTyping = { ...prev };
          delete newTyping[userId];
          return newTyping;
        }
      });
    });
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-history');
      socket.off('new-message');
      socket.off('message-status-update');
      socket.off('message-reaction');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('user-typing');
      socket.disconnect();
    };
  }, [roomId, username]);
  
  const sendMessage = (content: string, image?: string) => {
    if (!content.trim() && !image) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: username,
      senderId: userId,
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: {},
      image
    };
    
    socket.emit('send-message', newMessage);
    setMessages(prev => [...prev, newMessage]);
  };
  
  const handleReaction = (messageId: string, emoji: string) => {
    socket.emit('react-to-message', {
      messageId,
      roomId,
      userId,
      emoji
    });
  };
  
  const handleTyping = (isTyping: boolean) => {
    socket.emit('typing', isTyping);
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <ChatHeader 
        users={users} 
        isConnected={isConnected} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        shareUrl={shareUrl}
      />
      
      <MessageList 
        messages={messages} 
        currentUserId={userId}
        typingUsers={typingUsers}
        isDarkMode={isDarkMode}
        onReaction={handleReaction}
      />
      
      <MessageInput 
        onSendMessage={sendMessage} 
        onTyping={handleTyping}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};