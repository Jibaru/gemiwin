import React from 'react';
import { isMarkdown } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import * as api from '@/services/api';
import { Copy, Trash2, FileText } from 'lucide-react';
import type { ModelName } from '@/services/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    electronAPI?: {
      openExternal: (url: string) => void;
    };
  }
}

interface ChatMessagesProps {
  messages: api.Message[];
  isLoading: boolean;
  loadingText: string;
  currentModel: ModelName;
  onModelChange: (model: ModelName) => void;
  onDeleteMessage?: (index: number) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, loadingText, currentModel, onModelChange, onDeleteMessage }) => {
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
      {/* Model selector */}
      <div className="mb-4">
        <label htmlFor="model-select" className="mr-2 text-sm font-medium">Model:</label>
        <select
          id="model-select"
          value={currentModel}
          onChange={(e) => onModelChange(e.target.value as ModelName)}
          className="border border-border rounded px-2 py-1 text-sm bg-background"
        >
          <option value="gemini-2.5-flash">gemini-2.5-flash</option>
          <option value="gemini-2.5-pro">gemini-2.5-pro</option>
        </select>
      </div>
      {messages.map((msg, index) => (
        <div key={index} className={`flex mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`relative p-2 rounded-lg flex flex-col ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
            <div>
              {msg.type === 'doc' && msg.document ? (
                <div className="flex flex-col gap-1">
                  {msg.document.url ? (
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${api.API_URL}${msg.document.url}`;
                        // Prefer opening via the main process in Electron so that PDFs render correctly
                        if (window?.electronAPI?.openExternal) {
                          window.electronAPI.openExternal(url);
                        } else {
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="flex items-center gap-2 hover:underline text-left"
                    >
                      <FileText className="w-4 h-4" />
                      {msg.document.name}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      {msg.document.name}
                    </div>
                  )}
                  {msg.content && (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
              ) : msg.role === 'bot' && isMarkdown(msg.content) ? (
                <MarkdownRenderer content={msg.content} className="markdown" />
              ) : (
                msg.content
              )}
            </div>
            <div className="flex gap-1 self-end mt-1">
              {(msg.type === 'text' || (msg.type === 'doc' && msg.content)) && (
                <button
                  onClick={() => handleCopy(msg.content)}
                  aria-label="Copy message"
                  className="opacity-60 hover:opacity-100"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
              {onDeleteMessage && msg.role === 'user' && (
                <button
                  onClick={() => onDeleteMessage(index)}
                  aria-label="Delete message"
                  className="opacity-60 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
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