import { NextRequest, NextResponse } from 'next/server';
import { updateCheckIn, getConvidadoById } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { entrou } = body;

    if (typeof entrou !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo entrou deve ser boolean' },
        { status: 400 }
      );
    }

    const convidado = updateCheckIn(id, entrou);
    
    if (!convidado) {
      return NextResponse.json(
        { error: 'Convidado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(convidado);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar check-in' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const convidado = getConvidadoById(id);
    
    if (!convidado) {
      return NextResponse.json(
        { error: 'Convidado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(convidado);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar convidado' },
      { status: 500 }
    );
  }
}

