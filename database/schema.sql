-- ============================================================================
-- COOPRAIL AI PROCUREMENT PLATFORM - DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- ============================================================================

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. IDENTIDADE E ORGANIZAÇÃO (Fase 1: Foundation)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand_logo_url TEXT,
    brand_primary_color VARCHAR(32) DEFAULT '#2563EB',
    rfq_brand_settings JSONB DEFAULT '{"show_logo": true, "footer_note": "Gerado via Cooprail"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'pt-BR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'buyer' CHECK (role IN ('owner', 'admin', 'buyer', 'approver', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 2. GESTÃO DE TAREFAS & WORKFLOW (Fase 2: "Precisa de Você" / Decisões)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'needs_you' CHECK (status IN ('needs_you', 'waiting_others', 'completed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50) DEFAULT 'rfq_review' CHECK (category IN ('rfq_review', 'quote_decision', 'po_approval', 'supplier_negotiation')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    related_entity_type VARCHAR(50), -- 'rfq', 'quote', 'purchase_order'
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. CORE DE PROCUREMENT (Fase 3: Fornecedores, RFQs, Cotações, Pedidos)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    rating NUMERIC(2,1) DEFAULT 5.0,
    categories JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- Ex: "RFQ-2026-001"
    title VARCHAR(255) NOT NULL,
    scope_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'analyzing', 'awarded', 'cancelled')),
    deadline TIMESTAMP WITH TIME ZONE,
    target_delivery_date DATE,
    estimated_budget NUMERIC(15,2),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rfq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    specification TEXT,
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'unidade', -- 'un', 'kg', 'm', 'horas'
    target_unit_price NUMERIC(15,2)
);

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    total_amount NUMERIC(15,2) NOT NULL,
    delivery_lead_time_days INT,
    payment_terms VARCHAR(255), -- Ex: "30 dias líquido"
    valid_until DATE,
    status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'shortlisted', 'accepted', 'rejected')),
    ai_score NUMERIC(3,1), -- Nota calculada pelo Agente Analista (0-10)
    ai_analysis_summary TEXT, -- Resumo comparativo feito pela IA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    rfq_item_id UUID REFERENCES rfq_items(id) ON DELETE SET NULL,
    unit_price NUMERIC(15,2) NOT NULL,
    total_price NUMERIC(15,2) NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    po_code VARCHAR(50) NOT NULL, -- Ex: "PO-2026-089"
    rfq_id UUID REFERENCES rfqs(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'fulfilled', 'cancelled')),
    total_amount NUMERIC(15,2) NOT NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    entity_type VARCHAR(50) NOT NULL, -- 'rfq', 'quote', 'purchase_order', 'chat'
    entity_id UUID NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. IA & COPILOTO (Fase 4: Sessões, Mensagens e Ações de Agentes)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Nova Conversa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    slash_command VARCHAR(50), -- Ex: '/rfq', '/compare', '/negotiate'
    action_data JSONB, -- Payload estruturado da resposta da IA (ex: card de cotação)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('rfq_writer', 'quote_reader', 'purchase_analyst', 'negotiator')),
    prompt_tokens INT,
    completion_tokens INT,
    input_data JSONB,
    output_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- ÍNDICES PARA ALTA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tasks_org_status ON tasks(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_rfqs_org_status ON rfqs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_rfq ON quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- ----------------------------------------------------------------------------
-- 5. SEGURANÇA E ISOLAMENTO MULTI-TENANT (ROW LEVEL SECURITY - RLS)
-- ----------------------------------------------------------------------------

-- Habilita RLS mandatória em todas as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_logs ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para validar associação do usuário à organização
CREATE OR REPLACE FUNCTION is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = target_org_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de isolamento de inquilino (Tenant Isolation)
CREATE POLICY "org_members_policy" ON organization_members
    FOR ALL USING (user_id = auth.uid() OR is_org_member(organization_id));

CREATE POLICY "tasks_tenant_isolation" ON tasks
    FOR ALL USING (is_org_member(organization_id));

CREATE POLICY "suppliers_tenant_isolation" ON suppliers
    FOR ALL USING (is_org_member(organization_id));

CREATE POLICY "rfqs_tenant_isolation" ON rfqs
    FOR ALL USING (is_org_member(organization_id));

CREATE POLICY "rfq_items_isolation" ON rfq_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_items.rfq_id AND is_org_member(rfqs.organization_id))
    );

CREATE POLICY "quotes_isolation" ON quotes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = quotes.rfq_id AND is_org_member(rfqs.organization_id))
    );

CREATE POLICY "quote_items_isolation" ON quote_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM quotes
            JOIN rfqs ON rfqs.id = quotes.rfq_id
            WHERE quotes.id = quote_items.quote_id AND is_org_member(rfqs.organization_id)
        )
    );

CREATE POLICY "purchase_orders_tenant_isolation" ON purchase_orders
    FOR ALL USING (is_org_member(organization_id));

CREATE POLICY "attachments_tenant_isolation" ON attachments
    FOR ALL USING (is_org_member(organization_id));

CREATE POLICY "chat_sessions_tenant_isolation" ON chat_sessions
    FOR ALL USING (user_id = auth.uid() AND is_org_member(organization_id));

CREATE POLICY "chat_messages_isolation" ON chat_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "ai_agent_logs_tenant_isolation" ON ai_agent_logs
    FOR ALL USING (is_org_member(organization_id));
