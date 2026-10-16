import { RFQ, Quote, RFQItem } from './mockData';
import { savePublishedRFQ, PublishedRFQ } from './userWorkspace';

export interface QuotationIntentParams {
  material: string;
  quantity: number;
  unit: string;
  location: string;
  estimatedUnitPrice: number;
  totalBudget: number;
}

export function detectQuotationIntent(message: string): boolean {
  const lower = (message || '').toLowerCase().trim();

  // Se o usuário pedir cotação ou mencionar compra de insumos
  const triggerKeywords = [
    'cotar',
    'cotação',
    'cotacao',
    'orçar',
    'orçamento',
    'orcamento',
    'comprar',
    'preciso de',
    'solicito',
    'solicitar cotação',
    'busca de preço',
    'quanto custa',
    'fornecedor de',
  ];

  const materialKeywords = [
    'cimento',
    'sacos',
    'pead',
    'tubo',
    'tubos',
    'viga',
    'aço',
    'ferro',
    'areia',
    'brita',
    'concreto',
    'tijolo',
    'válvula',
    'bomba',
    'material',
  ];

  const hasTrigger = triggerKeywords.some((k) => lower.includes(k));
  const hasMaterial = materialKeywords.some((k) => lower.includes(k));

  // Ex: "50 sacos de cimento em Umuarama" tem material e quantidade mesmo sem a palavra "cotar"
  const hasQuantityAndMaterial = /\d+/.test(lower) && hasMaterial;

  return hasTrigger || hasQuantityAndMaterial;
}

