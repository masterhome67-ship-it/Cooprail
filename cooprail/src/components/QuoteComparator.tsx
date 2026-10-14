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
      <div className="p-10 text-center rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
        <Scale className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">
          Nenhuma cotação para comparar no momento
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Para ver a comparação lado a lado e o parecer técnico, crie um novo Pedido de Orçamento (RFQ) ou importe uma proposta comercial em PDF.
        </p>
        {onOpenCreateRFQ && (
          <button
            onClick={onOpenCreateRFQ}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {rfq.code}
            </span>
            <span className="text-xs text-slate-500 font-medium">Orçamento Máximo:</span>
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

      {/* Grid Comparativo de Cotações Lado a Lado */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 mb-2">
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
                className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'border-[#0284c7] bg-sky-50/40 ring-2 ring-[#0284c7]/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Badge de Recomendação */}
                {isBest && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Conformidade Homologada (Índice {quote.ai_score})</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{quote.supplier_name}</h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-slate-700">{quote.supplier_rating} / 5.0</span>
                      <span className="mx-1">•</span>
                      <span>Pagamento: {quote.payment_terms}</span>
                    </div>
                  </div>

                  {/* Preço e Economia */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Valor da Proposta</p>
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
                    <span className="text-slate-900 font-bold">Parecer Técnico-Comercial: </span>
                    {quote.ai_analysis_summary || (quote as any).analysis_summary || 'Proposta em total conformidade com as especificações da requisição.'}
                  </div>

                  {/* Ação */}
                  <div className="pt-2">
                    <button
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
