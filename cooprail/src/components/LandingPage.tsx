'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Scale,
  Check,
  Sparkles,
  ChevronDown,
  Truck,
  History,
  BarChart3,
  CheckCheck,
  Globe,
} from 'lucide-react';
import { Language, translations } from '@/lib/translations';
import { WorkflowShowcase } from '@/components/WorkflowShowcase';

interface LandingPageProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onOpenLogin: () => void;
  onEnterDemo?: () => void;
}

export function LandingPage({ lang, onToggleLang, onOpenLogin, onEnterDemo }: LandingPageProps) {
  const t = translations[lang];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);


  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-[#0284c7] selection:text-white font-sans overflow-x-hidden">
      {/* 1. Header com a Logo Oficial da Cooprail */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 lg:px-12 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/cooprail-logo.png"
            alt="COOPRAIL"
            className="h-8 md:h-9 w-auto object-contain"
          />
        </div>

        {/* Links de Navegação */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#diferenciais" className="hover:text-[#0284c7] transition-colors">
            {t.navOnSite}
          </a>
          <a href="#governanca" className="hover:text-[#0284c7] transition-colors">
            {t.navGovernance}
          </a>
          <a href="#comofunciona" className="hover:text-[#0284c7] transition-colors">
            {t.navHowItWorks}
          </a>
        </nav>

        {/* Seletor de Idioma & Botões de Acesso */}
        <div className="flex items-center gap-3">
          {/* Toggle de Idioma PT / EN */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-xs font-mono">
            <button
              onClick={() => onToggleLang('pt')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                lang === 'pt'
                  ? 'bg-white text-[#0284c7] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Português"
            >
              PT
            </button>
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                lang === 'en'
                  ? 'bg-white text-[#0284c7] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Link direto para o Portal do Fornecedor */}
          <a
            href="/portal-parceiro"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.heroCtaSupplier}</span>
          </a>

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <span>{t.navEnter}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section Moderna em Duas Colunas com Fundo Fluido & Mockup 3D */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-[#f8fafc] border-b border-slate-200/80 pt-16 lg:pt-20 pb-12 lg:pb-14 scroll-mt-16">
        {/* Elementos Decorativos de Fundo (Gradientes Suaves & Formas Fluidas SaaS) */}
        <div className="absolute -top-32 -right-32 w-[620px] h-[620px] rounded-full bg-gradient-to-br from-sky-200/50 via-sky-100/25 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-sky-100/40 via-indigo-50/30 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Coluna Esquerda: Texto de Impacto, Hierarquia Tipográfica e Ações */}
            <div className="flex flex-col gap-6 lg:gap-8 text-left max-w-xl">
              {/* Título Principal Alinhado à Esquerda com Peso 900 (font-black), leading-[1.12] e degradê uniforme nas duas palavras */}
              <h1
                style={{ fontWeight: 900 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[50px] font-black tracking-tight text-slate-900 leading-[1.12]"
              >
                {t.heroTitlePrefix}
                <span className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] bg-clip-text text-transparent block sm:inline">
                  {t.heroTitleHighlight}
                </span>
                {t.heroTitleSuffix}
              </h1>

              {/* Parágrafo de Apoio com Contraste Otimizado WCAG AA */}
              <p className="text-base sm:text-lg lg:text-[17px] text-slate-700 leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Chamadas para Ação: Primário 'Solicitar demonstração' (#contato) e Secundário 'Conhecer Funcionalidades' */}
              <div className="flex flex-wrap items-center gap-4">
                {/* CTA Primário: Solicitar demonstração */}
                {/* TODO: Integrar modal ou formulário dedicado de demonstração na âncora #contato */}
                <a
                  href="#contato"
                  className="w-full sm:w-[230px] h-[50px] rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white text-sm font-bold shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 group"
                >
                  <span>{t.heroCtaPrimary}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </a>

                <a
                  href="#diferenciais"
                  className="w-full sm:w-[230px] h-[50px] rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-bold transition-all shadow-xs hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>{t.heroCtaSecondary}</span>
                </a>
              </div>

              {/* Selos de Confiança: Alinhados em grade de 3 colunas no desktop e empilhados no mobile, contraste WCAG AA */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80 text-xs sm:text-[13px] text-slate-800 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="whitespace-nowrap">Receita Federal em 3s</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span className="whitespace-nowrap">Equalização auditada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="whitespace-nowrap">Governança blindada</span>
                </div>
              </div>

              {/* TODO: Prova Social - Faixa desativada por padrão até definição dos clientes e métricas auditadas reais */}
              {/* {SHOW_SOCIAL_PROOF && <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">...</div>} */}
            </div>

            {/* Coluna Direita: Mockup Tridimensional & Interface Rica Dinâmica */}
            <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end items-center">
              {/* Efeito de Profundidade 3D / Isometria com Respiro Superior para Cards Flutuantes */}
              <div className="relative [perspective:1400px] pt-14 pb-4 px-3 sm:px-6 w-full max-w-[620px]">
                {/* Glow de Iluminação Superior */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-80 h-40 bg-sky-400/20 blur-3xl pointer-events-none rounded-full" />

                {/* Card Flutuante 1 (Top-Left): Elevado para o topo externo, desobstruindo totalmente o logo COOPRAIL e o título do dashboard */}
                <div className="absolute -top-10 sm:-top-12 left-0 sm:-left-4 lg:-left-6 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xl shadow-slate-900/10 space-y-2 hidden md:block w-44 transition-transform hover:-translate-y-1 animate-hero-float-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                        <BarChart3 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">Auditoria</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      100%
                    </span>
                  </div>
                  {/* Gráfico de barras ascendente */}
                  <div className="h-8 flex items-end justify-between gap-1.5 px-1 pt-1">
                    <div className="w-full bg-sky-200/60 rounded-t h-[40%]" />
                    <div className="w-full bg-sky-300/80 rounded-t h-[60%]" />
                    <div className="w-full bg-[#0284c7] rounded-t h-[80%]" />
                    <div className="w-full bg-emerald-400 rounded-t h-[65%]" />
                    <div className="w-full bg-emerald-500 rounded-t h-[100%]" />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                    <span>Auditoria Técnica</span>
                    <span className="text-emerald-600 font-bold">Auditado</span>
                  </div>
                </div>

                {/* Card Flutuante 2 (Top-Right): Elevado para o topo externo, desobstruindo o status Live Sync e o canto escuro */}
                <div className="absolute -top-10 sm:-top-12 right-0 sm:-right-4 lg:-right-6 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xl shadow-slate-900/10 space-y-2 hidden md:block w-48 transition-transform hover:-translate-y-1 animate-hero-float-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">Fluxo cotação</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-800 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Recepção da cotação</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-sky-50/80 border border-sky-100 text-[#0369a1] font-medium">
                      <Check className="w-3 h-3 text-[#0284c7] shrink-0" />
                      <span>Conexão de canteiro</span>
                    </div>
                  </div>
                </div>

                {/* Janela Principal do Dashboard Cooprail com Efeito Isométrico */}
                <div className="w-full max-w-[580px] h-[410px] transform lg:[transform:rotateY(-5deg)_rotateX(3deg)] transition-all duration-500 hover:[transform:rotateY(0deg)_rotateX(0deg)] bg-white/95 rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(2,132,199,0.20)] overflow-hidden flex flex-col justify-between">
                  {/* Top Bar do Sistema */}
                  <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="h-4 w-px bg-slate-700 ml-1" />
                      <div className="flex items-center gap-1.5 text-white text-[11px] font-bold">
                        <img src="/cooprail-logo.png" alt="Cooprail" className="h-3.5 w-auto object-contain brightness-0 invert" />
                        <span className="text-slate-300 font-normal">|</span>
                        <span className="text-slate-200">Dashboard</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-600/40 text-[10px] text-sky-300 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                        Live Sync
                      </span>
                    </div>
                  </div>

                  {/* Corpo do Dashboard */}
                  <div className="p-4 sm:p-5 space-y-4 grow">
                    {/* Barra de Sub-Navegação & Status com Microcopy Atualizada */}
                    <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-medium text-slate-500">
                        <span className="px-2.5 py-1 rounded-md bg-sky-50 text-[#0284c7] font-bold">Visão Geral</span>
                        <span className="hover:text-slate-700 cursor-pointer">Cotações</span>
                        <span className="hover:text-slate-700 cursor-pointer">Canteiros</span>
                        <span className="hover:text-slate-700 cursor-pointer">Documentos</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                        v2.4 • Trilha de auditoria
                      </span>
                    </div>

                    {/* Linha de 3 Métricas Principais (Cards) com Microcopy Atualizada */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-500 font-medium block">Fornecedores</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-black text-slate-900">275</span>
                          <span className="text-[9px] font-bold text-emerald-600">+12 novos</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1">
                        <span className="text-[10px] text-[#0369a1] font-medium block">Propostas no Mês</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-black text-[#0284c7]">349</span>
                          <span className="text-[9px] font-bold text-[#0284c7]">Equalizadas</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                        <span className="text-[10px] text-emerald-800 font-medium block">Economia vs. orçamento</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-black text-emerald-700">R$ 230k</span>
                          <span className="text-[9px] font-bold text-emerald-600">-18.4%</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabela de Demandas e Cotações Equalizadas */}
                    <div className="rounded-xl border border-slate-200/80 overflow-hidden">
                      <div className="bg-slate-100/70 px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span>Análise de cotações</span>
                        <span className="text-slate-400 font-normal">Tempo real</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-[11px]">
                        <div className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <div>
                              <span className="font-semibold text-slate-900 block leading-tight">
                                Tubulação PEAD DN 800mm
                              </span>
                              <span className="text-[9px] text-slate-500">Canteiro Central • CC-2100</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block leading-tight">R$ 84.500</span>
                            <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                              98% Aprovado
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                            <div>
                              <span className="font-semibold text-slate-900 block leading-tight">
                                Conexões Flangeadas & Válvulas
                              </span>
                              <span className="text-[9px] text-slate-500">Planta Industrial • CC-1400</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block leading-tight">R$ 38.200</span>
                            <span className="text-[9px] font-mono text-sky-600 font-bold bg-sky-50 px-1.5 py-0.2 rounded">
                              3 Propostas
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <div>
                              <span className="font-semibold text-slate-900 block leading-tight">
                                Concreto Usinado FCK 35
                              </span>
                              <span className="text-[9px] text-slate-500">Frente de Obra Norte</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block leading-tight">R$ 112.000</span>
                            <span className="text-[9px] font-mono text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
                              Equalizando
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Flutuante 3 (Bottom-Right): Posicionado no canto inferior direito externo, sem cobrir o status 'Equalizando' da linha Concreto Usinado */}
                <div className="absolute -bottom-2 right-0 sm:-right-4 lg:-right-6 z-30 bg-white/95 backdrop-blur-md border border-sky-200 rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-slate-900/10 flex items-center gap-2.5 w-[215px] h-[52px] transition-transform hover:-translate-y-1 hidden md:flex animate-hero-float-in">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] shrink-0">
                    <Globe className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-900 whitespace-nowrap">3s via Receita Federal</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight truncate">
                      CNPJ e situação ativa validados.
                    </p>
                  </div>
                </div>

                {/* Base Isométrica & Conexão Física (Canteiro & Indústria Conectados) - Alinhado à esquerda com largura proporcional */}
                <div className="mt-4 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-[11px] text-slate-600 shadow-xs max-w-[340px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-slate-800">Canteiro & Planta Industrial</span>
                  </div>
                  <div className="flex items-center gap-1 text-sky-600 font-mono text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-ping" />
                    <span>Auditado</span>
                  </div>
                </div>

                {/* Legenda Discreta para Demonstração */}
                <p className="text-[10px] text-slate-400 mt-2 text-center lg:text-left italic font-sans">
                  * {lang === 'pt' ? 'Dados ilustrativos para demonstração da interface.' : 'Illustrative data for interface demonstration.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.1 Antes × Depois: Comparativo de Processo */}
      <section id="comparativo" className="py-20 border-t border-slate-200 bg-white px-6 lg:px-12 scroll-mt-16">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Cabeçalho */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
              {t.beforeAfterHeading}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t.beforeAfterTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.beforeAfterSubtitle}
            </p>
          </div>

          {/* Cards Comparativos Lado a Lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Coluna 1: Hoje (Processo Tradicional) */}
            <div className="p-7 md:p-8 rounded-3xl bg-rose-50/30 border border-rose-200/80 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {t.beforeAfterCol1Title}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                    {lang === 'pt' ? 'Gargalos & Riscos' : 'Friction & Risks'}
                  </span>
                </div>

                <div className="space-y-3 text-xs md:text-sm text-slate-700">
                  <div className="p-3.5 rounded-xl bg-white/90 border border-rose-100 flex items-start gap-3 shadow-2xs">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{t.beforeAfterCol1Item1}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/90 border border-rose-100 flex items-start gap-3 shadow-2xs">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{t.beforeAfterCol1Item2}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/90 border border-rose-100 flex items-start gap-3 shadow-2xs">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{t.beforeAfterCol1Item3}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/90 border border-rose-100 flex items-start gap-3 shadow-2xs">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{t.beforeAfterCol1Item4}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Com a Cooprail */}
            <div className="p-7 md:p-8 rounded-3xl bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 border-2 border-sky-300 space-y-5 shadow-lg shadow-sky-600/5 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-sky-200">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                    {t.beforeAfterCol2Title}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0284c7] text-white">
                    {lang === 'pt' ? 'Eficiência & Governança' : 'Speed & Compliance'}
                  </span>
                </div>

                <div className="space-y-3 text-xs md:text-sm text-slate-800 font-medium">
                  <div className="p-3.5 rounded-xl bg-white border border-sky-200 shadow-2xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                    <span className="leading-snug">{t.beforeAfterCol2Item1}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-sky-200 shadow-2xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                    <span className="leading-snug">{t.beforeAfterCol2Item2}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-sky-200 shadow-2xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                    <span className="leading-snug">{t.beforeAfterCol2Item3}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-sky-200 shadow-2xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                    <span className="leading-snug">{t.beforeAfterCol2Item4}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.2 Três Diferenciais em Destaque (Layout Zig-Zag) */}
      <section id="diferenciais" className="py-24 border-t border-slate-200 bg-[#f8fafc] px-6 lg:px-12 space-y-24 scroll-mt-16">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Cabeçalho da Seção de Diferenciais */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
              {t.diffHeading}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t.diffTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.diffSubtitle}
            </p>
          </div>

          {/* Diferencial 1: IA lê o memorial (Texto na Esquerda, Mockup na Direita) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Coluna Texto */}
            <div className="space-y-6">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-100 text-[#0284c7] uppercase tracking-wider">
                {t.diff1Tag}
              </span>
              <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t.diff1Title}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {t.diff1Desc}
              </p>
              <div className="space-y-2.5 pt-1 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff1Bullet1}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff1Bullet2}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff1Bullet3}</span>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href="#hero"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <span>{t.heroCtaPrimary}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Coluna Mockup: Visual Documento Técnico + Extração de Quantitativos */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      Memorial_Descritivo_Rev04.pdf
                    </span>
                    <span className="text-[10px] text-slate-500">
                      NBR 15575 / ASME B31.3 • Extração Instantânea
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Extraído
                </span>
              </div>

              {/* Tabela de Itens e Quantitativos Estruturados */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-[10px] font-mono font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">
                  <div className="col-span-6">ITEM / ESPECIFICAÇÃO</div>
                  <div className="col-span-3 text-center">QUANTIDADE</div>
                  <div className="col-span-3 text-right">STATUS IA</div>
                </div>
                <div className="grid grid-cols-12 text-[11px] p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 items-center">
                  <div className="col-span-6 font-medium text-slate-800">Tubulação PEAD DN 800mm PN10</div>
                  <div className="col-span-3 text-center font-mono text-slate-600">60 metros</div>
                  <div className="col-span-3 text-right">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-[#0284c7]">Validado</span>
                  </div>
                </div>
                <div className="grid grid-cols-12 text-[11px] p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 items-center">
                  <div className="col-span-6 font-medium text-slate-800">Conexões Flangeadas & Juntas</div>
                  <div className="col-span-3 text-center font-mono text-slate-600">16 unidades</div>
                  <div className="col-span-3 text-right">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-[#0284c7]">Validado</span>
                  </div>
                </div>
                <div className="grid grid-cols-12 text-[11px] p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 items-center">
                  <div className="col-span-6 font-medium text-slate-800">Kit Fixação & Juntas Vedação</div>
                  <div className="col-span-3 text-center font-mono text-slate-600">1 lote</div>
                  <div className="col-span-3 text-right">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-[#0284c7]">Validado</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-[#0284c7] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === 'pt' ? 'Tolerâncias e normas vinculadas à RFQ' : 'Tolerances & standards mapped to RFQ'}
                </span>
                <span className="font-mono text-[10px] text-slate-400">Zero Digitação Manual</span>
              </div>

              <p className="text-[10px] text-slate-400 pt-1 text-center italic font-sans">
                * {lang === 'pt' ? 'Dados ilustrativos para demonstração da interface.' : 'Illustrative data for interface demonstration.'}
              </p>
            </div>
          </div>

          {/* Diferencial 2: Equalização de Propostas (Mockup na Esquerda, Texto na Direita no Desktop; Mockup Abaixo no Mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Coluna Mockup (order-2 lg:order-1 para que no mobile o texto venha primeiro) */}
            <div className="order-2 lg:order-1 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      Matriz Comparativa & Equalização
                    </span>
                    <span className="text-[10px] text-slate-500">
                      RFQ #CH-2026-012 • 3 Propostas Concorrentes
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200">
                  Equalizado
                </span>
              </div>

              {/* As 3 Propostas Comparadas com Alerta Visual */}
              <div className="space-y-2.5">
                {/* Fornecedor A - Recomendada */}
                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-300 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {lang === 'pt' ? 'Fornecedor A' : 'Supplier A'}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        {lang === 'pt' ? 'Recomendada' : 'Best Bid'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      {lang === 'pt' ? 'Prazo: 12 dias • Frete equalizado CIF • Score 98%' : '12 days • CIF freight equalized • Score 98%'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs md:text-sm font-extrabold text-emerald-700 block font-mono">
                      R$ 84.500
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold font-mono">100% Conforme</span>
                  </div>
                </div>

                {/* Fornecedor B */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {lang === 'pt' ? 'Fornecedor B' : 'Supplier B'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      {lang === 'pt' ? 'Prazo: 8 dias • Frete FOB (+ R$ 4.200) • Score 92%' : '8 days • FOB freight (+ R$ 4,200) • Score 92%'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs md:text-sm font-bold text-slate-800 block font-mono">
                      R$ 96.200
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">CIF R$ 100.400</span>
                  </div>
                </div>

                {/* Fornecedor C - Preço fora da curva */}
                <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {lang === 'pt' ? 'Fornecedor C' : 'Supplier C'}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        {lang === 'pt' ? 'Alerta: +35%' : 'Alert: +35%'}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 block">
                      {lang === 'pt' ? 'Preço 35% acima da média histórica do item' : 'Price 35% above historical benchmark'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs md:text-sm font-bold text-amber-900 block font-mono">
                      R$ 115.000
                    </span>
                    <span className="text-[9px] text-amber-700 font-mono">Score 84%</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100">
                <span className="font-semibold text-slate-700">
                  {lang === 'pt' ? 'Parecer técnico pronto para aprovação de PO' : 'Technical dossier ready for PO sign-off'}
                </span>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  Auditável
                </span>
              </div>

              <p className="text-[10px] text-slate-400 pt-1 text-center italic font-sans">
                * {lang === 'pt' ? 'Dados ilustrativos para demonstração da interface.' : 'Illustrative data for interface demonstration.'}
              </p>
            </div>

            {/* Coluna Texto */}
            <div className="order-1 lg:order-2 space-y-6">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-100 text-[#0284c7] uppercase tracking-wider">
                {t.diff2Tag}
              </span>
              <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t.diff2Title}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {t.diff2Desc}
              </p>
              <div className="space-y-2.5 pt-1 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff2Bullet1}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff2Bullet2}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff2Bullet3}</span>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href="#hero"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <span>{t.heroCtaPrimary}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Diferencial 3: Segregação Canteiro × Compras (Texto na Esquerda, Mockup Split na Direita) */}
          <div id="governanca" className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center scroll-mt-16 pt-4">
            {/* Coluna Texto */}
            <div className="space-y-6">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                {t.diff3Tag}
              </span>
              <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t.diff3Title}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {t.diff3Desc}
              </p>
              <div className="space-y-2.5 pt-1 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff3Bullet1}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff3Bullet2}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.diff3Bullet3}</span>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href="#hero"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <span>{t.heroCtaPrimary}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Coluna Mockup Split-Screen: Canteiro vs. Mesa de Compras */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              {/* Painel Superior: Visão do Canteiro (Sem Preços) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {lang === 'pt' ? 'Visão da Frente de Obra' : 'Job Site Perspective'}
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {lang === 'pt' ? 'Preços e Fornecedores Ocultos' : 'Prices & Vendors Hidden'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-700 space-y-1">
                  <div>• Chamado #CH-2026-012 — Tubulação PEAD DN 800mm (60m)</div>
                  <div>• 3 Fotos Técnicas e Croqui de Campo Anexados</div>
                </div>
              </div>

              {/* Divisor Visual de Segregação Blindada */}
              <div className="flex items-center gap-2 justify-center py-1">
                <span className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {lang === 'pt' ? 'Segregação de Funções Blindada' : 'Strict Segregation Barrier'}
                </span>
                <span className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Painel Inferior: Visão da Mesa de Compras (Comercial Completo) */}
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-sky-200/60">
                  <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                    {lang === 'pt' ? 'Visão da Mesa de Suprimentos' : 'Central Procurement Perspective'}
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-[#0284c7]">
                    {lang === 'pt' ? 'Negociação & Auditoria Ativa' : 'Commercial Negotiation Active'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 flex justify-between items-center font-mono">
                  <span>Fornecedor A (Vencedor Equalizado):</span>
                  <span className="font-bold text-emerald-700">R$ 84.500 (CIF)</span>
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between items-center">
                  <span>{lang === 'pt' ? 'Responsável pela liberação:' : 'Approval sign-off by:'}</span>
                  <span className="font-mono font-bold text-slate-700">Gerência de Suprimentos</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-1 text-center italic font-sans">
                * {lang === 'pt' ? 'Dados ilustrativos para demonstração da interface.' : 'Illustrative data for interface demonstration.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.3 Como Funciona: Jornada em 5 Passos (Stepper Interativo) */}
      <WorkflowShowcase lang={lang} />

      {/* 2.4 Funcionalidades de Apoio (Grid Compacto de 4 Colunas) */}
      <section id="recursos" className="py-20 border-t border-slate-200 bg-white px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Cabeçalho */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
              {t.supportHeading}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.supportTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.supportSubtitle}
            </p>
          </div>

          {/* Grid de 4 Colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Homologação por CNPJ */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-3 hover:border-[#0284c7] hover:shadow-xs transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                {t.support1Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.support1Desc}
              </p>
            </div>

            {/* Card 2: Consolidação de Frete */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-3 hover:border-[#0284c7] hover:shadow-xs transition-all group">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                {t.support2Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.support2Desc}
              </p>
            </div>

            {/* Card 3: Conta de Garantia (Opcional) */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-3 hover:border-[#0284c7] hover:shadow-xs transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                {t.support3Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.support3Desc}
              </p>
            </div>

            {/* Card 4: Trilha de Auditoria */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-3 hover:border-[#0284c7] hover:shadow-xs transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                {t.support4Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.support4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Prova Social (Oculta por padrão sob flag SHOW_SOCIAL_PROOF = false) */}
      {/* TODO: Usuário informará logos oficiais de clientes e indicadores reais consolidados. */}
      {(() => {
        const SHOW_SOCIAL_PROOF = false;
        if (!SHOW_SOCIAL_PROOF) return null;
        return (
          <section className="py-16 border-t border-slate-200 bg-[#f8fafc] px-6 lg:px-12 text-center">
            {/* TODO: Preencher com logos e indicadores reais fornecidos pelo cliente */}
            <div className="max-w-5xl mx-auto space-y-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                EMPRESAS QUE CONFIAM NA COOPRAIL
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-60">
                {/* TODO: Inserir logomarcas oficiais dos clientes */}
              </div>
            </div>
          </section>
        );
      })()}

      {/* 2.6 FAQ Reformulado (Acordeão Acessível) */}
      <section id="faq" className="py-20 border-t border-slate-200 bg-[#f8fafc] px-6 lg:px-12 scroll-mt-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
              {t.faqHeading}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.faqTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.faqSubtitle}
            </p>
          </div>

          {/* Acordeão Interativo Acessível */}
          <div className="space-y-3">
            {[
              { q: t.faqQ1, a: t.faqA1 },
              { q: t.faqQ2, a: t.faqA2 },
              { q: t.faqQ3, a: t.faqA3 },
              { q: t.faqQ4, a: t.faqA4 },
            ].map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    id={`faq-question-${idx}`}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:ring-inset"
                  >
                    <span className="text-xs md:text-sm font-bold text-slate-900 leading-snug">
                      {item.q}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                        isOpen ? 'bg-sky-50 text-[#0284c7] rotate-180' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-question-${idx}`}
                      className="px-5 pb-5 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}

            {/* TODO: Perguntas adicionais aguardando conteúdo oficial do cliente:
                1. Como funciona a integração com nosso ERP atual (SAP, TOTVS, Protheus)?
                2. Qual o prazo médio de implantação da plataforma?
                3. Como funciona o modelo de contratação/cobrança (SaaS, licença ou transação)?
                4. Como a plataforma garante a segurança dos dados e conformidade com a LGPD?
                Placeholders permanecem apenas em comentário de código para evitar texto falso na tela. */}
          </div>
        </div>
      </section>

      {/* 2.7 CTA Final com Alto Impacto Visual (Destino da âncora #contato) */}
      <section id="contato" className="py-24 border-t border-slate-200 px-6 lg:px-12 text-center bg-gradient-to-b from-white to-sky-50/50 scroll-mt-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <img
            src="/cooprail-logo.png"
            alt="COOPRAIL"
            className="h-10 md:h-12 w-auto object-contain mx-auto"
          />
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.ctaFinalTitle}
          </h2>
          <p className="text-xs md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t.ctaFinalSubtitle}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* CTA Primário: Solicitar demonstração (Rola suavemente para o topo do hero) */}
            {/* TODO: Usuário informará canal de contato real (e-mail comercial, formulário ou WhatsApp). Até lá, o botão rola suavemente para o topo do hero. */}
            <a
              href="#hero"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white text-xs md:text-sm font-bold shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <span>{t.heroCtaPrimary}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>
            <a
              href="#diferenciais"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs md:text-sm font-bold transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{t.heroCtaSecondary}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2.8 Footer Limpo com a Logo Oficial */}
      <footer className="border-t border-slate-200 py-10 px-6 lg:px-12 bg-white text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/cooprail-logo.png"
            alt="COOPRAIL"
            className="h-6 w-auto object-contain"
          />
          <span>• {t.footerRights}</span>
        </div>
        {/* TODO: Placeholders de Privacidade, Termos de Uso e Contato adicionais permanecem ocultos até que os textos legais e URLs sejam fornecidos pelo cliente */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <a
            href="/portal-parceiro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0284c7] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-[#0284c7]" />
            <span>{t.heroCtaSupplier}</span>
          </a>
          <span>•</span>
          <span>{t.footerSub}</span>
          <span>•</span>
          <span className="font-semibold text-[#0284c7]">
            {lang === 'pt' ? 'Disponível em Nuvem 24/7' : 'Cloud Available 24/7'}
          </span>
        </div>
      </footer>
    </div>
  );
}

