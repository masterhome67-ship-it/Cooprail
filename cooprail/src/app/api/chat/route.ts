import { NextRequest, NextResponse } from 'next/server';
import { qualifiedSuppliers } from '@/lib/suppliersData';
import { executeMultiModelChat } from '@/lib/aiProviders';

export async function POST(req: NextRequest) {
  try {
    const { message, slashCommand, history, rfqs, orders, sectors, imageBase64, imageMimeType } =
      await req.json();

    if ((!message || typeof message !== 'string') && !imageBase64) {
      return NextResponse.json({ error: 'Mensagem ou imagem necessária' }, { status: 400 });
    }

    // Proteção contra payload DoS e estouro de contexto
    if (message && typeof message === 'string' && message.length > 8000) {
      return NextResponse.json(
        { error: 'Mensagem excede o limite máximo permitido de 8.000 caracteres.' },
        { status: 413 }
      );
    }

    if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.length > 12 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Imagem em base64 excede o limite máximo permitido de 10MB.' },
        { status: 413 }
      );
    }

    const trimmedMsg = (message || '').trim();
    const lower = trimmedMsg.toLowerCase();

    // Sanitiza e delimita histórico para evitar injeção e estouro de contexto
    const safeHistory = (Array.isArray(history) ? history : []).slice(-20).map((h: any) => ({
      role: h?.role === 'model' || h?.role === 'assistant' ? 'assistant' : 'user',
      content: String(h?.content || '').slice(0, 3000),
    }));

    // Determina o agente ativo com base no slash command ou no conteúdo
    let activeAgent = 'Módulo de Busca de Fornecedores & Peças';
    let agentRoleTag = slashCommand || '/busca';

    if (
      slashCommand === '/demandas' ||
      lower.startsWith('/demandas') ||
      lower.includes('demanda') ||
      lower.includes('rfq') ||
      lower.includes('edital')
    ) {
      activeAgent = 'Módulo de Organização de Demandas';
      agentRoleTag = '/demandas';
    } else if (
      slashCommand === '/controle' ||
      lower.startsWith('/controle') ||
      lower.includes('controle') ||
      lower.includes('compliance') ||
      lower.includes('orçamento')
    ) {
      activeAgent = 'Módulo de Controle & Compliance';
      agentRoleTag = '/controle';
    } else if (
      slashCommand === '/pedido' ||
      lower.startsWith('/pedido') ||
      lower.includes('pedido') ||
      lower.includes('ordem') ||
      lower.includes('po-')
    ) {
      activeAgent = 'Módulo de Pedidos & Ordens de Compra';
      agentRoleTag = '/pedido';
    } else if (
      slashCommand === '/compare' ||
      lower.startsWith('/compare') ||
      lower.includes('compare') ||
      lower.includes('proposta') ||
      lower.includes('comparador')
    ) {
      activeAgent = 'Módulo de Comparação de Cotações & Propostas';
      agentRoleTag = '/compare';
    } else {
      activeAgent = 'Módulo de Busca de Fornecedores & Peças';
      agentRoleTag = '/busca';
    }

    // 1. Contexto dos Fornecedores Homologados
    const suppliersContext = qualifiedSuppliers.map((s) => ({
      nome: s.name,
      categorias: s.categories.join(', '),
      certificacoes: s.certifications.join(', '),
      contato: `${s.contact_name} (${s.phone})`,
      prazoMedio: `${s.lead_time_avg_days} dias`,
      nota: s.rating,
      condicoes: s.payment_terms_standard,
    }));

    // 2. Contexto dos Setores e Empresas In-Loco (Sanitizado com tipagem defensiva)
    const sectorsContext = (Array.isArray(sectors) ? sectors : []).slice(0, 10).map((sec: any) => ({
      setor: String(sec?.name || '').slice(0, 100),
      codigo: String(sec?.code || '').slice(0, 50),
      localizacao: String(sec?.location || '').slice(0, 100),
      centroCusto: String(sec?.cost_center || '').slice(0, 50),
      empresasMobilizadasNoLocal: (Array.isArray(sec?.active_contractors) ? sec.active_contractors : []).slice(0, 5).map((c: any) => ({
        empresa: String(c?.supplier_name || '').slice(0, 100),
        contrato: String(c?.contract_code || '').slice(0, 50),
        escopo: String(c?.scope || '').slice(0, 150),
        aproveitamentoCanteiro: 'Atendimento imediato e zero frete de mobilização',
      })),
    }));

    // 3. Instrução de Sistema Enriquecida com Foco Estrito no Pedido do Usuário
    const systemInstruction = `Você é o ${activeAgent} da plataforma corporativa Cooprail (Enterprise Industrial Procurement).
Você responde em português do Brasil com rigor executivo, linguagem de Diretoria de Suprimentos e foco técnico direto ao ponto.

REGRAS MANDATÓRIAS DE FORMATO E SÍNTESE EXECUTIVA (SEM TEXTÃO):
- NUNCA cuspa textos longos, parágrafos teóricos ou disclaimers extensos.
- NUNCA use expressões vagas, jurídicas ou termos infantis.
- NUNCA mencione termos de blockchain, Solana, criptomoedas ou Smart Escrow. A plataforma opera em modelo B2B tradicional brasileiro (Boleto Bancário 30dd / TED / PIX Corporativo).
- Limite sua resposta a NO MÁXIMO 150 a 200 palavras, estruturada em blocos visuais e compactos:
  1. 📦 **Demanda Técnica:** [Material/Peça, Quantitativo, Local de Entrega e Norma ABNT/NBR pertinente].
  2. 💰 **Estimativa de Preço:** [Preço de mercado médio / balizador regional por unidade e total].
  3. 🏢 **Fornecedores Disponíveis:** [Lista ou tabela curta com 2 a 3 empresas da região com Nome, Cidade, Preço estimado, Prazo em dias e Contato público].
- Se a demanda for fora do escopo de suprimentos industriais (ex: esportes, entretenimento, pessoal), recuse de forma suscinta em 2 frases objetivas.

BASE DE DADOS CORPORATIVA COOPRAIL:
1. SETORES OPERACIONAIS E EMPRESAS MOBILIZADAS:
${JSON.stringify(sectorsContext, null, 2)}

2. CATÁLOGO DE FORNECEDORES HOMOLOGADOS:
${JSON.stringify(suppliersContext, null, 2)}

DIRETRIZES DE ATUAÇÃO POR AGENTE:
- Se for AGENTE DE BUSCA (/busca):
  * Identifique o material ou peça solicitada.
  * Se houver fornecedor homologado na base para aquele item específico, aponte.
  * Se NÃO houver homologado para o item, liste distribuidores reais de MERCADO ABERTO no Paraná/região com telefone e prazo.
- Se for AGENTE DE ORGANIZAÇÃO DE DEMANDAS (/demandas):
  * Estruture os dados para abertura da RFQ com memorial e itens especificados.
- Se for AGENTE DE COMPARAÇÃO (/compare):
  * Aponte comparativo de preços e percentual de economia (savings).
- Se for AGENTE DE CONTROLE (/controle):
  * Verifique conformidade cadastral e saldo orçamentário.
- Se for AGENTE DE PEDIDOS (/pedido):
  * Resuma as condições de faturamento corporativo para emissão do Pedido de Compra (PO).`;

    // 4. Executa chamada Multi-Model (Gemini com Vision/Search, DeepSeek, Groq ou OpenRouter)
    const aiResult = await executeMultiModelChat({
      message: trimmedMsg || 'Por favor, identifique esta peça e sugira fornecedores.',
      slashCommand: agentRoleTag,
      imageBase64,
      imageMimeType,
      systemInstruction,
      history: safeHistory,
    });

    return NextResponse.json({
      reply: aiResult.reply,
      agentRole: agentRoleTag,
      provider: aiResult.provider,
      modelUsed: aiResult.modelUsed,
      unhomologatedSuppliersFound: aiResult.unhomologatedSuppliersFound,
      fallbackReason: aiResult.fallbackReason,
    });
  } catch (err: any) {
    console.error('Erro na API de chat:', err);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}
