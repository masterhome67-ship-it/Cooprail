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

// GET /api/partner-quotes?rfq_id=RFQ-2026-UMU-01&cnpj=00.000.000/0001-00&pin=1234
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rfqId = searchParams.get('rfq_id');
  const cnpj = searchParams.get('cnpj');
  const pin = searchParams.get('pin');
  const isAuthorizedBuyer = req.headers.get('x-buyer-auth') === 'true';

  if (!rfqId) {
    return NextResponse.json(
      { error: 'Parâmetro rfq_id é obrigatório para consultar cotações.' },
      { status: 400 }
    );
  }

  // Trava de Segurança anti-IDOR/Vazamento de Concorrentes:
  // Apenas compradores autorizados podem listar todas as cotações de uma RFQ.
  // Fornecedores só podem consultar suas próprias propostas informando CNPJ.
  if (!isAuthorizedBuyer && !cnpj) {
    return NextResponse.json(
      { error: 'Não autorizado: Fornecedores só podem consultar suas próprias propostas mediante identificação de CNPJ.' },
      { status: 403 }
    );
  }

  const quotes = readQuotes();

  let filtered = quotes.filter(
    (q) => q.rfq_id === rfqId || q.rfq_code === rfqId
  );

  if (cnpj) {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    filtered = filtered.filter((q) => {
      const qClean = (q.cnpj || '').replace(/\D/g, '');
      return qClean === cleanCnpj;
    });

    // Se houver PIN cadastrado na proposta e a consulta for feita por fornecedor (não comprador), valida PIN
    if (!isAuthorizedBuyer && filtered.length > 0) {
      filtered = filtered.map((q) => {
        if (q.access_pin && q.access_pin !== pin) {
          // Oculta valores e notas se o PIN estiver incorreto para evitar espionagem por CNPJ
          return {
            id: q.id,
            rfq_id: q.rfq_id,
            supplier_name: q.supplier_name,
            cnpj: q.cnpj,
            requires_pin: true,
            has_pin_locked: true,
            message: 'Esta proposta está protegida por PIN de segurança.',
          };
        }
        return q;
      });
    }
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

    const numericAmount = Number(quote.total_amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Valor total da cotação inválido.' },
        { status: 400 }
      );
    }

    const quotes = readQuotes();
    const cleanCnpj = (quote.cnpj || '').replace(/\D/g, '');
    const isAuthorizedBuyer = req.headers.get('x-buyer-auth') === 'true';

    // Verifica se a proposta já existe
    const existingIndex = quotes.findIndex((q) => {
      if (quote.id && q.id === quote.id) return true;
      if (cleanCnpj && (q.cnpj || '').replace(/\D/g, '') === cleanCnpj && q.rfq_id === quote.rfq_id) {
        return true;
      }
      return false;
    });

    // Trava de Segurança anti-IDOR: Impede que um fornecedor sobrescreva proposta de outro
    if (existingIndex >= 0) {
      const existing = quotes[existingIndex];
      const existingCnpjClean = (existing.cnpj || '').replace(/\D/g, '');
      if (existingCnpjClean && cleanCnpj && existingCnpjClean !== cleanCnpj) {
        return NextResponse.json(
          { error: 'Não autorizado: esta proposta comercial pertence a outro fornecedor cadastrado.' },
          { status: 403 }
        );
      }

      // Validação de PIN existente
      if (existing.access_pin && !isAuthorizedBuyer) {
        if (!quote.access_pin || quote.access_pin !== existing.access_pin) {
          return NextResponse.json(
            { error: 'Não autorizado: PIN de acesso à proposta incorreto.' },
            { status: 401 }
          );
        }
      }
    }

    const quoteRecord = {
      ...quote,
      id: quote.id || `quote-${Date.now()}`,
      access_pin: quote.access_pin || (existingIndex >= 0 ? quotes[existingIndex].access_pin : undefined),
      total_amount: numericAmount,
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

// DELETE /api/partner-quotes?id=quote-123 OU /api/partner-quotes?rfq_id=RFQ-2026-UMU-01
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const rfqId = searchParams.get('rfq_id');
  const cnpjParam = searchParams.get('cnpj') || req.headers.get('x-supplier-cnpj');
  const isAuthorizedBuyer = req.headers.get('x-buyer-auth') === 'true';

  // Remoção em massa de cotações associadas a uma RFQ excluída pelo comprador
  if (rfqId && isAuthorizedBuyer) {
    const quotes = readQuotes();
    const remaining = quotes.filter((q) => q.rfq_id !== rfqId && q.rfq_code !== rfqId);
    writeQuotes(remaining);
    return NextResponse.json({ success: true, message: `Todas as cotações da RFQ ${rfqId} foram removidas.` });
  }

  if (!id) {
    return NextResponse.json({ error: 'ID da cotação não informado.' }, { status: 400 });
  }

  const quotes = readQuotes();
  const targetIndex = quotes.findIndex((q) => q.id === id);

  if (targetIndex < 0) {
    return NextResponse.json({ success: false, error: 'Cotação não encontrada.' }, { status: 404 });
  }

  const targetQuote = quotes[targetIndex];
  const targetCnpjClean = (targetQuote.cnpj || '').replace(/\D/g, '');
  const callerCnpjClean = (cnpjParam || '').replace(/\D/g, '');

  // Validação estrita de titularidade: apenas o autor da cotação ou comprador autorizado pode excluir
  if (targetCnpjClean && !isAuthorizedBuyer) {
    if (!callerCnpjClean || callerCnpjClean !== targetCnpjClean) {
      return NextResponse.json(
        { error: 'Não autorizado: apenas o fornecedor titular ou o comprador da RFQ pode remover esta proposta.' },
        { status: 403 }
      );
    }
  }

  quotes.splice(targetIndex, 1);
  writeQuotes(quotes);

  return NextResponse.json({ success: true, message: 'Cotação removida com sucesso.' });
}
