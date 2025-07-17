export type ConversationType = 'user-admin' | 'admin-admin';

export interface Conversation {
  id: string;
  type: ConversationType;
  user_id?: string; // solo per user-admin
  created_at: string;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'user' | 'admin';
  sender_name?: string; // solo per admin
  content: string;
  created_at: string;
}
