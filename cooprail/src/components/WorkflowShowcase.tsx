'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Building2,
  Scale,
  ShoppingBag,
  CheckCircle2,
  Camera,
  Check,
  Bot,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface StepContent {
  number: string;
  shortTitle: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
}

interface StepDefinition {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  pt: StepContent;
  en: StepContent;
}

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    number: '01',
    icon: FileText,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    pt: {
      number: '01',
      shortTitle: 'Chamado de Campo',
      badge: 'Requisição In-Loco',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      title: 'Abertura de Chamado com Múltiplos Itens & Fotos',
      description:
        'Engenheiros e encarregados no canteiro especificam materiais, quantidades, unidades e anexam fotos reais da obra ou croquis.',
    },
    en: {
      number: '01',
      shortTitle: 'Field Request',
      badge: 'On-Site Requisition',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      title: 'Field Ticket Creation with Multiple Items & Photos',
      description:
        'Field engineers and foremen specify materials, quantities, units, and attach real job site photos or technical sketches.',
    },
  },
  {
    number: '02',
    icon: Sparkles,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pt: {
      number: '02',
      shortTitle: 'Triagem & Extração por IA',
      badge: 'Canteiro → Compras',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Triagem de Suprimentos & Extração por IA',
      description:
        'A equipe de compras recebe o chamado do canteiro. A Inteligência Artificial analisa os memoriais descritivos e especificações técnicas, estruturando a concorrência (RFQ) sem digitação manual.',
    },
    en: {
      number: '02',
      shortTitle: 'AI Triage & Extraction',
      badge: 'Field → Procurement',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Procurement Triage & AI Spec Extraction',
      description:
        'Central procurement receives field tickets. Artificial Intelligence analyzes project specifications and technical standards, structuring the RFQ without manual data entry.',
    },
  },
  {
    number: '03',
    icon: Building2,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pt: {
      number: '03',
      shortTitle: 'Cotação de Parceiros',
      badge: 'Homologação Ágil',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Portal do Fornecedor com CNPJ Validado',
      description:
        'Fornecedores acessam por link direto com validação cadastral automática via Receita Federal (sem cadastro demorado) e enviam propostas Turnkey ou itens individuais.',
    },
    en: {
      number: '03',
      shortTitle: 'Partner Quotes',
      badge: 'Streamlined Onboarding',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Supplier Portal with Verified Tax ID',
      description:
        'Suppliers access via a direct link with automated Tax ID verification (no sluggish registration forms) and submit Turnkey or itemized proposals.',
    },
  },
  {
    number: '04',
    icon: Scale,
    badgeColor: 'bg-sky-50 text-[#0284c7] border-sky-200',
    pt: {
      number: '04',
      shortTitle: 'Equalização & Análise',
      badge: 'Decisão Técnica',
      badgeColor: 'bg-sky-50 text-[#0284c7] border-sky-200',
      title: 'Matriz Comparativa e Equalização Automática',
      description:
        'O comparador equaliza materiais, fretes e condições comerciais lado a lado, detecta discrepâncias de preço e gera o score técnico de conformidade.',
    },
    en: {
      number: '04',
      shortTitle: 'Equalization & Analysis',
      badge: 'Technical Decision',
      badgeColor: 'bg-sky-50 text-[#0284c7] border-sky-200',
      title: 'Comparative Matrix & Automated Equalization',
      description:
        'The comparator equalizes materials, freight and terms side-by-side, detects price anomalies, and scores technical specification compliance.',
    },
  },
  {
    number: '05',
    icon: ShoppingBag,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    pt: {
      number: '05',
      shortTitle: 'Pedido de Compra (PO)',
      badge: 'Governança & PO',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      title: 'Emissão da Ordem e Governança Financeira',
      description:
        'Aprovação formal com trilha de auditoria completa e liquidação a prazo ou via conta de garantia (opcional).',
    },
    en: {
      number: '05',
      shortTitle: 'Purchase Order (PO)',
      badge: 'Governance & PO',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      title: 'Order Issuance & Financial Governance',
      description:
        'Formal approval with complete audit trail and net-term invoicing or via optional escrow custody account.',
    },
  },
];

