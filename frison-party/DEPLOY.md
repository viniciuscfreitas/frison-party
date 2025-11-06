# Deploy na VPS - Festa Frison

## Opção 1: Docker (Recomendado)

### Pré-requisitos
- Docker e Docker Compose instalados na VPS
- Git instalado

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/viniciuscfreitas/frison-party.git
cd frison-party
```

2. **Build e start com Docker**
```bash
docker-compose up -d --build
```

3. **Importe os dados do Excel (dentro do container)**
```bash
docker-compose exec app sh -c "cd /app && npm run extract"
```

4. **Acesse a aplicação**
```
http://SEU_IP_VPS:30080
```

### Comandos úteis
```bash
# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart
```

---

## Opção 2: Deploy Direto (Node.js)

### Pré-requisitos
- Node.js 20+ instalado
- PM2 (gerenciador de processos)
- Nginx (proxy reverso opcional)

### Passos

1. **Clone e instale**
```bash
git clone https://github.com/viniciuscfreitas/frison-party.git
cd frison-party
npm install
```

2. **Importe dados**
```bash
npm run extract
```

3. **Build**
```bash
npm run build
```

4. **Inicie com PM2**
```bash
npm install -g pm2
pm2 start npm --name "frison-party" -- start
pm2 save
pm2 startup
```

5. **Configure Nginx (opcional)**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Variáveis de Ambiente

Crie `.env` (opcional):
```env
DATABASE_PATH=/app/data/convidados.db
NODE_ENV=production
PORT=3000
```

---

## Backup do Banco de Dados

```bash
# Com Docker
docker-compose exec app cp /app/data/convidados.db /app/data/backup-$(date +%Y%m%d).db

# Direto
cp data/convidados.db data/backup-$(date +%Y%m%d).db
```

---

## Troubleshooting

**Erro: "Cannot find module 'better-sqlite3'"**
```bash
npm rebuild better-sqlite3
```

**Porta 30080 já em uso**
```bash
# Altere a porta no docker-compose.yml (linha 7)
# Exemplo: "30081:3000" para usar porta 30081
```

**Permissões no banco**
```bash
chmod 664 data/convidados.db
chmod 775 data/
```

