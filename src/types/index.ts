export interface Message {
  id: string;
  content: string;
  sender: string;
  senderId: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'seen';
  reactions: {
    [userId: string]: string; // userId: emoji
  };
  image?: string;
}

export interface UserType {
  id: string;
  username: string;
  typing?: boolean;
}

export interface ImageUpload {
  file: File;
  preview: string;
}