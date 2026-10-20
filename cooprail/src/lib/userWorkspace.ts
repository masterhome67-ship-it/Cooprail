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
  is_initialized?: boolean;
  deleted_rfq_ids?: string[];
}

export interface RegisteredAccount extends UserProfile {
  company_name: string;
  password_hash?: string;
  password?: string;
}

// Função de Hashing Criptográfico SHA-256 no Navegador (Web Crypto API)
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return '';
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return `sha256_${plainText}`;
  }
  const msgUint8 = new TextEncoder().encode(plainText);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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
  password_hash?: string;
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
    password_hash: account.password_hash,
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
    content: `Olá! Sou o seu Assistente de Suprimentos & Engenharia.
Posso cotar materiais e serviços, localizar fornecedores homologados ou analisar memoriais descritivos e propostas comerciais.

💡 **Como começar:** Digite o que sua obra ou setor necessita (ex: *"Cotar disjuntores e cabos"* ou *"Preciso de 50 sacos de cimento"*) ou anexe seu projeto/memorial técnico em PDF/planilha.`,
    timestamp: 'Agora',
  };
}

export function getNewUserWelcomeMessage(userName: string, companyName: string): ChatMessage {
  const firstName = userName ? userName.split(' ')[0] : 'Comprador';
  return {
    id: `msg-welcome-new-${Date.now()}`,
    sender_role: 'assistant',
    content: `Olá, ${firstName}! Bem-vindo ao painel corporativo da **${companyName}** na plataforma Cooprail.

Seu workspace está **100% ativo e configurado**. Estou pronto para operar suas aquisições e engenharia de suprimentos:

• **Nova Cotação:** Digite os itens que sua obra necessita
• **Leitura de Memorial:** Anexe um projeto ou memorial descritivo em PDF para extração automática dos quantitativos
• **Portal de Fornecedores:** Seus editais públicos já geram link seguro instantâneo para fornecedores

Como deseja iniciar hoje?`,
    timestamp: 'Agora',
  };
}

// Inicializa workspace 100% limpo para usuário novo (sem dados mockados forçados)
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

  const initialWelcomeMessage = getNewUserWelcomeMessage(user.full_name, user.company_name);

  const cleanData: UserWorkspaceData = {
    organization: cleanOrg,
    user: user,
    tasks: [],
    rfqs: [],
    orders: [],
    sectors: [],
    chatMessages: [initialWelcomeMessage],
    isNewUser: true,
    is_initialized: true,
    deleted_rfq_ids: [],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(getWorkspaceStorageKey(user.id), JSON.stringify(cleanData));
  }

  return cleanData;
}

// Carregar dados guiados de demonstração sob demanda (desativado a pedido do usuário)
export function loadDemoDataIntoWorkspace(_userId: string): { rfq: RFQ; task: Task } | null {
  return null;
}

// Redefinição rápida de senha local para primeiro acesso / recuperação
export async function resetAccountPassword(email: string, newPasswordPlain: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const accounts = getRegisteredAccounts();
    const idx = accounts.findIndex((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (idx < 0) return false;
    const hash = await hashPassword(newPasswordPlain);
    accounts[idx].password_hash = hash;
    accounts[idx].password = newPasswordPlain;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
    return true;
  } catch (e) {
    console.error('Erro ao redefinir senha:', e);
    return false;
  }
}

// Conta de Demonstração Rápida de 1 Clique (Homologada para Apresentações)
export const DEMO_ACCOUNT_EMAIL = 'compras@cooprail.com.br';
export const DEMO_ACCOUNT_PASSWORD = 'cooprail2026';

export async function ensureDemoAccount(): Promise<RegisteredAccount> {
  const accounts = getRegisteredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase());
  if (existing) {
    return existing;
  }
  const hashed = await hashPassword(DEMO_ACCOUNT_PASSWORD);
  return registerNewAccount({
    full_name: 'Juliano Brustolin',
    email: DEMO_ACCOUNT_EMAIL,
    company_name: 'Cooprail Alimentos & Logística',
    role: 'Diretor de Suprimentos & Engenharia',
    password_hash: hashed,
    password: DEMO_ACCOUNT_PASSWORD,
  });
}

