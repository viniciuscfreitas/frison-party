import { NextRequest, NextResponse } from 'next/server';
import { getAllConvidados, createConvidado } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const convidados = getAllConvidados(search);
    return NextResponse.json(convidados);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar convidados' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telefone } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const convidado = createConvidado(nome.trim(), telefone?.trim());
    return NextResponse.json(convidado, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar convidado' },
      { status: 500 }
    );
  }
}

