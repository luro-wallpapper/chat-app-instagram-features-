import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: Record<string, string>;
  isDarkMode: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  typingUsers,
  isDarkMode
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div 
      className={`flex-1 overflow-y-auto p-4 space-y-4 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center justify-center">
            <div className={`px-3 py-1 rounded-full text-xs ${
              isDarkMode 
                ? 'bg-gray-800 text-gray-400' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {date}
            </div>
          </div>
          
          {msgs.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      ))}
      
      {/* Typing indicators */}
      {Object.values(typingUsers).length > 0 && (
        <div className={`mt-2 p-3 rounded-lg max-w-[80%] ${
          isDarkMode 
            ? 'bg-gray-800 text-gray-300' 
            : 'bg-gray-200 text-gray-700'
        }`}>
          <div className="flex items-center">
            <span className="text-sm font-medium">
              {Object.values(typingUsers).join(', ')} {Object.values(typingUsers).length === 1 ? 'is' : 'are'} typing
            </span>
            <span className="ml-2 flex">
              <span className="animate-bounce mx-0.5">.</span>
              <span className="animate-bounce animation-delay-200 mx-0.5">.</span>
              <span className="animate-bounce animation-delay-400 mx-0.5">.</span>
            </span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};