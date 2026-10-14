export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    // Landing Page Navigation
    navOnSite: 'Funcionalidades & Diferenciais',
    navGovernance: 'Governança & Canteiros',
    navHowItWorks: 'Modelo Operacional',
    navFaq: 'Dúvidas Frequentes',
    navEnter: 'Acessar Plataforma',
    navSignIn: 'Entrar',

    // Hero Section
    heroBadge: 'PLATAFORMA CORPORATIVA DE SUPRIMENTOS & COTAÇÕES INDUSTRIAIS',
    heroTitlePrefix: 'Suprimentos Inteligentes & Cotações com ',
    heroTitleHighlight: 'Auditoria Técnica e Governança Blindada',
    heroTitleSuffix: '',
    heroSubtitle:
      'A Cooprail transforma memoriais descritivos e projetos de engenharia em demandas estruturadas, homologa parceiros em 3 segundos via Receita Federal e conecta suas frentes de obra com máxima agilidade, transparência e economia.',
    heroCtaPrimary: 'Acessar Portal Corporativo',
    heroCtaSecondary: 'Conhecer Funcionalidades',
    heroCtaSupplier: 'Fornecedor',

    // Seção de Funcionalidades & Diferenciais Centrais
    diffHeading: 'FUNCIONALIDADES & DIFERENCIAIS DA PLATAFORMA',
    diffTitle: 'A Solução Completa de Suprimentos para Indústrias e Cooperativas',
    diffSubtitle:
      'Elimine planilhas manuais, semanas de espera em cadastros burocráticos de fornecedores e a lentidão do Mercado Eletrônico tradicional.',

    // Card 1: Leitura de Memoriais por IA
    feature1Tag: 'ENGENHARIA & IA',
    feature1Title: 'Leitura e Estruturação de Memoriais Técnicos (PDF / Planilhas)',
    feature1Desc:
      'Faça upload de projetos e memoriais descritivos complexos. O motor de conformidade técnica audita o escopo, identifica normas regulatórias e extrai tabelas de quantitativos e itens automaticamente sem necessidade de digitação manual.',
    feature1Check1: 'Extração instantânea de itens, unidades e especificações técnicas',
    feature1Check2: 'Zero cotações fictícias: demandas reais estruturadas para concorrência',
    feature1Check3: 'Redução de 80% no tempo gasto na preparação de cadernos de concorrência',

    // Card 2: Homologação Receita Federal
    feature2Tag: 'SUPERIOR AO MERCADO ELETRÔNICO (ME)',
    feature2Title: 'Portal do Fornecedor com Homologação em 3 Segundos via Receita Federal',
    feature2Desc:
      'Fim da burocracia que afasta novos parceiros. O fornecedor informa o CNPJ e o sistema consulta a Receita Federal em tempo real, validando Razão Social, CNAE e Situação Cadastral ATIVA, habilitando o envio imediato da proposta.',
    feature2Check1: 'Reconhecimento e cadastro instantâneo de novos parceiros comerciais',
    feature2Check2: 'Caderno técnico oficial com fotos e plantas em tela cheia com zoom',
    feature2Check3: 'Cotação simplificada: Turnkey (Material + Serviço) ou Fornecimento Parcial',

    // Card 3: Canteiros & Obras
    feature3Tag: 'OPERAÇÃO DE CAMPO & LOGÍSTICA',
    feature3Title: 'Gestão de Canteiros, Plantas Industriais e Frentes de Obra',
    feature3Desc:
      'Equipes de campo abrem chamados operacionais anexando fotos das peças com avaria e listas dinâmicas de múltiplos materiais. A plataforma verifica prestadores já mobilizados no local para cortar custos de frete e atrasos.',
    feature3Check1: 'Segregação rigorosa: a obra apenas requisita; compras centraliza a negociação',
    feature3Check2: 'Upload de fotos técnicas e croquis direto do smartphone ou canteiro',
    feature3Check3: 'Reaproveitamento de contratos in-loco para evitar custos de mobilização',

    // Card 4: Comparador & Compliance
    feature4Tag: 'DECISÃO & EQUALIZAÇÃO',
    feature4Title: 'Matriz Comparativa de Propostas & Equalização de Escopo',
    feature4Desc:
      'Equalize orçamentos concorrentes lado a lado com algoritmo de conformidade técnica. Identifique disparidades de prazos, divergências de escopo e aprove pedidos com segurança jurídica e governança blindada.',
    feature4Check1: 'Equalização automática entre preços de materiais e serviços',
    feature4Check2: 'Score técnico de confiabilidade e conformidade com o memorial',
    feature4Check3: 'Histórico auditável completo para comissões e diretorias',

    // Card 5: Smart Escrow
    feature5Tag: 'SEGURANÇA FINANCEIRA FLEXÍVEL',
    feature5Title: 'Faturamento Corporativo a Prazo ou Liquidação com Smart Escrow',
    feature5Desc:
      'Adapta-se à política de cada organização: continue operando no boleto faturado tradicional (30/60/90 dias) ou utilize Smart Escrow on-chain, onde o valor do pedido fica protegido em custódia e só é liberado após a aprovação da entrega.',
    feature5Check1: 'Garantia de pagamento para fornecedores homologados',
    feature5Check2: 'Proteção total do comprador contra entregas fora do padrão técnico',
    feature5Check3: 'Liquidação instantânea com recibo criptográfico irrevogável',

    // Seção Governança
    govHeading: 'SEGREGAÇÃO DE FUNÇÕES & BLINDAGEM',
    govTitle: 'O canteiro requisita a necessidade. O setor de compras negocia e aprova.',
    govSubtitle:
      'Para blindar sua organização contra fraudes, favorecimentos e desvios orçamentários, o pessoal de campo nunca tem acesso a preços ou contato comercial com fornecedores. Eles apenas abrem chamados técnicos auditados.',
    govBullet1:
      'Abertura Rápida: Engenheiros e técnicos relatam materiais com fotos e grau de urgência em segundos.',
    govBullet2:
      'Triagem de Suprimentos: A equipe central de compras analisa o chamado e decide a melhor estratégia.',
    govBullet3:
      'Aprovações Rastreadas: Histórico completo com data, hora e responsável por cada liberação.',

    // Seção Como Funciona o Pagamento & Operação (Responde as dúvidas do cliente)
    howHeading: 'MODELO FINANCEIRO & OPERACIONAL TRANSPARENTE',
    howTitle: 'Como funciona a operação na prática? É necessário instalar sistemas?',
    howSubtitle:
      'Tudo foi desenhado para se adequar à realidade da sua empresa, sem burocracia ou exigências complexas.',
    
    howStep1Title: '1. Preciso instalar algum sistema antes?',
    howStep1Desc:
      'Não. A Cooprail é 100% web em nuvem (SaaS). Você e sua equipe só precisam acessar o portal pelo navegador e começar a estruturar demandas imediatamente.',

    howStep2Title: '2. E se minha empresa não quiser usar custódia antecipada?',
    howStep2Desc:
      'Não tem problema! O uso da conta de garantia é 100% opcional. Você pode operar no modelo padrão de faturamento corporativo a prazo (boleto bancário 30/60/90 dias com Nota Fiscal).',

    howStep3Title: '3. Como funciona se eu optar pela garantia de pagamento?',
    howStep3Desc:
      'O valor da ordem é alocado em uma custódia segura programável. Os fundos ficam protegidos e só são liberados após o fiscal da obra atestar o recebimento do material.',

    howStep4Title: '4. Como o parceiro/fornecedor recebe o pagamento?',
    howStep4Desc:
      'Assim que a comissão técnica assina o aceite de entrega na plataforma, a liberação ocorre direto para a conta bancária ou digital da empresa parceira.',

    ctaFinalTitle: 'Pronto para modernizar a esteira de suprimentos da sua operação?',
    ctaFinalSubtitle:
      'Acesse o ambiente corporativo da Cooprail e experimente cotações sem burocracia.',
    ctaFinalBtn: 'Acessar Ambiente Corporativo',
    footerRights: 'Todos os direitos reservados © 2026 Cooprail Enterprise',
    footerSub: 'Plataforma Corporativa de Suprimentos, Cotações & Governança B2B',

    // App Sidebar & Menus
    menuDashboard: 'Painel & Decisões',
    menuRFQs: 'Requisições (RFQs)',
    menuComparator: 'Comparador de Cotações',
    menuOrders: 'Pedidos de Compra',
    menuSectors: 'Unidades & Setores',
    menuSuppliers: 'Fornecedores Qualificados',
    menuSettings: 'Configurações',
    signOut: 'Encerrar Sessão',

    // App Header & Ações
    searchPlaceholder: 'Buscar requisições, propostas, fornecedores ou componentes...',
    btnImportPDF: 'Importar Proposta (PDF)',
    btnNewRFQ: 'Nova Requisição (RFQ)',
    btnNewSector: 'Nova Unidade / Setor',
    assistantTitle: 'Assistente Operacional Corporativo',
    complianceActive: 'Motor de Compliance Ativo',
  },

  en: {
    // Landing Page Navigation
    navOnSite: 'Features & Differentiators',
    navGovernance: 'Field Governance',
    navHowItWorks: 'Operating Model',
    navFaq: 'FAQ',
    navEnter: 'Launch Platform',
    navSignIn: 'Sign In',

    // Hero Section
    heroBadge: 'ENTERPRISE PROCUREMENT & INDUSTRIAL SOURCING PLATFORM',
    heroTitlePrefix: 'Intelligent Procurement & Sourcing with ',
    heroTitleHighlight: 'Technical Audit & Governance',
    heroTitleSuffix: '',
    heroSubtitle:
      'Cooprail transforms complex engineering specifications into structured RFQs, verifies new vendors in 3 seconds via Federal Registry, and connects job sites with peak efficiency and cost savings.',
    heroCtaPrimary: 'Launch Corporate Portal',
    heroCtaSecondary: 'Explore Platform Features',
    heroCtaSupplier: 'Supplier',

    // Core Features & Differentials
    diffHeading: 'PLATFORM FEATURES & DIFFERENTIATORS',
    diffTitle: 'The Complete Procurement Solution for Heavy Industry & Cooperatives',
    diffSubtitle:
      'Eliminate manual spreadsheets, weeks of vendor registration bottlenecks, and the slowness of legacy portals.',

    // Card 1: Specs AI
    feature1Tag: 'ENGINEERING & AI',
    feature1Title: 'Automated Extraction of Technical Specifications (PDF / Sheets)',
    feature1Desc:
      'Upload complex project files and engineering specs. The compliance engine parses scopes, identifies regulatory standards, and generates itemized bill-of-quantities in seconds without manual entry.',
    feature1Check1: 'Instant extraction of items, units and engineering tolerances',
    feature1Check2: 'Zero fictitious data: genuine requests ready for market bidding',
    feature1Check3: '80% time reduction in preparing competitive bidding dossiers',

    // Card 2: Federal Registry
    feature2Tag: 'SUPERIOR TO LEGACY PORTALS',
    feature2Title: 'Supplier Portal with 3-Second Verification via Federal Registry',
    feature2Desc:
      'No more weeks waiting for manual onboarding. Partners enter their tax ID and the system queries the Federal Registry in real time, validating corporate status and business classifications instantly.',
    feature2Check1: 'Instant recognition and pre-qualification of new commercial vendors',
    feature2Check2: 'Official technical dossier with full-screen zoomable drawings',
    feature2Check3: 'Flexible bidding: Turnkey (Equipment + Service) or Partial Supply',

    // Card 3: Job Sites
    feature3Tag: 'FIELD OPERATIONS & LOGISTICS',
    feature3Title: 'Job Site & Plant Management with Visual Verification',
    feature3Desc:
      'Field personnel submit requests with photo evidence and itemized lists. The platform identifies contractors already on-site to slash transit fees and prevent schedule delays.',
    feature3Check1: 'Strict segregation: field logs tickets; procurement leads negotiations',
    feature3Check2: 'Upload photos and engineering sketches straight from the site',
    feature3Check3: 'Reuse on-site agreements to eliminate costly mobilization expenses',

    // Card 4: Comparator
    feature4Tag: 'DECISION & EQUALIZATION',
    feature4Title: 'Comparative Bid Matrix & Technical Compliance Scoring',
    feature4Desc:
      'Equalize competing vendor bids side-by-side with algorithmic compliance checks. Identify lead time variances, scope disparities, and approve purchase orders with full legal backing.',
    feature4Check1: 'Automated price equalization across equipment and labor breakdown',
    feature4Check2: 'Technical reliability score aligned with original project specs',
    feature4Check3: 'Complete audit trail for corporate oversight boards',

    // Card 5: Smart Escrow
    feature5Tag: 'FLEXIBLE SETTLEMENT',
    feature5Title: 'Corporate Invoiced Terms or Programmable Smart Escrow',
    feature5Desc:
      'Fits your enterprise treasury policies: operate on standard corporate net-30 / net-60 invoiced terms, or leverage programmable Smart Escrow where funds are guaranteed and only released upon site acceptance.',
    feature5Check1: 'Payment assurance for vetted suppliers',
    feature5Check2: 'Buyer protection against substandard deliveries',
    feature5Check3: 'Instant settlement with irrevocable cryptographically signed receipt',

    // Seção Governança
    govHeading: 'SEGREGATION OF DUTIES',
    govTitle: 'Field personnel log requirements. Procurement negotiates and approves.',
    govSubtitle:
      'To safeguard against fraud and budget overruns, field personnel never see pricing or commercial vendor margins. They only submit technical tickets.',
    govBullet1:
      'Fast Submission: Engineers log items with photos and urgency levels in seconds.',
    govBullet2:
      'Procurement Triage: Central buyers review the ticket and decide procurement strategy.',
    govBullet3:
      'Traceable Approvals: Full audit trail with time-stamps and managerial sign-offs.',

    // Seção Como Funciona o Pagamento & Operação
    howHeading: 'TRANSPARENT OPERATIONS & PAYMENTS',
    howTitle: 'How does it work in practice? Do we need to install software?',
    howSubtitle:
      'Engineered to adapt to your company’s existing corporate financial habits, without friction.',

    howStep1Title: '1. Do we need to install any protocol or software beforehand?',
    howStep1Desc:
      'No. Cooprail is a 100% cloud web SaaS. You and your team only need to sign in and begin organizing requirements immediately.',

    howStep2Title: '2. What if my company does not want to pre-fund or use escrow?',
    howStep2Desc:
      'No problem! Digital escrow is 100% optional. You can continue operating on standard corporate net-30 / net-60 invoiced terms with official tax invoices.',

    howStep3Title: '3. How does it work if we choose guaranteed escrow?',
    howStep3Desc:
      'Order funds are deposited into an autonomous escrow vault. Funds stay locked and protected until technical delivery is verified by site supervisors.',

    howStep4Title: '4. How does the partner/vendor receive payment?',
    howStep4Desc:
      'As soon as your field engineer inspects the delivery and signs off on the platform, payment is released directly to the partner’s bank account or digital wallet.',

    ctaFinalTitle: 'Ready to modernize your industrial supply chain?',
    ctaFinalSubtitle:
      'Access the Cooprail corporate workspace and experience frictionless procurement.',
    ctaFinalBtn: 'Access Enterprise Portal',
    footerRights: 'All rights reserved © 2026 Cooprail Enterprise',
    footerSub: 'Enterprise Cloud Platform for B2B Supply Chain & Governance',

    // App Sidebar & Menus
    menuDashboard: 'Dashboard & Decisions',
    menuRFQs: 'Purchase Requests (RFQs)',
    menuComparator: 'Quote Comparator',
    menuOrders: 'Purchase Orders',
    menuSectors: 'Units & Sectors',
    menuSuppliers: 'Qualified Suppliers',
    menuSettings: 'Settings',
    signOut: 'Sign Out',

    // App Header & Ações
    searchPlaceholder: 'Search RFQs, quotes, suppliers or parts...',
    btnImportPDF: 'Import Proposal (PDF)',
    btnNewRFQ: 'New RFQ',
    btnNewSector: 'New Unit / Sector',
    assistantTitle: 'Corporate Operations Assistant',
    complianceActive: 'Compliance Engine Active',
  },
};
