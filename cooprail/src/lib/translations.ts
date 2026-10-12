export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    // Landing Page Navigation
    navOnSite: 'Mapeamento In-Loco',
    navGovernance: 'Governança & Chamados',
    navHowItWorks: 'Como Funciona',
    navFaq: 'Dúvidas Frequentes',
    navEnter: 'Acessar Plataforma',
    navSignIn: 'Entrar',

    // Hero Section
    heroBadge: 'Gestão de Suprimentos Industriais & Pagamentos Garantidos',
    heroTitlePrefix: 'Contrate Quem Já Está no Seu Canteiro com ',
    heroTitleHighlight: 'Zero Custo de Deslocamento',
    heroTitleSuffix: '',
    heroSubtitle:
      'A Cooprail conecta as demandas de peças e manutenção aos prestadores já mobilizados em suas obras e plantas. Economize frete, elimine atrasos e centralize chamados com governança rigorosa.',
    heroCtaPrimary: 'Acessar Portal Corporativo',
    heroCtaSecondary: 'Ver Como Funciona na Prática',

    // Métricas Corporativas Reais
    metric1Val: '-35%',
    metric1Label: 'Economia em Mobilização',
    metric1Desc: 'Reaproveitamento de equipes já no local',
    metric2Val: '100% Nuvem',
    metric2Label: 'Zero Instalação',
    metric2Desc: 'Acesso web imediato sem servidores',
    metric3Val: 'Flexível',
    metric3Label: 'Forma de Pagamento',
    metric3Desc: 'Boleto faturado ou custódia garantida',
    metric4Val: 'Blindada',
    metric4Label: 'Governança do Campo',
    metric4Desc: 'Obras apenas requisitam sem cotar',

    // Seção Diferencial In-Loco
    diffHeading: 'Vantagem Estratégica In-Loco',
    diffTitle: 'Por que contratar quem já está trabalhando no seu canteiro?',
    diffSubtitle:
      'Em grandes indústrias, ferrovias e infraestrutura pesada, trazer uma equipe de fora custa caro e atrasa o cronograma. Aproveitar fornecedores mobilizados muda o jogo.',
    diffCard1Title: 'Atendimento Rápido e Sem Custo de Deslocamento',
    diffCard1Desc:
      'Quando sua planta ou canteiro precisa de uma peça urgente ou manutenção, a plataforma mostra quem já possui equipe e maquinário ativos no local.',
    diffCard2Title: 'Eliminação de Fretes Abusivos',
    diffCard2Desc:
      'Economize evitando cotações com empresas distantes que cobram taxas pesadas de transporte. O pedido complementar é atendido pela estrutura existente.',
    diffCard3Title: 'Contratos e Centros de Custo Integrados',
    diffCard3Desc:
      'Todas as compras complementares vinculam-se ao contrato-mestre da unidade e ao centro de custo correto, com auditoria jurídica impecável.',

    // Seção Governança
    govHeading: 'Segregação de Funções',
    govTitle: 'O canteiro pede o que precisa. O setor de compras negocia e aprova.',
    govSubtitle:
      'Para blindar sua empresa contra fraudes e desvios de orçamento, o pessoal de campo nunca tem acesso a preços ou contato comercial com fornecedores. Eles apenas abrem chamados técnicos.',
    govBullet1:
      'Abertura Rápida: Técnicos e engenheiros relatam a peça ou serviço e o grau de urgência em segundos.',
    govBullet2:
      'Triagem de Suprimentos: A equipe central de compras analisa o chamado e decide se aproveita o contrato local ou abre cotação.',
    govBullet3:
      'Aprovações Rastreadas: Histórico completo com data, hora e responsável por cada liberação.',

    // Seção Como Funciona o Pagamento & Operação (Responde as dúvidas do cliente)
    howHeading: 'Modelo Financeiro & Operacional Transparente',
    howTitle: 'Como funciona o pagamento? É obrigatório? E o parceiro, como recebe?',
    howSubtitle:
      'Tudo foi desenhado para se adequar à realidade da sua empresa, sem burocracia ou exigências complexas.',
    
    howStep1Title: '1. Preciso instalar algum sistema antes?',
    howStep1Desc:
      'Não. A Cooprail é 100% web em nuvem (SaaS). Você e sua equipe só precisam criar o acesso corporativo e cadastrar as unidades e prestadores ativos.',

    howStep2Title: '2. E se minha empresa não quiser usar custódia antecipada?',
    howStep2Desc:
      'Não tem problema! O uso da conta de garantia é 100% opcional. Você pode operar no modelo padrão de faturamento corporativo a prazo (boleto bancário 30/60/90 dias com Nota Fiscal).',

    howStep3Title: '3. Como funciona se eu optar pela garantia de pagamento?',
    howStep3Desc:
      'O valor da ordem é alocado em uma conta de garantia segura (via PIX/TED ou Dólar Digital USDC). Os fundos ficam protegidos e só saem da conta após a entrega conferida.',

    howStep4Title: '4. Como o parceiro/fornecedor recebe o dinheiro?',
    howStep4Desc:
      'Assim que o fiscal da sua obra assina o recebimento e conformidade técnica na plataforma, a liberação ocorre direto para a conta bancária ou digital da empresa parceira.',

    ctaFinalTitle: 'Pronto para simplificar os suprimentos da sua operação?',
    ctaFinalSubtitle:
      'Crie a conta da sua organização agora mesmo ou acesse o ambiente de demonstração para testar.',
    ctaFinalBtn: 'Começar Agora Gratuitamente',
    footerRights: 'Todos os direitos reservados © 2026 Cooprail Enterprise',
    footerSub: 'Plataforma Web Corporativa de Suprimentos & Governança B2B',

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
    navOnSite: 'On-Site Moat',
    navGovernance: 'Field Governance',
    navHowItWorks: 'How It Works',
    navFaq: 'FAQ',
    navEnter: 'Launch Platform',
    navSignIn: 'Sign In',

    // Hero Section
    heroBadge: 'Industrial Supply Chain & Guaranteed B2B Payments',
    heroTitlePrefix: 'Contract Teams Already on Your Job Site with ',
    heroTitleHighlight: 'Zero Mobilization Costs',
    heroTitleSuffix: '',
    heroSubtitle:
      'Cooprail connects field maintenance and parts requirements directly to contractors already active across your plants and job sites. Slash freight fees and centralize tickets with strict governance.',
    heroCtaPrimary: 'Launch Enterprise Portal',
    heroCtaSecondary: 'See How It Works',

    // Métricas Corporativas Reais
    metric1Val: '-35%',
    metric1Label: 'Mobilization Savings',
    metric1Desc: 'Reusing crews already on-site',
    metric2Val: '100% Cloud',
    metric2Label: 'Zero Setup',
    metric2Desc: 'Instant web access without servers',
    metric3Val: 'Flexible',
    metric3Label: 'Payment Terms',
    metric3Desc: 'Invoiced terms or secured escrow',
    metric4Val: 'Shielded',
    metric4Label: 'Field Governance',
    metric4Desc: 'Job sites request without bidding',

    // Seção Diferencial In-Loco
    diffHeading: 'On-Site Strategic Advantage',
    diffTitle: 'Why hiring contractors already on your job site changes everything',
    diffSubtitle:
      'In heavy industries, rail, and infrastructure, deploying an outside crew is expensive and delays schedules. Reusing mobilized vendors changes the game.',
    diffCard1Title: 'Rapid Turnaround with Zero Deployment Fee',
    diffCard1Desc:
      'When your facility requires urgent parts or maintenance, the platform surfaces partners already active on-site with equipment and crews ready.',
    diffCard2Title: 'Elimination of Excessive Logistics Fees',
    diffCard2Desc:
      'Stop costly quotes from distant vendors who charge heavy transit fees. The add-on order is handled by the existing work-site structure.',
    diffCard3Title: 'Integrated Master Contracts & Cost Centers',
    diffCard3Desc:
      'All supplemental orders link directly to the facility’s master agreement and specific cost center, ensuring clean legal compliance.',

    // Seção Governança
    govHeading: 'Segregation of Duties',
    govTitle: 'Field personnel log requirements. Procurement negotiates and approves.',
    govSubtitle:
      'To safeguard against fraud and budget overruns, field personnel never see pricing or commercial vendor margins. They only submit technical tickets.',
    govBullet1:
      'Fast Submission: Engineers log the item and urgency level in seconds.',
    govBullet2:
      'Procurement Triage: Central buyers review the ticket and decide between on-site agreements or open bidding.',
    govBullet3:
      'Traceable Approvals: Full audit trail with time-stamps and managerial sign-offs.',

    // Seção Como Funciona o Pagamento & Operação
    howHeading: 'Transparent Operations & Payments',
    howTitle: 'How does payment work? Is escrow mandatory? How does the supplier get paid?',
    howSubtitle:
      'Engineered to adapt to your company’s existing corporate financial habits, without friction.',

    howStep1Title: '1. Do we need to install any protocol or software beforehand?',
    howStep1Desc:
      'No. Cooprail is a 100% cloud web SaaS. You and your team only need to sign in and map your active facilities and contractors.',

    howStep2Title: '2. What if my company does not want to pre-fund or use escrow?',
    howStep2Desc:
      'No problem! Digital escrow is 100% optional. You can continue operating on standard corporate net-30 / net-60 invoiced terms with official tax invoices.',

    howStep3Title: '3. How does it work if we choose guaranteed escrow?',
    howStep3Desc:
      'Order funds are deposited into an autonomous escrow vault (via bank transfer or digital USD). Funds stay locked and protected until technical delivery is verified.',

    howStep4Title: '4. How does the partner/vendor receive payment?',
    howStep4Desc:
      'As soon as your field engineer inspects the delivery and signs off on the platform, payment is released directly to the partner’s bank account or digital wallet.',

    ctaFinalTitle: 'Ready to simplify your operational supply chain?',
    ctaFinalSubtitle:
      'Create your organization workspace today or access the demo portal to explore.',
    ctaFinalBtn: 'Get Started for Free',
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


