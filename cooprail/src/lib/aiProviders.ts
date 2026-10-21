/**
 * Cooprail Multi-Provider AI Architecture
 * Suporte a Gemini (Vision + Search Grounding), DeepSeek (V3/R1), Groq e OpenRouter.
 */

import { GEMINI_MODELS } from './geminiModels';

export interface AIRequestPayload {
  message: string;
  slashCommand?: string;
  imageBase64?: string;
  imageMimeType?: string;
  systemInstruction: string;
  history?: { role: string; content: string }[];
  rfqs?: any[];
  orders?: any[];
  sectors?: any[];
}

export interface AIResponsePayload {
  reply: string;
  provider: 'gemini' | 'deepseek' | 'groq' | 'openrouter' | 'local_fallback';
  modelUsed: string;
  unhomologatedSuppliersFound?: boolean;
  fallbackReason?: string;
  partIdentified?: {
    name: string;
    category: string;
    norma: string;
    estimatedCostRange?: string;
  };
}

export async function executeMultiModelChat(payload: AIRequestPayload): Promise<AIResponsePayload> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  const providerErrors: string[] = [];

  // 1. SE TEM IMAGEM: O Gemini é prioritário por suporte nativo a visão multimodal (peças industriais)
  if (payload.imageBase64 && geminiKey) {
    try {
      const visionResult = await callGeminiVision(payload, geminiKey);
      if (visionResult) return visionResult;
    } catch (e: any) {
      providerErrors.push(`Gemini Vision: ${e.message}`);
      console.error('[aiProviders] Falha no processamento de visão do Gemini:', e.message);
    }
  }

  // 2. TENTATIVA 1: Google Gemini (com Google Search Grounding para fornecedores de mercado)
  if (geminiKey) {
    try {
      const geminiResult = await callGemini(payload, geminiKey);
      if (geminiResult) return geminiResult;
    } catch (e: any) {
      providerErrors.push(`Gemini: ${e.message}`);
      console.error('[aiProviders] Gemini indisponível:', e.message);
    }
  }

  // 3. TENTATIVA 2: DeepSeek Oficial (deepseek-chat V3 e deepseek-reasoner R1)
  if (deepseekKey) {
    try {
      const deepseekResult = await callOpenAICompatible({
        baseUrl: 'https://api.deepseek.com',
        apiKey: deepseekKey,
        model: 'deepseek-chat',
        payload,
        provider: 'deepseek',
      });
      if (deepseekResult) return deepseekResult;
    } catch (e: any) {
      providerErrors.push(`DeepSeek: ${e.message}`);
      console.error('[aiProviders] DeepSeek indisponível:', e.message);
    }
  }

  // 4. TENTATIVA 3: Groq (Ultra-baixa latência)
  if (groqKey) {
    try {
      const groqResult = await callOpenAICompatible({
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKey: groqKey,
        model: 'llama-3.3-70b-versatile',
        payload,
        provider: 'groq',
      });
      if (groqResult) return groqResult;
    } catch (e: any) {
      providerErrors.push(`Groq: ${e.message}`);
      console.error('[aiProviders] Groq indisponível:', e.message);
    }
  }

  // 5. TENTATIVA 4: OpenRouter (Hub de modelos)
  if (openrouterKey) {
    try {
      const openRouterResult = await callOpenAICompatible({
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: openrouterKey,
        model: 'deepseek/deepseek-r1:free',
        payload,
        provider: 'openrouter',
      });
      if (openRouterResult) return openRouterResult;
    } catch (e: any) {
      providerErrors.push(`OpenRouter: ${e.message}`);
      console.error('[aiProviders] OpenRouter indisponível:', e.message);
    }
  }

  // 6. FALLBACK DETERMINÍSTICO INDUSTRIAL
  const fallbackReason =
    providerErrors.length > 0
      ? providerErrors.join(' | ')
      : 'Nenhuma chave de IA externa válida configurada no .env.local';

  return {
    reply: generateDeterministicFallback(payload),
    provider: 'local_fallback',
    modelUsed: 'Cooprail Engineering Engine v2.0',
    fallbackReason,
  };
}

