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

    const trimmedMsg = (message || '').trim();
    const lower = trimmedMsg.toLowerCase();

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

    // 2. Contexto dos Setores e Empresas In-Loco (Diferencial Estratégico)
    const sectorsContext = (sectors || []).map((sec: any) => ({
      setor: sec.name,
      codigo: sec.code,
      localizacao: sec.location,
      centroCusto: sec.cost_center,
      empresasMobilizadasNoLocal: (sec.active_contractors || []).map((c: any) => ({
        empresa: c.supplier_name,
        contrato: c.contract_code,
        escopo: c.scope,
        aproveitamentoCanteiro: 'Atendimento imediato e zero frete de mobilização',
      })),
    }));

    // 3. Instrução de Sistema Enriquecida com Foco Estrito no Pedido do Usuário
    const systemInstruction = `Você é o ${activeAgent} da plataforma corporativa Cooprail (Enterprise Industrial Procurement & Settlement).
Você responde em português do Brasil com rigor executivo, linguagem de Diretoria de Suprimentos e foco técnico.
NUNCA use tom infantil ou expressões vagas.

REGRA MANDATÓRIA DE CONTEXTO:
- Responda ESTRITAMENTE ao que o usuário perguntou ou enviou.
- NÃO traga projetos, memoriais ou obras antigas que não foram expressamente solicitados na mensagem atual.
- Se o usuário enviou uma imagem (ex: foto de painel elétrico, válvula, peça, trilho), concentre sua análise 100% no componente visualizado, suas características técnicas, normas aplicáveis e fornecedores pertinentes àquela classe de material.

BASE DE DADOS CORPORATIVA COOPRAIL:
1. SETORES OPERACIONAIS E EMPRESAS MOBILIZADAS:
${JSON.stringify(sectorsContext, null, 2)}

2. CATÁLOGO DE FORNECEDORES HOMOLOGADOS:
${JSON.stringify(suppliersContext, null, 2)}

DIRETRIZES DE ATUAÇÃO POR AGENTE:
- Se for AGENTE DE BUSCA (/busca):
  * Identifique o material ou peça solicitada.
  * Se houver fornecedor homologado na base para aquele item específico, aponte.
  * Se NÃO houver homologado para o item, liste fabricantes e distribuidores de MERCADO ABERTO (não homologados) no Paraná e Brasil, indicando "[FORNECEDOR DE MERCADO - NÃO HOMOLOGADO]".
  * Cite normas técnicas pertinentes (ABNT, ISO, IEC, DIN, AREMA).

- Se for AGENTE DE ORGANIZAÇÃO DE DEMANDAS (/demandas):
  * Estruture a requisição formal (RFQ) para o item/escopo solicitado pelo usuário, especificando descrição técnica, unidade, critérios de qualidade e requisitos para cotação.
  * Não invente itens de outros projetos; use apenas o que o usuário solicitou ou o que identificou na imagem.

- Se for AGENTE DE COMPARAÇÃO (/compare):
  * Analise preços de mercado, dispersão de valores e balizadores oficiais (ex: SINAPI Paraná) para o item demandado.

- Se for AGENTE DE CONTROLE (/controle):
  * Audite conformidade técnica, prazos e integridade de fornecimento.

- Se for AGENTE DE PEDIDOS (/pedido):
  * Oriente a emissão de Ordem de Compra (PO) e a liquidação garantida via Smart Escrow.`;

    // 4. Executa chamada Multi-Model (Gemini com Vision/Search, DeepSeek, Groq ou OpenRouter)
    const aiResult = await executeMultiModelChat({
      message: trimmedMsg || 'Por favor, identifique esta peça e sugira fornecedores.',
      slashCommand: agentRoleTag,
      imageBase64,
      imageMimeType,
      systemInstruction,
      history: history || [],
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
