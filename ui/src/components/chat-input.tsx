import React, { useRef, useState, DragEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
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

  return (
    <footer className="p-4 border-t border-border" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="flex space-x-2 items-center">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
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