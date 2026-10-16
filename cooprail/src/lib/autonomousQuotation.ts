import { RFQ, Quote, RFQItem } from './mockData';
import { savePublishedRFQ, PublishedRFQ } from './userWorkspace';

export interface QuotationParsedItem {
  id: string;
  name: string;
  specification: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  totalBudget: number;
}

export interface QuotationIntentParams {
  material: string;
  quantity: number;
  unit: string;
  location: string;
  estimatedUnitPrice: number;
  totalBudget: number;
  items?: QuotationParsedItem[];
}

interface MaterialCatalogEntry {
  regex: RegExp;
  name: string;
  defaultUnit: string;
  unitPrice: number;
  spec: string;
}

const MATERIAL_CATALOG: MaterialCatalogEntry[] = [
  {
    regex: /\b(cal\s+hidratada|cal\s+virgem|cal\s+para\s+pintura|cal)\b/i,
    name: 'Cal Hidratada CH-I para Construção Civil',
    defaultUnit: 'sacos (20kg)',
    unitPrice: 18.5,
    spec: 'Cal hidratada tipo CH-I conforme NBR 7175 para argamassa de assentamento e revestimento.',
  },
  {
    regex: /\b(cimento\s+portland|cimento|cp\s?ii|cp\s?iv|portland)\b/i,
    name: 'Cimento Portland CP II-Z ou CP IV',
    defaultUnit: 'sacos (50kg)',
    unitPrice: 34.0,
    spec: 'Cimento Portland em conformidade com ABNT NBR 16697, sacaria intacta de 50kg.',
  },
  {
    regex: /\b(pedra\s+brita|brita\s+n[ºo°]?\s*[123]|brita\s+graduada|brita)\b/i,
    name: 'Pedra Brita Graduada Nº 1/2/3',
    defaultUnit: 'm³',
    unitPrice: 95.0,
    spec: 'Agregado graúdo britado de rocha basáltica sã, isento de matérias orgânicas conforme NBR 7211.',
  },
  {
    regex: /\b(madeira\s+serrada|sarrafos?|t[áa]buas?|dormentes?|madeiramento|madeira)\b/i,
    name: 'Madeira Serrada / Sarrafos de Pinus Tratado',
    defaultUnit: 'metros',
    unitPrice: 28.0,
    spec: 'Madeira beneficiada/serrada com tratamento autoclave para escoramento e fôrmas industriais.',
  },
  {
    regex: /\b(areia\s+lavada|areia\s+m[ée]dia|areia\s+grossa|areia)\b/i,
    name: 'Areia Média Lavada para Construção Civil',
    defaultUnit: 'm³',
    unitPrice: 110.0,
    spec: 'Areia natural quartzosa lavada, granulometria média para argamassa e concreto (NBR 7211).',
  },
  {
    regex: /\b(tubo\s+pead|tubula[çc][ãa]o\s+pead|pead|tubo\s+corrugado)\b/i,
    name: 'Tubulação Corrugada PEAD DN 1.000mm',
    defaultUnit: 'metros',
    unitPrice: 420.0,
    spec: 'Tubos PEAD perfil corrugado DN 1000mm para drenagem pluvial e saneamento conforme NBR 8890.',
  },
  {
    regex: /\b(viga\s+estrutural|viga\s+de\s+a[çc]o|vigas?|perfil\s+w|perfil\s+i|trilhos?)\b/i,
    name: 'Viga Estrutural de Aço ASTM A572',
    defaultUnit: 'barras 12m',
    unitPrice: 850.0,
    spec: 'Perfil metálico I/W laminado de alta resistência mecânica para estruturas industriais e pontes.',
  },
  {
    regex: /\b(barra\s+de\s+a[çc]o|a[çc]o\s+ca-?50|a[çc]o\s+ca-?60|ferragem|a[çc]o|aco|ferro)\b/i,
    name: 'Barra de Aço CA-50 12mm (Barra 12m)',
    defaultUnit: 'barras 12m',
    unitPrice: 72.0,
    spec: 'Aço destinado a armaduras de concreto armado conforme norma ABNT NBR 7480.',
  },
  {
    regex: /\b(concreto\s+usinado|concreto|fck)\b/i,
    name: 'Concreto Usinado Fck 25 MPa',
    defaultUnit: 'm³',
    unitPrice: 430.0,
    spec: 'Concreto dosado em central com brita 1 e abatimento 10±2cm para fundações e estruturas.',
  },
  {
    regex: /\b(tijolos?|blocos?\s+de\s+concreto|bloco\s+estrutural)\b/i,
    name: 'Bloco Estrutural de Concreto 14x19x39cm',
    defaultUnit: 'unidades',
    unitPrice: 4.8,
    spec: 'Blocos vazados de concreto simples para alvenaria estrutural conforme NBR 6136.',
  },
];

