import React, { useRef, useState, DragEvent, useEffect } from 'react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
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