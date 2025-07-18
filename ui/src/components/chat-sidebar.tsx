import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import * as api from '@/services/api';

interface ChatSidebarProps {
  chats: api.Chat[];
  currentChat: api.Chat | null;
  onSelectChat: (chat: api.Chat) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChat,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="w-64 flex flex-col border-r border-border">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Gemiwin</h1>
        <Button variant="outline" size="sm" onClick={onNewChat}>
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center justify-between p-2 cursor-pointer hover:bg-accent/50 ${
              currentChat?.id === chat.id ? 'bg-accent' : ''
            }`}
            onClick={() => onSelectChat(chat)}
          >
            <span className="truncate flex-1">{chat.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </aside>
  );
}; 