export function WorkflowShowcase({ lang = 'pt' }: { lang?: 'pt' | 'en' }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Check prefers-reduced-motion on mount and listen to changes (no SSR mismatch)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsAutoPlaying(false);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-play cycling across steps every 4.5 seconds (respeita prefers-reduced-motion)
  useEffect(() => {
    if (!isAutoPlaying) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEP_DEFINITIONS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const stepDef = STEP_DEFINITIONS[activeStep];
  const current = lang === 'en' ? stepDef.en : stepDef.pt;

  return (
    <section id="comofunciona" className="py-24 bg-[#f8fafc] border-t border-slate-200 px-6 lg:px-12 scroll-mt-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Cabeçalho */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
            {lang === 'pt' ? 'Jornada Integrada de Suprimentos' : 'End-to-End Procurement Flow'}
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'pt'
              ? 'Do chamado de campo ao pedido de compra em 5 passos'
              : 'From Field Request to Purchase Order in 5 Steps'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {lang === 'pt'
              ? 'Da abertura do chamado no canteiro até a aprovação da ordem de compra: veja como o fluxo opera sem atrito e sem planilhas manuais.'
              : 'From job site ticket submission to purchase order approval: see how the automated workflow operates smoothly without manual spreadsheets.'}
          </p>
        </div>

        {/* Barra de Passos Interativa: Carrossel Horizontal com Indicadores no Mobile e Grade de 5 no Desktop */}
        <div className="space-y-3">
          <div className="flex flex-nowrap sm:grid sm:grid-cols-5 gap-2.5 sm:gap-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory">
            {STEP_DEFINITIONS.map((def, idx) => {
              const StepIcon = def.icon;
              const stepContent = lang === 'en' ? def.en : def.pt;
              const isActive = idx === activeStep;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveStep(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden shrink-0 w-[170px] sm:w-auto snap-center ${
                    isActive
                      ? 'bg-sky-50/80 border border-sky-300 text-slate-900 shadow-xs'
                      : 'hover:bg-slate-50 text-slate-500 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-[#0284c7] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lang === 'pt' ? `Passo ${def.number}` : `Step ${def.number}`}
                    </span>
                    <StepIcon
                      className={`w-4 h-4 ${isActive ? 'text-[#0284c7]' : 'text-slate-400'}`}
                    />
                  </div>
                  <span className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                    {stepContent.shortTitle}
                  </span>

                  {/* Linha animada de progresso no step ativo */}
                  {isActive && isAutoPlaying && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#0284c7] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Indicador de Passos no Mobile */}
          <div className="flex sm:hidden items-center justify-center gap-1.5">
            {STEP_DEFINITIONS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveStep(idx);
                  setIsAutoPlaying(false);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === activeStep ? 'w-6 bg-[#0284c7]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Passo ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Card Principal da Demonstração Visual */}
        <div className="p-8 md:p-12 rounded-3xl bg-white border border-slate-200 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado Esquerdo: Descrição do Passo */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${current.badgeColor}`}>
                {current.badge}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {lang === 'pt' ? `Passo ${current.number} de 05` : `Step ${current.number} of 05`}
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {current.title}
            </h3>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {current.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={() => {
                  setActiveStep((prev) => (prev + 1) % STEP_DEFINITIONS.length);
                  setIsAutoPlaying(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-all cursor-pointer"
              >
                <span>{lang === 'pt' ? 'Avançar Passo' : 'Next Step'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsAutoPlaying((v) => !v)}
                className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer px-2 font-medium"
              >
                {isAutoPlaying
                  ? (lang === 'pt' ? 'Pausar animação' : 'Pause animation')
                  : (lang === 'pt' ? 'Retomar animação' : 'Resume animation')}
              </button>
            </div>
          </div>

          {/* Lado Direito: Telas Simuladas dos 5 Passos (PT e EN) */}
          <div className="lg:col-span-7">
            {/* PASSO 1: Chamado Técnico com Fotos & Múltiplos Itens */}
            {activeStep === 0 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {lang === 'pt' ? 'Chamado Operacional #CH-2026-012' : 'Field Ticket #CH-2026-012'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {lang === 'pt' ? 'Setor: Planta Industrial Alfa • CC-2100' : 'Sector: Industrial Plant Alpha • CC-2100'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    {lang === 'pt' ? 'Urgência Alta' : 'High Priority'}
                  </span>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>{lang === 'pt' ? '1. Tubulação Industrial DN 800mm' : '1. Industrial Piping DN 800mm'}</span>
                    <strong className="text-slate-900">{lang === 'pt' ? '60 metros' : '60 meters'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'pt' ? '2. Conexões Flangeadas & Juntas EPDM' : '2. Flanged Connections & EPDM Gaskets'}</span>
                    <strong className="text-slate-900">{lang === 'pt' ? '16 unidades' : '16 units'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'pt' ? '3. Kit de Fixação e Montagem Civil' : '3. Civil Mounting & Assembly Kit'}</span>
                    <strong className="text-slate-900">{lang === 'pt' ? '1 lote' : '1 lot'}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-[11px] text-[#0369a1]">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#0284c7]" />
                    <span>
                      {lang === 'pt'
                        ? '3 Fotos Técnicas & Croqui Anexados pelo Canteiro'
                        : '3 Job Site Photos & Technical Sketch Attached'}
                    </span>
                  </div>
                  <span className="font-bold text-[#0284c7]">{lang === 'pt' ? 'Visualizar' : 'View'}</span>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                  <span>{lang === 'pt' ? '✓ Requisitado pelo engenheiro de campo' : '✓ Requested by job site engineer'}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {lang === 'pt' ? 'Encaminhado p/ Compras' : 'Routed to Procurement'}
                  </span>
                </div>
              </div>
            )}

            {/* PASSO 2: Triagem & Extração por IA (Passagem Canteiro -> Compras) */}
            {activeStep === 1 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {lang === 'pt' ? 'Triagem de Compras & Motor de IA' : 'Procurement Triage & AI Engine'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lang === 'pt' ? 'Chamado #CH-2026-012 → RFQ Estruturada' : 'Ticket #CH-2026-012 → Structured RFQ'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    {lang === 'pt' ? 'Canteiro → Compras' : 'Field → Procurement'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {lang === 'pt' ? 'Origem da Demanda' : 'Demand Origin'}
                    </span>
                    <strong className="text-slate-800 text-[11px] block">
                      {lang === 'pt' ? 'Canteiro Frente Norte' : 'North Job Site'}
                    </strong>
                    <span className="text-[9px] text-slate-500 font-mono">CC-2100 • Eng. Resp.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {lang === 'pt' ? 'Destino da Triagem' : 'Triage Target'}
                    </span>
                    <strong className="text-[#0284c7] text-[11px] block">
                      {lang === 'pt' ? 'Mesa de Compras Central' : 'Central Procurement Desk'}
                    </strong>
                    <span className="text-[9px] text-slate-500 font-mono">RFQ-2026-IND-01</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold">
                      {lang === 'pt' ? 'Extração Automática do Memorial Técnico:' : 'Technical Spec Auto-Extraction:'}
                    </span>
                    <span className="text-emerald-700 font-bold font-mono">100% OK</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0284c7] h-full w-full rounded-full" />
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                    {lang === 'pt'
                      ? '✓ Itens, tolerâncias e normas regulatórias extraídos sem redigitação manual.'
                      : '✓ Specifications, tolerances, and standards extracted without manual re-keying.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>
                    {lang === 'pt' ? 'RFQ pronta para concorrência' : 'RFQ ready for bidding'}
                  </span>
                  <span className="text-[#0284c7] font-bold">
                    {lang === 'pt' ? 'Disparar Cotação →' : 'Publish to Vendors →'}
                  </span>
                </div>
              </div>
            )}

            {/* PASSO 3: Cotação de Parceiros com CNPJ Validado (Nomes Neutros Fictícios) */}
            {activeStep === 2 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {lang === 'pt' ? 'Portal Aberto do Fornecedor' : 'Supplier Open Portal'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lang === 'pt' ? 'Acesso Direto via Link & CNPJ' : 'Direct Access via Link & Tax ID'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {lang === 'pt' ? 'Receita Federal: ATIVA' : 'Federal Registry: ACTIVE'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {lang === 'pt' ? 'Fornecedor Proponente' : 'Bidding Vendor'}
                      </span>
                      <strong className="text-slate-800 text-[11px]">
                        {lang === 'pt' ? 'Fornecedor A (Distribuidor B2B)' : 'Supplier A (B2B Distributor)'}
                      </strong>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      {lang === 'pt' ? 'Homologação Ágil' : 'Instant Verification'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">
                      {lang === 'pt' ? 'Modalidade:' : 'Mode:'}{' '}
                      <strong className="text-slate-800">
                        {lang === 'pt' ? 'Turnkey (Material + Instalação)' : 'Turnkey (Material + Installation)'}
                      </strong>
                    </span>
                    <span className="text-emerald-700 font-bold">
                      {lang === 'pt' ? 'Proposta Enviada' : 'Proposal Submitted'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>
                    {lang === 'pt'
                      ? 'Sem cadastro demorado ou burocracia manual de portais legados.'
                      : 'No sluggish registration forms or legacy portal bottlenecks.'}
                  </span>
                  <span className="font-bold text-[#0284c7]">
                    {lang === 'pt' ? 'Pronta p/ Equalização' : 'Ready for Equalization'}
                  </span>
                </div>
              </div>
            )}

            {/* PASSO 4: Matriz Comparativa e Equalização Automática (Nomes Fictícios Fornecedor A/B/C) */}
            {activeStep === 3 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284c7]">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {lang === 'pt' ? 'Matriz Comparativa de Propostas' : 'Proposal Equalization Matrix'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lang === 'pt' ? 'RFQ-2026-IND-01 • 3 Propostas Recebidas' : 'RFQ-2026-IND-01 • 3 Bids Received'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#0284c7] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                    {lang === 'pt' ? 'Equalização Auditada' : 'Audited Equalization'}
                  </span>
                </div>

                {/* Grid das 3 Propostas com Nomes Fictícios Fornecedor A/B/C */}
                <div className="space-y-2 text-xs">
                  {/* Proposta 1 (Recomendada) */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-[11px]">
                          {lang === 'pt' ? 'Fornecedor A' : 'Supplier A'}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                          {lang === 'pt' ? 'Recomendada' : 'Best Value'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {lang === 'pt' ? 'Prazo: 12 dias • Frete equalizado CIF' : 'Lead time: 12 days • Equalized CIF'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm block">R$ 84.500</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700">
                        Score: 98%
                      </span>
                    </div>
                  </div>

                  {/* Proposta 2 */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-[11px]">
                          {lang === 'pt' ? 'Fornecedor B' : 'Supplier B'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {lang === 'pt' ? 'Prazo: 8 dias • Frete FOB (+ R$ 4.200)' : 'Lead time: 8 days • FOB freight (+ R$ 4,200)'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 text-xs block">R$ 96.200</span>
                      <span className="text-[10px] font-mono text-slate-600">
                        Score: 92%
                      </span>
                    </div>
                  </div>

                  {/* Proposta 3 (Alerta de Preço Discrepante) */}
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 text-[11px]">
                          {lang === 'pt' ? 'Fornecedor C' : 'Supplier C'}
                        </span>
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      </div>
                      <span className="text-[10px] text-amber-700">
                        {lang === 'pt' ? 'Alerta: Preço 35% acima da média histórica' : 'Alert: Price 35% above historical mean'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 text-xs block">R$ 115.000</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Score: 84%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>
                    {lang === 'pt' ? 'Base técnica padronizada' : 'Standardized baseline'}
                  </span>
                  <span className="font-bold text-[#0284c7]">
                    {lang === 'pt' ? 'Decisão Pronta p/ PO →' : 'Ready for PO Sign-off →'}
                  </span>
                </div>
              </div>
            )}

            {/* PASSO 5: Emissão da Ordem (PO) & Liquidação a Prazo ou Conta de Garantia */}
            {activeStep === 4 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284c7]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {lang === 'pt' ? 'Pedido de Compra #PO-2026-089' : 'Purchase Order #PO-2026-089'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lang === 'pt' ? 'Equalização Técnica Aprovada' : 'Technical Equalization Approved'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'pt' ? 'Ordem Aprovada' : 'Order Approved'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {lang === 'pt' ? 'Decisão de Suprimentos' : 'Procurement Decision'}
                    </span>
                    <strong className="text-slate-800 text-[11px] block">
                      {lang === 'pt' ? 'Fornecedor A (Score 98%)' : 'Supplier A (Score 98%)'}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      {lang === 'pt' ? 'R$ 84.500 • 12 dias' : 'R$ 84,500 • 12 days'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {lang === 'pt' ? 'Forma de Liquidação' : 'Settlement Method'}
                    </span>
                    <strong className="text-emerald-700 text-[11px] block">
                      {lang === 'pt' ? 'A Prazo ou Conta de Garantia' : 'Net Terms or Custody Account'}
                    </strong>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {lang === 'pt' ? 'Opcional por contrato' : 'Optional per agreement'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950 flex items-center justify-between">
                  <span>
                    {lang === 'pt'
                      ? '✓ Contrato vinculado com governança e liberação após vistoria técnica.'
                      : '✓ Contract linked with formal audit trail and release upon site verification.'}
                  </span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {lang === 'pt' ? 'Concluído' : 'Completed'}
                  </span>
                </div>
              </div>
            )}

            {/* Legenda Discreta para Demonstração sob o Mockup */}
            <p className="text-[10px] text-slate-400 mt-2 text-center sm:text-right italic font-mono">
              * {lang === 'pt' ? 'Dados ilustrativos para demonstração da interface.' : 'Illustrative data for interface demonstration.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
