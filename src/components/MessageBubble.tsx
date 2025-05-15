import React, { useState } from 'react';
import { Message } from '../types';
import Linkify from 'linkify-react';
import { LinkPreview } from './LinkPreview';
import { extractUrls } from '../utils/linkUtils';
import { Check, Image } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isDarkMode: boolean;
  onReaction: (messageId: string, emoji: string) => void;
  currentUserId: string;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  isDarkMode,
  onReaction,
  currentUserId
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const links = extractUrls(message.content);
  const firstLink = links.length > 0 ? links[0] : null;
  
  const handleReaction = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowReactions(false);
  };
  
  const userReaction = message.reactions?.[currentUserId];
  const reactionCounts = Object.values(message.reactions || {}).reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[80%] animate-fade-in ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className={`text-sm mb-1 ${
          isOwnMessage 
            ? 'text-right mr-2 text-indigo-500' 
            : 'ml-2 text-green-500'
        }`}>
          {message.sender}
        </div>
        
        <div 
          className={`relative rounded-2xl px-4 py-3 break-words shadow-sm ${
            isOwnMessage
              ? isDarkMode 
                ? 'bg-indigo-600 text-white' 
                : 'bg-indigo-500 text-white'
              : isDarkMode 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-800'
          }`}
          onDoubleClick={() => setShowReactions(prev => !prev)}
        >
          {message.image && (
            <div className="mb-2">
              <img 
                src={message.image} 
                alt="Uploaded content"
                className="rounded-lg cursor-pointer max-h-60 w-auto"
                onClick={() => setShowImagePreview(true)}
              />
            </div>
          )}
          
          <Linkify 
            options={{
              render: ({ attributes, content }) => (
                <a 
                  {...attributes} 
                  className="text-blue-300 underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ),
            }}
          >
            {message.content}
          </Linkify>
          
          {firstLink && (
            <div className="mt-2">
              <LinkPreview url={firstLink} isDarkMode={isDarkMode} />
            </div>
          )}
          
          <div className={`text-xs mt-1 text-right flex items-center justify-end gap-1 ${
            isOwnMessage
              ? 'text-indigo-200'
              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {time}
            {isOwnMessage && (
              <span className="flex items-center ml-1">
                {message.status === 'sent' && <Check size={14} />}
                {message.status === 'delivered' && (
                  <div className="flex">
                    <Check size={14} className="-mr-1" />
                    <Check size={14} />
                  </div>
                )}
                {message.status === 'seen' && (
                  <div className="flex text-blue-400">
                    <Check size={14} className="-mr-1" />
                    <Check size={14} />
                  </div>
                )}
              </span>
            )}
          </div>
          
          {Object.keys(reactionCounts).length > 0 && (
            <div className="absolute -bottom-6 left-0 flex gap-1">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <div 
                  key={emoji}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  {emoji} {count}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {showReactions && (
          <div className={`absolute mt-2 p-2 rounded-full flex gap-1 ${
            isDarkMode ? 'bg-gray-700' : 'bg-white'
          } shadow-lg z-10`}>
            {REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`p-1 hover:bg-gray-100 rounded-full transition-colors ${
                  userReaction === emoji ? 'bg-gray-200' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {showImagePreview && message.image && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowImagePreview(false)}
        >
          <img 
            src={message.image} 
            alt="Full size preview"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};