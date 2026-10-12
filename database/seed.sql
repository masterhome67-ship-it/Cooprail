-- ============================================================================
-- COOPRAIL AI PROCUREMENT - SEED DATA PARA O MVP FUNCIONAL
-- ============================================================================

-- IDs Fixos para Consistência
DO $$
DECLARE
    v_org_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_user_id UUID := 'b0000000-0000-0000-0000-000000000001';
    v_sup1_id UUID := 'c0000000-0000-0000-0000-000000000001';
    v_sup2_id UUID := 'c0000000-0000-0000-0000-000000000002';
    v_rfq_id UUID := 'd0000000-0000-0000-0000-000000000001';
    v_item1_id UUID := 'e0000000-0000-0000-0000-000000000001';
    v_item2_id UUID := 'e0000000-0000-0000-0000-000000000002';
    v_session_id UUID := 'f0000000-0000-0000-0000-000000000001';
BEGIN

    -- 1. Organização e Usuário
    INSERT INTO organizations (id, name, slug, brand_primary_color, rfq_brand_settings)
    VALUES (
        v_org_id,
        'Juliano''s Organization',
        'juliano-org',
        '#0284C7',
        '{"show_logo": true, "company_title": "Cooprail Corp", "footer_note": "Termos de confidencialidade padrão aplicados."}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO users (id, email, full_name, avatar_url, preferred_language)
    VALUES (
        v_user_id,
        'juliano@cooprail.com',
        'Juliano Brustolin',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Juliano',
        'pt-BR'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_user_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- 2. Fornecedores
    INSERT INTO suppliers (id, organization_id, name, contact_name, email, phone, rating, categories)
    VALUES 
    (v_sup1_id, v_org_id, 'Metalúrgica Ferro & Aço Ltda', 'Carlos Silva', 'carlos@ferroaco.com.br', '(11) 98765-4321', 4.8, '["Matéria-prima", "Usinagem"]'::jsonb),
    (v_sup2_id, v_org_id, 'Trilhos Brasil Componentes', 'Mariana Ramos', 'mariana@trilhosbr.com', '(19) 99123-4567', 4.5, '["Estrutural", "Ferroviário"]'::jsonb)
    ON CONFLICT (id) DO NOTHING;

    -- 3. RFQ com Itens
    INSERT INTO rfqs (id, organization_id, code, title, scope_description, status, deadline, target_delivery_date, estimated_budget, created_by)
    VALUES (
        v_rfq_id,
        v_org_id,
        'RFQ-2026-001',
        'Aquisição de Vigas de Aço e Fixadores de Trilho',
        'Fornecimento de materiais de alta resistência para manutenção preventiva de malha ferroviária operacional.',
        'analyzing',
        NOW() + INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '30 days',
        85000.00,
        v_user_id
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO rfq_items (id, rfq_id, item_name, specification, quantity, unit, target_unit_price)
    VALUES
    (v_item1_id, v_rfq_id, 'Viga de Aço Perfil W 250x32', 'Aço estrutural ASTM A572 Grau 50 com laudo técnico', 120, 'unidade', 550.00),
    (v_item2_id, v_rfq_id, 'Kit Parafusos de Fixação Elástica', 'Tratamento anticorrosivo galvanizado a fogo classe 8.8', 500, 'kit', 38.00)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Cotações Recebidas e Comparação de Fornecedores
    INSERT INTO quotes (id, rfq_id, supplier_id, total_amount, delivery_lead_time_days, payment_terms, valid_until, status, ai_score, ai_analysis_summary)
    VALUES
    (
        uuid_generate_v4(),
        v_rfq_id,
        v_sup1_id,
        81500.00,
        15,
        '30/60 dias',
        CURRENT_DATE + INTERVAL '14 days',
        'shortlisted',
        9.2,
        'Melhor custo-benefício. Preço 4.1% abaixo do teto orçamentário e prazo de entrega em 15 dias com histórico confiável.'
    ),
    (
        uuid_generate_v4(),
        v_rfq_id,
        v_sup2_id,
        84200.00,
        22,
        '28 dias líquido',
        CURRENT_DATE + INTERVAL '10 days',
        'received',
        8.0,
        'Atende a todos os critérios técnicos, mas o prazo de entrega é 7 dias maior e o preço é 3.3% superior ao fornecedor concorrente.'
    );

    -- 5. Tarefas da Gestão "Precisa de Você" (Fase 2)
    INSERT INTO tasks (organization_id, title, description, status, priority, category, due_date, assigned_to, related_entity_type, related_entity_id)
    VALUES
    (
        v_org_id,
        'Aprovar seleção de fornecedor para RFQ-2026-001',
        'O Agente Leitor de Cotações analisou 2 propostas recebidas. A proposta da Metalúrgica Ferro & Aço obteve o maior score de custo-benefício (9.2).',
        'needs_you',
        'high',
        'quote_decision',
        NOW() + INTERVAL '2 days',
        v_user_id,
        'rfq',
        v_rfq_id
    ),
    (
        v_org_id,
        'Validar minuta de RFQ para Rolamentos Especiais',
        'Minuta gerada automaticamente pelo Agente Redator de RFQs a partir do pedido de produção #442.',
        'needs_you',
        'medium',
        'rfq_review',
        NOW() + INTERVAL '3 days',
        v_user_id,
        'rfq',
        NULL
    ),
    (
        v_org_id,
        'Aguardando envio de proposta formal da Trilhos Brasil',
        'Solicitação de detalhamento técnico de frete CIF enviada por e-mail pelo Agente Negociador.',
        'waiting_others',
        'low',
        'supplier_negotiation',
        NOW() + INTERVAL '4 days',
        v_user_id,
        'supplier',
        v_sup2_id
    );

    -- 6. Sessão de Chat e Mensagens do Copiloto (Fase 4)
    INSERT INTO chat_sessions (id, organization_id, user_id, title)
    VALUES (v_session_id, v_org_id, v_user_id, 'Cotação de Vigas e Manutenção')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO chat_messages (session_id, sender_role, content, slash_command, action_data)
    VALUES
    (
        v_session_id,
        'user',
        '/compare RFQ-2026-001',
        '/compare',
        NULL
    ),
    (
        v_session_id,
        'assistant',
        'Encontrei 2 cotações para o RFQ-2026-001. A proposta da Metalúrgica Ferro & Aço Ltda (R$ 81.500,00) é a mais vantajosa, gerando economia de R$ 3.500,00 em relação ao orçamento estimado. Deseja que eu emita a minuta de Pedido de Compra?',
        NULL,
        '{"recommended_supplier": "Metalúrgica Ferro & Aço Ltda", "savings": 3500.00, "recommended_quote_id": "c0000000-0000-0000-0000-000000000001"}'::jsonb
    );

END $$;
