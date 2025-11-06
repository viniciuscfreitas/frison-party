import { updateCheckIn } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const { entrou } = await request.json();
    const convidado = updateCheckIn(id, !!entrou);
    
    return convidado 
      ? NextResponse.json(convidado)
      : NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  } catch (error: any) {
    // SQLite com WAL mode lida bem com concorrência
    // Se realmente tiver problema, usuário pode tentar novamente
    console.error('Erro ao atualizar check-in:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar. Tente novamente.' },
      { status: 500 }
    );
  }
}