// Purga proativa de dados mockados e de exemplo residuais no navegador do usuário
export function purgeLegacyMockDataFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    // 1. Limpa SHARED_RFQS_KEY
    const rawShared = localStorage.getItem(SHARED_RFQS_KEY);
    if (rawShared) {
      const shared: PublishedRFQ[] = JSON.parse(rawShared);
      if (Array.isArray(shared)) {
        const cleaned = shared.filter(
          (s) =>
            s &&
            s.id !== 'rfq-umu-cimento-01' &&
            s.code !== 'RFQ-2026-UMU-01' &&
            !s.id?.toLowerCase().includes('umu') &&
            !s.code?.toLowerCase().includes('umu') &&
            !s.title?.toLowerCase().includes('umuarama') &&
            !s.scope_description?.toLowerCase().includes('umuarama') &&
            !s.code?.toLowerCase().includes('copacol') &&
            !s.title?.toLowerCase().includes('copacol') &&
            !s.title?.toLowerCase().includes('preciso que estruture')
        );
        localStorage.setItem(SHARED_RFQS_KEY, JSON.stringify(cleaned));
      }
    }

    // 2. Limpa todos os tenants de usuário no localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cooprail_workspace_tenant_')) {
        const val = localStorage.getItem(k);
        if (val) {
          const ws: UserWorkspaceData = JSON.parse(val);
          let modified = false;
          if (Array.isArray(ws.rfqs)) {
            const before = ws.rfqs.length;
            ws.rfqs = ws.rfqs.filter(
              (r) =>
                r &&
                r.id !== 'rfq-umu-cimento-01' &&
                r.code !== 'RFQ-2026-UMU-01' &&
                !r.id?.toLowerCase().includes('umu') &&
                !r.code?.toLowerCase().includes('umu') &&
                !r.title?.toLowerCase().includes('umuarama') &&
                !r.scope_description?.toLowerCase().includes('umuarama') &&
                !r.title?.toLowerCase().includes('copacol') &&
                !r.code?.toLowerCase().includes('copacol') &&
                !r.title?.toLowerCase().includes('preciso que estruture')
            );
            if (ws.rfqs.length !== before) modified = true;
          }
          if (Array.isArray(ws.tasks)) {
            const beforeT = ws.tasks.length;
            ws.tasks = ws.tasks.filter(
              (t) =>
                t &&
                !t.id?.toLowerCase().includes('umu') &&
                !t.title?.toLowerCase().includes('umuarama') &&
                !t.description?.toLowerCase().includes('umuarama') &&
                !t.title?.toLowerCase().includes('copacol') &&
                !t.description?.toLowerCase().includes('copacol')
            );
            if (ws.tasks.length !== beforeT) modified = true;
          }
          if (modified) {
            localStorage.setItem(k, JSON.stringify(ws));
          }
        }
      }
    }
  } catch (e) {
    console.error('Erro na purga de dados legados:', e);
  }
}

