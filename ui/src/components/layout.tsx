import React, { useState, useEffect } from 'react';
// UI imports are now handled by child components
import * as api from '@/services/api';
import { ChatSidebar } from './chat-sidebar';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';

export const Layout: React.FC = () => {
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
      <ChatSidebar
        chats={chats}
        currentChat={currentChat}
        onSelectChat={setCurrentChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={() => setCurrentChat(null)}
      />

      <main className="flex-1 flex flex-col">
        <ChatHeader currentChat={currentChat} />
        <ChatMessages
          messages={currentChat?.messages ?? []}
          isLoading={isLoading}
          loadingText={loadingText}
        />
        <ChatInput
          message={message}
          onChange={setMessage}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}; 