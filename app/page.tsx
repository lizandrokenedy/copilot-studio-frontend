'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createConversation,
  getConversation,
  getConversations,
  postMessage
} from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';

export default function ChatPage() {
  const router = useRouter();
  const token = useMemo(() => getToken(), []);
  const [conversations, setConversations] = useState<
    { id: string; title: string; updatedAt: string }[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  const scheduleScroll = () => {
    requestAnimationFrame(() => {
      scrollToBottom();
      requestAnimationFrame(() => scrollToBottom());
    });
  };

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }

    const load = async () => {
      try {
        const data = await getConversations(token);
        setConversations(data.conversations);
        if (data.conversations.length > 0) {
          setActiveId(data.conversations[0].id);
          const convo = await getConversation(token, data.conversations[0].id);
          setMessages(convo.messages);
          scheduleScroll();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Falha ao carregar conversas.'
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, token]);

  useLayoutEffect(() => {
    scheduleScroll();
  }, [messages.length, activeId, loading]);

  const handleSelectConversation = async (id: string) => {
    if (!token) return;
    setActiveId(id);
    try {
      const convo = await getConversation(token, id);
      setMessages(convo.messages);
      scheduleScroll();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao carregar conversa.'
      );
    }
  };

  const handleNewChat = async () => {
    if (!token) return;
    try {
      const data = await createConversation(token, 'Nova conversa');
      setConversations((prev) => [data.conversation, ...prev]);
      setActiveId(data.conversation.id);
      setMessages([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao criar conversa.'
      );
    }
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !input.trim()) return;

    const content = input.trim();
    setInput('');

    let conversationId = activeId;

    try {
      if (!conversationId) {
        const data = await createConversation(token, 'Nova conversa');
        conversationId = data.conversation.id;
        setConversations((prev) => [data.conversation, ...prev]);
        setActiveId(conversationId);
      }

      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, role: 'user', content }
      ]);
      scheduleScroll();

      const response = await postMessage(token, conversationId, content);
      setMessages((prev) => [...prev, response.assistantMessage]);
      scheduleScroll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar mensagem.');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleLogout = () => {
    clearToken();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="page">
        <div className="auth-shell">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Copilot</h2>
        <div className="nav-links">
          <Link className="nav-link active" href="/">
            Chat
          </Link>
          <Link className="nav-link" href="/integrations">
            Integracoes
          </Link>
        </div>
        <button className="action-btn new-chat" onClick={handleNewChat}>
          Nova conversa
        </button>
        <div className="chat-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`chat-item ${
                conversation.id === activeId ? 'active' : ''
              }`}
              onClick={() => handleSelectConversation(conversation.id)}
            >
              {conversation.title || 'Sem titulo'}
              <span>
                {new Date(conversation.updatedAt).toLocaleDateString('pt-BR')}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-content">
        <div className="topbar">
          <div className="brand">Copilot Chat</div>
          <button className="text-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>

        <div className="messages" ref={messagesRef}>
          {error && <div className="error">{error}</div>}
          {messages.length === 0 && (
            <div className="message assistant">
              Inicie uma conversa para ver as respostas do agente.
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              {message.content}
            </div>
          ))}
        </div>

        <div className="composer">
          <form onSubmit={handleSend}>
            <textarea
              value={input}
              placeholder="Digite sua mensagem..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="action-btn" type="submit">
              Enviar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
