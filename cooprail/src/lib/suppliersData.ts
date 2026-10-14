export interface Supplier {
  id: string;
  name: string;
  trade_name?: string;
  cnpj: string;
  clean_cnpj?: string;
  contact_name: string;
  email: string;
  phone: string;
  location: string;
  address?: string;
  rating: number; // 0.0 a 5.0
  categories: string[];
  certifications: string[];
  status: 'homologado' | 'em_auditoria' | 'bloqueado';
  status_receita?: string;
  cnae_principal?: string;
  capital_social?: number;
  opening_date?: string;
  min_order_value?: number;
  payment_terms_standard: string;
  lead_time_avg_days: number;
  is_mobilized_on_site?: boolean;
}

// Lista limpa por padrão (sem fornecedores mockados)
export const qualifiedSuppliers: Supplier[] = [];

const STORAGE_KEY = 'cooprail_custom_suppliers_v2';

// Carrega fornecedores reais salvos pelo usuário no workspace
export function getSavedSuppliers(): Supplier[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Salva fornecedor homologado
export function saveCustomSupplier(supplier: Supplier): Supplier[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedSuppliers();
    const existingIdx = current.findIndex(
      (s) => s.cnpj === supplier.cnpj || s.id === supplier.id
    );
    let updated: Supplier[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = supplier;
    } else {
      updated = [supplier, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// Remove fornecedor
export function removeCustomSupplier(supplierId: string): Supplier[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedSuppliers();
    const updated = current.filter((s) => s.id !== supplierId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// Motor de busca inteligente de fornecedores para RFQs
export function findEligibleSuppliers(
  rfqScope: string,
  itemsList: string[],
  customSuppliersList?: Supplier[]
): {
  supplier: Supplier;
  matchScore: number;
  matchedCategories: string[];
  reasons: string[];
}[] {
  const allSuppliers = customSuppliersList || getSavedSuppliers();
  const fullText = (rfqScope + ' ' + itemsList.join(' ')).toLowerCase();

  const results = allSuppliers
    .filter((sup) => sup.status === 'homologado')
    .map((supplier) => {
      let matchedCategories: string[] = [];
      let reasons: string[] = [];
      let score = 0;

      // Correspondência por categorias ou CNAE
      (supplier.categories || []).forEach((cat) => {
        const catWords = cat.toLowerCase().split(' ');
        const isMatched = catWords.some((word) => word.length > 2 && fullText.includes(word));
        if (isMatched) {
          matchedCategories.push(cat);
          score += 30;
        }
      });

      if (supplier.cnae_principal && fullText.includes(supplier.cnae_principal.toLowerCase().slice(0, 8))) {
        score += 30;
        reasons.push(`Atividade Econômica CNAE: ${supplier.cnae_principal}`);
      }

      if (matchedCategories.length > 0) {
        reasons.push(`Especialidade confirmada: ${matchedCategories.join(', ')}`);
        reasons.push(`Situação Receita Federal: ${supplier.status_receita || 'ATIVA'}`);
        score += (supplier.rating || 5) * 10;
      }

      return {
        supplier,
        matchScore: Math.min(100, Math.max(score, 60)),
        matchedCategories: matchedCategories.length > 0 ? matchedCategories : (supplier.categories || []).slice(0, 2),
        reasons: reasons.length > 0 ? reasons : [`Fornecedor cadastrado (${supplier.location})`],
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

export const matchSuppliersForRFQ = findEligibleSuppliers;
