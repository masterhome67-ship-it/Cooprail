'use client';

import React, { useState } from 'react';
import { RFQ, Quote } from '@/lib/mockData';
import { Check, Star, ShieldCheck, TrendingDown, Clock, Scale, Plus } from 'lucide-react';

interface QuoteComparatorProps {
  rfq?: RFQ;
  onGeneratePO: (quote: Quote) => void;
  onOpenCreateRFQ?: () => void;
}

export function QuoteComparator({ rfq, onGeneratePO, onOpenCreateRFQ }: QuoteComparatorProps) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(rfq?.quotes?.[0]?.id || '');

  if (!rfq || !rfq.quotes || rfq.quotes.length === 0) {
    return (
      <div className="p-10 text-center rounded border border-[#1c2636] bg-[#0d131c] space-y-3">
        <Scale className="w-10 h-10 text-slate-500 mx-auto opacity-60" />
        <h3 className="text-sm font-semibold text-slate-200">
          Nenhuma cotação para comparar no momento
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Para ver a comparação lado a lado e o parecer técnico, crie um novo Pedido de Orçamento (RFQ) ou envie um documento de proposta comercial em PDF.
        </p>
        {onOpenCreateRFQ && (
          <button
            onClick={onOpenCreateRFQ}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Novo Pedido de Orçamento</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho do RFQ */}
      <div className="p-4 rounded border border-[#1f2c3e] bg-[#111722] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold text-[#38bdf8] bg-[#0c1929] px-2 py-0.5 rounded border border-[#13304e]">
              {rfq.code}
            </span>
            <span className="text-xs text-slate-400">Orçamento Máximo:</span>
            <span className="text-xs font-semibold text-slate-200">
              {rfq.estimated_budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white">{rfq.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{rfq.scope_description}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[11px] text-slate-400">Prazo para Decisão</p>
          <p className="text-xs font-medium text-amber-400">{rfq.deadline}</p>
        </div>
      </div>

      {/* Grid Comparativo de Cotações Lado a Lado */}
      <div>
        <h3 className="text-xs font-semibold text-slate-300 mb-2">
          Comparação Analítica de Propostas ({rfq.quotes.length} recebidas)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rfq.quotes.map((quote) => {
            const isSelected = selectedQuoteId === quote.id;
            const isBest = quote.ai_score >= 9.0;

            return (
              <div
                key={quote.id}
                onClick={() => setSelectedQuoteId(quote.id)}
                className={`p-4 rounded border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#131d2b] ring-1 ring-[#0284c7]/40'
                    : 'border-[#1e2b3c] bg-[#101621] hover:border-[#273850]'
                }`}
              >
                {/* Badge de Recomendação */}
                {isBest && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-950/80 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-800/60">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Conformidade Homologada (Score {quote.ai_score})</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{quote.supplier_name}</h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{quote.supplier_rating} / 5.0</span>
                      <span className="mx-1">•</span>
                      <span>Pagamento: {quote.payment_terms}</span>
                    </div>
                  </div>

                  {/* Preço e Economia */}
                  <div className="p-2.5 rounded bg-[#0b0f17] border border-[#1a2536] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400">Valor da Proposta</p>
                      <p className="text-base font-bold text-white tracking-tight">
                        {quote.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Variação Orçamento</p>
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>-{quote.savings_percentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Prazo */}
                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#1a2536]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Prazo de Entrega:
                    </span>
                    <span className="font-medium text-slate-200">{quote.delivery_lead_time_days} dias corridos</span>
                  </div>

                  {/* Análise Textual da IA */}
                  <div className="text-xs text-slate-300 leading-relaxed bg-[#111722]/50 p-2 rounded">
                    <span className="text-slate-400 font-medium">Parecer Técnico-Comercial: </span>
                    {quote.ai_analysis_summary}
                  </div>

                  {/* Ação */}
                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGeneratePO(quote);
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm'
                          : 'bg-[#182332] hover:bg-[#202e42] text-slate-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Emitir Ordem de Compra para este Fornecedor</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
