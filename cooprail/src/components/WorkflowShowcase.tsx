'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  Sparkles,
  Building2,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  Camera,
  Check,
  ShieldCheck,
  Bot,
  Zap,
  Scale,
  Clock,
  ChevronRight,
  Eye,
  FileCheck2,
} from 'lucide-react';

interface StepData {
  number: string;
  shortTitle: string;
  icon: any;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}

const STEPS: StepData[] = [
  {
    number: '01',
    shortTitle: 'Cadastro do Setor',
    icon: Layers,
    title: 'Estruturação da Frente de Obra ou Planta',
    description:
      'Cadastre setores e frentes de trabalho em segundos, vinculando centro de custo e responsável. O ambiente inicia limpo e pronto para receber requisições auditadas.',
    badge: 'Estrutura Inicial',
    badgeColor: 'bg-sky-50 text-[#0284c7] border-sky-200',
  },
  {
    number: '02',
    shortTitle: 'Chamado de Campo',
    icon: FileText,
    title: 'Abertura de Chamado com Múltiplos Itens & Fotos',
    description:
      'Engenheiros no canteiro especificam a lista de materiais necessários, quantidades, unidades e anexam fotos reais da peça danificada ou croqui da obra.',
    badge: 'Requisição In-Loco',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    number: '03',
    shortTitle: 'Agente & Escopo',
    icon: Sparkles,
    title: 'Motor de Inteligência Estruturando o Escopo',
    description:
      'O agente técnico analisa os memoriais descritivos e editais, audita normas regulatórias e extrai tabelas de quantitativos para criar uma concorrência (RFQ) padronizada.',
    badge: 'Auditoria de Conformidade',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    number: '04',
    shortTitle: 'Envio de Cotação',
    icon: Building2,
    title: 'Portal do Fornecedor com CNPJ Validado em 3s',
    description:
      'Fornecedores acessam com credenciamento instantâneo via Receita Federal (sem cadastro moroso do ME) e enviam propostas Turnkey ou itens individuais.',
    badge: 'Homologação Instantânea',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    number: '05',
    shortTitle: 'Pedido de Compra (PO)',
    icon: ShoppingBag,
    title: 'Equalização de Propostas e Emissão da Ordem',
    description:
      'O setor de compras compara prazos, preços e conformidade técnica lado a lado, aprova a melhor decisão e emite o Pedido de Compra com liquidação flexível.',
    badge: 'Governança & PO Aprovada',
    badgeColor: 'bg-sky-50 text-[#0284c7] border-sky-200',
  },
];

