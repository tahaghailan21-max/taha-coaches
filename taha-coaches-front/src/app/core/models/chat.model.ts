export interface ChatMessage {
  id:             string;
  conversationId: string;
  senderId:       string;
  senderName:     string | null;
  body:           string;
  sentAt:         string;          // ISO instant
  readAt:         string | null;
}

export interface Conversation {
  id:         string;
  clientId:   string;
  clientName: string | null;
  createdAt:  string;
}

export interface ConversationSummary {
  id:              string;
  clientId:        string;
  clientName:      string | null;
  clientAvatar:    string | null;
  lastMessageBody: string | null;
  lastMessageAt:   string | null;
  unreadCount:     number;
}
