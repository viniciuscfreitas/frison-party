import { requireAuth } from '@/lib/auth';
import { createConvidado, getAllConvidados } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get('search') || undefined;
  const convidados = getAllConvidados(search);
  return NextResponse.json(Array.isArray(convidados) ? convidados : []);
}

export async function POST(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { nome, telefone } = await request.json();
  if (!nome?.trim()) {
    return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
  }
  const convidado = createConvidado(nome.trim(), telefone?.trim());
  return NextResponse.json(convidado, { status: 201 });
}

