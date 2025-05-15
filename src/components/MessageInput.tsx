import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Image as ImageIcon, X } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { ImageUpload } from '../types';

interface MessageInputProps {
  onSendMessage: (message: string, image?: string) => void;
  onTyping: (isTyping: boolean) => void;
  isDarkMode: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  isDarkMode
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageUpload, setImageUpload] = useState<ImageUpload | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Typing indicator logic
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const handleTyping = () => {
      onTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    };
    
    if (message) {
      handleTyping();
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, onTyping]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        event.target instanceof Element && 
        !event.target.closest('.emoji-toggle')
      ) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || imageUpload) {
      onSendMessage(message, imageUpload?.preview);
      setMessage('');
      setImageUpload(null);
      onTyping(false);
      inputRef.current?.focus();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUpload({
          file,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeTextArea = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  useEffect(resizeTextArea, [message]);
  
  return (
    <div className={`p-4 border-t ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {imageUpload && (
        <div className="mb-4 relative inline-block">
          <img 
            src={imageUpload.preview} 
            alt="Upload preview" 
            className="max-h-32 rounded-lg"
          />
          <button
            onClick={() => setImageUpload(null)}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={`w-full p-3 pr-20 rounded-lg border resize-none min-h-[42px] max-h-[150px] ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-1 rounded-full transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ImageIcon size={20} />
            </button>
            
            <button
              type="button"
              className={`emoji-toggle ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={20} />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef} 
              className="absolute bottom-full right-0 mb-2 z-10"
            >
              <EmojiPicker 
                onEmojiClick={handleEmojiClick} 
                theme={isDarkMode ? 'dark' : 'light'}
                searchDisabled={true}
                skinTonesDisabled={true}
                width={320}
                height={400}
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() && !imageUpload}
          className={`p-3 rounded-lg flex items-center justify-center ${
            message.trim() || imageUpload
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : isDarkMode 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } transition-colors`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};