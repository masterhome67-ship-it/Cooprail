import { Organization, UserProfile, Task, RFQ, Sector, ChatMessage, Quote } from './mockData';
import { PurchaseOrderRecord } from '@/components/SolanaSettlementModal';
import { initialOrganization } from './mockData';

export interface UserWorkspaceData {
  organization: Organization;
  user: UserProfile;
  tasks: Task[];
  rfqs: RFQ[];
  orders: PurchaseOrderRecord[];
  sectors: Sector[];
  chatMessages: ChatMessage[];
  isNewUser: boolean;
}

export interface RegisteredAccount extends UserProfile {
  company_name: string;
  password?: string;
}

// Contas registradas vazias por padrão (sem dados mockados)
export const defaultAccounts: RegisteredAccount[] = [];

const USERS_STORAGE_KEY = 'cooprail_registered_accounts_v2';
const CURRENT_SESSION_KEY = 'cooprail_active_session_user_id_v2';

// Obter todas as contas registradas
export function getRegisteredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Registrar nova conta de usuário (ambiente do zero)
export function registerNewAccount(account: {
  full_name: string;
  email: string;
  company_name: string;
  role: string;
  avatar_url?: string;
  password?: string;
}): RegisteredAccount {
  const accounts = getRegisteredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === account.email.toLowerCase());
  if (existing) {
    return existing;
  }

  const newAccount: RegisteredAccount = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    email: account.email.trim(),
    full_name: account.full_name.trim(),
    company_name: account.company_name.trim() || 'Minha Empresa Global',
    role: account.role.trim() || 'Gestor de Suprimentos',
    avatar_url: account.avatar_url || '',
    preferred_language: 'Português (BR)',
    password: account.password,
  };

  const updated = [...accounts, newAccount];
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
  }

  // Inicializa workspace vazio e isolado para o novo usuário
  initializeCleanWorkspace(newAccount);

  return newAccount;
}

// Obter chave de armazenamento isolada por usuário
function getWorkspaceStorageKey(userId: string): string {
  return `cooprail_workspace_tenant_${userId}`;
}

export function getHelpAgentInitialMessage(): ChatMessage {
  return {
    id: `msg-help-init`,
    sender_role: 'assistant',
    content: `Sou o seu Assistente Operacional de Suprimentos. Estou aqui para auxiliar você na navegação e nos fluxos de compras industriais da plataforma.

Você pode me fazer perguntas diretas ou utilizar os comandos especializados:
• /busca [termo ou cidade] — Módulo de Busca: pesquisa materiais, fornecedores homologados e empresas mobilizadas no canteiro.
• /controle — Módulo de Controle & Compliance: audita status orçamentário, centros de custo e conformidade da esteira de compras.
• /pedido — Módulo de Pedidos: instruções para emissão de ordens formais (PO) e liquidação via Smart Escrow on-chain.
• /demandas — Módulo de Planejamento de Demandas: ajuda a consolidar necessidades técnicas dos setores para novas RFQs.`,
    timestamp: 'Agora',
  };
}

// Inicializa workspace 100% limpo para usuário novo

function initializeCleanWorkspace(user: RegisteredAccount): UserWorkspaceData {
  const cleanOrg: Organization = {
    id: `org-${user.id}`,
    name: user.company_name,
    slug: user.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    brand_primary_color: '#0284c7',
    rfq_brand_settings: {
      show_logo: true,
      company_title: user.company_name,
      footer_note: 'Termos de confidencialidade padrão aplicados.',
    },
  };

  const initialWelcomeMessage = getHelpAgentInitialMessage();

  const defaultUmuRFQ = DEFAULT_PUBLISHED_RFQS[0];
  const initialTask: Task = {
    id: `task-rfq-init-umu`,
    title: `Cotação Ativa: Propostas para ${defaultUmuRFQ.code}`,
    description: `Requisição de compra aberta para 50 sacos de cimento em Umuarama/PR. Envie o link do Portal do Parceiro aos fornecedores ou avalie cotações de mercado.`,
    status: 'needs_you',
    priority: 'high',
    category: 'quote_decision',
    due_date: defaultUmuRFQ.deadline,
    badge_text: 'Cotação em Andamento',
  };

  const cleanData: UserWorkspaceData = {
    organization: cleanOrg,
    user: user,
    tasks: [initialTask],
    rfqs: [defaultUmuRFQ],
    orders: [],
    sectors: [],
    chatMessages: [initialWelcomeMessage],
    isNewUser: false,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(getWorkspaceStorageKey(user.id), JSON.stringify(cleanData));
  }

  return cleanData;
}

