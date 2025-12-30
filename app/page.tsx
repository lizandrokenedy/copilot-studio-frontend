
'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Logo from '@/components/Logo';
import LoadingDots from '@/components/LoadingDots';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import {
  createConversation,
  deleteConversations,
  getConversation,
  getConversations,
  postMessage
} from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';

export default function ChatPage() {
  const router = useRouter();
  const token = useMemo(() => getToken(), []);
  const showSidebar = process.env.NEXT_PUBLIC_SHOW_SIDEBAR === 'true';
  const maxMessageLength = 2000;
  const [conversations, setConversations] = useState<
    { id: string; title: string; updatedAt: string }[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    if (!token || !input.trim() || isSending) return;

    const content = input.trim().slice(0, maxMessageLength);
    setInput('');

    let conversationId = activeId;

    try {
      setIsSending(true);
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
    } finally {
      setIsSending(false);
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

  const handleClearConversations = async () => {
    if (!token || isClearing) return;
    setError(null);
    setIsClearing(true);

    try {
      await deleteConversations(token);
      setConversations([]);
      setMessages([]);
      setActiveId(null);

      const data = await createConversation(token, 'Nova conversa');
      setConversations([data.conversation]);
      setActiveId(data.conversation.id);
      setMessages([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao limpar conversas.'
      );
    } finally {
      setIsClearing(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="auth-shell">Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`app-shell ${showSidebar ? 'with-sidebar' : 'no-sidebar'}`}>
      {showSidebar && (
        <>
          <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <button
              className="sidebar-close"
              type="button"
              aria-label="Fechar menu"
              onClick={closeSidebar}
            >
              <span />
              <span />
            </button>
            <Logo className="logo logo-sidebar" />
          <div className="nav-links">
            {/* <Link className="nav-link active" href="/" onClick={closeSidebar}>
              Chat
            </Link>
            <Link
              className="nav-link"
              href="/integrations"
              onClick={closeSidebar}
            >
              Integracoes
            </Link> */}
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
                    {new Date(conversation.updatedAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                </button>
              ))}
            </div>
          </aside>
          <button
            className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
            type="button"
            aria-label="Fechar menu"
            onClick={closeSidebar}
          />
        </>
      )}

      <section className="chat-content">
        <div className="topbar">
          {showSidebar && (
            <button
              className="menu-btn"
              type="button"
              aria-label="Abrir menu"
              onClick={toggleSidebar}
            >
              <span />
              <span />
              <span />
            </button>
          )}
          <div className="brand">
            <Logo className="logo logo-topbar logo-white" />
          </div>
          <div className="top-actions">
            <button
              className="text-btn"
              onClick={handleClearConversations}
              disabled={isClearing}
            >
              {isClearing ? 'Limpando...' : 'Limpar conversas'}
            </button>
            <button className="text-btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        <div className="messages" ref={messagesRef}>
          {error && <div className="error">{error}</div>}
          {messages.length === 0 && (
            <div className="message assistant">
              Inicie uma conversa para ver as respostas do agente.
            </div>
          )}
          {messages.filter(Boolean).map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              {message.role === 'assistant' ? (
                <div className="markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ children, href, title }) => {
                        const isCitation =
                          (title && title.startsWith('Citation-')) ||
                          (href === '' && /^\d+$/.test(String(children)));
                        return isCitation ? null : (
                          <a
                            href={href}
                            title={title}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {children}
                          </a>
                        );
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          ))}
          {isSending && (
            <div className="message assistant loading">
              <LoadingDots />
            </div>
          )}
        </div>

        <div className="composer">
          <form onSubmit={handleSend}>
            <textarea
              value={input}
              placeholder="Digite sua mensagem..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              readOnly={isSending}
              maxLength={maxMessageLength}
            />
            <div className="composer-actions">
              <span className="char-counter">
                {input.length}/{maxMessageLength}
              </span>
              <button className="action-btn" type="submit" disabled={isSending}>
                {isSending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
