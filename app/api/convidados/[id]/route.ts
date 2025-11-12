import { requireAuth } from '@/lib/auth';
import {
  deleteConvidado,
  updateConvidadoInfo,
  updateConvidadoStatus,
  incrementarAcompanhantes,
} from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export async function PUT(
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

    const { entrou } = await request.json();
    if (typeof entrou !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo "entrou" obrigatório (boolean).' },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const convidado = updateConvidadoStatus(id, entrou);

    return convidado
      ? NextResponse.json(convidado, { headers: JSON_HEADERS })
      : NextResponse.json({ error: 'Não encontrado' }, { status: 404, headers: JSON_HEADERS });
  } catch (error: any) {
    // SQLite com WAL mode lida bem com concorrência
    // Se realmente tiver problema, usuário pode tentar novamente
    console.error('Erro ao atualizar check-in:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar. Tente novamente.' },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function PATCH(
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

    const payload = await request.json();
    const nomeRaw = payload?.nome;
    const telefoneRaw = payload?.telefone;

    const nome =
      typeof nomeRaw === 'string'
        ? nomeRaw.trim()
        : typeof nomeRaw === 'undefined'
          ? undefined
          : null;
    if (nome === null) {
      return NextResponse.json({ error: 'Nome inválido.' }, { status: 400, headers: JSON_HEADERS });
    }
    if (typeof nome !== 'undefined' && nome.length === 0) {
      return NextResponse.json({ error: 'Nome não pode ser vazio.' }, { status: 400, headers: JSON_HEADERS });
    }

    let telefone: string | null | undefined;
    if (typeof telefoneRaw === 'string') {
      const trimmed = telefoneRaw.trim();
      telefone = trimmed.length > 0 ? trimmed : null;
    } else if (telefoneRaw === null) {
      telefone = null;
    } else if (typeof telefoneRaw === 'undefined') {
      telefone = undefined;
    } else {
      return NextResponse.json({ error: 'Telefone inválido.' }, { status: 400, headers: JSON_HEADERS });
    }

    if (typeof nome === 'undefined' && typeof telefone === 'undefined') {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar informado.' },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const convidado = updateConvidadoInfo(id, nome, telefone);

    if (!convidado) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404, headers: JSON_HEADERS });
    }

    return NextResponse.json(convidado, { headers: JSON_HEADERS });
  } catch (error: any) {
    console.error('Erro ao atualizar convidado:', error);
    const mensagem =
      error instanceof Error ? error.message : 'Erro ao atualizar convidado.';
    const status =
      mensagem === 'Nome inválido.' || mensagem === 'Nenhum campo informado para atualizar.'
        ? 400
        : 500;
    return NextResponse.json({ error: mensagem }, { status, headers: JSON_HEADERS });
  }
}

export async function DELETE(
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

    const removido = deleteConvidado(id);

    if (!removido) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404, headers: JSON_HEADERS });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao remover convidado:', error);
    return NextResponse.json({ error: 'Erro ao remover convidado.' }, { status: 500, headers: JSON_HEADERS });
  }
}

