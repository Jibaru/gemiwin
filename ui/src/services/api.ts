const API_URL = 'http://localhost:8080';

export interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  created_at: string;
  messages: Message[];
}

export const createChat = async (content: string): Promise<Chat> => {
  const response = await fetch(`${API_URL}/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error('Failed to create chat');
  }
  return response.json();
};

export const getChat = async (id: string): Promise<Chat> => {
  const response = await fetch(`${API_URL}/chats/${id}`);
  if (!response.ok) {
    throw new Error('Failed to get chat');
  }
  return response.json();
};

export const addMessageToChat = async (id: string, content: string): Promise<Chat> => {
  const response = await fetch(`${API_URL}/chats/${id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error('Failed to add message to chat');
  }
  return response.json();
};

export const deleteChat = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/chats/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete chat');
  }
}; 