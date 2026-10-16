/**
 * Cooprail Multi-Provider AI Architecture
 * Suporte a Gemini (Vision + Search Grounding), DeepSeek (R1), Groq e OpenRouter.
 */

export interface AIRequestPayload {
  message: string;
  slashCommand?: string;
  imageBase64?: string;
  imageMimeType?: string;
  systemInstruction: string;
  history?: { role: string; content: string }[];
}

export interface AIResponsePayload {
  reply: string;
  provider: 'gemini' | 'deepseek' | 'groq' | 'openrouter' | 'local_fallback';
  modelUsed: string;
  unhomologatedSuppliersFound?: boolean;
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

  // 1. SE TEM IMAGEM: O Gemini é prioritário por suporte nativo a visão multimodal (peças industriais)
  if (payload.imageBase64 && geminiKey) {
    try {
      const visionResult = await callGeminiVision(payload, geminiKey);
      if (visionResult) return visionResult;
    } catch (e) {
      console.error('Falha no processamento de visão do Gemini:', e);
    }
  }

  // 2. TENTATIVA 1: Google Gemini (com Google Search Grounding para fornecedores de mercado)
  if (geminiKey) {
    try {
      const geminiResult = await callGemini(payload, geminiKey);
      if (geminiResult) return geminiResult;
    } catch (e) {
      console.warn('Gemini indisponível, testando provedores alternativos...');
    }
  }

  // 3. TENTATIVA 2: DeepSeek Oficial ou Groq (DeepSeek-R1 Distill) para raciocínio profundo
  if (groqKey) {
    try {
      const groqResult = await callOpenAICompatible({
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKey: groqKey,
        model: 'deepseek-r1-distill-llama-70b',
        payload,
        provider: 'groq',
      });
      if (groqResult) return groqResult;
    } catch (e) {
      console.warn('Groq indisponível, tentando próximo provedor...');
    }
  }

  if (deepseekKey) {
    try {
      const deepseekResult = await callOpenAICompatible({
        baseUrl: 'https://api.deepseek.com',
        apiKey: deepseekKey,
        model: 'deepseek-reasoner',
        payload,
        provider: 'deepseek',
      });
      if (deepseekResult) return deepseekResult;
    } catch (e) {
      console.warn('DeepSeek indisponível, tentando próximo provedor...');
    }
  }

  // 4. TENTATIVA 3: OpenRouter (Hub com DeepSeek-R1 e Llama gratuitos)
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
    } catch (e) {
      console.warn('OpenRouter indisponível...');
    }
  }

  // 5. FALLBACK DETERMINÍSTICO INDUSTRIAL
  return {
    reply: generateDeterministicFallback(payload),
    provider: 'local_fallback',
    modelUsed: 'Cooprail Engineering Engine v2.0',
  };
}

/**
 * Chamada Multimodal ao Gemini (Texto + Foto de Peça)
 */
