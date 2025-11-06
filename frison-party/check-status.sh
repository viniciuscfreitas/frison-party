#!/bin/bash
echo "=== Status dos Containers ==="
docker compose ps

echo ""
echo "=== Últimos Logs ==="
docker compose logs --tail=50

echo ""
echo "=== Verificando se o container está rodando ==="
if docker compose ps | grep -q "Up"; then
    echo "✅ Container está rodando!"
    echo ""
    echo "=== Testando acesso ==="
    docker compose exec app sh -c "ls -la /app/data/ 2>/dev/null || echo 'Pasta data ainda não existe'"
else
    echo "❌ Container não está rodando"
    echo ""
    echo "=== Tentando iniciar ==="
    docker compose up -d
fi

