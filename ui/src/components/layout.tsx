import React, { useState, useEffect, useRef } from 'react';
import * as api from '@/services/api';
import { ChatSidebar } from './chat-sidebar';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import toast from 'react-hot-toast';

export const Layout: React.FC = () => {
  const [chats, setChats] = useState<api.Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<api.Chat | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Thinking.');
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<api.ModelName>('gemini-2.5-flash');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const allChats = await api.listChats();
        setChats(allChats);
      } catch (error) {
        console.error('Failed to list chats', error);
        toast.error(`Failed to load chats: ${(error instanceof Error ? error.message : String(error))}`);
      }
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
    try {
      await api.deleteChat(chatId);
      setChats(chats.filter((chat) => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
    } catch (error) {
      console.error('Failed to delete chat', error);
      toast.error(`Failed to delete chat: ${(error instanceof Error ? error.message : String(error))}`);
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
      toast.error(`Failed to delete message: ${(error instanceof Error ? error.message : String(error))}`);
    }
  };

  // Ref to manage request cancellation
  const abortRef = useRef<AbortController | null>(null);

  // Track the optimistic user message so we can undo it on cancel
  const pendingRef = useRef<{
    chatId: string | null;
    message: string;
    type: 'text' | 'doc';
    createdTempChat: boolean;
  } | null>(null);

  const handleCancelRequest = () => {
    if (isLoading) {
      abortRef.current?.abort();
      abortRef.current = null;
      setIsLoading(false);
      setLoadingChatId(null);

      const pending = pendingRef.current;
      if (pending) {
        // Restore input message so user can edit/resend
        setMessage(pending.message);

        if (pending.createdTempChat) {
          // Remove temporary chat entirely
          setChats(prev => prev.filter(c => c.id !== currentChat?.id));
          if (currentChat?.id === pending.chatId) {
            setCurrentChat(null);
          }
        } else {
          // Remove last optimistic message from existing chat
          if (currentChat) {
            setCurrentChat(prev => {
              if (!prev) return prev;
              const msgs = [...prev.messages];
              if (msgs.length && msgs[msgs.length - 1].role === 'user') {
                msgs.pop();
              }
              return { ...prev, messages: msgs };
            });

            setChats(prev => prev.map(c => {
              if (c.id !== currentChat!.id) return c;
              const msgs = [...c.messages];
              if (msgs.length && msgs[msgs.length - 1].role === 'user') {
                msgs.pop();
              }
              return { ...c, messages: msgs };
            }));
          }
        }

        pendingRef.current = null;
      }
    }
  };

  const handleSendMessage = async (content: string, file: File | null) => {
    if (isLoading) return;

    // Require content when uploading a file
    if (file && content.trim() === '') return;

    if (!file && content.trim() === '') return;

    setMessage('');
    setIsLoading(true);
    // Track which chat is currently loading
    if (currentChat) {
      setLoadingChatId(currentChat.id);
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    abortRef.current = controller;

    // Store info about the pending optimistic message
    pendingRef.current = {
      chatId: currentChat?.id ?? null,
      message: content,
      type: file ? 'doc' : 'text',
      createdTempChat: !currentChat,
    };

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

          const updatedChat = await api.uploadFileToChat(currentChat.id, file, content, controller.signal);
          setCurrentChat(updatedChat);
          setChats(prev => prev.map(c => (c.id === updatedChat.id ? updatedChat : c)));
        } else {
          // Create temp chat with optimistic message
          const tempChat: api.Chat = {
            id: `temp-${Date.now()}`,
            name: content || file.name,
            created_at: new Date().toISOString(),
            messages: [tempDocMsg],
            config: { model: selectedModel },
          };

          setCurrentChat(tempChat);
          setChats(prev => [...prev, tempChat]);
          // Associate loading with this temporary chat
          setLoadingChatId(tempChat.id);

          // Upload file and create new chat
          const newChat = await api.uploadFileNewChat(file, content, { model: selectedModel }, controller.signal);
          setCurrentChat(newChat);
          setChats(prev => prev.map(c => (c.id === tempChat.id ? newChat : c)));
          setLoadingChatId(newChat.id);
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

          const updatedChat = await api.addMessageToChat(currentChat.id, content, controller.signal);
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
            config: { model: selectedModel },
          };

          setCurrentChat(tempChat);
          setChats(prev => [...prev, tempChat]);

          setLoadingChatId(tempChat.id);

          const newChat = await api.createChat(content, { model: selectedModel }, controller.signal);

          // Replace temporary chat with real chat
          setCurrentChat(newChat);
          setChats(prev => prev.map(c => (c.id === tempChat.id ? newChat : c)));
          setLoadingChatId(newChat.id);
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error('Failed to send message:', error);
        toast.error(`Failed to send message: ${(error instanceof Error ? error.message : String(error))}`);
      }
    } finally {
      setIsLoading(false);
      setLoadingChatId(null);
      abortRef.current = null;
    }
  };

  // Handle model change from ChatMessages
  const handleModelChange = async (model: api.ModelName) => {
    setSelectedModel(model);

    if (currentChat) {
      // Update UI immediately
      setCurrentChat(prev => prev ? { ...prev, config: { model } } : prev);
      setChats(prev => prev.map(c => c.id === currentChat.id ? { ...c, config: { model } } : c));

      // Persist to backend if chat already exists (not temporary)
      if (!currentChat.id.startsWith('temp-')) {
        try {
          const updated = await api.updateChatConfig(currentChat.id, { model });
          setCurrentChat(updated);
          setChats(prev => prev.map(c => c.id === updated.id ? updated : c));
        } catch (err) {
          console.error('Failed to update chat config', err);
          toast.error(`Failed to update chat config: ${(err instanceof Error ? err.message : String(err))}`);
        }
      }
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
          isLoading={isLoading && currentChat?.id === loadingChatId}
          loadingText={loadingText}
          currentModel={currentChat?.config.model ?? selectedModel}
          onModelChange={handleModelChange}
          onDeleteMessage={handleDeleteMessage}
          onCancel={handleCancelRequest}
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