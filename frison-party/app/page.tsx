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

  useEffect(() => {
    const url = search ? `/api/convidados?search=${encodeURIComponent(search)}` : '/api/convidados';
    fetch(url)
      .then((res) => res.json())
      .then((data) => setConvidados(Array.isArray(data) ? data : []));
  }, [search]);

  const handleCheckIn = async (id: number, entrou: boolean) => {
    // Atualização otimista: atualiza UI imediatamente
    const novoEstado = entrou ? 0 : 1;
    setConvidados((prev) =>
      prev.map((c) => (c.id === id ? { ...c, entrou: novoEstado } : c))
    );
    
    try {
      const response = await fetch(`/api/convidados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entrou: !entrou }),
      });
      
      if (!response.ok) {
        // Se falhar, reverte a mudança e recarrega do servidor
        const url = search ? `/api/convidados?search=${encodeURIComponent(search)}` : '/api/convidados';
        const res = await fetch(url);
        const data = await res.json();
        setConvidados(Array.isArray(data) ? data : []);
        throw new Error('Falha ao atualizar');
      }
      
      // Atualiza com os dados do servidor para garantir sincronização
      const updated = await response.json();
      setConvidados((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    } catch (error) {
      // Em caso de erro, recarrega tudo do servidor
      const url = search ? `/api/convidados?search=${encodeURIComponent(search)}` : '/api/convidados';
      fetch(url)
        .then((res) => res.json())
        .then((data) => setConvidados(Array.isArray(data) ? data : []))
        .catch(() => {
          // Reverte para o estado anterior se a requisição falhar
          setConvidados((prev) =>
            prev.map((c) => (c.id === id ? { ...c, entrou: entrou ? 1 : 0 } : c))
          );
        });
    }
  };

  const presentes = convidados.filter((c) => c.entrou === 1).length;
  const total = convidados.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Lista de Presença</h1>
          <div className="flex gap-6 mb-4">
            <div>
              <span className="text-sm text-gray-600">Total: </span>
              <span className="font-bold">{total}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Presentes: </span>
              <span className="font-bold text-green-600">{presentes}</span>
            </div>
          </div>
          <Input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          {convidados.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-4 p-4 bg-white rounded-lg border ${
                c.entrou === 1 ? 'border-green-300 bg-green-50' : ''
              }`}
            >
              <Checkbox
                checked={c.entrou === 1}
                onCheckedChange={() => handleCheckIn(c.id, c.entrou === 1)}
              />
              <div className="flex-1">
                <div className="font-medium">{c.nome}</div>
                {c.telefone && <div className="text-sm text-gray-500">{c.telefone}</div>}
              </div>
              {c.entrou === 1 && <span className="text-green-600 text-sm">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