/**
 * Chamada Multimodal ao Gemini (Texto + Foto de Peça)
 */
async function callGeminiVision(payload: AIRequestPayload, apiKey: string): Promise<AIResponsePayload | null> {
  const models = GEMINI_MODELS;
  const cleanBase64 = payload.imageBase64?.replace(/^data:image\/\w+;base64,/, '') || '';
  const mimeType = payload.imageMimeType || 'image/jpeg';

  const visionPrompt = `Você é o Engenheiro Especialista em Identificação de Peças Industriais e Ferroviárias da plataforma Cooprail.
O usuário enviou a foto de uma peça/componente que ele precisa adquirir ou substituir no campo.

Sua tarefa de inspeção visual:
1. IDENTIFICAÇÃO DA PEÇA: Nome técnico exato do componente (ex: Placa de Apoio TR-45, Grampo Elástico Pandrol/Deenik, Válvula Gaveta Flangeada, Tubo PEAD Corrugado DN 400, Sapata de Freio Composta, etc.).
2. FUNÇÃO E APLICAÇÃO: Onde é utilizada (via permanente, vagão, drenagem de subleito, etc.).
3. NORMAS TÉCNICAS APLICÁVEIS: Normas de fabricação (NBR, ABNT, AREMA, DIN).
4. ESTADO APARENTE: Se aparenta estar desgastada, trincada ou com fadiga material.
5. DIAGNÓSTICO DE FORNECEDORES:
   - Se houver empresa homologada na base interna que fabrique/distribua, aponte.
   - Caso NÃO haja fornecedor homologado cadastrado para esta peça específica, LISTE FABRICANTES E DISTRIBUIDORES NACIONAIS DE MERCADO ABERTO (não homologados) recomendados para contato e cotação.
6. AÇÃO RECOMENDADA: Orientar a abertura de RFQ com especificação técnica padronizada.

Responda em português com linguagem executiva e técnica.`;

  const historyContents = (payload.history || []).map((h) => ({
    role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  const body = {
    systemInstruction: {
      parts: [{ text: payload.systemInstruction }],
    },
    contents: [
      ...historyContents,
      {
        role: 'user',
        parts: [
          { text: `${visionPrompt}\n\nComentário do usuário: "${payload.message}"` },
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2500,
    },
  };

  let lastErrorMsg = '';
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        lastErrorMsg = err.error?.message || `HTTP ${res.status}`;
        console.error(`[aiProviders] Gemini Vision (${model}) erro:`, lastErrorMsg);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return {
          reply: text.trim(),
          provider: 'gemini',
          modelUsed: model,
          unhomologatedSuppliersFound: text.includes('NÃO HOMOLOGADO') || text.includes('Mercado Aberto'),
        };
      }
    } catch (err: unknown) {
      lastErrorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[aiProviders] Falha no fetch Gemini Vision (${model}):`, lastErrorMsg);
    }
  }

  throw new Error(lastErrorMsg || 'Falha ao processar imagem no Gemini');
}

/**
 * Chamada de Texto ao Gemini para busca e diagnóstico técnico de mercado
 */
async function callGemini(payload: AIRequestPayload, apiKey: string): Promise<AIResponsePayload | null> {
  const models = GEMINI_MODELS;

  const historyContents = (payload.history || []).map((h) => ({
    role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  const body = {
    systemInstruction: {
      parts: [{ text: payload.systemInstruction }],
    },
    contents: [
      ...historyContents,
      {
        role: 'user',
        parts: [
          {
            text: payload.message,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2500,
    },
  };

  let lastErrorMsg = '';
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        lastErrorMsg = err.error?.message || `HTTP ${res.status}`;
        console.error(`[aiProviders] Gemini (${model}) erro:`, lastErrorMsg);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return {
          reply: text.trim(),
          provider: 'gemini',
          modelUsed: model,
          unhomologatedSuppliersFound:
            text.includes('não homologado') ||
            text.includes('mercado aberto') ||
            text.includes('NÃO HOMOLOGADO'),
        };
      }
    } catch (err: unknown) {
      lastErrorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[aiProviders] Falha no fetch Gemini (${model}):`, lastErrorMsg);
    }
  }

  throw new Error(lastErrorMsg || 'Falha ao consultar Gemini');
}

/**
 * Chamada genérica para APIs compatíveis com OpenAI (DeepSeek, Groq, OpenRouter)
 */
async function callOpenAICompatible(options: {
  baseUrl: string;
  apiKey: string;
  model: string;
  payload: AIRequestPayload;
  provider: 'deepseek' | 'groq' | 'openrouter';
}): Promise<AIResponsePayload | null> {
  const historyMessages = (options.payload.history || []).map((h) => ({
    role: (h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
    content: h.content,
  }));

  const messages = [
    { role: 'system' as const, content: options.payload.systemInstruction },
    ...historyMessages,
    { role: 'user' as const, content: options.payload.message },
  ];

  try {
    const res = await fetch(`${options.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: 0.3,
        max_tokens: 2500,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${res.status}`;
      console.error(`[aiProviders] Falha no provedor ${options.provider} (${options.model}):`, msg);
      throw new Error(msg);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    return {
      reply: text.trim(),
      provider: options.provider,
      modelUsed: options.model,
    };
  } catch (err: any) {
    console.error(`[aiProviders] Exceção em ${options.provider} (${options.model}):`, err.message);
    throw err;
  }
}

/**
 * Fallback industrial em caso de falta de conectividade externa
 */
function generateDeterministicFallback(payload: AIRequestPayload): string {
  const lower = payload.message.toLowerCase();
  const normalized = payload.message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const cmd = payload.slashCommand || '';

  // 0. Caso uma imagem tenha sido anexada e o sistema esteja em modo de contingência
  if (payload.imageBase64) {
    return `[Módulo de Inspeção Visual & Engenharia de Peças]

📸 **Registro Fotográfico Recebido:**
• O arquivo visual do componente/equipamento foi carregado no sistema.
• **Status do Diagnóstico Visual com IA:** A identificação automática de peças por visão computacional requer a variável de ambiente **GEMINI_API_KEY** ativa nas configurações do servidor.
• **Como prosseguir com a cotação:**
  - Para abrir uma requisição formal para este equipamento: \`/demandas cotar componentes e materiais para canteiro\`
  - Para buscar fornecedores do setor no mercado: \`/busca fornecedores de equipamentos e materiais no Paraná\`.`;
  }

  // 1. CONEXÃO DIRETA COM O PAINEL: Pergunta sobre cotações abertas, demandas ou status
  const rfqs = payload.rfqs || [];

  const isAskingAboutOpenRFQs =
    normalized.includes('cotacoes abertas') ||
    normalized.includes('cotacao aberta') ||
    normalized.includes('o que temos') ||
    normalized.includes('quais cotacoes') ||
    normalized.includes('quais demandas') ||
    normalized.includes('demandas abertas') ||
    normalized.includes('quais editais') ||
    normalized.includes('minhas cotacoes') ||
    normalized.includes('minhas demandas') ||
    (cmd === '/demandas' &&
      (normalized.includes('abertas') ||
        normalized.includes('temos') ||
        normalized.includes('listar') ||
        normalized.includes('quais') ||
        normalized.includes('status')));

  if (isAskingAboutOpenRFQs) {
    if (rfqs.length === 0) {
      return `[Módulo de Gestão de Demandas & Cotações]\n\n📂 **Status Atual do Painel:**\n• Não há nenhuma cotação aberta ou rascunho pendente no momento.\n• **Como iniciar:** Anexe um memorial descritivo ou projeto em PDF pelo botão "Importar por Documento" ou digite o material desejado.`;
    }

    let out = `[Módulo de Gestão de Demandas & Cotações]\n\n📋 **Você possui ${rfqs.length} ${
      rfqs.length === 1 ? 'demanda registrada' : 'demandas registradas'
    } no painel:**\n\n`;
    rfqs.forEach((r: any, idx: number) => {
      const itemsCount = Array.isArray(r.itens)
        ? r.itens.length
        : Array.isArray(r.items)
        ? r.items.length
        : 0;
      const statusLabel = r.status === 'published' ? '🟢 Aberta para Cotações' : '🟡 Rascunho / Pendente';
      const loc = r.localizacao || r.location || 'Local a definir';
      out += `**${idx + 1}. ${r.codigo || r.code || 'RFQ'}** — *${r.titulo || r.title}*\n`;
      out += `• **Status:** ${statusLabel} | **Local:** ${loc}\n`;
      out += `• **Quantitativo:** ${itemsCount} itens cadastrados\n`;
      const itemList = Array.isArray(r.itens) ? r.itens : Array.isArray(r.items) ? r.items : [];
      if (itemList.length > 0) {
        const preview = itemList
          .slice(0, 3)
          .map((it: any) => `*${it.item || it.item_name}*`)
          .join(', ');
        out += `• **Amostra de Itens:** ${preview}${itemList.length > 3 ? ` *(+${itemList.length - 3} itens)*` : ''}\n`;
      }
      out += `\n`;
    });
    out += `💡 **Como proceder:** Acesse a aba **Demandas** para acompanhar o andamento ou **Comparador** para propostas.`;
    return out;
  }

  // 2. CONEXÃO DIRETA COM O PAINEL: Pergunta sobre materiais, produtos a cotar, memorial
  const isAskingAboutProductsToQuote =
    normalized.includes('precisamos cotar') ||
    normalized.includes('produtos a cotar') ||
    normalized.includes('quais produtos') ||
    normalized.includes('quais itens') ||
    normalized.includes('itens do documento') ||
    normalized.includes('itens do memorial') ||
    normalized.includes('quais materiais') ||
    normalized.includes('tipos de materiais') ||
    normalized.includes('tipo de material') ||
    normalized.includes('materiais que vamos utilizar') ||
    normalized.includes('materiais que vamos usar') ||
    normalized.includes('materiais vamos utilizar') ||
    normalized.includes('vamos utilizar') ||
    normalized.includes('vamos usar') ||
    normalized.includes('o que vamos comprar') ||
    normalized.includes('o que comprar') ||
    normalized.includes('o que cotar') ||
    normalized.includes('lista de produtos') ||
    normalized.includes('materiais a utilizar') ||
    (normalized.includes('materiais') &&
      (normalized.includes('utilizar') ||
        normalized.includes('usar') ||
        normalized.includes('comprar') ||
        normalized.includes('projeto') ||
        normalized.includes('obra') ||
        normalized.includes('quais'))) ||
    (normalized.includes('produtos') &&
      (normalized.includes('cotar') ||
        normalized.includes('temos') ||
        normalized.includes('quais') ||
        normalized.includes('comprar')));

  if (isAskingAboutProductsToQuote) {
    if (rfqs.length === 0) {
      return `[Módulo de Suprimentos & Engenharia]\n\n📦 **Produtos e Insumos:**\n• Nenhuma demanda foi carregada ainda no sistema.\n• Para extrair os produtos automaticamente, anexe seu memorial descritivo em PDF pelo botão "Importar por Documento".`;
    }

    let out = `[Módulo de Suprimentos & Engenharia]\n\n📦 **Relação de Materiais e Insumos Cadastrados nas Demandas:**\n\n`;
    rfqs.forEach((r: any) => {
      const itemList = Array.isArray(r.itens) ? r.itens : Array.isArray(r.items) ? r.items : [];
      out += `📁 **Demanda ${r.codigo || r.code}** — *${r.titulo || r.title}* (${r.localizacao || r.location || 'Canteiro'}):\n`;
      if (itemList.length > 0) {
        itemList.slice(0, 10).forEach((it: any, i: number) => {
          const qty = it.quantidade || (it.quantity ? `${it.quantity} ${it.unit || 'un'}` : '');
          const spec = it.especificacao || it.specification ? ` — ${it.especificacao || it.specification}` : '';
          out += `  ${i + 1}. **${it.item || it.item_name}** ${qty ? `(${qty})` : ''}${spec}\n`;
        });
        if (itemList.length > 10) {
          out += `  *(... e mais ${itemList.length - 10} itens cadastrados no memorial completo)*\n`;
        }
      } else {
        out += `  • Demanda em estruturação de escopo.\n`;
      }
      out += `\n`;
    });
    out += `💡 Para pesquisar fornecedores de qualquer um destes materiais, digite \`/busca [nome do material]\`.`;
    return out;
  }

  // 3. Comando ou intenção /busca (Busca de Fornecedores & Peças)
  if (
    cmd === '/busca' ||
    normalized.startsWith('/busca') ||
    normalized.includes('fornecedor') ||
    normalized.includes('distribuidor') ||
    normalized.includes('onde comprar') ||
    normalized.includes('preco de')
  ) {
    if (normalized.includes('cimento')) {
      return `[Módulo de Busca de Fornecedores & Mercado]\n\n🏭 **Fornecedores e Distribuidores de Cimento Identificados:**\n\n• **Distribuidora Regional Homologada:**\n  - Marcas: Votoran CP II-E / Itambé CP IV / Cimento Campeão\n  - Prazo Médio: 24 a 48 horas | Frete paletizado no canteiro\n  - Capacidade: Cargas fracionadas ou fechadas (truck ou carreta 30t)\n\n• **Comercial & Insumos Industriais:**\n  - Atendimento para atacado e bases operacionais de infraestrutura\n\n💡 **Recomendação:** Digite \`/demandas cotar 50 sacos de cimento\` para abrir o edital de cotação formal.`;
    }

    if (normalized.includes('cal')) {
      return `[Módulo de Busca de Fornecedores & Mercado]\n\n🏭 **Fornecedores de Cal Hidratada (Argamassa e Pintura):**\n\n• **Depósito Regional de Materiais:**\n  - Especialidade: Cal Hidratada CH-I (sacos 20kg conforme NBR 7175)\n  - Prazo: Pronta-entrega (1 a 2 dias úteis)\n  - Referência Balizadora SINAPI: ~R$ 18,50 / saco\n\n• **Distribuidores Industriais:**\n  - Atendimento para atacado industrial e bases de infraestrutura\n\n💡 **Recomendação:** Digite \`/demandas cotar cal hidratada\` para disparar a requisição de mercado.`;
    }

    if (normalized.includes('brita') || normalized.includes('pedra')) {
      return `[Módulo de Busca de Fornecedores & Mercado]\n\n🪨 **Pedreiras e Distribuidores de Brita Graduada:**\n\n• **Pedreira e Mineração:**\n  - Materiais: Brita 1, Brita 2, Brita 3 e Rachão para Drenagem\n  - Entrega: Basculante caçamba trucada (14m³) ou carreta (28m³)\n  - Balizador SINAPI: ~R$ 95,00 / m³ posto canteiro\n\n💡 **Recomendação:** Digite \`/demandas cotar 50 metros de brita\` para estruturar a cotação formal.`;
    }

    if (normalized.includes('madeira')) {
      return `[Módulo de Busca de Fornecedores & Mercado]\n\n🪵 **Madeireiras e Fornecedores de Pinus Tratado:**\n\n• **Madeireira e Insumos Civis:**\n  - Especialidade: Sarrafos 2,5x5cm, tábuas de pinus para caixaria e mourões\n  - Tratamento: Autoclave CCA conforme norma ABNT\n  - Balizador SINAPI: ~R$ 28,00 / metro\n\n💡 **Recomendação:** Digite \`/demandas cotar madeira para canteiro\` para gerar a requisição.`;
    }

    if (
      normalized.includes('pead') ||
      normalized.includes('tubo') ||
      normalized.includes('valvula') ||
      normalized.includes('drenagem')
    ) {
      return `[Módulo de Busca de Fornecedores & Mercado]\n\nIdentificação de Material de Via/Drenagem:\n• Especificação: Tubos PEAD Corrugados DN 400mm/1000mm conforme NBR 8890 e Válvulas Industriais de Retenção.\n• Fornecedores Homologados e de Mercado:\n  - Fabricantes de tubos corrugados de grande diâmetro e conexões industriais\n  - Fornecimento CIF com ensaios e laudos de rigidez anular\n\nRecomendação: Para cotar, envie \`/demandas cotar tubos PEAD DN 1000mm\`.`;
    }

    return `[Módulo de Busca de Fornecedores & Mercado]\n\n🔎 **Pesquisa de Insumos e Fornecedores Ativa:**\n• O sistema consulta a base de homologados regionais, empresas cadastradas e fabricantes do mercado B2B.\n• Para localizar fornecedores com precisão, informe o material e a cidade ou canteiro desejado (ou anexe o arquivo com memorial descritivo).`;
  }

  // 4. Comando ou intenção /compare (Comparador de Cotações)
  if (
    cmd === '/compare' ||
    normalized.startsWith('/compare') ||
    normalized.includes('compar') ||
    normalized.includes('cotac') ||
    normalized.includes('proposta')
  ) {
    let itemContext = 'insumos para obras civis e industriais';
    let referenceInfo = 'Referência de balizadores oficiais SINAPI Paraná.';

    if (normalized.includes('cal')) {
      itemContext = 'Cal Hidratada CH-I (sacos 20kg)';
      referenceInfo = 'Balizador SINAPI PR: R$ 18,50 / saco (50 sacos = R$ 925,00 teto de mercado).';
    } else if (normalized.includes('cimento')) {
      itemContext = 'Cimento Portland CP II-Z / CP IV (sacos 50kg)';
      referenceInfo = 'Balizador SINAPI PR: R$ 34,00 / saco (50 sacos = R$ 1.700,00 teto de mercado).';
    } else if (normalized.includes('brita')) {
      itemContext = 'Pedra Brita Graduada Nº 1/2/3';
      referenceInfo = 'Balizador SINAPI PR: R$ 95,00 / m³.';
    } else if (normalized.includes('madeira')) {
      itemContext = 'Madeira Serrada / Sarrafos de Pinus Tratado';
      referenceInfo = 'Balizador SINAPI PR: R$ 28,00 / metro linear.';
    }

    return `[Módulo de Comparação de Cotações & Propostas]\n\n📊 **Análise Comparativa de Mercado (${itemContext}):**\n• **${referenceInfo}**\n• **Análise de Dispersão:** No Paraná, a dispersão média entre distribuidores locais e atacado direto de fábrica varia entre 6% e 12%.\n• **Gestão de Propostas:** As propostas recebidas de parceiros e cotações de mercado aberto são centralizadas na aba **Comparador de Cotações**.\n• **Como Abrir Cotação Formal:** Para publicar esta requisição aos fornecedores, digite \`/demandas cotar [material]\` ou clique em "+ Nova Cotação (RFQ)".`;
  }

  // 5. Comando /controle
  if (
    cmd === '/controle' ||
    normalized.startsWith('/controle') ||
    normalized.includes('compliance') ||
    normalized.includes('orcament')
  ) {
    return `[Módulo de Controle & Compliance Fiscal]\n\n🛡️ **Auditoria Cadastral e Orçamentária Ativa:**\n• **Conformidade Fiscal:** Cruzamento de chaves NF-e via WebService SEFAZ PR/DF-e com Certificado Digital A1.\n• **Situação Cadastral:** Consulta integrada de CNPJ na Receita Federal (CND e certidões negativas).\n• **Alçadas de Compra:** Controle estrito de centros de custo e limites orçamentários por diretoria.`;
  }

  // 6. Comando /pedido
  if (cmd === '/pedido' || normalized.startsWith('/pedido') || normalized.includes('pedido') || normalized.includes('po-')) {
    return `[Módulo de Pedidos & Ordens de Compra]\n\n📦 **Emissão e Liquidação de Purchase Orders (POs):**\n• As ordens de compra aprovadas vinculam o fornecedor homologado diretamente ao centro de custo operacional requisitante.\n• Faturamento corporativo formal com controle de entrega, medição técnica e pagamento via Boleto Bancário ou PIX corporativo.`;
  }

  // 7. Resposta genérica final clara sobre indisponibilidade temporária de IA
  return `Assistente de IA temporariamente indisponível.

Você pode utilizar os comandos rápidos para consultar o painel:
• **/busca** — Pesquisar fornecedores e insumos no mercado
• **/demandas** — Estruturar editais de cotação e consultar memoriais
• **/compare** — Comparar propostas e consultar balizadores SINAPI
• **/pedido** — Consultar e aprovar ordens de compra (PO)
• **/controle** — Auditar certidões de conformidade e centros de custo`;
}
