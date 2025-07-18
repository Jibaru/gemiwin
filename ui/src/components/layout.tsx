import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Moon, Sun, Trash2 } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import * as api from '@/services/api';
import { isMarkdown } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import { ChatExporter } from './chat-exporter';

export const Layout: React.FC = () => {
  const { setTheme, theme } = useTheme();
  const [chats, setChats] = useState<api.Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<api.Chat | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Thinking.');

  useEffect(() => {
    const fetchChats = async () => {
      const allChats = await api.listChats();
      setChats(allChats);
    };
    fetchChats();
  }, []);

  // Rotate loading messages and dots while waiting for the bot response
  useEffect(() => {
    if (!isLoading) return;

    const messages = [
      'Thinking',
      'Consulting the AI',
      'Crunching some data',
      'Summoning wisdom',
    ];

    let msgIndex = 0;
    let dotCount = 1;

    const interval = setInterval(() => {
      // advance dots 1→2→3→1
      dotCount = dotCount % 3 + 1;
      // every time we loop back to 1 dot, change the base message
      if (dotCount === 1) {
        msgIndex = (msgIndex + 1) % messages.length;
      }
      setLoadingText(`${messages[msgIndex]}${'.'.repeat(dotCount)}`);
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleDeleteChat = async (chatId: string) => {
    await api.deleteChat(chatId);
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessageContent = message;
    setMessage('');
    setIsLoading(true);

    try {
      if (currentChat) {
        const newUserMessage = { role: 'user' as const, content: userMessageContent, timestamp: new Date().toISOString() };
        setCurrentChat(prev => ({ ...prev!, messages: [...prev!.messages, newUserMessage] }));
        
        const updatedChat = await api.addMessageToChat(currentChat.id, userMessageContent);
        setCurrentChat(updatedChat);
        setChats(chats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)));
      } else {
        // Optimistically show the user message while creating a new chat
        const tempChat: api.Chat = {
          id: `temp-${Date.now()}`,
          name: 'New Chat',
          created_at: new Date().toISOString(),
          messages: [
            { role: 'user', content: userMessageContent, timestamp: new Date().toISOString() },
          ],
        };

        setCurrentChat(tempChat);
        setChats(prev => [...prev, tempChat]);

        const newChat = await api.createChat(userMessageContent);

        // Replace temporary chat with real chat
        setCurrentChat(newChat);
        setChats(prev => prev.map(c => (c.id === tempChat.id ? newChat : c)));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Here you could add logic to show an error to the user
    } finally {
      setIsLoading(false);
    }
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
              className={`flex items-center justify-between p-2 cursor-pointer hover:bg-accent/50 ${
                currentChat?.id === chat.id ? 'bg-accent' : ''
              }`}
              onClick={() => setCurrentChat(chat)}
            >
              <span className="truncate flex-1">{chat.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
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
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">{currentChat?.name || 'New Chat'}</h2>
          {currentChat && <ChatExporter chat={currentChat} />}
        </header>
        <div id="chat-container" className="flex-1 p-4 overflow-y-auto">
          {currentChat?.messages.map((msg, index) => (
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
        <footer className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>Send</Button>
          </div>
        </footer>
      </main>
    </div>
  );
}; 