import { NextRequest, NextResponse } from 'next/server';
import { qualifiedSuppliers } from '@/lib/suppliersData';
import { executeMultiModelChat } from '@/lib/aiProviders';
import { routeUserMessage } from '@/lib/chatRouter';

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

    // Roteamento inteligente de agentes (normalizado, com radicais e padrão geral)
    const routing = routeUserMessage({ message: trimmedMsg, slashCommand });
    const activeAgent = routing.activeAgent;
    const agentRoleTag = routing.agentRoleTag;

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

    // 3. Contexto das Requisições e Memoriais do Usuário
    const userRfqsContext = (Array.isArray(rfqs) ? rfqs : []).map((r: any) => ({
      codigo: r.code,
      titulo: r.title,
      escopo: r.scope_description,
      localizacao: r.location,
      status: r.status,
      itens: Array.isArray(r.items)
        ? r.items.map((it: any) => ({
            item: it.item_name,
            especificacao: it.specification,
            quantidade: `${it.quantity} ${it.unit}`,
            preco_alvo: it.target_unit_price,
          }))
        : [],
    }));

    // 4. Instrução de Sistema Enriquecida com Foco Estrito no Pedido do Usuário
    const systemInstruction = `Você é o ${activeAgent} da plataforma corporativa Cooprail (Enterprise Industrial Procurement).
Você responde em português do Brasil com rigor executivo, linguagem de Diretoria de Suprimentos e foco técnico direto ao ponto.

REGRAS MANDATÓRIAS:
- NUNCA mencione termos de blockchain, Solana, criptomoedas ou Smart Escrow. A plataforma opera em modelo B2B corporativo brasileiro tradicional (Boleto Bancário 30dd / TED / PIX Corporativo).
- NUNCA invente itens, quantidades, fornecedores, telefones ou preços fora das bases fornecidas abaixo. Se não houver dados, informe com clareza técnica que a informação não consta na base ativa.
- Se o usuário perguntar sobre itens do memorial, demandas cadastradas ou o que vamos utilizar/comprar (ex: "quais materiais vamos utilizar?", "quais são os itens do memorial?", "o que comprar?"), CONSULTE OBRIGATORIAMENTE OS DADOS DE "REQUISIÇÕES E MEMORIAIS DO USUÁRIO" ABAIXO e responda listando com fidelidade os itens, tipos de materiais, quantitativos e especificações cadastrados.
- Responda de forma direta e objetiva à dúvida apresentada.

DIRETRIZES DE FORMATO POR AGENTE:
- Se for AGENTE DE BUSCA (/busca):
  * Estruture sua resposta em NO MÁXIMO 150 a 200 palavras, dividida estritamente nestes 3 blocos visuais:
    1. 📦 **Demanda Técnica:** [Material/Peça, Quantitativo, Local de Entrega e Norma ABNT pertinente].
    2. 💰 **Estimativa de Preço:** [Preço de mercado médio / balizador regional].
    3. 🏢 **Fornecedores Disponíveis:** [Liste os fornecedores homologados na base para o item específico com contato. Se não houver homologado na base, informe que não há fornecedor homologado cadastrado na base interna].
- Se for Assistente de Suprimentos (geral):
  * Responda diretamente à pergunta feita. Se a pergunta for sobre os materiais do projeto ou memorial, consulte as RFQs cadastradas e liste os materiais e quantidades dos itens da RFQ mais recente ou de todas as ativas.
- Se for Módulo de Organização de Demandas (/demandas):
  * Estruture os dados para abertura da RFQ com memorial e itens especificados.
- Se for Módulo de Comparação de Cotações & Propostas (/compare):
  * Aponte comparativo de preços e percentual de economia (savings).
- Se for Módulo de Controle & Compliance (/controle):
  * Verifique conformidade cadastral e saldo orçamentário.
- Se for Módulo de Pedidos & Ordens de Compra (/pedido):
  * Resuma as condições de faturamento corporativo para emissão do Pedido de Compra (PO).

BASE DE DADOS CORPORATIVA COOPRAIL:
1. REQUISIÇÕES E MEMORIAIS DO USUÁRIO CADASTRADOS NO WORKSPACE:
${JSON.stringify(userRfqsContext, null, 2)}

2. SETORES OPERACIONAIS E EMPRESAS MOBILIZADAS:
${JSON.stringify(sectorsContext, null, 2)}

3. CATÁLOGO DE FORNECEDORES HOMOLOGADOS:
${JSON.stringify(suppliersContext, null, 2)}`;

    // 4. Executa chamada Multi-Model (Gemini, DeepSeek, Groq ou OpenRouter)
    const aiResult = await executeMultiModelChat({
      message: trimmedMsg || 'Por favor, identifique esta peça e sugira fornecedores.',
      slashCommand: routing.explicitSlashCommand,
      imageBase64,
      imageMimeType,
      systemInstruction,
      history: safeHistory,
      rfqs: userRfqsContext,
      orders,
      sectors,
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
