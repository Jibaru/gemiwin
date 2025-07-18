import React from 'react';
import { isMarkdown } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import * as api from '@/services/api';

interface ChatMessagesProps {
  messages: api.Message[];
  isLoading: boolean;
  loadingText: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, loadingText }) => {
  return (
    <div id="chat-container" className="flex-1 p-4 overflow-y-auto">
      {messages.map((msg, index) => (
        <div key={index} className={`flex mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
            {msg.role === 'bot' && isMarkdown(msg.content) ? (
              <MarkdownRenderer content={msg.content} className="markdown" />
            ) : (
              msg.content
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex mb-2 justify-start">
          <div className="p-2 rounded-lg bg-secondary">
            {loadingText}
          </div>
        </div>
      )}
    </div>
  );
}; 