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