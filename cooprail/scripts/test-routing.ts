import { routeUserMessage } from '../src/lib/chatRouter';

interface TestCase {
  phrase: string;
  expectedAgent: string;
  expectedTag: string;
}

const testCases: TestCase[] = [
  {
    phrase: 'O que são os materiais elétricos?',
    expectedAgent: 'Assistente de Suprimentos (geral)',
    expectedTag: 'geral',
  },
  {
    phrase: 'Ativar agente de comparação de preços',
    expectedAgent: 'Módulo de Comparação de Cotações & Propostas',
    expectedTag: '/compare',
  },
  {
    phrase: 'Quais são os tipos de materiais que vamos utilizar?',
    expectedAgent: 'Assistente de Suprimentos (geral)',
    expectedTag: 'geral',
  },
  {
    phrase: '/busca eletroduto 3/4 em Cascavel',
    expectedAgent: 'Módulo de Busca de Fornecedores & Peças',
    expectedTag: '/busca',
  },
  {
    phrase: 'preciso aprovar o pedido PO-123',
    expectedAgent: 'Módulo de Pedidos & Ordens de Compra',
    expectedTag: '/pedido',
  },
  {
    phrase: 'verificar orçamento do centro de custo',
    expectedAgent: 'Módulo de Controle & Compliance',
    expectedTag: '/controle',
  },
];

let failed = 0;

console.log('🧪 Iniciando testes de roteamento dos agentes Cooprail...\n');

testCases.forEach((tc, idx) => {
  const result = routeUserMessage({ message: tc.phrase });
  const agentOk = result.activeAgent === tc.expectedAgent;
  const tagOk = result.agentRoleTag === tc.expectedTag;

  if (agentOk && tagOk) {
    console.log(`✅ [${idx + 1}/${testCases.length}] "${tc.phrase}"`);
    console.log(`   -> Agente: ${result.activeAgent} (${result.agentRoleTag})\n`);
  } else {
    failed++;
    console.error(`❌ [${idx + 1}/${testCases.length}] "${tc.phrase}"`);
    console.error(`   Esperado: ${tc.expectedAgent} (${tc.expectedTag})`);
    console.error(`   Recebido: ${result.activeAgent} (${result.agentRoleTag})\n`);
  }
});

if (failed === 0) {
  console.log('🎉 Todos os testes de roteamento passaram com 100% de sucesso!');
  process.exit(0);
} else {
  console.error(`💥 ${failed} teste(s) falharam.`);
  process.exit(1);
}
