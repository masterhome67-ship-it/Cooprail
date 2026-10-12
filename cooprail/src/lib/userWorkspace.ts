import { Organization, UserProfile, Task, RFQ, Sector, ChatMessage } from './mockData';
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
    avatar_url: '',
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

  const initialWelcomeMessage: ChatMessage = {
    id: `msg-welcome-${Date.now()}`,
    sender_role: 'assistant',
    content: `Olá, ${user.full_name}! Bem-vindo ao ambiente corporativo exclusivo da ${user.company_name}. Este workspace foi criado do zero e é totalmente isolado. Para começar, cadastre suas unidades operacionais no menu "Unidades & Setores" ou crie sua primeira requisição de compras (RFQ).`,
    timestamp: 'Agora',
  };

  const cleanData: UserWorkspaceData = {
    organization: cleanOrg,
    user: user,
    tasks: [],
    rfqs: [],
    orders: [],
    sectors: [],
    chatMessages: [initialWelcomeMessage],
    isNewUser: true,
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
      rfqs: [],
      orders: [],
      sectors: [],
      chatMessages: [],
      isNewUser: true,
    };
  }

  const key = getWorkspaceStorageKey(user.id);
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Erro ao ler workspace:', e);
    }
  }

  // Sempre inicializa workspace limpo do zero para qualquer usuário
  return initializeCleanWorkspace(user);
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

// Gerenciamento de Sessão Ativa
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
