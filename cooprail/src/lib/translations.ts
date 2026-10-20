export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    // Landing Page Navigation
    navOnSite: 'Diferenciais',
    navGovernance: 'Governança',
    navHowItWorks: 'Como funciona',
    navFaq: 'Dúvidas Frequentes',
    navEnter: 'Acessar Plataforma',
    navSignIn: 'Entrar',

    // Hero Section
    heroBadge: 'AUDITORIA TÉCNICA & GOVERNANÇA BLINDADA',
    heroTitlePrefix: 'Compras Inteligentes através de ',
    heroTitleHighlight: 'Cotações Integradas.',
    heroTitleSuffix: '',
    heroSubtitle:
      'Centralize toda a gestão de suprimentos da sua obra em um só lugar. Automatize cotações, audite parceiros e garanta o melhor negócio com governança total.',
    heroCtaPrimary: 'Solicitar demonstração',
    heroCtaSecondary: 'Conhecer Funcionalidades',
    heroCtaSupplier: 'Fornecedor',
    heroBenefit1: 'Homologação em 3s',
    heroBenefit1Sub: 'via Receita Federal',
    heroBenefit2: '+ Agilidade',
    heroBenefit2Sub: 'Cotações Equalizadas',
    heroBenefit3: 'Transparência',
    heroBenefit3Sub: 'Auditoria & Compliance',
    heroBenefit4: 'Governança Blindada',
    heroBenefit4Sub: 'Segregação de Funções',

    // 2.1 Antes × Depois (Comparativo)
    beforeAfterHeading: 'COMPARAÇÃO DE PROCESSO',
    beforeAfterTitle: 'Esqueça as planilhas. Compre com base técnica.',
    beforeAfterSubtitle:
      'Veja como a Cooprail transforma a rotina de compras da sua operação eliminando retrabalho, riscos de fraude e compras com sobrepreço.',
    beforeAfterCol1Title: 'Hoje (Processo Tradicional)',
    beforeAfterCol1Item1: 'Planilhas manuais dispersas e retrabalho constante de digitação',
    beforeAfterCol1Item2: 'Portais lentos e semanas de espera para homologar novos fornecedores',
    beforeAfterCol1Item3: 'Cotações sem base técnica comparável e preços distorcidos',
    beforeAfterCol1Item4: 'Aprovações descentralizadas sem rastreabilidade ou trilha de auditoria',
    beforeAfterCol2Title: 'Com a Cooprail',
    beforeAfterCol2Item1: 'Extração automática de itens, tabelas e normas por Inteligência Artificial',
    beforeAfterCol2Item2: 'Homologação instantânea via Receita Federal sem cadastro demorado',
    beforeAfterCol2Item3: 'Matriz comparativa equalizada com alerta automático de sobrepreço',
    beforeAfterCol2Item4: 'Segregação de funções e histórico 100% auditável para a diretoria',

    // 2.2 Três Diferenciais em Destaque
    diffHeading: 'DIFERENCIAIS EXCLUSIVOS',
    diffTitle: 'Tecnologia projetada para a complexidade da indústria pesada.',
    diffSubtitle:
      'Da leitura de pranchas de engenharia à decisão de compra: veja como a plataforma resolve os três maiores gargalos de suprimentos.',

    // Diferencial 1: Leitura de Memoriais por IA
    diff1Tag: 'IA & ENGENHARIA',
    diff1Title: 'IA que lê memoriais técnicos e cadernos de encargos',
    diff1Desc:
      'Suba arquivos em PDF ou planilhas de projetos. Nossa Inteligência Artificial identifica escopos, quantitativos e normas regulatórias em segundos, eliminando a digitação manual.',
    diff1Bullet1: 'Extração instantânea de itens, tolerâncias e memoriais de cálculo',
    diff1Bullet2: 'Demandas reais, prontas para concorrência',
    diff1Bullet3: 'Dossiê técnico padronizado pronto para envio imediato aos fornecedores',

    // Diferencial 2: Equalização Automática de Propostas
    diff2Tag: 'DECISÃO & EQUALIZAÇÃO',
    diff2Title: 'Comparação e equalização automática de propostas',
    diff2Desc:
      'Avalie orçamentos concorrentes exatamente na mesma régua. Nosso algoritmo decompõe materiais, fretes e serviços, sinalizando discrepâncias e calculando o score técnico de cada fornecedor.',
    diff2Bullet1: 'Equalização algorítmica entre propostas Turnkey e fornecimento parcial',
    diff2Bullet2: 'Alerta visual de preços fora da curva e sobrepreço em relação à média',
    diff2Bullet3: 'Histórico auditável completo para embasar aprovações de diretoria',

    // Diferencial 3: Segregação Canteiro × Compras
    diff3Tag: 'SEGREGAÇÃO DE FUNÇÕES',
    diff3Title: 'O canteiro requisita a obra. Compras negocia e aprova.',
    diff3Desc:
      'Blinde sua empresa contra fraudes e favorecimentos. O pessoal de campo relata a necessidade técnica com fotos e croquis sem nunca ter acesso a preços ou contato direto com fornecedores.',
    diff3Bullet1: 'Abertura rápida de chamados com fotos e especificações in-loco',
    diff3Bullet2: 'Mesa de suprimentos centraliza a negociação e concorrência comercial',
    diff3Bullet3: 'Rastreabilidade com data, hora e responsável por cada liberação',
    diffLinkWorkflow: 'Ver no fluxo completo',

    // 2.4 Funcionalidades de Apoio (4 Colunas)
    supportHeading: 'RECURSOS DE APOIO',
    supportTitle: 'Robustez operacional de ponta a ponta',
    supportSubtitle:
      'Tudo o que sua equipe precisa para operar com velocidade e conformidade contínua.',
    support1Title: 'Homologação por CNPJ',
    support1Desc:
      'Consulta em tempo real à Receita Federal para validar situação fiscal e cadastral de novos parceiros sem burocracia.',
    support2Title: 'Consolidação de Fretes',
    support2Desc:
      'Agrupamento inteligente de demandas de diferentes frentes de obra para cortar custos de frete e mobilização.',
    support3Title: 'Conta de Garantia (Opcional)',
    support3Desc:
      'Custódia financeira flexível (Smart Escrow): os recursos ficam protegidos e só são liberados após o aceite técnico.',
    support4Title: 'Trilha de Auditoria',
    support4Desc:
      'Histórico completo e rastreável de acessos, cotações recebidas, pareceres técnicos e aprovações corporativas.',

    // 2.6 FAQ Reformulado (Acordeão)
    faqHeading: 'TIRA-DÚVIDAS',
    faqTitle: 'Perguntas Frequentes',
    faqSubtitle:
      'Esclarecimentos diretos sobre implantação, modalidades de faturamento e governança da plataforma.',
    faqQ1: 'Preciso instalar algum software ou servidor na minha empresa?',
    faqA1:
      'Não. A Cooprail é 100% em nuvem (SaaS). Você e sua equipe só precisam de um navegador web para acessar o portal seguro e começar a estruturar demandas imediatamente.',
    faqQ2: 'E se a minha empresa não quiser usar a conta de garantia?',
    faqA2:
      'O uso da conta de garantia é 100% opcional. Sua empresa pode continuar operando no modelo corporativo tradicional a prazo (faturado 30/60/90 dias com boleto bancário e Nota Fiscal direta).',
    faqQ3: 'Como funciona a operação se optarmos pela conta de garantia?',
    faqA3:
      'O valor da ordem de compra fica protegido em uma custódia de garantia segura e só é liberado ao parceiro após o fiscal da obra validar tecnicamente a entrega no canteiro.',
    faqQ4: 'Como o fornecedor parceiro recebe o pagamento?',
    faqA4:
      'Assim que a comissão técnica assina o aceite de entrega na plataforma, a liberação ocorre diretamente para a conta bancária homologada da empresa parceira.',

    ctaFinalTitle: 'Pronto para modernizar a esteira de suprimentos da sua operação?',
    ctaFinalSubtitle: 'Fale com nossa equipe e veja a Cooprail em operação.',
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
    navOnSite: 'Differentiators',
    navGovernance: 'Governance',
    navHowItWorks: 'How it works',
    navFaq: 'FAQ',
    navEnter: 'Launch Platform',
    navSignIn: 'Sign In',

    // Hero Section
    heroBadge: 'TECHNICAL AUDIT & RIGOROUS GOVERNANCE',
    heroTitlePrefix: 'Intelligent Procurement through ',
    heroTitleHighlight: 'Integrated Quotes.',
    heroTitleSuffix: '',
    heroSubtitle:
      'Centralize all supply chain management for your construction and industrial projects in one place. Automate RFQs, audit partners, and secure the best deal with total governance.',
    heroCtaPrimary: 'Request a Demo',
    heroCtaSecondary: 'Explore Features',
    heroCtaSupplier: 'Supplier Portal',
    heroBenefit1: 'Verification in 3s',
    heroBenefit1Sub: 'Federal Registry API',
    heroBenefit2: '+ Agility',
    heroBenefit2Sub: 'Equalized Proposals',
    heroBenefit3: 'Transparency',
    heroBenefit3Sub: 'Audit & Compliance',
    heroBenefit4: 'Rigorous Governance',
    heroBenefit4Sub: 'Duty Segregation',

    // 2.1 Before × After
    beforeAfterHeading: 'PROCESS COMPARISON',
    beforeAfterTitle: 'Forget spreadsheets. Procure with technical precision.',
    beforeAfterSubtitle:
      'See how Cooprail transforms your industrial procurement routine by eliminating manual rework, fraud risks, and overpriced bids.',
    beforeAfterCol1Title: 'Traditional Process (Today)',
    beforeAfterCol1Item1: 'Scattered manual spreadsheets and tedious data re-entry',
    beforeAfterCol1Item2: 'Slow legacy portals and weeks spent onboarding vendors',
    beforeAfterCol1Item3: 'Bids lacking comparable technical baselines and hidden margins',
    beforeAfterCol1Item4: 'Decentralized approvals without traceable audit records',
    beforeAfterCol2Title: 'With Cooprail',
    beforeAfterCol2Item1: 'Instant extraction of items, units, and engineering tolerances via AI',
    beforeAfterCol2Item2: 'Fast tax ID onboarding via Federal Registry with zero red tape',
    beforeAfterCol2Item3: 'Equalized comparison matrix with real-time price outlier alerts',
    beforeAfterCol2Item4: 'Strict segregation of duties and 100% auditable managerial trail',

    // 2.2 Three Core Differentiators
    diffHeading: 'EXCLUSIVE DIFFERENTIATORS',
    diffTitle: 'Technology engineered for heavy industry complexity.',
    diffSubtitle:
      'From blueprint parsing to purchase approvals: discover how Cooprail resolves the three biggest procurement bottlenecks.',

    // Differential 1: AI Tech Spec Reading
    diff1Tag: 'AI & ENGINEERING',
    diff1Title: 'AI that extracts engineering specs with zero manual entry',
    diff1Desc:
      'Upload technical PDFs and project spreadsheets. Our AI parses scopes, bill-of-quantities, and regulatory standards in seconds, eliminating manual data entry.',
    diff1Bullet1: 'Instant parsing of technical scopes, tables, and tolerances',
    diff1Bullet2: 'Genuine demands, structured for competitive bidding',
    diff1Bullet3: 'Standardized bidding dossier ready for immediate vendor dispatch',

    // Differential 2: Automated Proposal Equalization
    diff2Tag: 'DECISION & EQUALIZATION',
    diff2Title: 'Automated proposal comparison and equalization',
    diff2Desc:
      'Evaluate competing bids against the exact same baseline. Our algorithm isolates materials, freight, and services, highlighting cost anomalies and scoring vendor compliance.',
    diff2Bullet1: 'Algorithmic equalization between Turnkey and partial supply bids',
    diff2Bullet2: 'Visual alerts for markups and historical pricing outliers',
    diff2Bullet3: 'Comprehensive audit trail supporting executive board approvals',

    // Differential 3: Segregation Field × Procurement
    diff3Tag: 'DUTY SEGREGATION',
    diff3Title: 'Job sites request needs. Procurement negotiates and approves.',
    diff3Desc:
      'Safeguard your company against fraud and favoritism. Field crews log technical requests with photos and sketches without ever accessing pricing or contacting vendors.',
    diff3Bullet1: 'Fast mobile ticket creation with on-site photos and specs',
    diff3Bullet2: 'Central procurement desk conducts commercial negotiations',
    diff3Bullet3: 'Complete audit trail with timestamps and sign-off identification',
    diffLinkWorkflow: 'View full workflow',

    // 2.4 Support Features (4 Columns)
    supportHeading: 'SUPPORT CAPABILITIES',
    supportTitle: 'End-to-end operational robustness',
    supportSubtitle:
      'Everything your procurement organization needs to operate fast and with continuous compliance.',
    support1Title: 'Instant Tax ID Check',
    support1Desc:
      'Real-time Federal Registry queries validating fiscal standing and partner registration instantly.',
    support2Title: 'Freight Consolidation',
    support2Desc:
      'Intelligent batching of demands across active job sites to cut transit and mobilization expenses.',
    support3Title: 'Guarantee Custody Account',
    support3Desc:
      'Flexible escrow protection: funds stay locked and are only released after formal site delivery acceptance.',
    support4Title: 'Tamper-Proof Audit Trail',
    support4Desc:
      'Complete and traceable audit trail of RFQ submissions, technical reviews, and managerial sign-offs.',

    // 2.6 Revamped FAQ (Accordion)
    faqHeading: 'FAQ',
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle:
      'Clear answers regarding deployment, corporate invoicing options, and platform governance.',
    faqQ1: 'Do I need to install software or servers on premise?',
    faqA1:
      'No. Cooprail is 100% cloud SaaS. You and your team only need a modern web browser to access the secure portal and start structuring demands right away.',
    faqQ2: 'What if our company prefers standard invoiced corporate terms?',
    faqA2:
      'The custody guarantee account is 100% optional. You can continue operating on standard corporate net-30 / net-60 invoiced terms with official direct tax invoices.',
    faqQ3: 'How does it work if we choose the guarantee custody account?',
    faqA3:
      'Order funds are placed in a secure custody vault. Funds stay protected and are only released to the vendor after your site engineer officially validates delivery.',
    faqQ4: 'How does the supplier partner receive the payment?',
    faqA4:
      'As soon as site supervisors confirm delivery receipt on the platform, funds are settled directly into the supplier’s verified corporate bank account.',

    ctaFinalTitle: 'Ready to modernize your industrial supply chain?',
    ctaFinalSubtitle: 'Talk to our team and experience Cooprail in action.',
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

