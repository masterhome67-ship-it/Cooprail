export interface RoutingResult {
  activeAgent: string;
  agentRoleTag: string;
  explicitSlashCommand?: string;
}

/**
 * Normaliza e classifica a mensagem do usuário para o agente correspondente.
 * Aceita radicais como: compar, cotac, pedido, compliance, orcament, demanda, rfq.
 * Agente padrão quando não houver comando nem palavra de busca: "Assistente de Suprimentos (geral)".
 */
export function routeUserMessage(params: {
  message: string;
  slashCommand?: string;
}): RoutingResult {
  const trimmedMsg = (params.message || '').trim();
  const normalizedMsg = trimmedMsg
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const explicitSlash =
    params.slashCommand && params.slashCommand.startsWith('/')
      ? params.slashCommand
      : trimmedMsg.startsWith('/')
      ? trimmedMsg.split(' ')[0]
      : undefined;

  // 1. Busca explícita ou termos inequívocos de busca de mercado
  const isBusca =
    explicitSlash === '/busca' ||
    normalizedMsg.startsWith('/busca') ||
    normalizedMsg.includes('fornecedor') ||
    normalizedMsg.includes('distribuidor') ||
    normalizedMsg.includes('onde comprar') ||
    normalizedMsg.includes('preco de') ||
    normalizedMsg.includes('precos de');

  // 2. Demandas / RFQ / Edital
  const isDemanda =
    explicitSlash === '/demandas' ||
    normalizedMsg.startsWith('/demandas') ||
    normalizedMsg.includes('demanda') ||
    normalizedMsg.includes('rfq') ||
    normalizedMsg.includes('edital');

  // 3. Comparador / Cotações / Propostas (radicais compar, cotac)
  const isCompare =
    explicitSlash === '/compare' ||
    normalizedMsg.startsWith('/compare') ||
    normalizedMsg.includes('compar') ||
    normalizedMsg.includes('cotac') ||
    normalizedMsg.includes('proposta');

  // 4. Pedidos / Ordens de Compra (radical pedido, ordem, po-123)
  const isPedido =
    explicitSlash === '/pedido' ||
    normalizedMsg.startsWith('/pedido') ||
    normalizedMsg.includes('pedido') ||
    normalizedMsg.includes('ordem') ||
    /\bpo-\d+/i.test(normalizedMsg);

  // 5. Controle & Compliance / Orçamento (radicais compliance, orcament, controle)
  const isControle =
    explicitSlash === '/controle' ||
    normalizedMsg.startsWith('/controle') ||
    normalizedMsg.includes('controle') ||
    normalizedMsg.includes('compliance') ||
    normalizedMsg.includes('orcament');

  if (explicitSlash === '/busca' || isBusca) {
    return {
      activeAgent: 'Módulo de Busca de Fornecedores & Peças',
      agentRoleTag: '/busca',
      explicitSlashCommand: explicitSlash,
    };
  }

  if (explicitSlash === '/demandas' || isDemanda) {
    return {
      activeAgent: 'Módulo de Organização de Demandas',
      agentRoleTag: '/demandas',
      explicitSlashCommand: explicitSlash,
    };
  }

  if (explicitSlash === '/compare' || isCompare) {
    return {
      activeAgent: 'Módulo de Comparação de Cotações & Propostas',
      agentRoleTag: '/compare',
      explicitSlashCommand: explicitSlash,
    };
  }

  if (explicitSlash === '/pedido' || isPedido) {
    return {
      activeAgent: 'Módulo de Pedidos & Ordens de Compra',
      agentRoleTag: '/pedido',
      explicitSlashCommand: explicitSlash,
    };
  }

  if (explicitSlash === '/controle' || isControle) {
    return {
      activeAgent: 'Módulo de Controle & Compliance',
      agentRoleTag: '/controle',
      explicitSlashCommand: explicitSlash,
    };
  }

  // Agente Geral padrão
  return {
    activeAgent: 'Assistente de Suprimentos (geral)',
    agentRoleTag: 'geral',
    explicitSlashCommand: explicitSlash,
  };
}