async function callGeminiVision(payload: AIRequestPayload, apiKey: string): Promise<AIResponsePayload | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${payload.systemInstruction}\n\n${visionPrompt}\n\nComentário do usuário: "${payload.message}"` },
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

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return {
    reply: text.trim(),
    provider: 'gemini',
    modelUsed: 'gemini-2.5-flash-vision',
    unhomologatedSuppliersFound: text.includes('NÃO HOMOLOGADO') || text.includes('Mercado Aberto'),
  };
}

/**
 * Chamada de Texto ao Gemini com Google Search Grounding para busca de fornecedores de mercado
 */
async function callGemini(payload: AIRequestPayload, apiKey: string): Promise<AIResponsePayload | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${payload.systemInstruction}\n\nEntrada do usuário: "${payload.message}"`,
          },
        ],
      },
    ],
    // Habilita Google Search Grounding para pesquisar fornecedores externos quando não constarem no catálogo
    tools: [
      {
        googleSearch: {},
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2500,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return {
    reply: text.trim(),
    provider: 'gemini',
    modelUsed: 'gemini-2.5-flash-grounded',
    unhomologatedSuppliersFound: text.includes('não homologado') || text.includes('mercado aberto') || text.includes('Google Search'),
  };
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
  const res = await fetch(`${options.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        { role: 'system', content: options.payload.systemInstruction },
        { role: 'user', content: options.payload.message },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;

  return {
    reply: text.trim(),
    provider: options.provider,
    modelUsed: options.model,
  };
}

/**
 * Fallback industrial em caso de falta de conectividade
 */
function generateDeterministicFallback(payload: AIRequestPayload): string {
  const lower = payload.message.toLowerCase();
  const cmd = payload.slashCommand || '';

  // 1. Comando ou intenção /compare (Comparador de Cotações)
  if (cmd === '/compare' || lower.startsWith('/compare') || lower.includes('compare') || lower.includes('proposta') || lower.includes('comparador')) {
    let itemContext = 'insumos para obras civis e industriais';
    let referenceInfo = 'Referência de balizadores oficiais SINAPI Paraná.';

    if (lower.includes('cal')) {
      itemContext = 'Cal Hidratada CH-I (sacos 20kg)';
      referenceInfo = 'Balizador SINAPI PR: R$ 18,50 / saco (50 sacos = R$ 925,00 teto de mercado).';
    } else if (lower.includes('cimento')) {
      itemContext = 'Cimento Portland CP II-Z / CP IV (sacos 50kg)';
      referenceInfo = 'Balizador SINAPI PR: R$ 34,00 / saco (50 sacos = R$ 1.700,00 teto de mercado).';
    } else if (lower.includes('brita')) {
      itemContext = 'Pedra Brita Graduada Nº 1/2/3';
      referenceInfo = 'Balizador SINAPI PR: R$ 95,00 / m³.';
    } else if (lower.includes('madeira')) {
      itemContext = 'Madeira Serrada / Sarrafos de Pinus Tratado';
      referenceInfo = 'Balizador SINAPI PR: R$ 28,00 / metro linear.';
    }

    return `[Módulo de Comparação de Cotações & Propostas]\n\n📊 **Análise Comparativa de Mercado (${itemContext}):**\n• **${referenceInfo}**\n• **Análise de Dispersão:** No Paraná, a dispersão média entre distribuidores locais e atacado direto de fábrica varia entre 6% e 12%.\n• **Gestão de Propostas:** As propostas recebidas de parceiros e cotações de mercado aberto são centralizadas e gerenciadas na aba **Comparador de Cotações**.\n• **Como Abrir Cotação Formal:** Para publicar esta requisição aos fornecedores da região, digite \`/demandas cotar 50 sacos de cal\` ou clique em "+ Nova Cotação (RFQ)".`;
  }

  // 2. PEAD / Tubos / Drenagem
  if (lower.includes('pead') || lower.includes('tubo') || lower.includes('válvula') || lower.includes('drenagem')) {
    return `[Módulo de Suprimentos & Engenharia]\n\nIdentificação de Material de Via/Drenagem:\n• Especificação: Tubos PEAD Corrugados DN 400mm conforme NBR 8890 e Válvulas Industriais de Retenção.\n• Fornecedores Homologados Próximos:\n  - Hidráulica Oeste Paraná Ltda (Cascavel/PR - 12 km)\n  - Drenagem Toledo S.A. (Toledo/PR - 45 km)\n• Fornecedores Externos de Mercado (Não Homologados recomendados para cotação):\n  - Tigre ADS Brasil (Joinville/SC) • Tubos corrugados de grande diâmetro\n  - PeadBrasil Tubulações Industriais (Curitiba/PR)\n\nRecomendação: Para cotar, envie \`/demandas cotar tubos PEAD DN 1000mm\` para publicar na esteira de RFQs.`;
  }

  // 3. Comando /controle
  if (cmd === '/controle' || lower.startsWith('/controle')) {
    return `[Módulo de Controle & Compliance Fiscal]\n\n🛡️ **Auditoria Cadastral e Orçamentária Ativa:**\n• **Conformidade Fiscal:** Cruzamento de chaves NF-e via WebService SEFAZ PR/DF-e com Certificado Digital A1.\n• **Situação Cadastral:** Consulta integrada de CNPJ na Receita Federal (CND e certidões negativas).\n• **Alçadas de Compra:** Controle estrito de centros de custo e limites orçamentários por diretoria.`;
  }

  // 4. Comando /pedido
  if (cmd === '/pedido' || lower.startsWith('/pedido')) {
    return `[Módulo de Pedidos & Ordens de Compra]\n\n📦 **Emissão e Liquidação de Purchase Orders (POs):**\n• As ordens de compra aprovadas vinculam o fornecedor homologado diretamente ao centro de custo operacional requisitante.\n• **Solana Smart Escrow:** Liquidação financeira garantida on-chain, protegendo o comprador até o aceite da NF e medição técnica em canteiro.`;
  }

  return `Consulta processada pelo motor operacional Cooprail. O sistema está pronto para buscar fornecedores homologados, prestadores já mobilizados no canteiro e fabricantes de mercado aberto.`;
}
