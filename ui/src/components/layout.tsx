import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import * as api from '@/services/api';

export const Layout: React.FC = () => {
  const { setTheme, theme } = useTheme();
  const [chats, setChats] = useState<api.Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<api.Chat | null>(null);
  const [message, setMessage] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (currentChat) {
      const updatedChat = await api.addMessageToChat(currentChat.id, message);
      setCurrentChat(updatedChat);
      setChats(chats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)));
    } else {
      const newChat = await api.createChat(message);
      setCurrentChat(newChat);
      setChats([...chats, newChat]);
    }
    setMessage('');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 flex flex-col border-r border-border">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Gemiwin</h1>
          <Button variant="outline" size="sm" onClick={() => setCurrentChat(null)}>
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-2 cursor-pointer ${
                currentChat?.id === chat.id ? 'bg-accent' : ''
              }`}
              onClick={() => setCurrentChat(chat)}
            >
              {chat.name}
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
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{currentChat?.name || 'Chat'}</h2>
        </header>
        <div className="flex-1 p-4 overflow-y-auto">
          {currentChat?.messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <footer className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </footer>
      </main>
    </div>
  );
}; 