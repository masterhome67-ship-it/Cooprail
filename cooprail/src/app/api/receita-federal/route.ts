import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cnpjParam = searchParams.get('cnpj') || '';

  return handleCnpjLookup(cnpjParam);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cnpjParam = body.cnpj || '';
    return handleCnpjLookup(cnpjParam);
  } catch (err: any) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}

async function handleCnpjLookup(cnpjInput: string) {
  const cleanCnpj = cnpjInput.replace(/\D/g, '');

  if (!cleanCnpj || cleanCnpj.length !== 14) {
    return NextResponse.json(
      { error: 'CNPJ inválido. Forneça exatamente 14 dígitos numéricos.' },
      { status: 400 }
    );
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Cooprail Procurement System; contact@cooprail.com)',
    Accept: 'application/json',
  };

  // 1. Tenta BrasilAPI
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        source: 'Receita Federal (via BrasilAPI)',
        supplier: formatReceitaData(data, cleanCnpj),
      });
    }
  } catch (e) {
    console.warn('BrasilAPI indisponível, tentando MinhaReceita...', e);
  }

  // 2. Fallback para MinhaReceita
  try {
    const res2 = await fetch(`https://minhareceita.org/${cleanCnpj}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (res2.ok) {
      const data2 = await res2.json();
      return NextResponse.json({
        success: true,
        source: 'Receita Federal (via MinhaReceita)',
        supplier: formatReceitaData(data2, cleanCnpj),
      });
    }
  } catch (e) {
    console.error('Falha em todos os provedores da Receita Federal:', e);
  }

  return NextResponse.json(
    {
      error: 'Não foi possível localizar este CNPJ na base da Receita Federal. Verifique o número digitado.',
    },
    { status: 404 }
  );
}

function formatCnpj(digits: string) {
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

function formatReceitaData(d: any, cleanCnpj: string) {
  const formattedCnpj = formatCnpj(cleanCnpj);
  const logradouro = [d.descricao_tipo_de_logradouro, d.logradouro].filter(Boolean).join(' ');
  const numero = d.numero || 'S/N';
  const complemento = d.complemento ? ` - ${d.complemento}` : '';
  const bairro = d.bairro || '';
  const municipio = d.municipio || '';
  const uf = d.uf || '';
  const cep = d.cep ? d.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2') : '';

  const fullAddress = `${logradouro}, ${numero}${complemento}, ${bairro}, ${municipio} - ${uf}, CEP ${cep}`
    .replace(/\s+,/g, ',')
    .trim();

  const cnaePrincipal = d.cnae_fiscal_descricao || '';
  const cnaesSecundarios = Array.isArray(d.cnaes_secundarios)
    ? d.cnaes_secundarios.map((c: any) => c.descricao || c).filter(Boolean)
    : [];

  const situacao = d.descricao_situacao_cadastral || 'ATIVA';
  const isAtiva = situacao.toUpperCase().includes('ATIVA');

  const phone = d.ddd_telefone_1 || d.telefone || '';
  const email = (d.email || '').toLowerCase();

  return {
    id: `rec-${cleanCnpj}`,
    name: d.razao_social || d.nome_fantasia || 'Empresa Registrada',
    trade_name: d.nome_fantasia || '',
    cnpj: formattedCnpj,
    clean_cnpj: cleanCnpj,
    status_receita: situacao,
    is_active: isAtiva,
    status: isAtiva ? 'homologado' : 'bloqueado',
    cnae_principal: cnaePrincipal,
    cnaes_secundarios: cnaesSecundarios,
    categories: [cnaePrincipal, ...cnaesSecundarios.slice(0, 2)].filter(Boolean),
    location: `${municipio} / ${uf}`,
    address: fullAddress,
    contact_name: (d.qsa && d.qsa[0]?.nome_socio) ? d.qsa[0].nome_socio : 'Departamento Comercial',
    phone: phone ? (phone.length === 10 ? phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3') : phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')) : '',
    email: email,
    capital_social: d.capital_social || 0,
    opening_date: d.data_inicio_atividade || '',
    qsa: Array.isArray(d.qsa)
      ? d.qsa.map((s: any) => ({
          name: s.nome_socio,
          role: s.qualificacao_socio || 'Sócio',
        }))
      : [],
    rating: isAtiva ? 5.0 : 2.0,
    certifications: ['Receita Federal Oficial', 'Cadastro Nacional da Pessoa Jurídica (CNPJ)'],
    payment_terms_standard: '30 dias faturado',
    lead_time_avg_days: 10,
    is_mobilized_on_site: false,
  };
}
