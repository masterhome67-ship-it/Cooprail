export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  contact_name: string;
  email: string;
  phone: string;
  rating: number; // 0.0 a 5.0
  categories: string[]; // ex: ['Aço e Estrutural', 'Fixadores', 'Elétrica', 'Rolamentos']
  certifications: string[]; // ex: ['ISO 9001', 'CRCC Petrobras', 'Qualificação RFFSA']
  status: 'homologado' | 'em_auditoria' | 'bloqueado';
  min_order_value?: number;
  payment_terms_standard: string;
  lead_time_avg_days: number;
}

export const qualifiedSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Metalúrgica Ferro & Aço Nacional S.A.',
    cnpj: '45.123.890/0001-12',
    contact_name: 'Carlos Alberto Silva',
    email: 'vendas@ferroaco.com.br',
    phone: '(11) 3456-7890',
    rating: 4.8,
    categories: ['Aço e Estrutural', 'Vigas', 'Perfis Metálicos', 'Usinagem Pesada'],
    certifications: ['ISO 9001:2015', 'Certificado ASTM A572', 'Selo ABNT NBR'],
    status: 'homologado',
    payment_terms_standard: '30/60 dias faturado',
    lead_time_avg_days: 15,
  },
  {
    id: 'sup-2',
    name: 'Trilhos Brasil Fixadores e Componentes Ltda',
    cnpj: '18.987.654/0001-34',
    contact_name: 'Mariana Ramos',
    email: 'comercial@trilhosbrasil.com.br',
    phone: '(19) 3298-1122',
    rating: 4.6,
    categories: ['Fixadores', 'Grampos Elásticos', 'Parafusos Industriais', 'Placas de Apoio'],
    certifications: ['ISO 9001:2015', 'Homologação Ferroviária CPTM/Vale'],
    status: 'homologado',
    payment_terms_standard: '28 dias líquido',
    lead_time_avg_days: 18,
  },
  {
    id: 'sup-3',
    name: 'Condutores & Cabos Paulistas Eletro S.A.',
    cnpj: '03.456.789/0001-90',
    contact_name: 'Fernando Guimarães',
    email: 'orcamentos@cabospaulista.com.br',
    phone: '(11) 4004-9800',
    rating: 4.9,
    categories: ['Elétrica', 'Cabos de Cobre', 'Subestações', 'Transformadores'],
    certifications: ['ISO 9001', 'ISO 14001', 'Laudo Cepel'],
    status: 'homologado',
    payment_terms_standard: '30 dias',
    lead_time_avg_days: 10,
  },
  {
    id: 'sup-4',
    name: 'Rolamentos & Mancais Dinâmica Industrial',
    cnpj: '61.222.333/0001-77',
    contact_name: 'Eduardo Neves',
    email: 'engenharia@dinamicarolamentos.com.br',
    phone: '(41) 3321-4455',
    rating: 4.7,
    categories: ['Rolamentos', 'Mancais', 'Elementos de Transmissão', 'Vedação'],
    certifications: ['ISO 9001:2015', 'Certificado de Origem SKF/TIMKEN'],
    status: 'homologado',
    payment_terms_standard: '30/45 dias',
    lead_time_avg_days: 12,
  },
  {
    id: 'sup-5',
    name: 'Concreto & Dormentes Sul Pré-Moldados',
    cnpj: '92.444.555/0001-88',
    contact_name: 'Juliana Fagundes',
    email: 'contato@concretosul.ind.br',
    phone: '(51) 3450-8899',
    rating: 4.5,
    categories: ['Concreto', 'Dormentes', 'Pré-Moldados', 'Lastro Ferroviário'],
    certifications: ['ABNT NBR 11725', 'ISO 9001'],
    status: 'homologado',
    payment_terms_standard: '30/60/90 dias',
    lead_time_avg_days: 25,
  },
];

// Motor Assertivo de Matching: Encontra fornecedores aptos baseados nas palavras-chave e escopo do RFQ
export function matchSuppliersForRFQ(rfqScope: string, itemsList: string[]): {
  supplier: Supplier;
  matchScore: number;
  matchedCategories: string[];
  reasons: string[];
}[] {
  const fullText = (rfqScope + ' ' + itemsList.join(' ')).toLowerCase();

  const results = qualifiedSuppliers
    .filter((sup) => sup.status === 'homologado')
    .map((supplier) => {
      let matchedCategories: string[] = [];
      let reasons: string[] = [];
      let score = 0;

      supplier.categories.forEach((cat) => {
        const catWords = cat.toLowerCase().split(' ');
        const isMatched = catWords.some((word) => word.length > 3 && fullText.includes(word));
        if (isMatched) {
          matchedCategories.push(cat);
          score += 25;
        }
      });

      if (matchedCategories.length > 0) {
        reasons.push(`Especialidade homologada em: ${matchedCategories.join(', ')}`);
        reasons.push(`Certificações ativas: ${supplier.certifications.join(', ')}`);
        reasons.push(`Histórico de pontualidade: Rating ${supplier.rating}/5.0`);
        score += supplier.rating * 10;
      }

      return {
        supplier,
        matchScore: Math.min(100, score),
        matchedCategories,
        reasons,
      };
    })
    .filter((res) => res.matchedCategories.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return results;
}
