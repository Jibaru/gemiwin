import React from 'react';
import * as api from '@/services/api';
import { ChatExporter } from './chat-exporter';

interface ChatHeaderProps {
  currentChat: api.Chat | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ currentChat }) => (
  <header className="p-4 border-b border-border flex items-center justify-between">
    <h2 className="text-lg font-semibold">{currentChat?.name || 'New Chat'}</h2>
    {currentChat && <ChatExporter chat={currentChat} />}
  </header>
); 