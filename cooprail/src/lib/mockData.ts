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
  image_url?: string;
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

export const initialSectors: Sector[] = [];




