'use client';

import { useEffect, useState } from 'react';

interface Convidado {
  id: number;
  nome: string;
  telefone?: string;
  entrou: number;
}

export default function RelatoriosPage() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);

  useEffect(() => {
    fetch('/api/convidados')
      .then((res) => res.json())
      .then((data) => setConvidados(Array.isArray(data) ? data : []));
  }, []);

  const total = convidados.length;
  const presentes = convidados.filter((c) => c.entrou === 1).length;
  const ausentes = total - presentes;
  const taxa = total > 0 ? Math.round((presentes / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Relatórios</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold">{total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Presentes</div>
            <div className="text-3xl font-bold text-green-600">{presentes}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Ausentes</div>
            <div className="text-3xl font-bold text-gray-400">{ausentes}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Taxa</div>
            <div className="text-3xl font-bold">{taxa}%</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Taxa de Presença</h2>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-green-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs"
              style={{ width: `${taxa}%` }}
            >
              {taxa > 10 && `${taxa}%`}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Presentes ({presentes})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {convidados
                .filter((c) => c.entrou === 1)
                .map((c) => (
                  <div key={c.id} className="p-2 bg-green-50 rounded">
                    <div className="font-medium">{c.nome}</div>
                    {c.telefone && <div className="text-sm text-gray-500">{c.telefone}</div>}
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Ausentes ({ausentes})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {convidados
                .filter((c) => c.entrou === 0)
                .map((c) => (
                  <div key={c.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{c.nome}</div>
                    {c.telefone && <div className="text-sm text-gray-500">{c.telefone}</div>}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