// Carregar workspace isolado do usuário
export function loadUserWorkspace(user: RegisteredAccount): UserWorkspaceData {
  if (typeof window === 'undefined') {
    return {
      organization: { ...initialOrganization, name: user.company_name },
      user,
      tasks: [],
      rfqs: [DEFAULT_PUBLISHED_RFQS[0]],
      orders: [],
      sectors: [],
      chatMessages: [getHelpAgentInitialMessage()],
      isNewUser: false,
    };
  }

  const key = getWorkspaceStorageKey(user.id);
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const parsed: UserWorkspaceData = JSON.parse(raw);
      // Se não tiver a RFQ de Umuarama no workspace, insere com os fornecedores
      if (!parsed.rfqs || parsed.rfqs.length === 0) {
        parsed.rfqs = [DEFAULT_PUBLISHED_RFQS[0]];
        localStorage.setItem(key, JSON.stringify(parsed));
      } else {
        // Limpa quaisquer propostas sintéticas/mockadas que tenham ficado salvas em RFQs anteriores
        let changed = false;
        parsed.rfqs.forEach((r) => {
          if (r.quotes && r.quotes.length > 0) {
            const cleaned = r.quotes.filter(
              (q) =>
                !q.id.startsWith('quote-umu-') &&
                !q.id.startsWith('quote-auto-') &&
                !q.id.startsWith('quote-init-') &&
                !q.supplier_name.includes('Depósito & Distribuidora Umuarama Materiais') &&
                !q.supplier_name.includes('Votoran / Constrular Paraná') &&
                !q.supplier_name.includes('Cimento Itambé / Rede Oeste') &&
                !q.supplier_name.includes('Distribuidora Regional Líder') &&
                !q.supplier_name.includes('Comercial & Insumos Industriais Sul') &&
                !q.supplier_name.includes('Materiais & Logística Canteiro Express')
            );
            if (cleaned.length !== r.quotes.length) {
              r.quotes = cleaned;
              changed = true;
            }
          }
        });
        if (changed) {
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      }

      // Se a primeira mensagem ainda for a de boas-vindas antiga, atualiza para o agente de ajuda com comandos
      if (parsed.chatMessages && parsed.chatMessages.length > 0) {
        if (
          parsed.chatMessages[0].content.includes('Bem-vindo ao ambiente corporativo exclusivo') ||
          parsed.chatMessages[0].content.includes('Este workspace foi criado do zero')
        ) {
          parsed.chatMessages[0] = getHelpAgentInitialMessage();
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      } else {
        parsed.chatMessages = [getHelpAgentInitialMessage()];
        localStorage.setItem(key, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.error('Erro ao ler workspace:', e);
    }
  }

  // Sempre inicializa workspace limpo do zero para qualquer usuário
  return initializeCleanWorkspace(user);
}

export interface PublishedRFQ extends RFQ {
  location?: string;
  hasCopacolDrawings?: boolean;
}

export const DEFAULT_UMU_QUOTES: Quote[] = [];

export const DEFAULT_PUBLISHED_RFQS: PublishedRFQ[] = [
  {
    id: 'rfq-umu-cimento-01',
    code: 'RFQ-2026-UMU-01',
    title: 'Aquisição de 50 Sacos de Cimento CP II-Z / CP IV (Umuarama - PR)',
    scope_description:
      'Fornecimento imediato com frete incluso e descarga paletizada de 50 sacos de 50kg de Cimento Portland para manutenção civil e drenagem no canteiro regional de Umuarama - PR. Fornecimento com nota fiscal e laudo ABNT NBR 16697.',
    status: 'published',
    deadline: 'Em 24 horas',
    target_delivery_date: 'Em até 2 dias úteis',
    estimated_budget: 1750,
    items: [
      {
        id: 'umu-1',
        item_name: 'Cimento Portland CP II-Z ou CP IV (Saco 50kg)',
        specification:
          'Em conformidade com ABNT NBR 16697, marca de primeira linha homologada (Votoran, Itambé ou equivalente técnico), sacaria intacta sem umidade.',
        quantity: 50,
        unit: 'sacos (50kg)',
        target_unit_price: 34.0,
      },
      {
        id: 'umu-2',
        item_name: 'Frete e Descarga no Canteiro de Obras (Umuarama/PR)',
        specification:
          'Entrega CIF no perímetro urbano de Umuarama - PR, com descarga paletizada ou manual direta no depósito de obra.',
        quantity: 1,
        unit: 'frete/descarga',
        target_unit_price: 50.0,
      },
    ],
    quotes: DEFAULT_UMU_QUOTES,
    location: 'Umuarama - PR',
    hasCopacolDrawings: false,
  },
  {
    id: 'rfq-copacol-01',
    code: 'RFQ-2026-COPACOL-01',
    title:
      'Substituição Parcial de Tubulação da Rede de Águas Pluviais da Indústria de Cafelândia - PR',
    scope_description:
      'Contratação de empresa de engenharia para execução de valas, caixas de inspeção estruturadas, assentamento de 740m de tubos PEAD DN 1.000mm e canal de descida 3x3m na Unidade Industrial da Copacol em Cafelândia/PR.',
    status: 'published',
    deadline: 'Em 48 horas',
    target_delivery_date: 'Conclusão em 45 dias',
    estimated_budget: 185000,
    items: [
      {
        id: 'cop-1',
        item_name: 'Escavação de Vala para Drenagem',
        specification:
          '370m lineares, 1,5m prof. x 2,5m larg. Fornecido pela Contratada.',
        quantity: 370,
        unit: 'm lineares',
        target_unit_price: 95.0,
      },
      {
        id: 'cop-2',
        item_name: 'Execução de 05 Caixas de Inspeção Estruturadas',
        specification:
          '2,50m x 1,50m x 2,00m prof., bloco dissipador em concreto 70cm sobre estaca armada.',
        quantity: 5,
        unit: 'unidades',
        target_unit_price: 11000.0,
      },
      {
        id: 'cop-3',
        item_name: 'Locação e Assentamento de Tubos PEAD DN 1000mm',
        specification:
          '740m lineares. Material PEAD fornecido pela Copacol (Contratante). Cotação de mão de obra e maquinário.',
        quantity: 740,
        unit: 'm lineares',
        target_unit_price: 65.0,
      },
      {
        id: 'cop-4',
        item_name: 'Reaterro de Vala e Regularização do Solo',
        specification:
          '370 metros de extensão com compactação mecânica em camadas sucessivas.',
        quantity: 1,
        unit: 'serviço global',
        target_unit_price: 28000.0,
      },
      {
        id: 'cop-5',
        item_name: 'Execução de Canal de Descida Revestido em Concreto',
        specification:
          'Canal 3,00m x 3,00m em concreto armado 10cm com malha até corpo receptor.',
        quantity: 1,
        unit: 'estrutura',
        target_unit_price: 38000.0,
      },
    ],
    quotes: [],
    location: 'Cafelândia - PR (Unidade Industrial Copacol)',
    hasCopacolDrawings: true,
  },
];

const SHARED_RFQS_KEY = 'cooprail_shared_rfqs_v1';

export function savePublishedRFQ(rfq: RFQ | PublishedRFQ): void {
  if (typeof window === 'undefined') return;
  try {
    const rfqs = getAllPublishedRFQs();
    const idx = rfqs.findIndex((r) => r.code === rfq.code || r.id === rfq.id);
    if (idx >= 0) {
      rfqs[idx] = { ...rfqs[idx], ...rfq };
    } else {
      rfqs.unshift(rfq as PublishedRFQ);
    }
    localStorage.setItem(SHARED_RFQS_KEY, JSON.stringify(rfqs));
  } catch (e) {
    console.error('Erro ao salvar RFQ compartilhada:', e);
  }
}

export function getAllPublishedRFQs(): PublishedRFQ[] {
  if (typeof window === 'undefined') return DEFAULT_PUBLISHED_RFQS;
  try {
    const raw = localStorage.getItem(SHARED_RFQS_KEY);
    const shared: PublishedRFQ[] = raw ? JSON.parse(raw) : [];

    const tenantRfqs: PublishedRFQ[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cooprail_workspace_tenant_')) {
        try {
          const val = localStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed.rfqs)) {
              tenantRfqs.push(...parsed.rfqs);
            }
          }
        } catch {}
      }
    }

    const map = new Map<string, PublishedRFQ>();
    DEFAULT_PUBLISHED_RFQS.forEach((d) => map.set(d.code, d));
    tenantRfqs.forEach((t) => {
      if (t.code) map.set(t.code, { ...map.get(t.code), ...t });
    });
    shared.forEach((s) => {
      if (s.code) map.set(s.code, { ...map.get(s.code), ...s });
    });

    return Array.from(map.values());
  } catch {
    return DEFAULT_PUBLISHED_RFQS;
  }
}

