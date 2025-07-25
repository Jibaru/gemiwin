import React, { useRef, useState, DragEvent, useEffect, KeyboardEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  message: string;
  onChange: (value: string) => void;
  onSend: (message: string, file: File | null) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ message, onChange, onSend, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file extensions (lower-case)
  const allowedExtensions = new Set([
    '.txt', '.md', '.markdown', '.json', '.yaml', '.yml', '.xml', '.csv',
    '.go', '.js', '.ts', '.py', '.java', '.c', '.cpp', '.rb', '.rs', '.pdf',
  ]);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  const isAllowedFile = (filename: string) => {
    const idx = filename.lastIndexOf('.');
    if (idx === -1) return false;
    const ext = filename.slice(idx).toLowerCase();
    return allowedExtensions.has(ext);
  };

  const isFileSizeValid = (file: File) => file.size <= MAX_FILE_SIZE;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      if (!isAllowedFile(selected.name)) {
        toast.error('Unsupported file type');
        return;
      }
      if (!isFileSizeValid(selected)) {
        toast.error('File too large (max 1 MB)');
        return;
      }
    }
    setFile(selected);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!isAllowedFile(droppedFile.name)) {
        toast.error('Unsupported file type');
        return;
      }
      if (!isFileSizeValid(droppedFile)) {
        toast.error('File too large (max 1 MB)');
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSend = () => {
    if (isLoading) return;

    // When uploading a file, a message is now mandatory
    if (file && message.trim() === '') {
      return;
    }

    onSend(message, file);
    // Do not clear file immediately; wait until request finishes (isLoading becomes false)
  };

  // Clear file once loading finishes (after successful upload)
  useEffect(() => {
    if (!isLoading) {
      setFile(null);
    }
  }, [isLoading]);

  // -- Command highlighting helpers ------------------------------------
  const HIGHLIGHT_CLASS = 'cmd-highlight';

  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const getHighlightedHtml = (text: string) => {
    const escaped = escapeHtml(text).replace(/\n/g, '<br/>');
    // Highlight words that start with @ or /
    return escaped.replace(/(^|\s)([@\/][\w-]+)/g, `$1<span class="${HIGHLIGHT_CLASS}">$2</span>`);
  };

  const editableRef = useRef<HTMLDivElement>(null);

  // Keep the contenteditable HTML in sync when message prop changes (e.g. after send clears it)
  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    // To avoid losing caret on every keystroke, only update when external change
    if (document.activeElement !== el) {
      el.innerHTML = getHighlightedHtml(message);
    }
  }, [message]);

  const handleEditableInput = () => {
    const el = editableRef.current;
    if (!el) return;
    const text = el.innerText;
    onChange(text);
    // Re-apply highlighting while preserving caret position at the end
    const selection = window.getSelection();
    const range = selection && selection.getRangeAt(0);
    const caretOffset = range ? range.endOffset : null;

    el.innerHTML = getHighlightedHtml(text);

    if (caretOffset !== null) {
      // Move caret to end (simpler than exact offset restore)
      selection?.selectAllChildren(el);
      selection?.collapseToEnd();
    }
  };

  const handleEditableKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="p-4 border-t border-border" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="flex space-x-2 items-center">
        {/* Contenteditable message input with command highlighting */}
        <div
          ref={editableRef}
          contentEditable={!isLoading}
          role="textbox"
          aria-multiline="false"
          data-placeholder="Type a message..."
          onInput={handleEditableInput}
          onKeyDown={handleEditableKeyDown}
          suppressContentEditableWarning
          className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto"
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".txt,.md,.markdown,.json,.yaml,.yml,.xml,.csv,.go,.js,.ts,.py,.java,.c,.cpp,.rb,.rs,.pdf"
        />

        <Button
          variant="ghost"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <Button onClick={handleSend} disabled={isLoading || (file ? message.trim() === '' : false)}>Send</Button>
      </div>

      {file && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate max-w-xs">{file.name}</span>
          <button onClick={() => setFile(null)} aria-label="Remove file">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </footer>
  );
}; 