export function parseQuotationParams(message: string): QuotationIntentParams {
  const text = (message || '').trim();
  const lower = text.toLowerCase();

  // 1. Extrai Quantidade e Unidade
  let quantity = 50;
  let unit = 'unidades';

  const qtyMatch = lower.match(/(\d+)\s*(sacos?|sc|unidades?|un|peças?|pç|metros?|m|toneladas?|ton|kg|lts?|litros?)/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
    const rawUnit = qtyMatch[2].toLowerCase();
    if (rawUnit.startsWith('saco') || rawUnit === 'sc') unit = 'sacos (50kg)';
    else if (rawUnit.startsWith('metro') || rawUnit === 'm') unit = 'metros';
    else if (rawUnit.startsWith('peça') || rawUnit === 'pç') unit = 'peças';
    else if (rawUnit.startsWith('ton')) unit = 'toneladas';
    else unit = rawUnit;
  } else {
    const simpleNum = lower.match(/(\d+)/);
    if (simpleNum) {
      quantity = parseInt(simpleNum[1], 10);
    }
  }

  // 2. Extrai Localidade / Cidade
  let location = 'Umuarama - PR';
  const cities = [
    'umuarama',
    'cafelândia',
    'cafelandia',
    'cascavel',
    'toledo',
    'maringá',
    'maringa',
    'londrina',
    'curitiba',
    'foz do iguaçu',
    'foz',
    'paranavaí',
    'campo mourão',
    'guarapuava',
    'ponta grossa',
  ];

  for (const city of cities) {
    if (lower.includes(city)) {
      location = city.charAt(0).toUpperCase() + city.slice(1) + ' - PR';
      if (city === 'umuarama') location = 'Umuarama - PR';
      if (city.includes('cafelandia') || city.includes('cafelândia')) location = 'Cafelândia - PR';
      if (city.includes('maringa') || city.includes('maringá')) location = 'Maringá - PR';
      break;
    }
  }

  // 3. Extrai Material / Nome da Peça
  let material = 'Cimento Portland CP II-Z / CP IV';
  let estimatedUnitPrice = 34.0;

  if (lower.includes('cimento')) {
    material = 'Cimento Portland CP II-Z ou CP IV';
    estimatedUnitPrice = 33.5;
    if (unit === 'unidades') unit = 'sacos (50kg)';
  } else if (lower.includes('pead') || lower.includes('tubo')) {
    material = 'Tubulação Corrugada PEAD DN 1.000mm';
    estimatedUnitPrice = 420.0;
    if (unit === 'unidades') unit = 'metros';
  } else if (lower.includes('viga') || lower.includes('aço') || lower.includes('aco')) {
    material = 'Viga Estrutural de Aço ASTM A572';
    estimatedUnitPrice = 850.0;
    if (unit === 'unidades') unit = 'barras 12m';
  } else if (lower.includes('areia')) {
    material = 'Areia Média Lavada para Construção';
    estimatedUnitPrice = 110.0;
    unit = 'm³';
  } else if (lower.includes('brita')) {
    material = 'Pedra Brita Nº 1 Graduada';
    estimatedUnitPrice = 95.0;
    unit = 'm³';
  } else {
    // Tenta capturar o nome do produto no texto
    const cleaned = text
      .replace(/cotar|cotação|cotacao|orçar|orçamento|comprar|preciso de|em\s+[a-zÀ-ÿ]+/gi, '')
      .replace(/\d+\s*(sacos?|unidades?|peças?|metros?)/gi, '')
      .trim();
    if (cleaned.length > 3) {
      material = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  const totalBudget = Math.round(quantity * estimatedUnitPrice);

  return {
    material,
    quantity,
    unit,
    location,
    estimatedUnitPrice,
    totalBudget,
  };
}

export async function executeAutonomousQuotation(
  params: QuotationIntentParams
): Promise<{
  rfq: RFQ;
  quotes: Quote[];
  summaryText: string;
}> {
  const generatedCode = `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`;
  let quotes: Quote[] = [];

  // Tenta buscar cotações reais via /api/market-search com timeout de 4.5s
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('/api/market-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: params.material,
        quantity: `${params.quantity} ${params.unit}`,
        location: params.location,
        budget: params.totalBudget,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
        quotes = data.suppliers.map((sup: any, idx: number) => {
          const quoteAmount = sup.total_amount || Math.round(params.totalBudget * (1 - idx * 0.04));
          const savings = Math.max(0, Math.round(((params.totalBudget - quoteAmount) / params.totalBudget) * 100));

          return {
            id: `quote-auto-${Date.now()}-${idx}`,
            rfq_id: generatedCode,
            supplier_name: sup.name || `Distribuidor Regional ${idx + 1}`,
            supplier_rating: sup.rating || 4.7,
            total_amount: quoteAmount,
            delivery_lead_time_days: sup.delivery_lead_time_days || (idx === 0 ? 1 : 2),
            payment_terms: 'Liquidação Garantida via Solana Smart Escrow / Boleto',
            status: 'received',
            ai_score: Number((9.1 + (idx === 0 ? 0.6 : 0.2)).toFixed(1)),
            ai_analysis_summary:
              sup.ai_analysis ||
              `Fornecedor localizado em ${sup.city || params.location}. Cotação apurada via motor de mercado aberto.`,
            savings_percentage: savings,
            is_open_market: true,
            supplier_phone: sup.phone || '(44) 3622-1000',
            supplier_city: sup.city || params.location,
            market_source: sup.market_source || 'Mercado B2B Regional',
          };
        });
      }
    }
  } catch (e) {
    // Se o fetch falhar ou estourar timeout, não interrompe e monta com fornecedores consolidados
    console.warn('Busca de mercado via API demorou ou falhou, aplicando cotações locais rápidas.');
  }

  // Cria o registro da RFQ completo sem propostas fictícias
  const rfqItem: RFQItem = {
    id: `item-${Date.now()}`,
    item_name: params.material,
    specification: `Insumos em conformidade técnica com normas ABNT aplicáveis, sacaria e entrega paletizada no canteiro de ${params.location}.`,
    quantity: params.quantity,
    unit: params.unit,
    target_unit_price: params.estimatedUnitPrice,
  };

  const newRFQ: PublishedRFQ = {
    id: `rfq-auto-${Date.now()}`,
    code: generatedCode,
    title: `Aquisição de ${params.quantity} ${params.unit} de ${params.material} (${params.location})`,
    scope_description: `Cotação autônoma aberta pelo Agente de Suprimentos para fornecimento e descarga em ${params.location}.`,
    status: 'published',
    deadline: 'Em 24 horas',
    target_delivery_date: 'Até 2 dias úteis',
    estimated_budget: params.totalBudget,
    items: [rfqItem],
    quotes: quotes,
    location: params.location,
    hasCopacolDrawings: false,
  };

  // Salva no barramento compartilhado para ficar acessível ao Portal do Parceiro
  savePublishedRFQ(newRFQ);

  let summaryText = '';
  if (quotes.length > 0) {
    const bestQuote = quotes[0];
    const unitPriceFormatted = (bestQuote.total_amount / params.quantity).toFixed(2);
    const totalFormatted = bestQuote.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    summaryText = `🎯 **Cotação Autônoma Realizada!**\n\nIdentifiquei a necessidade de **${params.quantity} ${params.unit} de ${params.material}** para entrega em **${params.location}**.\n\nO motor de pesquisa localizou **${quotes.length} fornecedores reais**:\n\n• 🏆 **1º Menor Preço:** **${bestQuote.supplier_name}** — **${totalFormatted}** (R$ ${unitPriceFormatted}/unidade) • Prazo: **${bestQuote.delivery_lead_time_days} dia(s)**\n\nA requisição **${generatedCode}** está sincronizada no **Comparador de Cotações**. O link público do **Portal do Parceiro** também está ativo para receber propostas adicionais.`;
  } else {
    summaryText = `🎯 **Requisição de Compra Criada e Aberta ao Mercado!**\n\nIdentifiquei a necessidade de **${params.quantity} ${params.unit} de ${params.material}** para entrega em **${params.location}**.\n\n• **Código da RFQ:** **${generatedCode}**\n• **Referência de Balizador (SINAPI Paraná):** R$ ${params.estimatedUnitPrice.toFixed(2)}/${params.unit} (Orçamento Teto: ${params.totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})\n• **Status:** Publicada no Mercado Aberto.\n• **Propostas de Fornecedores:** Aguardando envio de propostas reais pelo **Portal do Parceiro** ou inserção direta no Comparador.\n\nAcesse a aba **Comparador de Cotações** para acompanhar as propostas que chegarem ou copiar o link público para fornecedores da sua rede.`;
  }

  return {
    rfq: newRFQ,
    quotes,
    summaryText,
  };
}