export function getPublishedRFQByCode(code?: string | null): PublishedRFQ {
  const all = getAllPublishedRFQs();
  if (!code) {
    const umu = all.find((r) => r.code.includes('UMU') || r.title.toLowerCase().includes('cimento'));
    return umu || all[0] || DEFAULT_PUBLISHED_RFQS[0];
  }

  const clean = code.trim().toLowerCase();
  const direct = all.find((r) => r.code.toLowerCase() === clean);
  if (direct) return direct;

  if (clean.includes('umu') || clean.includes('cimento')) {
    const umuMatch = all.find(
      (r) => r.code.includes('UMU') || r.title.toLowerCase().includes('cimento')
    );
    if (umuMatch) return umuMatch;
  }
  if (clean.includes('copacol') || clean.includes('cafel')) {
    const copMatch = all.find((r) => r.code.includes('COPACOL'));
    if (copMatch) return copMatch;
  }

  return all[0] || DEFAULT_PUBLISHED_RFQS[0];
}

// Salvar workspace isolado do usuário
export function saveUserWorkspace(userId: string, data: UserWorkspaceData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getWorkspaceStorageKey(userId), JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar workspace do usuário:', e);
  }
}

export function clearAllWorkspaceData(userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.removeItem(getWorkspaceStorageKey(userId));
    }
    localStorage.removeItem('cooprail_partner_quotes');
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('cooprail_workspace_tenant_') || k === 'cooprail_partner_quotes')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Erro ao limpar dados do workspace:', e);
  }
}

export function getActiveSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

export function setActiveSessionUserId(userId: string | null): void {
  if (typeof window === 'undefined') return;
  if (userId) {
    localStorage.setItem(CURRENT_SESSION_KEY, userId);
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

// Máscara e conversão monetária em padrão brasileiro (R$ 1.234,56)
export function formatCurrencyBRLInput(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '';
  const number = Number(digits) / 100;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function parseCurrencyBRL(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = val.replace(/[^\d.,]/g, '').trim();
  if (!clean) return 0;

  if (clean.includes('.') && clean.includes(',')) {
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
  }
  if (clean.includes(',')) {
    return parseFloat(clean.replace(',', '.')) || 0;
  }
  if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      return parseFloat(parts[0] + parts[1]) || 0;
    }
    if (parts.length > 2) {
      return parseFloat(clean.replace(/\./g, '')) || 0;
    }
    return parseFloat(clean) || 0;
  }
  return parseFloat(clean) || 0;
}


