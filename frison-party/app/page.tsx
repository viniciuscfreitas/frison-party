'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Search, Users, CheckCircle2 } from 'lucide-react';

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
  const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header com estatísticas */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Lista de Presença
              </h1>
              <p className="text-muted-foreground">
                Festa de Aniversário - 50 anos Frison Convenience
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary/10 rounded-lg p-4 min-w-[120px]">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
              </div>
              <div className="bg-success/10 rounded-lg p-4 min-w-[120px]">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Presentes</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{checkedCount}</p>
              </div>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Taxa de presença</span>
              <span className="text-sm font-semibold text-foreground">{percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 h-12 text-base"
          />
        </div>

        {/* Lista de convidados */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-muted-foreground">Carregando convidados...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {convidados.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Nenhum convidado encontrado
                </p>
                {search && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Tente buscar com outros termos
                  </p>
                )}
              </div>
            ) : (
              convidados.map((convidado) => (
                <div
                  key={convidado.id}
                  className={`flex items-center gap-4 p-5 bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                    convidado.entrou === 1
                      ? 'border-success/30 bg-success/5'
                      : 'border-border'
                  }`}
                >
                  <Checkbox
                    checked={convidado.entrou === 1}
                    onCheckedChange={() =>
                      handleCheckIn(convidado.id, convidado.entrou === 1)
                    }
                    className="h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-base">
                      {convidado.nome}
                    </div>
                    {convidado.telefone && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {convidado.telefone}
                      </div>
                    )}
                  </div>
                  {convidado.entrou === 1 && (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-semibold hidden sm:inline">
                        Presente
                      </span>
                    </div>
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

