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
      'Retrieving knowledge',
      'Brewing some ideas',
      'Crossing the T\'s',
      'Dotting the I\'s',
      'Polishing thoughts',
      'Exploring the archives',
      'Chasing insights',
      'Sifting possibilities',
      'Aligning the stars',
      'Decoding patterns',
      'Sharpening response',
      'Gathering context',
      'Drawing conclusions',
      'Writing words',
      'Double-checking facts',
      'Finishing up',
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
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleDeleteChat = async (chatId: string) => {
    await api.deleteChat(chatId);
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
  };

  const handleDeleteMessage = async (messageIndex: number) => {
    if (!currentChat) return;
    try {
      await api.deleteMessagesFromChat(currentChat.id, messageIndex);
      const refreshedChat = await api.getChat(currentChat.id);
      setCurrentChat(refreshedChat);
      setChats(prev => prev.map(chat => (chat.id === refreshedChat.id ? refreshedChat : chat)));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleSendMessage = async (content: string, file: File | null) => {
    if (isLoading) return;

    // Require content when uploading a file
    if (file && content.trim() === '') return;

    if (!file && content.trim() === '') return;

    setMessage('');
    setIsLoading(true);

    try {
      // If a file is being uploaded, a message is mandatory
      if (file) {
        const tempDocMsg: api.Message = {
          role: 'user',
          type: 'doc',
          content: content,
          document: { id: 'temp', name: file.name, url: '' },
          timestamp: new Date().toISOString(),
        };

        if (currentChat) {
          // Optimistic update
          setCurrentChat(prev => ({ ...prev!, messages: [...prev!.messages, tempDocMsg] }));
          setChats(prev => prev.map(c => (c.id === currentChat.id ? { ...c, messages: [...c.messages, tempDocMsg] } : c)));

          const updatedChat = await api.uploadFileToChat(currentChat.id, file, content);
          setCurrentChat(updatedChat);
          setChats(prev => prev.map(c => (c.id === updatedChat.id ? updatedChat : c)));
        } else {
          // Create temp chat with optimistic message
          const tempChat: api.Chat = {
            id: `temp-${Date.now()}`,
            name: content || file.name,
            created_at: new Date().toISOString(),
            messages: [tempDocMsg],
          };

          setCurrentChat(tempChat);
          setChats(prev => [...prev, tempChat]);

          // Upload file and create new chat
          const newChat = await api.uploadFileNewChat(file, content);
          setCurrentChat(newChat);
          setChats(prev => prev.map(c => (c.id === tempChat.id ? newChat : c)));
        }
      } else if (content.trim()) {
        // Text-only flow (no file)
        if (currentChat) {
          const newUserMessage: api.Message = {
            role: 'user',
            type: 'text',
            content: content,
            document: null,
            timestamp: new Date().toISOString(),
          };
          setCurrentChat(prev => ({ ...prev!, messages: [...prev!.messages, newUserMessage] }));

          const updatedChat = await api.addMessageToChat(currentChat.id, content);
          setCurrentChat(updatedChat);
          setChats(prev => prev.map(c => (c.id === updatedChat.id ? updatedChat : c)));
        } else {
          // Create a new chat via text
          const tempChat: api.Chat = {
            id: `temp-${Date.now()}`,
            name: 'New Chat',
            created_at: new Date().toISOString(),
            messages: [
              {
                role: 'user',
                type: 'text',
                content: content,
                document: null,
                timestamp: new Date().toISOString(),
              },
            ],
          };

          setCurrentChat(tempChat);
          setChats(prev => [...prev, tempChat]);

          const newChat = await api.createChat(content);

          // Replace temporary chat with real chat
          setCurrentChat(newChat);
          setChats(prev => prev.map(c => (c.id === tempChat.id ? newChat : c)));
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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
          onDeleteMessage={handleDeleteMessage}
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