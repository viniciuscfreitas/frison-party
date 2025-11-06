'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface Convidado {
  id: number;
  nome: string;
  telefone?: string;
  entrou: number;
}

export default function Home() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConvidados = async () => {
    try {
      const url = search
        ? `/api/convidados?search=${encodeURIComponent(search)}`
        : '/api/convidados';
      const res = await fetch(url);
      const data = await res.json();
      setConvidados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar convidados:', error);
      setConvidados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConvidados();
  }, [search]);

  const handleCheckIn = async (id: number, entrou: boolean) => {
    try {
      const res = await fetch(`/api/convidados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entrou: !entrou }),
      });
      if (res.ok) {
        fetchConvidados();
      }
    } catch (error) {
      console.error('Erro ao atualizar check-in:', error);
    }
  };

  const checkedCount = convidados.filter((c) => c.entrou === 1).length;
  const totalCount = convidados.length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Lista de Convidados</h1>
          <p className="text-muted-foreground">
            {checkedCount} de {totalCount} entraram
          </p>
        </div>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <div className="space-y-2">
            {convidados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum convidado encontrado
              </div>
            ) : (
              convidados.map((convidado) => (
                <div
                  key={convidado.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Checkbox
                    checked={convidado.entrou === 1}
                    onCheckedChange={() =>
                      handleCheckIn(convidado.id, convidado.entrou === 1)
                    }
                  />
                  <div className="flex-1">
                    <div className="font-medium">{convidado.nome}</div>
                    {convidado.telefone && (
                      <div className="text-sm text-muted-foreground">
                        {convidado.telefone}
                      </div>
                    )}
                  </div>
                  {convidado.entrou === 1 && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Entrou
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

