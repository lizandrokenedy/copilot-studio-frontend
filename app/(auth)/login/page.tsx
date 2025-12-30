'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '@/components/Logo';
import { login } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login({ email, password });
      setToken(data.token);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-shell fade-in">
        <div className="auth-hero">
          <Logo className="logo logo-auth" />
          <h1>Bem-vindo ao ambiente de testes da Multilog</h1>
          <p>
            Ambiente construído para a Multilog testar o Chatbot Inteligênte
          </p>
        </div>
        <div className="auth-panel">
          <h2>Entrar</h2>
          <form onSubmit={handleSubmit} className="input-group">
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
              placeholder="Sua senha"
              required
            />

            {error && <div className="error">{error}</div>}

            <button className="action-btn" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <Link className="text-btn" href="/register">
            Criar nova conta
          </Link>
        </div>
      </div>
    </div>
  );
}
