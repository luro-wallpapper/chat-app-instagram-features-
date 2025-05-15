import React, { useState, useEffect } from 'react';
import { Link } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
  isDarkMode: boolean;
}

type PreviewData = {
  title: string;
  description: string;
  image: string;
  url: string;
};

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url, isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  
  // In a real app, you would call an API to get link preview data
  // Here we simulate extracting metadata from the URL
  useEffect(() => {
    // Simulating API call delay
    setLoading(true);
    
    const timer = setTimeout(() => {
      // Simulate a basic preview based on domain
      let domain = '';
      try {
        domain = new URL(url).hostname;
      } catch (e) {
        domain = url;
      }
      
      // Generate a fake preview
      setPreview({
        title: `Page from ${domain}`,
        description: 'Link preview information would be fetched from the actual URL',
        image: '', // No image in this demo
        url: url
      });
      
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [url]);
  
  if (loading) {
    return (
      <div className={`flex items-center p-2 rounded ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <div className="animate-pulse flex space-x-2 w-full">
          <div className={`rounded-md ${
            isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
          } h-12 w-12`}></div>
          <div className="flex-1 space-y-2">
            <div className={`h-4 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
            } rounded w-3/4`}></div>
            <div className={`h-3 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
            } rounded w-1/2`}></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!preview) return null;
  
  return (
    <a 
      href={url} 
      target="_blank"
      rel="noopener noreferrer"
      className={`block overflow-hidden rounded ${
        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
      } transition-colors duration-200`}
    >
      <div className="flex p-2 items-center space-x-2">
        <div className={`flex-shrink-0 rounded-md h-10 w-10 flex items-center justify-center ${
          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`}>
          <Link size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {preview.title}
          </p>
          <p className={`text-xs truncate ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {preview.description}
          </p>
        </div>
      </div>
    </a>
  );
};