export function WorkflowShowcase({ lang = 'pt' }: { lang?: 'pt' | 'en' }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play cycling across steps every 4.5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const current = STEPS[activeStep];
  const IconComponent = current.icon;

  return (
    <section className="py-24 bg-[#f8fafc] border-t border-slate-200 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Cabeçalho */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
            {lang === 'pt' ? 'Jornada Integrada de Suprimentos' : 'End-to-End Procurement Flow'}
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'pt'
              ? 'Como Funciona na Prática: Simples, Ágil e Blindado'
              : 'How It Works: Simple, Fast and Governed'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {lang === 'pt'
              ? 'Da abertura do chamado no canteiro até a aprovação da ordem de compra: veja como o fluxo opera sem atrito e sem planilhas manuais.'
              : 'From job site ticket submission to purchase order approval: see how the automated workflow operates smoothly.'}
          </p>
        </div>

        {/* Barra de Passos Interativa */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === activeStep;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveStep(idx);
                  setIsAutoPlaying(false);
                }}
                className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden ${
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
                    Passo {step.number}
                  </span>
                  <StepIcon
                    className={`w-4 h-4 ${isActive ? 'text-[#0284c7]' : 'text-slate-400'}`}
                  />
                </div>
                <span className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                  {step.shortTitle}
                </span>

                {/* Linha animada de progresso no step ativo */}
                {isActive && isAutoPlaying && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#0284c7] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Card Principal da Demonstração Visual Animada */}
        <div className="p-8 md:p-12 rounded-3xl bg-white border border-slate-200 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado Esquerdo: Descrição do Passo */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${current.badgeColor}`}>
                {current.badge}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Passo {current.number} de 05
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {current.title}
            </h3>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {current.description}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs">
              <button
                onClick={() => {
                  setActiveStep((prev) => (prev + 1) % STEPS.length);
                  setIsAutoPlaying(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-all cursor-pointer"
              >
                <span>Avançar Passo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsAutoPlaying((v) => !v)}
                className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer px-2"
              >
                {isAutoPlaying ? 'Pausar animação automática' : 'Retomar animação'}
              </button>
            </div>
          </div>

          {/* Lado Direito: Telas Animadas Simuladas (Zero Dados Reais) */}
          <div className="lg:col-span-7">
            {/* PASSO 1: Cadastro do Setor */}
            {activeStep === 0 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284c7]">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Novo Setor Estruturado</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: SEC-IND-01 • CC-2100</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ativo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">Nome da Frente</span>
                    <strong className="text-slate-800">Planta Industrial Alfa</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">Gestor Responsável</span>
                    <strong className="text-slate-800">Eng. Operacional de Campo</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-dashed border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>✓ Canteiro mapeado e liberado para abertura de chamados técnicos</span>
                  <span className="font-mono text-sky-600 font-bold">Pronto</span>
                </div>
              </div>
            )}

            {/* PASSO 2: Chamado Técnico com Fotos & Múltiplos Itens */}
            {activeStep === 1 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Chamado Operacional #CH-2026-012</span>
                      <span className="text-[10px] text-slate-500">Setor: Planta Industrial Alfa</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Urgência Alta
                  </span>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>1. Tubulação Industrial DN 800mm</span>
                    <strong className="text-slate-900">60 metros</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>2. Conexões Flangeadas & Juntas EPDM</span>
                    <strong className="text-slate-900">16 unidades</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>3. Kit de Fixação e Montagem Civil</span>
                    <strong className="text-slate-900">1 lote</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-[11px] text-[#0369a1]">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#0284c7]" />
                    <span>3 Fotos Técnicas & Croqui Anexados pelo Canteiro</span>
                  </div>
                  <span className="font-bold text-[#0284c7]">Visualizar Fotos</span>
                </div>
              </div>
            )}

            {/* PASSO 3: Agente de IA Estruturando o Escopo */}
            {activeStep === 2 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Motor Técnico de Conformidade</span>
                      <span className="text-[10px] text-slate-500 font-mono">Auditoria do Memorial Descritivo</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Bot className="w-3 h-3" /> Auditando Escopo...
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Extração Técnica de Quantitativos:</span>
                    <span className="text-emerald-700 font-bold">100% Concluído</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0284c7] h-full w-full rounded-full transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    ✓ Especificações técnicas padronizadas conforme normas do projeto.<br />
                    ✓ Demanda técnica estruturada sem valores fictícios para concorrência de mercado.
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>RFQ Gerada: <strong className="font-mono text-slate-800">RFQ-2026-IND-01</strong></span>
                  <span className="text-[#0284c7] font-bold">Disparar p/ Fornecedores →</span>
                </div>
              </div>
            )}

            {/* PASSO 4: Envio & Resposta da Cotação pelo Fornecedor */}
            {activeStep === 3 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Portal Aberto do Fornecedor</span>
                      <span className="text-[10px] text-slate-500 font-mono">Acesso por Link Único & CNPJ</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Receita Federal: ATIVA
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Proponente</span>
                      <strong className="text-slate-800">Empresa Fornecedora Industrial S.A.</strong>
                    </div>
                    <span className="text-[10px] font-mono bg-sky-50 text-[#0284c7] px-2 py-0.5 rounded border border-sky-200 font-bold">
                      Habilitação Automática (3s)
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">Modalidade: <strong>Turnkey (Peças + Serviço)</strong></span>
                    <span className="text-emerald-700 font-bold">Proposta Enviada</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Sem filas ou aprovação manual de cadastro. Resposta rápida.</span>
                  <span className="font-bold text-[#0284c7]">Pronta p/ Equalização</span>
                </div>
              </div>
            )}

            {/* PASSO 5: Equalização & Emissão do Pedido de Compra (PO) */}
            {activeStep === 4 && (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284c7]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Pedido de Compra #PO-2026-089</span>
                      <span className="text-[10px] text-slate-500 font-mono">Equalização Técnica Aprovada</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ordem Aprovada
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">Decisão de Suprimentos</span>
                    <strong className="text-slate-800">Menor Prazo & 100% Escopo</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">Forma de Liquidação</span>
                    <strong className="text-emerald-700">Faturamento a Prazo / Escrow</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
                  <span>✓ Contrato vinculado com governança e liberação após vistoria técnica.</span>
                  <span className="font-bold text-emerald-700">Concluído</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
