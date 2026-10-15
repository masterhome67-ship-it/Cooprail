'use client';

import React, { useState, useEffect } from 'react';
import { RFQ, Quote } from '@/lib/mockData';
import { DEFAULT_UMU_QUOTES } from '@/lib/userWorkspace';
import {
  Check,
  Star,
  ShieldCheck,
  TrendingDown,
  Clock,
  Scale,
  Plus,
  Globe,
  Share2,
  Copy,
  MessageCircle,
  Phone,
  MapPin,
  Sparkles,
  Loader2,
  ExternalLink,
  X,
  FilePlus,
  Building2,
} from 'lucide-react';

interface QuoteComparatorProps {
  rfq?: RFQ;
  onGeneratePO: (quote: Quote) => void;
  onOpenCreateRFQ?: () => void;
  onUpdateQuotes?: (rfqId: string, quotes: Quote[]) => void;
}

export function QuoteComparator({
  rfq,
  onGeneratePO,
  onOpenCreateRFQ,
  onUpdateQuotes,
}: QuoteComparatorProps) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(rfq?.quotes?.[0]?.id || '');
  const [isSearchingMarket, setIsSearchingMarket] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [localQuotes, setLocalQuotes] = useState<Quote[]>(rfq?.quotes || []);

  // Modal para inserir proposta manual recebida por e-mail/balcão
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualSupplierName, setManualSupplierName] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualDays, setManualDays] = useState('3');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualTerms, setManualTerms] = useState('Boleto 30 dias');
  const [manualNotes, setManualNotes] = useState('');

  useEffect(() => {
    if (rfq?.quotes && rfq.quotes.length > 0) {
      setLocalQuotes(rfq.quotes);
      if (!selectedQuoteId || !rfq.quotes.some((q) => q.id === selectedQuoteId)) {
        setSelectedQuoteId(rfq.quotes[0].id);
      }
    } else if (
      rfq?.code?.includes('UMU') ||
      rfq?.title?.toLowerCase().includes('cimento') ||
      rfq?.scope_description?.toLowerCase().includes('cimento')
    ) {
      setLocalQuotes(DEFAULT_UMU_QUOTES);
      setSelectedQuoteId(DEFAULT_UMU_QUOTES[0].id);
      if (onUpdateQuotes && rfq?.id) {
        onUpdateQuotes(rfq.id, DEFAULT_UMU_QUOTES);
      }
    } else if (rfq) {
      const budget = rfq.estimated_budget || 5000;
      const q1 = Math.round(budget * 0.95);
      const q2 = Math.round(budget * 0.98);
      const q3 = Math.round(budget * 1.02);
      const autoQuotes: Quote[] = [
        {
          id: `quote-auto-${rfq.id}-0`,
          rfq_id: rfq.code,
          supplier_name: `Distribuidora Regional Líder (${rfq.location || 'Paraná'})`,
          supplier_rating: 4.8,
          total_amount: q1,
          delivery_lead_time_days: 2,
          payment_terms: 'Liquidação Garantida via Solana Smart Escrow / Boleto',
          status: 'received',
          ai_score: 9.6,
          ai_analysis_summary: `Melhor relação custo-benefício apurada no mercado regional. Economia de 5% sobre a estimativa orçamentária.`,
          savings_percentage: 5.0,
          is_open_market: true,
          supplier_phone: '(44) 3622-4500',
          supplier_city: rfq.location || 'Paraná',
          market_source: 'Catálogo de Fornecedores Homologados',
        },
        {
          id: `quote-auto-${rfq.id}-1`,
          rfq_id: rfq.code,
          supplier_name: `Comercial & Insumos Industriais Sul`,
          supplier_rating: 4.6,
          total_amount: q2,
          delivery_lead_time_days: 3,
          payment_terms: 'Boleto Faturado 30 dias / Depósito Bancário',
          status: 'received',
          ai_score: 9.1,
          ai_analysis_summary: `Fornecedor homologado com certificação de conformidade técnica e faturamento corporativo padrão.`,
          savings_percentage: 2.0,
          is_open_market: true,
          supplier_phone: '(44) 3624-8800',
          supplier_city: rfq.location || 'Paraná',
          market_source: 'Rede Oficial de Distribuição B2B',
        },
        {
          id: `quote-auto-${rfq.id}-2`,
          rfq_id: rfq.code,
          supplier_name: `Materiais & Logística Canteiro Express`,
          supplier_rating: 4.5,
          total_amount: q3,
          delivery_lead_time_days: 1,
          payment_terms: 'Faturamento 15/30 dias / Smart Escrow',
          status: 'received',
          ai_score: 8.8,
          ai_analysis_summary: `Opção de pronta-entrega emergencial em 24h caso haja urgência no avanço da obra no canteiro.`,
          savings_percentage: 0.0,
          is_open_market: true,
          supplier_phone: '(44) 3639-1200',
          supplier_city: rfq.location || 'Paraná',
          market_source: 'Distribuição Rápida de Insumos',
        },
      ];
      setLocalQuotes(autoQuotes);
      setSelectedQuoteId(autoQuotes[0].id);
      if (onUpdateQuotes && rfq?.id) {
        onUpdateQuotes(rfq.id, autoQuotes);
      }
    } else {
      setLocalQuotes([]);
    }
  }, [rfq, onUpdateQuotes]);

  // Sincronização em tempo real com propostas enviadas pelo Portal do Parceiro (/portal-parceiro)
  useEffect(() => {
    if (!rfq?.code) return;
    const syncPartnerQuotes = () => {
      try {
        const raw = localStorage.getItem('cooprail_partner_quotes');
        if (!raw) return;
        const partnerQuotes: any[] = JSON.parse(raw);
        const matching = partnerQuotes.filter((q) => q.rfq_id === rfq.code);
        if (matching.length > 0) {
          setLocalQuotes((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newProposals = matching.filter((m) => !existingIds.has(m.id));
            if (newProposals.length > 0) {
              const merged = [...prev, ...newProposals];
              if (onUpdateQuotes && rfq.id) {
                onUpdateQuotes(rfq.id, merged);
              }
              return merged;
            }
            return prev;
          });
        }
      } catch (e) {
        console.error('Erro ao ler propostas do portal:', e);
      }
    };

    syncPartnerQuotes();
    const interval = setInterval(syncPartnerQuotes, 2500);
    return () => clearInterval(interval);
  }, [rfq?.code, rfq?.id, onUpdateQuotes]);


  if (!rfq) {
    return (
      <div className="p-10 text-center rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
        <Scale className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">
          Nenhum Pedido de Cotação (RFQ) selecionado
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Para ver a comparação lado a lado de propostas comerciais e emitir a Ordem de Compra, abra uma nova requisição de compras.
        </p>
        {onOpenCreateRFQ && (
          <button
            onClick={onOpenCreateRFQ}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Abrir Novo Pedido de Cotação (RFQ)</span>
          </button>
        )}
      </div>
    );
  }

  const portalLink = typeof window !== 'undefined'
    ? `${window.location.origin}/portal-parceiro?rfq=${rfq.code}`
    : `http://localhost:3000/portal-parceiro?rfq=${rfq.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleWhatsAppShare = (phone?: string) => {
    const textMsg = encodeURIComponent(
      `Olá! A Cooprail abriu o Pedido de Cotação ${rfq.code} para aquisição de: "${rfq.title}".\n` +
      `Para enviar sua proposta comercial (preço e prazo de entrega), acesse nosso portal:\n${portalLink}`
    );
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const waUrl = cleanPhone.length >= 10
      ? `https://wa.me/55${cleanPhone}?text=${textMsg}`
      : `https://wa.me/?text=${textMsg}`;
    window.open(waUrl, '_blank');
  };

  const handleSearchMarket = async () => {
    setIsSearchingMarket(true);
    try {
      const itemsSummary = rfq.items?.map((i) => `${i.quantity} ${i.unit} de ${i.item_name}`).join(', ') || rfq.title;
      const res = await fetch('/api/market-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: `${rfq.title} (${itemsSummary})`,
          quantity: `${rfq.items?.[0]?.quantity || 1} ${rfq.items?.[0]?.unit || 'unidades'}`,
          location: 'Região do Canteiro / Paraná',
          budget: rfq.estimated_budget,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
        const newQuotes: Quote[] = data.suppliers.map((sup: any, idx: number) => {
          const totalAmount = sup.total_amount || rfq.estimated_budget * (1 - idx * 0.05);
          const savings = Math.max(0, Math.round(((rfq.estimated_budget - totalAmount) / (rfq.estimated_budget || 1)) * 100));

          return {
            id: `quote-mkt-${Date.now()}-${idx}`,
            rfq_id: rfq.code,
            supplier_name: sup.name,
            supplier_rating: sup.rating || 4.5,
            total_amount: totalAmount,
            delivery_lead_time_days: sup.delivery_lead_time_days || (idx === 0 ? 1 : 3),
            payment_terms: 'Mercado Aberto / 30 dias',
            status: 'received',
            ai_score: Number((9.0 + (idx === 0 ? 0.7 : 0.3)).toFixed(1)),
            ai_analysis_summary:
              sup.ai_analysis ||
              `Fornecedor identificado em ${sup.city || 'região'}. Contato: ${sup.phone || 'Público'}.`,
            savings_percentage: savings,
            is_open_market: true,
            supplier_phone: sup.phone,
            supplier_city: sup.city,
            market_source: sup.market_source,
          };
        });

        const merged = [...localQuotes, ...newQuotes];
        setLocalQuotes(merged);
        if (!selectedQuoteId && newQuotes.length > 0) {
          setSelectedQuoteId(newQuotes[0].id);
        }
        if (onUpdateQuotes) {
          onUpdateQuotes(rfq.id, merged);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar fornecedores de mercado:', err);
    } finally {
      setIsSearchingMarket(false);
    }
  };

  const handleSaveManualQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSupplierName.trim() || !manualAmount) return;

    const numAmount = parseFloat(manualAmount.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!numAmount || isNaN(numAmount)) return;

    const budget = rfq.estimated_budget || numAmount;
    const savings = Math.max(0, Math.round(((budget - numAmount) / budget) * 100));

    const newQuote: Quote = {
      id: `quote-manual-${Date.now()}`,
      rfq_id: rfq.code,
      supplier_name: manualSupplierName.trim(),
      supplier_rating: 4.8,
      total_amount: numAmount,
      delivery_lead_time_days: Number(manualDays) || 3,
      payment_terms: manualTerms || 'Boleto 30 dias',
      status: 'received',
      ai_score: 9.3,
      ai_analysis_summary:
        manualNotes.trim() ||
        `Proposta inserida manualmente. Cidade: ${manualCity || 'Não informada'}. Contato: ${manualPhone || 'Direto'}.`,
      savings_percentage: savings,
      is_open_market: false,
      supplier_phone: manualPhone,
      supplier_city: manualCity,
      market_source: 'Inserção Manual / E-mail de Fornecedor',
    };

    const updated = [...localQuotes, newQuote];
    setLocalQuotes(updated);
    setSelectedQuoteId(newQuote.id);
    if (onUpdateQuotes) {
      onUpdateQuotes(rfq.id, updated);
    }

    setManualSupplierName('');
    setManualAmount('');
    setManualDays('3');
    setManualPhone('');
    setManualCity('');
    setManualNotes('');
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Cabeçalho da RFQ */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {rfq.code}
            </span>
            <span className="text-xs text-slate-500 font-medium">Orçamento Teto:</span>
            <span className="text-xs font-bold text-slate-800">
              {rfq.estimated_budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-900">{rfq.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{rfq.scope_description}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">Prazo para Decisão</p>
          <p className="text-xs font-bold text-amber-600">{rfq.deadline}</p>
        </div>
      </div>

      {/* 2. Central de Envio da Cotação às Empresas (Mecânica de Envio) */}
      <div className="p-4 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50/40 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Mecânica de Disparo: Como enviar esta cotação para as empresas?</span>
            </h3>
            <p className="text-[11px] text-slate-600">
              Você pode enviar o link exclusivo do portal para qualquer fornecedor preencher, disparar no WhatsApp, inserir propostas recebidas por e-mail ou acionar a IA de mercado aberto.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSearchMarket}
              disabled={isSearchingMarket}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSearchingMarket ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Pesquisando Fornecedores...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Buscar Fornecedores na Web (IA)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barra de Ações de Envio aos Fornecedores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-sky-200/60">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span className="truncate">{copiedLink ? 'Link Copiado!' : '1. Copiar Link do Portal'}</span>
          </button>

          <button
            onClick={() => handleWhatsAppShare()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="truncate">2. Disparar no WhatsApp</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#0284c7]" />
            <span className="truncate">3. Inserir Cotação Manual</span>
          </button>
        </div>
      </div>

      {/* 3. Grid Comparativo de Cotações Lado a Lado */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800">
            Comparação Analítica de Propostas ({localQuotes.length} cotações prontas)
          </h3>
          <span className="text-[11px] text-slate-500">
            Selecione uma proposta para emitir a Ordem de Compra formal (PO)
          </span>
        </div>

        {localQuotes.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-white space-y-3">
            <Globe className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Aguardando propostas dos fornecedores</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Copie o link acima e envie para os fornecedores, ou clique no botão azul para a IA pesquisar lojas e distribuidoras reais da região na internet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localQuotes.map((quote) => {
              const isSelected = selectedQuoteId === quote.id;
              const isBest = quote.ai_score >= 9.2;
              const isOpenMarket = Boolean(quote.is_open_market);

              return (
                <div
                  key={quote.id}
                  onClick={() => setSelectedQuoteId(quote.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-[#0284c7] bg-sky-50/40 ring-2 ring-[#0284c7]/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Badge de Origem */}
                  <div className="flex items-center justify-between mb-2">
                    {isOpenMarket ? (
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                        <Globe className="w-3 h-3 text-amber-600" />
                        <span>Mercado Aberto (Descoberto por IA)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Fornecedor Homologado em Canteiro</span>
                      </span>
                    )}

                    {isBest && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-emerald-600" /> Score IA {quote.ai_score}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{quote.supplier_name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                        {quote.supplier_city && (
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <MapPin className="w-3 h-3 text-slate-400" /> {quote.supplier_city}
                          </span>
                        )}
                        {quote.supplier_phone && (
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" /> {quote.supplier_phone}
                          </span>
                        )}
                        <span>Pagamento: {quote.payment_terms}</span>
                      </div>
                    </div>

                    {/* Preço e Economia */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Valor Total da Cotação</p>
                        <p className="text-base font-extrabold text-slate-900 tracking-tight">
                          {quote.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-medium">Variação Orçamento</p>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>-{quote.savings_percentage || 0}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Prazo */}
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" /> Prazo de Entrega:
                      </span>
                      <span className="font-semibold text-slate-800">{quote.delivery_lead_time_days} dias corridos</span>
                    </div>

                    {/* Parecer Técnico Analítico */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-900 font-bold">Diagnóstico de Suprimentos: </span>
                      {quote.ai_analysis_summary}
                    </div>

                    {/* Ação de Contato e Emissão */}
                    <div className="pt-2 space-y-2">
                      {quote.supplier_phone && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsAppShare(quote.supplier_phone);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Contatar / Negociar no WhatsApp ({quote.supplier_phone.split(' ')[0]})</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGeneratePO(quote);
                        }}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprovar Proposta e Emitir Ordem de Compra (PO)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Inserir Cotação Manual Recebida por E-mail / Telefone */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Inserir Cotação Recebida Manualmente</h3>
                  <p className="text-[11px] text-slate-500">Lançar orçamento de empresa recebido por e-mail ou WhatsApp</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualQuote} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome do Fornecedor / Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comercial Votorantim S.A."
                  value={manualSupplierName}
                  onChange={(e) => setManualSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valor Total da Proposta (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 48500.00"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prazo de Entrega (dias) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 5"
                    value={manualDays}
                    onChange={(e) => setManualDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(45) 99876-5432"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="Ex: Cascavel / PR"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Condições de Pagamento</label>
                <input
                  type="text"
                  placeholder="Ex: Faturado 28 dias / Pix / Smart Escrow"
                  value={manualTerms}
                  onChange={(e) => setManualTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Inclui certificado de ensaio, frete CIF incluso no preço."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold shadow-xs cursor-pointer"
                >
                  Salvar e Adicionar ao Comparador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
