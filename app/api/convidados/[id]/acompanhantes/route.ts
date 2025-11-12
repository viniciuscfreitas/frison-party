import { requireAuth } from '@/lib/auth';
import { incrementarAcompanhantes } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401, headers: JSON_HEADERS });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400, headers: JSON_HEADERS });
    }

    const { delta } = await request.json();
    const deltaNumber = typeof delta === 'number' ? Math.floor(delta) : parseInt(String(delta || 0), 10);

    if (isNaN(deltaNumber) || deltaNumber === 0) {
      return NextResponse.json(
        { error: 'Delta inválido. Deve ser um número diferente de zero.' },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const convidado = incrementarAcompanhantes(id, deltaNumber);

    if (!convidado) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404, headers: JSON_HEADERS });
    }

    return NextResponse.json(convidado, { headers: JSON_HEADERS });
  } catch (error: any) {
    console.error('Erro ao atualizar acompanhantes:', error);
    const mensagem =
      error instanceof Error ? error.message : 'Erro ao atualizar acompanhantes. Tente novamente.';
    const status = mensagem.includes('deve estar presente') ? 400 : 500;
    return NextResponse.json({ error: mensagem }, { status, headers: JSON_HEADERS });
  }
}

