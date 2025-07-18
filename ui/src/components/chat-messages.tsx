import React from 'react';
import { isMarkdown } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import * as api from '@/services/api';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessagesProps {
  messages: api.Message[];
  isLoading: boolean;
  loadingText: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, loadingText }) => {
  const handleCopy = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => toast('Copied')).catch(() => {});
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const success = document.execCommand('copy');
        if (success) toast('Copied');
      } catch {}
      document.body.removeChild(textarea);
    }
  };

  return (
    <div id="chat-container" className="flex-1 p-4 overflow-y-auto">
      {messages.map((msg, index) => (
        <div key={index} className={`flex mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`relative p-2 rounded-lg flex flex-col ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
            <div>
              {msg.role === 'bot' && isMarkdown(msg.content) ? (
                <MarkdownRenderer content={msg.content} className="markdown" />
              ) : (
                msg.content
              )}
            </div>
            <button
              onClick={() => handleCopy(msg.content)}
              aria-label="Copy message"
              className="self-end mt-1 opacity-60 hover:opacity-100"
            >
              <Copy className="h-4 w-4" />
            </button>
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