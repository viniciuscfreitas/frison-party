import { updateCheckIn } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const { entrou } = await request.json();
  const convidado = updateCheckIn(id, !!entrou);
  
  return convidado 
    ? NextResponse.json(convidado)
    : NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
}

