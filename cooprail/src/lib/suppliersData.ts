export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  contact_name: string;
  email: string;
  phone: string;
  location: string;
  rating: number; // 0.0 a 5.0
  categories: string[]; // ex: ['Aço e Estrutural', 'Fixadores', 'Elétrica', 'Rolamentos']
  certifications: string[]; // ex: ['ISO 9001', 'CRCC Petrobras', 'Qualificação RFFSA']
  status: 'homologado' | 'em_auditoria' | 'bloqueado';
  min_order_value?: number;
  payment_terms_standard: string;
  lead_time_avg_days: number;
  is_mobilized_on_site?: boolean;
}

export const qualifiedSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Metalúrgica Ferro & Aço Nacional S.A.',
    cnpj: '45.123.890/0001-12',
    contact_name: 'Carlos Alberto Silva',
    email: 'vendas@ferroaco.com.br',
    phone: '(45) 3220-7890',
    location: 'Corredor Oeste / Canteiro Central',
    rating: 4.8,
    categories: ['Aço e Estrutural', 'Vigas', 'Perfis Metálicos', 'Usinagem Pesada', 'Solda Industrial'],
    certifications: ['ISO 9001:2015', 'Certificado ASTM A572', 'Selo ABNT NBR'],
    status: 'homologado',
    payment_terms_standard: '30/60 dias faturado',
    lead_time_avg_days: 5,
    is_mobilized_on_site: true,
  },
  {
    id: 'sup-2',
    name: 'Hidráulica & Tubulações Oeste Paraná Ltda',
    cnpj: '78.654.321/0001-45',
    contact_name: 'Marcos Vinicius Souza',
    email: 'comercial@hidraulicaoeste.com.br',
    phone: '(45) 3324-1100',
    location: 'Cascavel / PR',
    rating: 4.9,
    categories: ['Instalações Hidráulicas', 'Tubos PEAD', 'Drenagem Pluvial', 'Rede Pluvial', 'Válvulas Industriais', 'Conexões'],
    certifications: ['ISO 9001:2015', 'Laudo Técnico Falcão Bauer', 'Conformidade Sanepar'],
    status: 'homologado',
    payment_terms_standard: '28 dias líquido',
    lead_time_avg_days: 7,
    is_mobilized_on_site: false,
  },
  {
    id: 'sup-3',
    name: 'Drenagem & Saneamento Toledo Industrial S.A.',
    cnpj: '89.123.456/0001-99',
    contact_name: 'Renata Zanin',
    email: 'orcamentos@toledodrenagem.com.br',
    phone: '(45) 3277-4400',
    location: 'Toledo / PR',
    rating: 4.7,
    categories: ['Drenagem Pluvial', 'Rede Pluvial', 'Canaletas', 'Tubos de Concreto', 'Grelhas Industriais'],
    certifications: ['ABNT NBR 8890', 'ISO 9001:2015'],
    status: 'homologado',
    payment_terms_standard: '30/45 dias',
    lead_time_avg_days: 8,
    is_mobilized_on_site: false,
  },
  {
    id: 'sup-4',
    name: 'Trilhos Brasil Fixadores e Componentes Ltda',
    cnpj: '18.987.654/0001-34',
    contact_name: 'Mariana Ramos',
    email: 'comercial@trilhosbrasil.com.br',
    phone: '(19) 3298-1122',
    location: 'Campinas / SP',
    rating: 4.6,
    categories: ['Fixadores', 'Grampos Elásticos', 'Parafusos Industriais', 'Placas de Apoio'],
    certifications: ['ISO 9001:2015', 'Homologação Ferroviária CPTM/Vale'],
    status: 'homologado',
    payment_terms_standard: '28 dias líquido',
    lead_time_avg_days: 14,
    is_mobilized_on_site: false,
  },
  {
    id: 'sup-5',
    name: 'Condutores & Cabos Paulistas Eletro S.A.',
    cnpj: '03.456.789/0001-90',
    contact_name: 'Fernando Guimarães',
    email: 'orcamentos@cabospaulista.com.br',
    phone: '(11) 4004-9800',
    location: 'São Paulo / SP',
    rating: 4.9,
    categories: ['Elétrica', 'Cabos de Cobre', 'Subestações', 'Transformadores'],
    certifications: ['ISO 9001', 'ISO 14001', 'Laudo Cepel'],
    status: 'homologado',
    payment_terms_standard: '30 dias',
    lead_time_avg_days: 10,
    is_mobilized_on_site: false,
  },
  {
    id: 'sup-6',
    name: 'Rolamentos & Mancais Dinâmica Industrial',
    cnpj: '61.222.333/0001-77',
    contact_name: 'Eduardo Neves',
    email: 'engenharia@dinamicarolamentos.com.br',
    phone: '(41) 3321-4455',
    location: 'Curitiba / PR',
    rating: 4.7,
    categories: ['Rolamentos', 'Mancais', 'Elementos de Transmissão', 'Vedação'],
    certifications: ['ISO 9001:2015', 'Certificado de Origem SKF/TIMKEN'],
    status: 'homologado',
    payment_terms_standard: '30/45 dias',
    lead_time_avg_days: 12,
    is_mobilized_on_site: false,
  },
  {
    id: 'sup-7',
    name: 'Concreto & Dormentes Sul Pré-Moldados',
    cnpj: '92.444.555/0001-88',
    contact_name: 'Juliana Fagundes',
    email: 'contato@concretosul.ind.br',
    phone: '(51) 3450-8899',
    location: 'Porto Alegre / RS',
    rating: 4.5,
    categories: ['Concreto', 'Dormentes', 'Pré-Moldados', 'Lastro Ferroviário'],
    certifications: ['ABNT NBR 11725', 'ISO 9001'],
    status: 'homologado',
    payment_terms_standard: '30/60/90 dias',
    lead_time_avg_days: 20,
    is_mobilized_on_site: false,
  },
];