// Carregar workspace isolado do usuário
export function loadUserWorkspace(user: RegisteredAccount): UserWorkspaceData {
  if (typeof window === 'undefined') {
    return {
      organization: { ...initialOrganization, name: user.company_name },
      user,
      tasks: [],
      rfqs: [],
      orders: [],
      sectors: [],
      chatMessages: [getHelpAgentInitialMessage()],
      isNewUser: false,
      is_initialized: true,
      deleted_rfq_ids: [],
    };
  }

  // Purga proativamente dados residuais de exemplo do navegador
  purgeLegacyMockDataFromLocalStorage();

  const key = getWorkspaceStorageKey(user.id);
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const parsed: UserWorkspaceData = JSON.parse(raw);
      if (!parsed.deleted_rfq_ids) {
        parsed.deleted_rfq_ids = [];
      }

      // PURGA INCONDICIONAL DE RFQs E TAREFAS DE EXEMPLO/MOCK (Umuarama/Copacol)
      if (parsed.rfqs && Array.isArray(parsed.rfqs)) {
        parsed.rfqs = parsed.rfqs.filter(
          (r) =>
            r &&
            r.id !== 'rfq-umu-cimento-01' &&
            r.code !== 'RFQ-2026-UMU-01' &&
            !r.id?.toLowerCase().includes('umu') &&
            !r.code?.toLowerCase().includes('umu') &&
            !r.title?.toLowerCase().includes('umuarama') &&
            !r.scope_description?.toLowerCase().includes('umuarama') &&
            !r.title?.toLowerCase().includes('copacol') &&
            !r.code?.toLowerCase().includes('copacol') &&
            !r.title?.toLowerCase().includes('preciso que estruture')
        );
      }
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        parsed.tasks = parsed.tasks.filter(
          (t) =>
            t &&
            !t.id?.toLowerCase().includes('umu') &&
            !t.title?.toLowerCase().includes('umuarama') &&
            !t.description?.toLowerCase().includes('umuarama') &&
            !t.title?.toLowerCase().includes('copacol') &&
            !t.description?.toLowerCase().includes('copacol')
        );
      }

      // Se for primeira inicialização de usuário novo/legado sem a flag
      if (!parsed.is_initialized) {
        parsed.is_initialized = true;
        localStorage.setItem(key, JSON.stringify(parsed));
      } else {
        // Respeita a deleção do usuário
        if (parsed.rfqs && parsed.deleted_rfq_ids.length > 0) {
          parsed.rfqs = parsed.rfqs.filter(
            (r) => !parsed.deleted_rfq_ids!.includes(r.id) && !parsed.deleted_rfq_ids!.includes(r.code)
          );
        }
        localStorage.setItem(key, JSON.stringify(parsed));
      }

        // Limpa quaisquer propostas sintéticas/mockadas residuais
        let changed = false;
        if (parsed.rfqs) {
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
        }
        if (changed) {
          localStorage.setItem(key, JSON.stringify(parsed));
        }

      // Limpa consultas e respostas anteriores para iniciar nova pesquisa do zero
      if (parsed.chatMessages && parsed.chatMessages.length > 0) {
        const hasOldQueries = parsed.chatMessages.length > 1 || parsed.chatMessages.some(
          (m) =>
            m.content.includes('Preciso que estruture') ||
            m.content.includes('Consulta processada pelo motor') ||
            m.content.includes('Viga Estrutural de Aço') ||
            m.content.includes('RFQ-2026-')
        );
        if (hasOldQueries) {
          parsed.chatMessages = [getHelpAgentInitialMessage()];
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

export const DEFAULT_PUBLISHED_RFQS: PublishedRFQ[] = [];

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

export function deletePublishedRFQ(rfqId: string, rfqCode?: string, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    // 1. Marca no set global de RFQs excluídas
    const globalDeletedIds = new Set<string>();
    const rawDeleted = localStorage.getItem('cooprail_deleted_rfq_ids');
    if (rawDeleted) {
      try {
        const arr = JSON.parse(rawDeleted);
        if (Array.isArray(arr)) arr.forEach((id: string) => globalDeletedIds.add(id));
      } catch {}
    }
    globalDeletedIds.add(rfqId);
    if (rfqCode) globalDeletedIds.add(rfqCode);
    localStorage.setItem('cooprail_deleted_rfq_ids', JSON.stringify(Array.from(globalDeletedIds)));

    // 2. Remove de SHARED_RFQS_KEY
    const rawShared = localStorage.getItem(SHARED_RFQS_KEY);
    if (rawShared) {
      const shared: PublishedRFQ[] = JSON.parse(rawShared);
      const filtered = shared.filter((r) => r.id !== rfqId && r.code !== rfqCode && r.code !== rfqId);
      localStorage.setItem(SHARED_RFQS_KEY, JSON.stringify(filtered));
    }

    // 3. Atualiza no workspace do usuário atual se informado
    if (userId) {
      const key = getWorkspaceStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const ws: UserWorkspaceData = JSON.parse(raw);
        ws.rfqs = (ws.rfqs || []).filter((r) => r.id !== rfqId && r.code !== rfqCode);
        ws.tasks = (ws.tasks || []).filter((t) => !t.id.includes(rfqId) && (!rfqCode || !t.title.includes(rfqCode)));
        if (!ws.deleted_rfq_ids) ws.deleted_rfq_ids = [];
        if (!ws.deleted_rfq_ids.includes(rfqId)) ws.deleted_rfq_ids.push(rfqId);
        if (rfqCode && !ws.deleted_rfq_ids.includes(rfqCode)) ws.deleted_rfq_ids.push(rfqCode);
        ws.is_initialized = true;
        localStorage.setItem(key, JSON.stringify(ws));
      }
    }
  } catch (err) {
    console.error('Erro ao excluir RFQ compartilhada:', err);
  }
}

