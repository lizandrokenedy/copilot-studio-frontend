
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '@/components/Logo';
import { register } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await register({ email, password, displayName });
      setToken(data.token);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-shell fade-in">
        <div className="auth-hero">
          <Logo className="logo logo-auth" />
          <h1>Crie sua conta e comece a conversar</h1>
          <p>
            Ambiente construído para a Multilog testar o Chatbot Inteligênte
          </p>
        </div>
        <div className="auth-panel">
          <h2>Criar conta</h2>
          <form onSubmit={handleSubmit} className="input-group">
            <label htmlFor="displayName">Nome</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Seu nome"
              required
            />

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@empresa.com"
              required
            />

            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Crie uma senha segura"
              required
            />

            {error && <div className="error">{error}</div>}

            <button className="action-btn" type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>
          <Link className="text-btn" href="/login">
            Ja tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