// Motor Assertivo de Matching: Encontra fornecedores aptos baseados nas palavras-chave, localização e escopo do RFQ
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

      // Correspondência por categorias
      supplier.categories.forEach((cat) => {
        const catWords = cat.toLowerCase().split(' ');
        const isMatched = catWords.some((word) => word.length > 2 && fullText.includes(word));
        if (isMatched) {
          matchedCategories.push(cat);
          score += 30;
        }
      });

      // Bônus se fornecedor for próximo ou in-loco
      if (supplier.is_mobilized_on_site) {
        score += 20;
        reasons.push('⚡ Empresa Mobilizada no Local (Atendimento imediato e frete zero)');
      } else if (
        fullText.includes('oeste') ||
        fullText.includes('cascavel') ||
        fullText.includes('toledo') ||
        fullText.includes('paraná')
      ) {
        if (supplier.location.includes('PR') || supplier.location.includes('Oeste')) {
          score += 25;
          reasons.push(`📍 Fornecedor Regional Próximo (${supplier.location})`);
        }
      }

      if (matchedCategories.length > 0) {
        reasons.push(`Especialidade homologada em: ${matchedCategories.join(', ')}`);
        reasons.push(`Certificações ativas: ${supplier.certifications.join(', ')}`);
        reasons.push(`Histórico de pontualidade: Rating ${supplier.rating}/5.0`);
        score += supplier.rating * 10;
      }

      return {
        supplier,
        matchScore: Math.min(100, Math.max(score, supplier.is_mobilized_on_site ? 85 : 0)),
        matchedCategories: matchedCategories.length > 0 ? matchedCategories : supplier.categories.slice(0, 2),
        reasons: reasons.length > 0 ? reasons : [`Fornecedor homologado em ${supplier.location}`],
      };
    })
    .filter((res) => res.matchScore >= 40 || res.supplier.is_mobilized_on_site)
    .sort((a, b) => b.matchScore - a.matchScore);

  // Se nenhum bateu exatamente, retorna os 3 fornecedores mais próximos e bem avaliados
  if (results.length === 0) {
    return qualifiedSuppliers.slice(0, 3).map((s) => ({
      supplier: s,
      matchScore: 80,
      matchedCategories: s.categories.slice(0, 2),
      reasons: [`Fornecedor homologado em ${s.location}`, `Rating ${s.rating}/5.0`],
    }));
  }

  return results;
}
