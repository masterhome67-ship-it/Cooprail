'use client';

import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  FileCheck2,
  TrendingDown,
  Layers,
  HelpCircle,
  CreditCard,
  Banknote,
  Cloud,
  Lock,
  ChevronRight,
  ExternalLink,
  Scale,
  Sparkles,
  Camera,
  Check,
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
      {/* 1. Header com a Logo Oficial da Cooprail */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 lg:px-12 h-20 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/cooprail-logo.png"
            alt="COOPRAIL"
            className="h-8 md:h-9 w-auto object-contain"
          />
          <span className="hidden sm:inline-block text-[10px] bg-sky-50 text-[#0284c7] font-bold px-2 py-0.5 rounded border border-sky-200 tracking-wider">
            ENTERPRISE
          </span>
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

      {/* 2. Hero Section com Espaçamentos Generosos */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-6 lg:px-12 max-w-6xl mx-auto text-center space-y-8">
        {/* Badge Institucional */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>{t.heroBadge}</span>
        </div>

        {/* Título Principal de Grande Impacto */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
          {t.heroTitlePrefix}
          <span className="text-[#0284c7] inline-block">{t.heroTitleHighlight}</span>
          {t.heroTitleSuffix}
        </h1>

        {/* Subtítulo Claro e Explicativo */}
        <p className="text-sm md:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Ações Principais do Hero */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs md:text-sm font-bold shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
          >
            <span>{t.heroCtaPrimary}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="/portal-parceiro"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0284c7] text-xs md:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t.heroCtaSupplier}</span>
          </a>

          <a
            href="#diferenciais"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs md:text-sm font-bold transition-all shadow-xs"
          >
            <span>{t.heroCtaSecondary}</span>
          </a>
        </div>
      </section>

      {/* 3. Seção dos Grandes Diferenciais & Funcionalidades da Solução */}
      <section id="diferenciais" className="py-24 border-t border-slate-200 bg-white px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Cabeçalho da Seção */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
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

          {/* Cards Grandes e Estruturados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Leitura de Memoriais por IA */}
            <div className="p-8 md:p-10 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-5 hover:border-[#0284c7] hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-[#0284c7]">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200 uppercase">
                  {t.feature1Tag}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                  {t.feature1Title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {t.feature1Desc}
                </p>
              </div>

              <div className="pt-2 space-y-2 text-xs text-slate-700 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature1Check1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature1Check2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature1Check3}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Homologação Instantânea na Receita Federal */}
            <div className="p-8 md:p-10 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-5 hover:border-[#0284c7] hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {t.feature2Tag}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                  {t.feature2Title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {t.feature2Desc}
                </p>
              </div>

              <div className="pt-2 space-y-2 text-xs text-slate-700 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature2Check1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature2Check2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature2Check3}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Gestão de Canteiros & Mobilização In-Loco */}
            <div className="p-8 md:p-10 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-5 hover:border-[#0284c7] hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {t.feature3Tag}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                  {t.feature3Title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {t.feature3Desc}
                </p>
              </div>

              <div className="pt-2 space-y-2 text-xs text-slate-700 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature3Check1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature3Check2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature3Check3}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Matriz Comparativa de Propostas & Compliance */}
            <div className="p-8 md:p-10 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-5 hover:border-[#0284c7] hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-[#0369a1]">
                  <Scale className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-50 text-[#0369a1] border border-sky-200 uppercase">
                  {t.feature4Tag}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                  {t.feature4Title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {t.feature4Desc}
                </p>
              </div>

              <div className="pt-2 space-y-2 text-xs text-slate-700 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature4Check1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature4Check2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature4Check3}</span>
                </div>
              </div>
            </div>

            {/* Card 5: Smart Escrow & Liquidação Flexível (Ocupa largura inteira) */}
            <div className="md:col-span-2 p-8 md:p-10 rounded-3xl bg-gradient-to-r from-sky-50/60 to-white border border-sky-200 space-y-5 shadow-xs hover:border-[#0284c7] transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                  {t.feature5Tag}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg md:text-2xl font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                  {t.feature5Title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 max-w-4xl leading-relaxed">
                  {t.feature5Desc}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs text-slate-700 border-t border-sky-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature5Check1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature5Check2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.feature5Check3}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Seção: Governança, Segregação de Funções & Frentes de Obra */}
      <section id="governanca" className="py-24 border-t border-slate-200 px-6 lg:px-12 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              {t.govHeading}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {t.govTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.govSubtitle}
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 text-slate-700 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.govBullet1}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-700 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.govBullet2}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-700 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.govBullet3}</span>
              </div>
            </div>
          </div>

          {/* Exemplo Visual do Chamado Técnico com Múltiplos Itens & Fotos */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Chamado Técnico Operacional #CH-2026-089
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Planta Industrial Cafelândia • CC-4500
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Urgência Alta
              </span>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <strong className="text-slate-900 block text-[11px] mb-1">Itens Requisitados da Frente de Obra:</strong>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700">
                  <div>• 50 metros — Tubo PEAD 1.000mm (Conforme Memorial Cafelândia)</div>
                  <div>• 12 unidades — Conexões e Anéis de Vedação EPDM</div>
                  <div>• 1 lote — Armação CA-50 para Caixas de Passagem</div>
                </div>
              </div>

              {/* Indicador de Fotos Anexadas */}
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-[11px] text-[#0369a1]">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#0284c7]" />
                  <span>3 Fotos Técnicas & Croqui Anexados pelo Canteiro</span>
                </div>
                <span className="font-bold text-[#0284c7]">Visualizar</span>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100">
              <span>Triagem de Compras: Análise Técnica Ativa</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Governança Blindada
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Seção Como Funciona a Operação e Pagamentos */}
      <section id="comofunciona" className="py-24 border-t border-slate-200 bg-white px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
              {t.howHeading}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t.howTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {t.howSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pergunta 1: Instalação */}
            <div className="p-8 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-3 text-[#0284c7]">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-900">{t.howStep1Title}</h3>
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{t.howStep1Desc}</p>
            </div>

            {/* Pergunta 2: Faturamento a Prazo */}
            <div className="p-8 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-3 text-emerald-700">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-900">{t.howStep2Title}</h3>
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{t.howStep2Desc}</p>
            </div>

            {/* Pergunta 3: Custódia Garantida */}
            <div className="p-8 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-3 text-[#0369a1]">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-900">{t.howStep3Title}</h3>
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{t.howStep3Desc}</p>
            </div>

            {/* Pergunta 4: Pagamento ao Parceiro */}
            <div className="p-8 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-3 text-amber-700">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-900">{t.howStep4Title}</h3>
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{t.howStep4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Final com Alto Impacto Visual */}
      <section className="py-24 border-t border-slate-200 px-6 lg:px-12 text-center bg-gradient-to-b from-white to-sky-50/50">
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
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs md:text-sm font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              <span>{t.ctaFinalBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/portal-parceiro"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs md:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#0284c7]" />
              <span>{t.heroCtaSupplier}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 7. Footer Limpo com a Logo Oficial */}
      <footer className="border-t border-slate-200 py-10 px-6 lg:px-12 bg-white text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/cooprail-logo.png"
            alt="COOPRAIL"
            className="h-6 w-auto object-contain"
          />
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
