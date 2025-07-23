import React from 'react';
import { isMarkdown } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import * as api from '@/services/api';
import { Copy, Trash2, FileText, X } from 'lucide-react';
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
  onCancel?: () => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, loadingText, currentModel, onModelChange, onDeleteMessage, onCancel }) => {
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

  // Handle opening or downloading documents
  const handleDocumentClick = (doc: api.Document) => {
    const url = `${api.API_URL}${doc.url}`;
    const isPDF = /\.pdf$/i.test(doc.name);

    if (isPDF) {
      const viewer = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
        url,
      )}`;
      window.open(viewer, '_blank', 'noopener,noreferrer');
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div id="chat-container" className="relative flex-1 overflow-y-auto">
      {/* Fading grid background behind messages only */}
      <div className="pointer-events-none absolute inset-0 grid-pattern"></div>
      <div className="relative p-4">
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
        <div key={index} className={`flex my-2 message-appear ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`relative p-2 rounded-lg flex flex-col ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
            <div>
              {msg.type === 'doc' && msg.document ? (
                <div className="flex flex-col gap-1">
                  {msg.document.url ? (
                    <button
                      type="button"
                      onClick={() => handleDocumentClick(msg.document!)}
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
        <div className="flex mb-2 justify-start items-center gap-2">
          <div className="p-2 rounded-lg bg-secondary">
            {loadingText}
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              aria-label="Cancel request"
              className="opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}; 