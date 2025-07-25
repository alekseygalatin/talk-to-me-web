export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
}