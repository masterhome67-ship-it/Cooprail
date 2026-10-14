'use client';

import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  TrendingDown,
  Layers,
  HelpCircle,
  CreditCard,
  Banknote,
  Cloud,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface LandingPageProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onOpenLogin: () => void;
}

export function LandingPage({ lang, onToggleLang, onOpenLogin }: LandingPageProps) {
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-[#0284c7] selection:text-white font-sans">
      {/* 1. Header Superior em Off-white com Vidro Fosco */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 lg:px-12 h-18 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center font-bold text-white text-sm shadow-sm">
            CR
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">COOPRAIL</span>
            <span className="text-[10px] bg-sky-50 text-[#0284c7] font-bold px-2 py-0.5 rounded ml-2 border border-sky-200">
              ENTERPRISE
            </span>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#diferencial" className="hover:text-[#0284c7] transition-colors">
            {t.navOnSite}
          </a>
          <a href="#governanca" className="hover:text-[#0284c7] transition-colors">
            {t.navGovernance}
          </a>
          <a href="#comofunciona" className="hover:text-[#0284c7] transition-colors">
            {t.navHowItWorks}
          </a>
          <a href="#duvidas" className="hover:text-[#0284c7] transition-colors">
            {t.navFaq}
          </a>
        </nav>

        {/* Seletor de Idioma & Botão de Login */}
        <div className="flex items-center gap-3">
          {/* Toggle de Idioma PT / EN */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-xs font-mono">
            <button
              onClick={() => onToggleLang('pt')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
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
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] text-xs font-bold transition-all shadow-xs cursor-pointer"
            title={lang === 'pt' ? 'Área exclusiva para envio de propostas e cotações de fornecedores' : 'Supplier Proposal & Quotation Portal'}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Portal do Fornecedor' : 'Supplier Portal'}</span>
          </a>

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>{t.navEnter}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section Clean Off-White & Azul Corporativo */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-6xl mx-auto text-center space-y-6">

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          {t.heroTitlePrefix}
          <span className="text-[#0284c7] block sm:inline"> {t.heroTitleHighlight}</span>
          {t.heroTitleSuffix}
        </h1>

        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <span>{t.heroCtaPrimary}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="/portal-parceiro"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0284c7] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Portal do Fornecedor (Cotar)' : 'Supplier Portal (Quote)'}</span>
          </a>
          <a
            href="#comofunciona"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <span>{t.heroCtaSecondary}</span>
          </a>
        </div>

        {/* Destaque de Métricas Reais do Negócio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{t.metric1Label}</span>
            <p className="text-2xl font-extrabold text-[#0284c7]">{t.metric1Val}</p>
            <p className="text-[11px] text-slate-600">{t.metric1Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{t.metric2Label}</span>
            <p className="text-2xl font-extrabold text-slate-900">{t.metric2Val}</p>
            <p className="text-[11px] text-slate-600">{t.metric2Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{t.metric3Label}</span>
            <p className="text-2xl font-extrabold text-[#0369a1]">{t.metric3Val}</p>
            <p className="text-[11px] text-slate-600">{t.metric3Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{t.metric4Label}</span>
            <p className="text-2xl font-extrabold text-emerald-600">{t.metric4Val}</p>
            <p className="text-[11px] text-slate-600">{t.metric4Desc}</p>
          </div>
        </div>
      </section>

      {/* 3. Seção: O Diferencial Estratégico In-Loco */}
      <section id="diferencial" className="py-16 border-t border-slate-200 bg-white px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider">
              {t.diffHeading}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {t.diffTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.diffSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-3.5 hover:border-[#0284c7] transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-[#0284c7]">
                <Zap className="w-5 h-5 fill-[#0284c7]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.diffCard1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.diffCard1Desc}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-3.5 hover:border-[#0284c7] transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.diffCard2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.diffCard2Desc}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-3.5 hover:border-[#0284c7] transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-[#0369a1]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.diffCard3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.diffCard3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Seção: Governança & Segregação de Funções */}
      <section id="governanca" className="py-16 border-t border-slate-200 px-6 lg:px-12 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
              {t.govHeading}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {t.govTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.govSubtitle}
            </p>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-start gap-2.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.govBullet1}</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.govBullet2}</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.govBullet3}</span>
              </div>
            </div>
          </div>

          {/* Exemplo Visual de Chamado Operacional em Card Off-White */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0284c7]" />
                <span className="text-xs font-bold text-slate-900">
                  {lang === 'pt' ? 'Chamado Operacional #CH-2026-042' : 'Work Ticket #CH-2026-042'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {lang === 'pt' ? 'Urgência Alta' : 'High Urgency'}
              </span>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-800">
                <strong className="text-slate-900">{lang === 'pt' ? 'Item Solicitado:' : 'Requested Item:'}</strong>{' '}
                {lang === 'pt'
                  ? 'Substituição de válvulas de alta pressão e conjuntos de flange na Unidade 04.'
                  : 'Replacement of high-pressure control valves and flange assemblies at Processing Unit 04.'}
              </p>
              <p className="text-slate-500 text-[11px]">
                {lang === 'pt'
                  ? 'Setor: Divisão de Infraestrutura & Manutenção Operacional'
                  : 'Sector: Infrastructure Division & Heavy Maintenance'}
              </p>
              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-[#0369a1] flex items-center gap-2 font-medium">
                <Zap className="w-4 h-4 text-[#0284c7] shrink-0 fill-[#0284c7]" />
                <span>
                  {lang === 'pt'
                    ? 'Prestador parceiro já ativo no canteiro: Mecânica Industrial Integrada S.A.'
                    : 'Active contractor already on-site: Integrated Industrial Engineering Ltd'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100">
              <span>{lang === 'pt' ? 'Status: Em análise pelo Setor de Compras' : 'Status: Under Procurement Review'}</span>
              <span className="font-bold text-[#0284c7]">{lang === 'pt' ? 'Governança Ativa' : 'Compliant Flow'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEÇÃO ESSENCIAL: Como Funciona o Pagamento, Depósito e Operação (Responde as dúvidas do usuário) */}
      <section id="comofunciona" className="py-16 border-t border-slate-200 bg-white px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider">
              {t.howHeading}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {t.howTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.howSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pergunta 1: Instalação */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2.5 text-[#0284c7]">
                <Cloud className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">{t.howStep1Title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7.5">{t.howStep1Desc}</p>
            </div>

            {/* Pergunta 2: Opcionalidade do Escrow / Faturamento a Prazo */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">{t.howStep2Title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7.5">{t.howStep2Desc}</p>
            </div>

            {/* Pergunta 3: Como deposita na custódia */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2.5 text-[#0369a1]">
                <Lock className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">{t.howStep3Title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7.5">{t.howStep3Desc}</p>
            </div>

            {/* Pergunta 4: Como o parceiro recebe */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Banknote className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">{t.howStep4Title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7.5">{t.howStep4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Final em Azul & Off-White */}
      <section className="py-16 border-t border-slate-200 px-6 lg:px-12 text-center bg-gradient-to-b from-[#f8fafc] to-[#edf2f7]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {t.ctaFinalTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t.ctaFinalSubtitle}
          </p>
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all cursor-pointer"
          >
            <span>{t.ctaFinalBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7. Footer Limpo */}
      <footer className="border-t border-slate-200 py-8 px-6 lg:px-12 bg-white text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700">
          <div className="w-5 h-5 rounded bg-[#0284c7] flex items-center justify-center font-bold text-white text-[10px]">
            CR
          </div>
          <span className="font-bold text-slate-900">COOPRAIL Enterprise</span>
          <span>• {t.footerRights}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <a
            href="/portal-parceiro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0284c7] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-[#0284c7]" />
            <span>{lang === 'pt' ? 'Portal do Fornecedor' : 'Supplier Portal'}</span>
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
