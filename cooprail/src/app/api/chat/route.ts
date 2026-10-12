import { NextRequest, NextResponse } from 'next/server';
import { qualifiedSuppliers } from '@/lib/suppliersData';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { message, slashCommand, history, rfqs, orders, sectors } =
      await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 });
    }

    const trimmedMsg = message.trim();
    const lower = trimmedMsg.toLowerCase();

    // Determina o agente ativo com base no slash command ou no conteúdo
    let activeAgent = 'Assistente de Suprimentos';
    let agentRoleTag = slashCommand || '';

    if (slashCommand === '/busca' || lower.startsWith('/busca') || lower.includes('busca') || lower.includes('fornecedor') || lower.includes('pead') || lower.includes('hidráulica') || lower.includes('peça')) {
      activeAgent = 'Agente de Busca de Fornecedores & Peças';
      agentRoleTag = '/busca';
    } else if (slashCommand === '/controle' || lower.startsWith('/controle') || lower.includes('controle') || lower.includes('compliance') || lower.includes('orçamento')) {
      activeAgent = 'Agente de Controle & Compliance';
      agentRoleTag = '/controle';
    } else if (slashCommand === '/pedido' || lower.startsWith('/pedido') || lower.includes('pedido') || lower.includes('ordem') || lower.includes('po-')) {
      activeAgent = 'Agente de Pedidos & Ordens de Compra';
      agentRoleTag = '/pedido';
    } else if (slashCommand === '/demandas' || lower.startsWith('/demandas') || lower.includes('demanda') || lower.includes('rfq') || lower.includes('edital')) {
      activeAgent = 'Agente de Organização de Demandas';
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

    // 3. Se temos a API Key do Gemini, usamos o modelo com instruções ricas para os 4 Agentes
    if (GEMINI_API_KEY) {
      const systemInstruction = `Você é o ${activeAgent} da plataforma corporativa Cooprail (Enterprise Procurement & Settlement).
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

DIRETRIZES DE ATUAÇÃO CONFORME O AGENTE ATIVO:
- Se for AGENTE DE BUSCA (/busca):
  * CONDIÇÃO 1 (EMPRESAS MOBILIZADAS NO LOCAL): Sempre verifique se a unidade ou setor citado já possui uma empresa com contrato ativo naquele local. Se tiver (ex: Metalúrgica Ferro & Aço Nacional sob CTR-2026-ENG-04), DESTAQUE esta oportunidade estratégica: atendimento imediato e zero custo de mobilização externa!
  * CONDIÇÃO 2 (LOCALIDADE & UNIDADE): Analise as unidades operacionais e centros de distribuição cadastrados na organização.
  * CONDIÇÃO 3 (CATEGORIAS E MATERIAIS): Se o item constar no catálogo (Aço, Válvulas, Vigas, Fixadores, Elétrica, Rolamentos, Pré-moldados), detalhe a empresa e condições. Se NÃO constar (ex: instalações hidráulicas especializadas, PEAD), informe claramente a inexistência na base cadastral e recomende acionar o Agente de Demandas (/demandas) para abrir RFQ pública ou iniciar homologação cadastral.
  * CONDIÇÃO 4 (COMPLIANCE): Cite certificações (ISO, ASTM, ABNT, DIN).

- Se for AGENTE DE CONTROLE (/controle):
  * Audite as ordens emitidas, valores comprometidos, prazos de entrega e conformidade de centros de custo.

- Se for AGENTE DE PEDIDOS (/pedido):
  * Oriente a emissão formal de Ordens de Compra (PO), vinculação com o setor requisitante e a execução do Smart Escrow On-Chain na Solana para garantia financeira.

- Se for AGENTE DE ORGANIZAÇÃO DE DEMANDAS (/demandas):
  * Ajude a estruturar novas requisições (RFQs), especificando escopo técnico, lote de itens e critérios de qualificação técnica para atrair fornecedores no mercado.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

      try {
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemInstruction}\n\nEntrada do usuário: "${trimmedMsg}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2500,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText =
            data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (replyText.trim()) {
            return NextResponse.json({
              reply: replyText.trim(),
              agentRole: agentRoleTag,
            });
          }
        }
      } catch (geminiErr) {
        console.error('Falha na requisição Gemini Chat:', geminiErr);
      }
    }

    // 4. Fallback Inteligente baseado nos Setores e Fornecedores
    if (activeAgent === 'Agente de Busca de Fornecedores & Peças') {
      if (lower.includes('oeste') || lower.includes('unidade') || lower.includes('canteiro') || lower.includes('mobilizada') || lower.includes('local')) {
        return NextResponse.json({
          agentRole: '/busca',
          reply: `[Agente de Busca de Fornecedores & Peças]\n\nResultado da consulta para as unidades operacionais da organização:\n\n⚡ OPORTUNIDADE IN-LOCO (Prestador Já Mobilizado no Local):\n• Metalúrgica Ferro & Aço Nacional S.A.\n• Setor: Divisão de Infraestrutura & Via Permanente - Corredor Oeste\n• Contrato Vigente: CTR-2026-ENG-04 (Manutenção mecânica e soldagem industrial)\n• Diferencial Estratégico: Já possui equipe técnica e canteiro ativos no local — atendimento com zero custo de mobilização e entrega prioritária.\n\nDemais Categorias (Instalações Especiais, PEAD, etc.):\nAtualmente nossa base interna não possui prestador homologado para essa especialidade nesta unidade. Recomenda-se acionar o Agente de Demandas (/demandas) para publicar uma RFQ pública no mercado global.`,
        });
      }

      if (lower.includes('pead') || lower.includes('hidráulica') || lower.includes('tubo')) {
        return NextResponse.json({
          agentRole: '/busca',
          reply: `[Agente de Busca de Fornecedores & Peças]\n\nConsulta de materiais/serviços de tubulação e instalações:\n\n• Status no Catálogo: Categoria atualmente não coberta pelos fornecedores homologados na unidade.\n• Recomendação de Suprimentos: Abra uma Requisição de Compra (RFQ) pública para prospectar e homologar fornecedores aptos, ou cadastre o fornecedor desejado no menu "Fornecedores" para análise de compliance.`,
        });
      }
    }

    if (activeAgent === 'Agente de Controle & Compliance') {
      return NextResponse.json({
        agentRole: '/controle',
        reply: `[Agente de Controle & Compliance]\n\nBalanço da Esteira Operacional Cooprail:\n• Ordens de Compra Emitidas: ${orders?.length || 1} ordens registradas no sistema.\n• Limites e Centros de Custo: Todas as ordens vinculadas aos setores e unidades operacionais dentro da dotação orçamentária.\n• Custódia Financeira: Disponível liquidação garantida via Smart Escrow em sub-segundo.`,
      });
    }

    if (activeAgent === 'Agente de Pedidos & Ordens de Compra') {
      return NextResponse.json({
        agentRole: '/pedido',
        reply: `[Agente de Pedidos & Ordens de Compra]\n\nDiretrizes de Emissão de Pedidos (PO):\n1. Selecione a proposta homologada no "Comparador de Cotações".\n2. O modal de conferência exibirá todos os itens, valores e a Unidade Operacional de destino.\n3. Se o fornecedor já operar no canteiro daquele setor, a ordem recebe a chancela de "Empresa Mobilizada (Zero Custo Extra)".\n4. Após confirmação, execute a liquidação garantida via Smart Escrow on-chain.`,
      });
    }

    if (activeAgent === 'Agente de Organização de Demandas') {
      return NextResponse.json({
        agentRole: '/demandas',
        reply: `[Agente de Organização de Demandas]\n\nPlanejamento de Demandas por Setor:\n• Unidade Operacional Oeste: Demanda prioritária para materiais industriais, peças de substituição e serviços complementares.\n• Sugestão: Reúna as solicitações de peças em um único lote para emitir nova RFQ corporativa com maior poder de barganha de frete e volume.`,
      });
    }

    return NextResponse.json({
      agentRole: '/busca',
      reply: `Consulta registrada pelo Assistente Operacional. Você pode acionar diretamente:\n• /busca [termo] — para pesquisar materiais, cidades e empresas in-loco\n• /controle — para auditar o status das compras\n• /pedido — para orientações sobre ordens de compra e liquidação\n• /demandas — para organizar novas requisições técnicas`,
    });
  } catch (err: any) {
    console.error('Erro na API de chat:', err);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}
