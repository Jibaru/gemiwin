import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Trash2, Moon, Sun, Settings } from 'lucide-react';
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

  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const [config, setConfig] = React.useState<api.AppConfig>({ gemini_api_key: '' });
  const [isSaving, setIsSaving] = React.useState(false);

  const openConfigModal = async () => {
    try {
      const cfg = await api.getAppConfig();
      setConfig(cfg);
    } catch (error) {
      console.error('Failed to load config', error);
    }
    setIsConfigOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateAppConfig(config);
      setIsConfigOpen(false);
    } catch (error) {
      console.error('Failed to save config', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <aside className="w-64 flex flex-col border-r border-border">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Gemiwin</h1>
        <Button variant="outline" size="sm" onClick={onNewChat}>
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 w-full">
        <style>{`[data-radix-scroll-area-viewport] > div { display:block !important; }`}</style>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex w-full items-center justify-between p-2 cursor-pointer hover:bg-accent/50 ${
              currentChat?.id === chat.id ? 'bg-accent' : ''
            }`}
            onClick={() => onSelectChat(chat)}
          >
            <span className="flex-1 truncate overflow-hidden">{chat.name}</span>
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
      <div className="p-4 border-t border-border flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          aria-label="Configuration"
          onClick={openConfigModal}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>

    {/* Config Modal */}
    {isConfigOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-background p-6 rounded-lg shadow-lg w-[90vw] max-w-md">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="gemini-api-key">Gemini API Key</label>
              <Input
                id="gemini-api-key"
                value={config.gemini_api_key}
                onChange={(e) => setConfig({ ...config, gemini_api_key: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsConfigOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>Save</Button>
          </div>
        </div>
      </div>
    )}
      </>
    );
}; 