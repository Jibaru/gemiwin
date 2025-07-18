export const API_URL = 'http://localhost:8080';

// Document metadata for messages of type 'doc'
export interface Document {
  id: string;
  name: string;
  url: string;
}

export interface Message {
  role: 'user' | 'bot';
  // Distinguish between plain text and document messages
  type: 'text' | 'doc';
  content: string;
  document?: Document | null;
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

export const listChats = async (): Promise<Chat[]> => {
  const response = await fetch(`${API_URL}/chats`);
  if (!response.ok) {
    throw new Error('Failed to list chats');
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

export const deleteMessagesFromChat = async (id: string, index: number): Promise<Chat> => {
  const response = await fetch(`${API_URL}/chats/${id}/messages/${index}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete messages');
  }
  return response.json();
};

// Upload a file to an existing chat (or pass a placeholder id like 'new' to create a chat)
export const uploadFileToChat = async (
  id: string,
  file: File,
): Promise<Chat> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/chats/${id}/files`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
  return response.json();
};

// Upload a file and create a new chat when no ID exists.
export const uploadFileNewChat = async (file: File): Promise<Chat> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/chats/files`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload file and create chat');
  }
  return response.json();
}; 