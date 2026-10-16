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
      slashCommand === '/busca' ||
      lower.startsWith('/busca') ||
      lower.includes('busca') ||
      lower.includes('fornecedor') ||
      lower.includes('pead') ||
      lower.includes('hidráulica') ||
      lower.includes('peça') ||
      imageBase64
    ) {
      activeAgent = 'Módulo de Busca de Fornecedores & Peças';
      agentRoleTag = '/busca';
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
    } else if (
      slashCommand === '/demandas' ||
      lower.startsWith('/demandas') ||
      lower.includes('demanda') ||
      lower.includes('rfq') ||
      lower.includes('edital')
    ) {
      activeAgent = 'Módulo de Organização de Demandas';
      agentRoleTag = '/demandas';
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

    // 3. Instrução de Sistema Enriquecida com Busca de Fornecedores Não Homologados
    const systemInstruction = `Você é o ${activeAgent} da plataforma corporativa Cooprail (Enterprise Industrial Procurement & Settlement).
Você responde em português do Brasil com rigor executivo, linguagem de Diretoria de Suprimentos e foco técnico.
NUNCA use tom infantil ou expressões vagas.

BASE DE DADOS REAIS DO SISTEMA:
1. SETORES OPERACIONAIS E EMPRESAS JÁ PRESTANDO SERVIÇO NO LOCAL (Diferencial Estratégico Cooprail):
${JSON.stringify(sectorsContext, null, 2)}

2. CATÁLOGO DE FORNECEDORES HOMOLOGADOS:
${JSON.stringify(suppliersContext, null, 2)}

3. ESTATÍSTICAS DA ESTEIRA:
- RFQs ativas: ${rfqs?.length || 0}
- Ordens de Compra (POs) emitidas: ${orders?.length || 0}

4. MEMORIAL TÉCNICO DESCRITIVO REAL ATIVO (COPACOL):
- Objeto: Substituição Parcial de Tubulação da Rede de Águas Pluviais da Indústria de Cafelândia - PR
- Responsável: Eng. Civil Kaique de Lucca P. Cotrin • Copacol Unidade Cafelândia
- Responsabilidade de Materiais: Os 740 metros de tubulação corrugada de PEAD DN 1.000 mm são fornecidos pela CONTRATANTE (Copacol). Os materiais de escavação, caixas de inspeção, reaterro e canal de descida 3x3m são fornecidos pela CONTRATADA.
- Detalhamento das Caixas: 05 caixas (2,50m x 1,50m x 2,00m), bloco dissipador em concreto de 70cm sobre estaca de 1,50m com 4 barras CA-50 3/8" e estribos CA-60 4,2mm a cada 15cm.
- Canal de Descida: 3m x 3m em concreto armado até o rio receptor.
- Valas: 370m de extensão, 1,5m de profundidade e 2,5m de largura.

DIRETRIZES DE ATUAÇÃO CONFORME O AGENTE ATIVO:
- Se for AGENTE DE BUSCA (/busca):
  * CONDIÇÃO 1 (EMPRESAS MOBILIZADAS NO LOCAL): Sempre verifique se a unidade ou setor citado já possui uma empresa com contrato ativo naquele local. Se tiver (ex: Metalúrgica Ferro & Aço Nacional sob CTR-2026-ENG-04), DESTAQUE esta oportunidade estratégica: atendimento imediato e zero custo de mobilização externa!
  * CONDIÇÃO 2 (FORNECEDORES NÃO HOMOLOGADOS / MERCADO ABERTO): Se o usuário solicitar uma peça ou fornecedor que NÃO consta na lista de homologados da Cooprail, VOCÊ DEVE PESQUISAR E APRESENTAR FORNECEDORES REAIS DE MERCADO ABERTO (fabricantes, distribuidores industriais no Paraná, Santa Catarina, São Paulo e Brasil).
    - Identifique claramente: "[FORNECEDOR DE MERCADO - NÃO HOMOLOGADO]"
    - Indique o nome da empresa, especialidade, cidade/estado e o que ela produz.
    - Oriente o usuário: "Este fornecedor não é homologado na Cooprail. Você pode emitir uma RFQ aberta de mercado ou solicitar o envio de proposta em PDF para qualificação cadastral."
  * CONDIÇÃO 3 (COMPLIANCE): Cite normas técnicas de engenharia (ISO, ASTM, ABNT, DIN, AREMA).

- Se for AGENTE DE CONTROLE (/controle):
  * Audite ordens emitidas, valores comprometidos, prazos de entrega e conformidade de centros de custo.

- Se for AGENTE DE PEDIDOS (/pedido):
  * Oriente a emissão formal de Ordens de Compra (PO), vinculação com o setor requisitante e a execução do Smart Escrow On-Chain na Solana para garantia financeira.

- Se for AGENTE DE COMPARAÇÃO (/compare):
  * Analise as cotações e propostas disponíveis para as RFQs ativas no sistema.
  * Compare preço unitário, frete, prazo de entrega, garantias e condições de pagamento.
  * Se o usuário consultar preço de mercado de materiais (ex: cal, cimento, brita, madeira), informe referências técnicas e balizadores oficiais (ex: SINAPI Paraná: Cal ~R$ 18,50/saco, Cimento ~R$ 34,00/saco, Brita ~R$ 95,00/m³), e oriente que as cotações detalhadas de fornecedores são gerenciadas na aba Comparador de Cotações.

- Se for AGENTE DE ORGANIZAÇÃO DE DEMANDAS (/demandas):
  * Ajude a estruturar novas requisições (RFQs), especificando escopo técnico, lote de itens e critérios de qualificação técnica para atrair fornecedores no mercado.`;

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
    });
  } catch (err: any) {
    console.error('Erro na API de chat:', err);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}
