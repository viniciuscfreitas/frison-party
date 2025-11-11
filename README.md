# Frison Party - Sistema de Lista de Presença

Sistema minimalista de check-in para eventos. Sem bloat, sem complexidade desnecessária.

## Stack

- **Next.js 14** - App Router, Server Components
- **TypeScript** - Type safety sem ceremony
- **SQLite** - Banco de dados simples, sem servidor
- **Tailwind CSS** - Estilos diretos, sem abstrações
- **Radix UI** - Componentes acessíveis, só o necessário

## Arquitetura

```
app/
  api/convidados/     # REST API simples
  page.tsx            # Lista de presença
  relatorios/         # Dashboard de estatísticas
lib/
  db.ts               # SQLite wrapper minimalista
components/
  ui/                 # Componentes reutilizáveis
```

## Como Funciona

1. **Banco de dados**: SQLite com WAL mode para performance
2. **API Routes**: Handlers diretos, sem middleware desnecessário
3. **Estado**: React hooks simples, sem state management complexo
4. **Estilos**: Tailwind utility classes, sem CSS customizado

## Setup

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run extract` - Importa CSV para banco
- `npm run clear-db` - Limpa banco de dados

## Deploy

Docker standalone build:

```bash
docker build -t frison-party .
docker run -p 3000:3000 frison-party
```

Ou com docker-compose:

```bash
docker-compose up -d
```

## Decisões de Design

- **Sem ORM**: SQL direto é mais simples e performático
- **Sem state library**: React hooks são suficientes
- **Sem CSS-in-JS**: Tailwind é mais rápido e simples
- **Sem testes**: Para este caso, testes adicionam complexidade sem valor
- **PWA opcional**: Funciona offline, mas não é obrigatório

## Performance

- Build: ~99KB First Load JS
- API: <1ms response time (SQLite local)
- Zero dependencies desnecessárias

## Licença

MIT

