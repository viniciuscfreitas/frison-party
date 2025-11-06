#!/bin/bash
echo "=== Diagnóstico Completo ==="
echo ""

echo "1. Verificando imagens Docker:"
docker images | grep frison-party || echo "Nenhuma imagem encontrada"
echo ""

echo "2. Verificando containers (incluindo parados):"
docker compose ps -a
echo ""

echo "3. Verificando se há processos do Docker rodando:"
docker ps -a | grep frison-party || echo "Nenhum container relacionado"
echo ""

echo "4. Verificando arquivos do projeto:"
ls -la | head -10
echo ""

echo "5. Verificando docker-compose.yml:"
if [ -f docker-compose.yml ]; then
    echo "✅ docker-compose.yml existe"
    cat docker-compose.yml | head -15
else
    echo "❌ docker-compose.yml não encontrado"
fi
echo ""

echo "=== Próximos passos ==="
echo "Se não houver imagens, execute:"
echo "  docker compose up -d --build"
echo ""
echo "Se houver erro, execute:"
echo "  docker compose build --no-cache"

