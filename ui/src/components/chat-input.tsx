import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  message: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ message, onChange, onSend, isLoading }) => {
  return (
    <footer className="p-4 border-t border-border">
      <div className="flex space-x-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          disabled={isLoading}
        />
        <Button onClick={onSend} disabled={isLoading}>Send</Button>
      </div>
    </footer>
  );
}; 