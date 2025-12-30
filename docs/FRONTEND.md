# Subir o frontend

Este documento descreve como subir o frontend com e sem Docker Compose.

## Requisitos
- Node.js 20+ e Yarn (para rodar sem Docker)
- Docker Desktop (para rodar com Docker Compose)

## Variaveis de ambiente
- `NEXT_PUBLIC_API_BASE_URL`: URL do backend (padrao `http://localhost:3001`).
- `NEXT_PUBLIC_SHOW_SIDEBAR`: `true` para exibir a sidebar.

Crie um `.env` (ou `.env.local`) na raiz do projeto:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SHOW_SIDEBAR=false
```

## Sem Docker Compose (modo dev)
```
yarn
yarn dev
```

Abra em `http://localhost:3000`.

## Com Docker Compose (modo dev)
```
docker compose up --build
```

Abra em `http://localhost:3000`.

Observacoes:
- As variaveis `NEXT_PUBLIC_*` sao lidas do `.env` durante o build.
