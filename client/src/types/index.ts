// Dosya: client/src/types/index.ts

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  createdAt: string; 
  completions: string[];
  completionsLastWeek: number;
  currentStreak: number;
  isCompletedToday: boolean;
  isArchived: boolean; 
}

export interface Activity {
  id: string;
  description: string;
  createdAt: string;
  userName: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  relatedHabitName?: string | null;
}

export interface MessageDto {
  id: string; 
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string; 
  isRead: boolean;
}

export interface ConversationDto {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount: number;
}