export function getAllPublishedRFQs(): PublishedRFQ[] {
  if (typeof window === 'undefined') return DEFAULT_PUBLISHED_RFQS;
  try {
    const raw = localStorage.getItem(SHARED_RFQS_KEY);
    const shared: PublishedRFQ[] = raw ? JSON.parse(raw) : [];

    const globalDeletedIds = new Set<string>();
    // Bloqueia permanentemente resquícios de Copacol, Umuarama mock e IDs deletados
    globalDeletedIds.add('rfq-copacol-01');
    globalDeletedIds.add('RFQ-2026-COPACOL-01');
    globalDeletedIds.add('rfq-umu-cimento-01');
    globalDeletedIds.add('RFQ-2026-UMU-01');

    const rawDeleted = localStorage.getItem('cooprail_deleted_rfq_ids');
    if (rawDeleted) {
      try {
        const arr = JSON.parse(rawDeleted);
        if (Array.isArray(arr)) arr.forEach((id: string) => globalDeletedIds.add(id));
      } catch {}
    }

    const tenantRfqs: PublishedRFQ[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cooprail_workspace_tenant_')) {
        try {
          const val = localStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed.deleted_rfq_ids)) {
              parsed.deleted_rfq_ids.forEach((id: string) => globalDeletedIds.add(id));
            }
            if (Array.isArray(parsed.rfqs)) {
              // Somente RFQs com status 'published' explícito (NUNCA rascunhos) e sem Copacol ou mock Umuarama
              const publishedOnly = parsed.rfqs.filter(
                (r: any) =>
                  r.status === 'published' &&
                  !r.code?.toLowerCase().includes('copacol') &&
                  !r.title?.toLowerCase().includes('copacol') &&
                  !r.code?.toLowerCase().includes('umu') &&
                  !r.title?.toLowerCase().includes('umuarama') &&
                  !r.title?.toLowerCase().includes('preciso que estruture') &&
                  !globalDeletedIds.has(r.id) &&
                  !globalDeletedIds.has(r.code)
              );
              tenantRfqs.push(...publishedOnly);
            }
          }
        } catch {}
      }
    }

    const map = new Map<string, PublishedRFQ>();
    DEFAULT_PUBLISHED_RFQS.forEach((d) => {
      if (
        !globalDeletedIds.has(d.id) &&
        !globalDeletedIds.has(d.code) &&
        !d.code.toLowerCase().includes('copacol') &&
        !d.title.toLowerCase().includes('copacol')
      ) {
        map.set(d.code, d);
      }
    });

    tenantRfqs.forEach((t) => {
      if (
        t.code &&
        t.status === 'published' &&
        !globalDeletedIds.has(t.id) &&
        !globalDeletedIds.has(t.code) &&
        !t.code.toLowerCase().includes('copacol') &&
        !t.title.toLowerCase().includes('copacol') &&
        !t.code.toLowerCase().includes('umu') &&
        !t.title.toLowerCase().includes('umuarama')
      ) {
        map.set(t.code, { ...map.get(t.code), ...t });
      }
    });

    const validShared = shared.filter(
      (s) =>
        s.code &&
        s.status === 'published' &&
        !globalDeletedIds.has(s.id) &&
        !globalDeletedIds.has(s.code) &&
        !s.code.toLowerCase().includes('copacol') &&
        !s.title.toLowerCase().includes('copacol') &&
        !s.code.toLowerCase().includes('umu') &&
        !s.title.toLowerCase().includes('umuarama') &&
        !s.title.toLowerCase().includes('preciso que estruture')
    );
    validShared.forEach((s) => {
      map.set(s.code, { ...map.get(s.code), ...s });
    });

    if (raw && validShared.length !== shared.length) {
      localStorage.setItem(SHARED_RFQS_KEY, JSON.stringify(validShared));
    }

    return Array.from(map.values());
  } catch {
    return DEFAULT_PUBLISHED_RFQS;
  }
}

export const EMPTY_PUBLISHED_RFQ: PublishedRFQ = {
  id: 'rfq-none',
  code: 'SEM-RFQ',
  title: 'Nenhuma Cotação Selecionada',
  scope_description: 'Nenhum edital ou cotação ativa no momento.',
  status: 'published',
  deadline: 'A definir',
  target_delivery_date: 'A definir',
  estimated_budget: 0,
  items: [],
  quotes: [],
  location: 'Local a combinar',
};

export function getPublishedRFQByCode(code?: string | null): PublishedRFQ {
  const all = getAllPublishedRFQs();
  if (all.length === 0) {
    return EMPTY_PUBLISHED_RFQ;
  }
  if (!code) {
    return all[0];
  }

  const clean = code.trim().toLowerCase();
  const direct = all.find((r) => r.code.toLowerCase() === clean || r.id.toLowerCase() === clean);
  if (direct) return direct;

  return all[0];
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


