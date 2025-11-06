'use client';

import { useEffect, useState } from 'react';
import { Users, CheckCircle2, XCircle, TrendingUp, Calendar, Clock } from 'lucide-react';

interface Convidado {
  id: number;
  nome: string;
  telefone?: string;
  entrou: number;
  created_at?: string;
}

interface Estatisticas {
  total: number;
  presentes: number;
  ausentes: number;
  taxaPresenca: number;
  convidadosComTelefone: number;
  convidadosSemTelefone: number;
}

export default function RelatoriosPage() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);

  useEffect(() => {
    fetchConvidados();
  }, []);

  const fetchConvidados = async () => {
    try {
      const res = await fetch('/api/convidados');
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      setConvidados(lista);
      calcularEstatisticas(lista);
    } catch (error) {
      console.error('Erro ao buscar convidados:', error);
      setConvidados([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (lista: Convidado[]) => {
    const total = lista.length;
    const presentes = lista.filter((c) => c.entrou === 1).length;
    const ausentes = total - presentes;
    const taxaPresenca = total > 0 ? Math.round((presentes / total) * 100) : 0;
    const convidadosComTelefone = lista.filter((c) => c.telefone && c.telefone.trim()).length;
    const convidadosSemTelefone = total - convidadosComTelefone;

    setEstatisticas({
      total,
      presentes,
      ausentes,
      taxaPresenca,
      convidadosComTelefone,
      convidadosSemTelefone,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-muted-foreground">Carregando relatórios...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!estatisticas) {
    return null;
  }

  const presentesList = convidados.filter((c) => c.entrou === 1);
  const ausentesList = convidados.filter((c) => c.entrou === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">
            Estatísticas e informações da festa de aniversário de 50 anos
          </p>
        </div>

        {/* Cards de Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total de Convidados</h3>
            <p className="text-3xl font-bold text-foreground">{estatisticas.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-success/10 rounded-lg p-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Presentes</h3>
            <p className="text-3xl font-bold text-foreground">{estatisticas.presentes}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 rounded-lg p-3">
                <XCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Ausentes</h3>
            <p className="text-3xl font-bold text-foreground">{estatisticas.ausentes}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Taxa de Presença</h3>
            <p className="text-3xl font-bold text-foreground">{estatisticas.taxaPresenca}%</p>
          </div>
        </div>

        {/* Gráfico de Presença */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Taxa de Presença</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Presentes</span>
                <span className="text-sm font-semibold text-foreground">
                  {estatisticas.presentes} ({estatisticas.taxaPresenca}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                <div
                  className="bg-success h-full transition-all duration-500 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${estatisticas.taxaPresenca}%` }}
                >
                  {estatisticas.taxaPresenca > 10 && (
                    <span className="text-xs font-semibold text-white">
                      {estatisticas.taxaPresenca}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Ausentes</span>
                <span className="text-sm font-semibold text-foreground">
                  {estatisticas.ausentes} ({100 - estatisticas.taxaPresenca}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gray-300 h-full transition-all duration-500 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${100 - estatisticas.taxaPresenca}%` }}
                >
                  {100 - estatisticas.taxaPresenca > 10 && (
                    <span className="text-xs font-semibold text-gray-700">
                      {100 - estatisticas.taxaPresenca}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Informações de Contato
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-foreground">Com telefone</span>
                <span className="text-lg font-bold text-primary">
                  {estatisticas.convidadosComTelefone}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-foreground">Sem telefone</span>
                <span className="text-lg font-bold text-muted-foreground">
                  {estatisticas.convidadosSemTelefone}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Resumo Rápido
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Evento</p>
                <p className="font-semibold text-foreground">
                  Festa de Aniversário - 50 anos
                </p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Empresa</p>
                <p className="font-semibold text-foreground">Frison Convenience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Presentes */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Lista de Presentes ({presentesList.length})
          </h2>
          {presentesList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum convidado presente ainda
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {presentesList.map((convidado) => (
                <div
                  key={convidado.id}
                  className="flex items-center gap-3 p-3 bg-success/5 rounded-lg border border-success/20"
                >
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{convidado.nome}</p>
                    {convidado.telefone && (
                      <p className="text-xs text-muted-foreground truncate">
                        {convidado.telefone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Ausentes */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Lista de Ausentes ({ausentesList.length})
          </h2>
          {ausentesList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Todos os convidados estão presentes!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {ausentesList.map((convidado) => (
                <div
                  key={convidado.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                >
                  <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{convidado.nome}</p>
                    {convidado.telefone && (
                      <p className="text-xs text-muted-foreground truncate">
                        {convidado.telefone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