export function detectQuotationIntent(message: string): boolean {
  const lower = (message || '').toLowerCase().trim();

  // 1. Comandos analíticos/de consulta nunca devem abrir RFQ autônoma no mercado
  if (/^\s*\/(compare|controle|pedido|status|relatorio|ajuda)\b/i.test(lower)) {
    return false;
  }

  // 2. Palavras de intenção explícita de compra ou cotação
  const triggerKeywords = [
    'cotar',
    'cotação',
    'cotacao',
    'orçar',
    'orçamento',
    'orcamento',
    'comprar',
    'preciso de',
    'solicito cotação',
    'solicitar cotação',
    'abrir rfq',
    'nova rfq',
    'criar rfq',
    '/demandas',
  ];

  // Regex estrita de materiais com word-boundaries (evita que 'sacos' dispare 'aco')
  const materialRegex =
    /\b(cal|cimento|pead|tubo|tubos|viga|vigas|areia|brita|pedra brita|madeira|sarrafo|sarrafos|tábua|tabuas|tijolo|tijolos|concreto|ferragem|ca-?50|ca-?60)\b/i;

  const hasTrigger = triggerKeywords.some((k) => lower.includes(k));
  const hasMaterial = materialRegex.test(lower);

  // Ex: "50 sacos de cal em Umuarama" ou "preciso de 50 sacos de cimento"
  const hasQuantityAndMaterial =
    /\d+/.test(lower) && hasMaterial && (lower.includes(' de ') || lower.includes('metro') || lower.includes('saco') || lower.includes('m³') || lower.includes('ton'));

  return hasTrigger && (hasMaterial || /\d+/.test(lower)) || hasQuantityAndMaterial;
}

