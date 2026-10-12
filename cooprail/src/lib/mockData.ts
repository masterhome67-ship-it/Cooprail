export interface Organization {
  id: string;
  name: string;
  slug: string;
  brand_primary_color: string;
  rfq_brand_settings: {
    show_logo: boolean;
    company_title: string;
    footer_note: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  preferred_language: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'needs_you' | 'waiting_others' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'rfq_review' | 'quote_decision' | 'po_approval' | 'supplier_negotiation';
  due_date: string;
  related_entity_type?: string;
  related_entity_id?: string;
  badge_text?: string;
}

export interface RFQItem {
  id: string;
  item_name: string;
  specification: string;
  quantity: number;
  unit: string;
  target_unit_price: number;
}

export interface Quote {
  id: string;
  rfq_id: string;
  supplier_name: string;
  supplier_rating: number;
  total_amount: number;
  delivery_lead_time_days: number;
  payment_terms: string;
  status: 'received' | 'shortlisted' | 'accepted' | 'rejected';
  ai_score: number;
  ai_analysis_summary: string;
  savings_percentage: number;
}

export interface Sector {
  id: string;
  name: string;
  code: string;
  location: string;
  manager_name: string;
  cost_center: string;
  description: string;
  active_contractors: {
    supplier_name: string;
    contract_code: string;
    scope: string;
    since_date: string;
    can_provide_parts: boolean;
  }[];
}

export interface RFQ {
  id: string;
  code: string;
  title: string;
  scope_description: string;
  status: 'draft' | 'published' | 'analyzing' | 'awarded';
  deadline: string;
  target_delivery_date: string;
  estimated_budget: number;
  items: RFQItem[];
  quotes: Quote[];
  sector_id?: string;
}

export interface ChatMessage {
  id: string;
  sender_role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  slash_command?: string;
  action_card?: {
    type: 'quote_recommendation' | 'rfq_scope';
    title: string;
    metrics?: { label: string; value: string }[];
    actions?: { label: string; action: string }[];
  };
}

export const initialOrganization: Organization = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: "Juliano's Organization",
  slug: 'juliano-org',
  brand_primary_color: '#0284c7',
  rfq_brand_settings: {
    show_logo: true,
    company_title: 'Cooprail Corp',
    footer_note: 'Termos de confidencialidade padrão aplicados.',
  },
};

export const initialUserProfile: UserProfile = {
  id: 'b0000000-0000-0000-0000-000000000001',
  email: 'juliano@cooprail.com',
  full_name: 'Juliano Brustolin',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  preferred_language: 'Português (BR)',
  role: 'Diretor de Suprimentos',
};

export const initialTasks: Task[] = [];

export const initialRFQs: RFQ[] = [];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'm-welcome',
    sender_role: 'assistant',
    content:
      'Olá Juliano. O painel Cooprail Enterprise está ativo. Você pode abrir uma requisição de compras, importar documentos comerciais (PDF de propostas, editais ou planilhas) para conferência automática de conformidade ou emitir liquidações on-chain via Solana.',
    timestamp: 'Agora',
  },
];

export const initialSectors: Sector[] = [
  {
    id: 'sec-1',
    name: 'Divisão de Infraestrutura & Via Permanente - Corredor Oeste',
    code: 'SEC-VIA-INFRA-01',
    location: 'Hub Logístico e Corredor Operacional Ocidental',
    manager_name: 'Eng. Ricardo Mendes',
    cost_center: 'CC-4100-VIA',
    description: 'Manutenção de via permanente, troca de dormentes, nivelamento de lastro e conformidade estrutural.',
    active_contractors: [
      {
        supplier_name: 'Metalúrgica Ferro & Aço Nacional S.A.',
        contract_code: 'CTR-2026-ENG-04',
        scope: 'Contrato vigente de manutenção mecânica e soldagem industrial',
        since_date: '15/01/2026',
        can_provide_parts: true,
      },
    ],
  },
  {
    id: 'sec-2',
    name: 'Oficinas Centrais & Manutenção de Frota',
    code: 'SEC-OF-CENTRAL',
    location: 'Pátio Central Ferroviário - Hangar 3',
    manager_name: 'Marcos Vinícius Prado',
    cost_center: 'CC-3200-FROTA',
    description: 'Revisão geral de truques de locomotivas, rodeiros, eixos, rolamentos e sistemas pneumáticos de freio.',
    active_contractors: [
      {
        supplier_name: 'Trilhos Brasil Fixadores e Componentes Ltda',
        contract_code: 'CTR-2025-OF-12',
        scope: 'Fornecimento contínuo e reposição de fixadores e grampos elásticos',
        since_date: '02/08/2025',
        can_provide_parts: true,
      },
    ],
  },
  {
    id: 'sec-3',
    name: 'Sinalização, Eletrificação & Subestações',
    code: 'SEC-ELETRO-SUB',
    location: 'Trecho Eletrificado Norte / Serra',
    manager_name: 'Helena Bottino',
    cost_center: 'CC-5500-ELETRO',
    description: 'Sistemas de catenária, cabos alimentadores, transformadores e monitoramento de circuitos de via.',
    active_contractors: [
      {
        supplier_name: 'Condutores & Cabos Paulistas Eletro S.A.',
        contract_code: 'CTR-2026-SUB-08',
        scope: 'Manutenção preventiva de subestações e rede aérea',
        since_date: '10/02/2026',
        can_provide_parts: true,
      },
    ],
  },
];



