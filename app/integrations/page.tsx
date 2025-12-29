'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  deleteMe,
  getContext,
  getConversations,
  getHealth,
  getMe,
  updateMe
} from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';

type Conversation = { id: string; title: string; updatedAt: string };

type User = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

type ContextSummary = { userId: string; summary: string; source: string };

export default function IntegrationsPage() {
  const router = useRouter();
  const token = useMemo(() => getToken(), []);
  const [user, setUser] = useState<User | null>(null);
  const [context, setContext] = useState<ContextSummary | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [health, setHealth] = useState<'ok' | 'down' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }

    const load = async () => {
      try {
        const [meData, contextData, convoData] = await Promise.all([
          getMe(token),
          getContext(token),
          getConversations(token)
        ]);

        setUser(meData.user);
        setDisplayName(meData.user.displayName);
        setContext(contextData);
        setConversations(convoData.conversations);

        try {
          const healthData = await getHealth();
          setHealth(healthData.status === 'ok' ? 'ok' : 'down');
        } catch {
          setHealth('down');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Falha ao carregar integracoes.'
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, token]);

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !displayName.trim()) return;
    setActionMessage(null);
    setError(null);

    try {
      const data = await updateMe(token, { displayName: displayName.trim() });
      setUser(data.user);
      setActionMessage('Nome atualizado com sucesso.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao atualizar o nome.'
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!token || deleteConfirm.trim().toUpperCase() !== 'EXCLUIR') {
      setError('Digite EXCLUIR para confirmar.');
      return;
    }

    setError(null);
    setActionMessage(null);

    try {
      await deleteMe(token);
      clearToken();
      router.replace('/register');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao remover a conta.'
      );
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

  const latestConversation = conversations[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Copilot</h2>
        <div className="nav-links">
          <Link className="nav-link" href="/">
            Chat
          </Link>
          <Link className="nav-link active" href="/integrations">
            Integracoes
          </Link>
        </div>
        <Link className="action-btn new-chat" href="/">
          Ir para o chat
        </Link>
      </aside>

      <section className="chat-content">
        <div className="topbar">
          <div className="brand">Integracoes</div>
          <div className="top-actions">
            <Link className="text-btn" href="/">
              Voltar ao chat
            </Link>
            <button className="text-btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        <div className="integrations-body">
          {error && <div className="error">{error}</div>}
          {actionMessage && <div className="success">{actionMessage}</div>}
          <div className="integration-grid">
            <div className="integration-card">
              <span className="status-pill">Ativo</span>
              <h3>Conta conectada</h3>
              <p className="muted">
                {user
                  ? `${user.displayName} - ${user.email}`
                  : 'Usuario nao identificado'}
              </p>
              <p className="muted">ID: {user?.id ?? '---'}</p>
            </div>

            <div className="integration-card">
              <span className="status-pill">Sincronizando</span>
              <h3>Contexto do usuario</h3>
              <p className="muted">
                {context?.summary || 'Sem resumo ainda.'}
              </p>
              <p className="muted">Origem: {context?.source ?? '---'}</p>
            </div>

            <div className="integration-card">
              <span className="status-pill">Conectado</span>
              <h3>Conversas sincronizadas</h3>
              <p className="muted">
                Total: {conversations.length} conversa(s)
              </p>
              <p className="muted">
                Ultima atualizacao:{' '}
                {latestConversation
                  ? new Date(latestConversation.updatedAt).toLocaleDateString(
                      'pt-BR'
                    )
                  : '---'}
              </p>
            </div>

            <div className="integration-card">
              <span
                className={`status-pill ${health === 'ok' ? '' : 'warning'}`}
              >
                {health === 'ok' ? 'Online' : 'Indisponivel'}
              </span>
              <h3>Status da API</h3>
              <p className="muted">
                Endpoint: <span className="mono">/health</span>
              </p>
              <p className="muted">
                {health === 'ok'
                  ? 'Servico operacional.'
                  : 'Sem resposta do backend.'}
              </p>
            </div>
          </div>

          <div className="integration-card">
            <h3>Ultimas conversas</h3>
            {conversations.length === 0 && (
              <p className="muted">Nenhuma conversa encontrada.</p>
            )}
            <div className="integration-list">
              {conversations.slice(0, 4).map((conversation) => (
                <div key={conversation.id} className="integration-row">
                  <div>
                    <div className="row-title">
                      {conversation.title || 'Sem titulo'}
                    </div>
                    <div className="row-subtitle">
                      Atualizado em{' '}
                      {new Date(conversation.updatedAt).toLocaleDateString(
                        'pt-BR'
                      )}
                    </div>
                  </div>
                  <Link className="text-btn" href="/">
                    Abrir
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="integration-card">
            <h3>Atualizar nome</h3>
            <form className="integration-form" onSubmit={handleUpdateProfile}>
              <label className="input-label" htmlFor="displayName">
                Nome exibido
              </label>
              <div className="input-inline">
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Seu nome"
                  required
                />
                <button className="action-btn" type="submit">
                  Salvar
                </button>
              </div>
            </form>
          </div>

          <div className="integration-card danger">
            <h3>Excluir conta</h3>
            <p className="muted">
              Esta acao remove sua conta e conversas. Digite EXCLUIR para
              confirmar.
            </p>
            <div className="input-inline">
              <input
                type="text"
                value={deleteConfirm}
                onChange={(event) => setDeleteConfirm(event.target.value)}
                placeholder="EXCLUIR"
              />
              <button className="danger-btn" onClick={handleDeleteAccount}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
