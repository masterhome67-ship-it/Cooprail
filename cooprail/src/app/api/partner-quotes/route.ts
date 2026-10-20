import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Arquivo de persistência centralizada no servidor
const DATA_DIR = path.join(process.cwd(), 'data');
const QUOTES_FILE = path.join(DATA_DIR, 'partner_quotes.json');

// Garante que o diretório e arquivo existam
function ensureStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(QUOTES_FILE)) {
      fs.writeFileSync(QUOTES_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Erro ao inicializar storage de cotações de parceiros:', err);
  }
}

function readQuotes(): any[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(QUOTES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler partner_quotes.json:', err);
    return [];
  }
}

function writeQuotes(quotes: any[]): boolean {
  ensureStorage();
  try {
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro ao escrever em partner_quotes.json:', err);
    return false;
  }
}

// GET /api/partner-quotes?rfq_id=RFQ-2026-UMU-01&cnpj=00.000.000/0001-00
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rfqId = searchParams.get('rfq_id');
  const cnpj = searchParams.get('cnpj');

  const quotes = readQuotes();

  let filtered = quotes;

  if (rfqId) {
    filtered = filtered.filter(
      (q) => q.rfq_id === rfqId || q.rfq_code === rfqId
    );
  }

  if (cnpj) {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    filtered = filtered.filter((q) => {
      const qClean = (q.cnpj || '').replace(/\D/g, '');
      return qClean === cleanCnpj;
    });
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    quotes: filtered,
  });
}

// POST /api/partner-quotes
export async function POST(req: NextRequest) {
  try {
    const quote = await req.json();

    if (!quote || !quote.supplier_name || !quote.total_amount) {
      return NextResponse.json(
        { error: 'Nome do fornecedor e valor total são obrigatórios.' },
        { status: 400 }
      );
    }

    const quotes = readQuotes();

    // Se a proposta já existir pelo mesmo ID ou pelo mesmo fornecedor para a mesma RFQ, atualiza
    const cleanCnpj = (quote.cnpj || '').replace(/\D/g, '');
    const existingIndex = quotes.findIndex((q) => {
      if (quote.id && q.id === quote.id) return true;
      if (cleanCnpj && (q.cnpj || '').replace(/\D/g, '') === cleanCnpj && q.rfq_id === quote.rfq_id) {
        return true;
      }
      return false;
    });

    const quoteRecord = {
      ...quote,
      id: quote.id || `quote-${Date.now()}`,
      updated_at: new Date().toISOString(),
      submitted_at: quote.submitted_at || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      quotes[existingIndex] = {
        ...quotes[existingIndex],
        ...quoteRecord,
      };
    } else {
      quotes.unshift(quoteRecord);
    }

    writeQuotes(quotes);

    return NextResponse.json({
      success: true,
      message: existingIndex >= 0 ? 'Proposta comercial atualizada com sucesso!' : 'Proposta comercial registrada com sucesso!',
      quote: quoteRecord,
    });
  } catch (err: any) {
    console.error('Erro na rota POST /api/partner-quotes:', err);
    return NextResponse.json(
      { error: 'Falha interna ao processar proposta comercial.' },
      { status: 500 }
    );
  }
}

// DELETE /api/partner-quotes?id=quote-123
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID da cotação não informado.' }, { status: 400 });
  }

  const quotes = readQuotes();
  const filtered = quotes.filter((q) => q.id !== id);

  if (filtered.length !== quotes.length) {
    writeQuotes(filtered);
    return NextResponse.json({ success: true, message: 'Cotação removida com sucesso.' });
  }

  return NextResponse.json({ success: false, message: 'Cotação não encontrada.' }, { status: 404 });
}