export function parseQuotationParams(message: string): QuotationIntentParams {
  const text = (message || '').trim();
  const lower = text.toLowerCase();

  // 1. Extrai Localidade / Cidade
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

  // 2. Extrai múltiplos itens se separados por '/', ',', ';' ou ' e '
  const cleanedText = text
    .replace(/^\s*\/(demandas|busca|compare|controle|pedido)\b/gi, '')
    .replace(/cotar|cotação|cotacao|orçar|orçamento|comprar|preciso de/gi, '')
    .trim();

  // Divide potenciais itens
  const segments = cleanedText.split(/[/,;\n]|(?:\s+e\s+(?=\d+))/i).map((s) => s.trim()).filter((s) => s.length > 2);

  const parsedItems: QuotationParsedItem[] = [];

  for (const seg of segments) {
    const segLower = seg.toLowerCase();

    // Extrai quantidade do segmento
    let segQty = 50;
    const numMatch = segLower.match(/(\d+)/);
    if (numMatch) {
      segQty = parseInt(numMatch[1], 10);
    }

    // Extrai unidade do segmento
    let segUnit = '';
    const unitMatch = segLower.match(
      /(sacos?|sc|unidades?|un|peças?|pç|metros?|m³|m2|m|toneladas?|ton|kg|lts?|litros?)/i
    );
    if (unitMatch) {
      const raw = unitMatch[1].toLowerCase();
      if (raw.startsWith('saco') || raw === 'sc') segUnit = 'sacos';
      else if (raw === 'm³' || raw.startsWith('metro cub')) segUnit = 'm³';
      else if (raw.startsWith('metro') || raw === 'm') segUnit = 'metros';
      else if (raw.startsWith('peça') || raw === 'pç') segUnit = 'peças';
      else if (raw.startsWith('ton')) segUnit = 'toneladas';
      else segUnit = raw;
    }

    // Identifica catálogo
    let matchedCatalog: MaterialCatalogEntry | null = null;
    for (const cat of MATERIAL_CATALOG) {
      if (cat.regex.test(segLower)) {
        matchedCatalog = cat;
        break;
      }
    }

    if (matchedCatalog) {
      const finalUnit = segUnit
        ? segUnit === 'sacos' && matchedCatalog.defaultUnit.includes('20kg')
          ? 'sacos (20kg)'
          : segUnit === 'sacos' && matchedCatalog.defaultUnit.includes('50kg')
          ? 'sacos (50kg)'
          : segUnit
        : matchedCatalog.defaultUnit;

      const total = Math.round(segQty * matchedCatalog.unitPrice);

      parsedItems.push({
        id: `item-${Date.now()}-${parsedItems.length}`,
        name: matchedCatalog.name,
        specification: matchedCatalog.spec,
        quantity: segQty,
        unit: finalUnit,
        estimatedUnitPrice: matchedCatalog.unitPrice,
        totalBudget: total,
      });
    }
  }

  // Se múltiplos itens foram encontrados
  if (parsedItems.length > 0) {
    const totalBudget = parsedItems.reduce((acc, it) => acc + it.totalBudget, 0);
    const primaryItem = parsedItems[0];

    const summaryMaterial =
      parsedItems.length === 1
        ? primaryItem.name
        : parsedItems.map((p) => `${p.quantity} ${p.unit} de ${p.name.split(' ')[0]}`).join(', ');

    return {
      material: summaryMaterial,
      quantity: primaryItem.quantity,
      unit: primaryItem.unit,
      location,
      estimatedUnitPrice: primaryItem.estimatedUnitPrice,
      totalBudget,
      items: parsedItems,
    };
  }

  // Fallback caso não tenha conseguido separar em múltiplos itens
  let defaultCatalog = MATERIAL_CATALOG[0]; // Cal Hidratada como default seguro se cal for citada
  if (lower.includes('cimento')) defaultCatalog = MATERIAL_CATALOG[1];
  else if (lower.includes('brita')) defaultCatalog = MATERIAL_CATALOG[2];
  else if (lower.includes('madeira')) defaultCatalog = MATERIAL_CATALOG[3];
  else if (lower.includes('areia')) defaultCatalog = MATERIAL_CATALOG[4];
  else if (lower.includes('pead') || lower.includes('tubo')) defaultCatalog = MATERIAL_CATALOG[5];
  else if (/\b(viga|vigas|trilho)\b/i.test(lower)) defaultCatalog = MATERIAL_CATALOG[6];
  else if (/\b(aço|aco|ferragem)\b/i.test(lower)) defaultCatalog = MATERIAL_CATALOG[7];

  const defaultQty = 50;
  const singleTotal = Math.round(defaultQty * defaultCatalog.unitPrice);

  return {
    material: defaultCatalog.name,
    quantity: defaultQty,
    unit: defaultCatalog.defaultUnit,
    location,
    estimatedUnitPrice: defaultCatalog.unitPrice,
    totalBudget: singleTotal,
    items: [
      {
        id: `item-${Date.now()}-0`,
        name: defaultCatalog.name,
        specification: defaultCatalog.spec,
        quantity: defaultQty,
        unit: defaultCatalog.defaultUnit,
        estimatedUnitPrice: defaultCatalog.unitPrice,
        totalBudget: singleTotal,
      },
    ],
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
    console.warn('Busca de mercado via API demorou ou falhou, mantendo RFQ aberta sem propostas sintéticas.');
  }

  // Cria itens técnicos da RFQ (suporta múltiplos itens)
  const rfqItems: RFQItem[] =
    params.items && params.items.length > 0
      ? params.items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          item_name: it.name,
          specification: it.specification,
          quantity: it.quantity,
          unit: it.unit,
          target_unit_price: it.estimatedUnitPrice,
        }))
      : [
          {
            id: `item-${Date.now()}-0`,
            item_name: params.material,
            specification: `Insumos em conformidade técnica com normas ABNT aplicáveis, sacaria e entrega no canteiro de ${params.location}.`,
            quantity: params.quantity,
            unit: params.unit,
            target_unit_price: params.estimatedUnitPrice,
          },
        ];

  const newRFQ: PublishedRFQ = {
    id: `rfq-auto-${Date.now()}`,
    code: generatedCode,
    title:
      params.items && params.items.length > 1
        ? `Aquisição de Lote de Insumos (${params.items.length} itens) — ${params.location}`
        : `Aquisição de ${params.quantity} ${params.unit} de ${params.material} (${params.location})`,
    scope_description: `Cotação autônoma aberta pelo Agente de Demandas para fornecimento e descarga no canteiro de ${params.location}.`,
    status: 'published',
    deadline: 'Em 24 horas',
    target_delivery_date: 'Até 2 dias úteis',
    estimated_budget: params.totalBudget,
    items: rfqItems,
    quotes: quotes,
    location: params.location,
    hasCopacolDrawings: false,
  };

  // Salva no barramento compartilhado para ficar acessível ao Portal do Parceiro
  savePublishedRFQ(newRFQ);

  let summaryText = '';
  if (quotes.length > 0) {
    const bestQuote = quotes[0];
    const totalFormatted = bestQuote.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    summaryText = `🎯 **Cotação Autônoma Realizada!**\n\nIdentifiquei a necessidade para entrega em **${params.location}**.\n\nO motor de pesquisa localizou **${quotes.length} propostas reais de fornecedores**:\n\n• 🏆 **1º Menor Preço:** **${bestQuote.supplier_name}** — **${totalFormatted}** • Prazo: **${bestQuote.delivery_lead_time_days} dia(s)**\n\nA requisição **${generatedCode}** está sincronizada no **Comparador de Cotações**.`;
  } else {
    const itemsDescription =
      params.items && params.items.length > 1
        ? `Lote com **${params.items.length} itens**:\n` +
          params.items
            .map(
              (it, i) =>
                `  • **Item ${i + 1}:** ${it.quantity} ${it.unit} de ${it.name} (Balizador SINAPI: R$ ${it.estimatedUnitPrice.toFixed(2)}/${it.unit} — Subtotal: ${it.totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`
            )
            .join('\n')
        : `**${params.quantity} ${params.unit} de ${params.material}**`;

    summaryText = `🎯 **Requisição de Compra Criada e Aberta ao Mercado!**\n\nIdentifiquei a necessidade de ${itemsDescription} para entrega em **${params.location}**.\n\n• **Código da RFQ:** **${generatedCode}**\n• **Orçamento Teto Balizador (SINAPI Paraná):** ${params.totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n• **Status:** Publicada no Mercado Aberto.\n• **Propostas de Fornecedores:** Aguardando envio de propostas reais pelo **Portal do Parceiro** ou inserção direta no Comparador.\n\nAcesse a aba **Comparador de Cotações** para acompanhar as propostas recebidas ou copiar o link público para fornecedores da sua rede.`;
  }

  return {
    rfq: newRFQ,
    quotes,
    summaryText,
  };
}
