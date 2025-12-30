const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

type ApiError = { error: string };

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

async function request<T>(path: string, options: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, options);
  let data: T | ApiError | null = null;

  if (response.status !== 204) {
    try {
      data = (await response.json()) as T | ApiError;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data && 'error' in data ? data.error : 'Erro inesperado';
    throw new Error(message);
  }

  return data as T;
}

type AuthResponse = {
  token: string;
  user: { id: string; email: string; displayName: string };
};

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
}

export function register(payload: {
  email: string;
  password: string;
  displayName: string;
}) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
}

export function getHealth() {
  return request<{ status: string }>('/health', {
    method: 'GET',
    headers: getHeaders()
  });
}

export function getMe(token: string) {
  return request<{
    user: {
      id: string;
      email: string;
      displayName: string;
      createdAt: string;
      updatedAt: string;
    };
  }>('/users/me', {
    method: 'GET',
    headers: getHeaders(token)
  });
}

export function updateMe(token: string, payload: { displayName: string }) {
  return request<{
    user: {
      id: string;
      email: string;
      displayName: string;
      createdAt: string;
      updatedAt: string;
    };
  }>('/users/me', {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function deleteMe(token: string) {
  return request<void>('/users/me', {
    method: 'DELETE',
    headers: getHeaders(token)
  });
}

export function getContext(token: string) {
  return request<{ userId: string; summary: string; source: string }>(
    '/context',
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
}

export function getConversations(token: string) {
  return request<{
    conversations: { id: string; title: string; updatedAt: string }[];
    source: string;
  }>('/conversations', {
    method: 'GET',
    headers: getHeaders(token)
  });
}

export function createConversation(token: string, title?: string) {
  return request<{
    conversation: {
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    };
    source: string;
  }>('/conversations', {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(title ? { title } : {})
  });
}

export function getConversation(token: string, id: string) {
  return request<{
    conversation: {
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    };
    messages: { id: string; role: 'user' | 'assistant'; content: string }[];
    contextSummary: string;
    source: string;
  }>(`/conversations/${id}`, {
    method: 'GET',
    headers: getHeaders(token)
  });
}

export function postMessage(token: string, id: string, content: string) {
  return request<{
    message: { id: string; role: 'user'; content: string };
    assistantMessage: { id: string; role: 'assistant'; content: string };
    source: string;
  }>(`/conversations/${id}/messages`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ role: 'user', content })
  });
}

export function deleteConversations(token: string) {
  return request<{
    deletedConversations: number;
    deletedMessages: number;
    source: string;
  }>('/conversations', {
    method: 'DELETE',
    headers: getHeaders(token)
  });
}
