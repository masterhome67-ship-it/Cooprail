'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Quote, RFQ, Sector } from '@/lib/mockData';

interface OrderConfirmationModalProps {
  quote: Quote | null;
  rfq?: RFQ;
  sectors: Sector[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (data: {
    quote: Quote;
    sectorId: string;
    approvalNotes: string;
    isExistingContractor: boolean;
  }) => void;
}

export function OrderConfirmationModal({
  quote,
  rfq,
  sectors,
  isOpen,
  onClose,
  onConfirmOrder,
}: OrderConfirmationModalProps) {
  const [selectedSectorId, setSelectedSectorId] = useState<string>(
    sectors[0]?.id || ''
  );
  const [approvalNotes, setApprovalNotes] = useState('');

  if (!isOpen || !quote) return null;

  const currentSector = sectors.find((s) => s.id === selectedSectorId);
  const matchingContractor = currentSector?.active_contractors.find(
    (c) =>
      c.supplier_name.toLowerCase().includes(quote.supplier_name.toLowerCase()) ||
      quote.supplier_name.toLowerCase().includes(c.supplier_name.toLowerCase())
  );

  const isExistingContractor = Boolean(matchingContractor);

  const handleConfirm = () => {
    onConfirmOrder({
      quote,
      sectorId: selectedSectorId,
      approvalNotes,
      isExistingContractor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1018] border border-[#1e2a3c] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2636] bg-[#0e141f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white">
                Revisão e Emissão da Ordem de Compra (PO)
              </h3>
              <p className="text-[11px] text-slate-400">
                Confira os dados da proposta comercial antes de formalizar o pedido corporativo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#182332] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Card do Fornecedor e Valores */}
          <div className="p-4 rounded-lg bg-[#0f1622] border border-[#1a2537] space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Fornecedor Selecionado
                </span>
                <h4 className="text-sm font-semibold text-white mt-0.5">
                  {quote.supplier_name}
                </h4>
                <p className="text-xs text-slate-400">
                  Avaliação: <span className="text-amber-400 font-semibold">{quote.supplier_rating} / 5.0</span>
                  <span className="mx-1">•</span>
                  Conformidade: <span className="text-emerald-400 font-semibold">{quote.ai_score} / 10</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Valor Total da Proposta
                </span>
                <p className="text-lg font-bold text-white tracking-tight">
                  {quote.total_amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
                <p className="text-[11px] font-mono text-emerald-400">
                  Economia de {quote.savings_percentage}% vs. Orçamento
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1a2536] text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Condições Comerciais:</span>
                <span className="text-slate-200 font-medium">{quote.payment_terms}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Prazo de Execução/Entrega:</span>
                <span className="text-slate-200 font-medium">{quote.delivery_lead_time_days} dias corridos</span>
              </div>
            </div>
          </div>

          {/* Itens do RFQ de Origem (se disponível) */}
          {rfq && rfq.items && rfq.items.length > 0 && (
            <div>
              <h5 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Itens Vinculados à Ordem ({rfq.items.length} itens)
              </h5>
              <div className="bg-[#0b1017] border border-[#172230] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f1724] text-[10px] uppercase text-slate-400 border-b border-[#182332]">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5">Especificação</th>
                      <th className="p-2.5 text-center">Qtd</th>
                      <th className="p-2.5 text-right">Preço Est.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16212e] text-slate-300">
                    {rfq.items.map((it) => (
                      <tr key={it.id} className="hover:bg-[#0e1520]">
                        <td className="p-2.5 font-medium text-white">{it.item_name}</td>
                        <td className="p-2.5 text-slate-400 truncate max-w-xs">{it.specification}</td>
                        <td className="p-2.5 text-center">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {it.target_unit_price.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Seletor de Setor Requisitante & Destaque de Prestador In-Loco */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Setor Requisitante / Frente Operacional de Destino
            </label>
            <select
              value={selectedSectorId}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className="w-full bg-[#0c121b] border border-[#1f2c3f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0284c7] transition-colors"
            >
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.code} - {sec.cost_center})
                </option>
              ))}
            </select>

            {/* Diferencial Estratégico: Empresa Já Prestando Serviço no Local */}
            {isExistingContractor && matchingContractor ? (
              <div className="p-3.5 rounded-lg bg-[#0e1d1a] border border-emerald-600/70 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <Zap className="w-4 h-4 fill-emerald-400" />
                  <span>DIFERENCIAL COOPRAIL: Empresa com Equipe Mobilizada no Setor!</span>
                </div>
                <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                  A <strong>{quote.supplier_name}</strong> já possui contrato ativo neste setor (
                  <span className="font-mono">{matchingContractor.contract_code}</span> - {matchingContractor.scope}).
                </p>
                <div className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Aproveitamento de canteiro ativo: Zero custo de mobilização e agilidade de entrega</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Localização: <span className="text-slate-300">{currentSector?.location}</span> • Gerente:{' '}
                <span className="text-slate-300">{currentSector?.manager_name}</span>
              </p>
            )}
          </div>

          {/* Campo de Notas e Centro de Custo */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Observações de Aprovação & Justificativa (Opcional):
            </label>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Ex: Fornecimento prioritário para substituição preventiva no trecho de via permanente..."
              className="w-full bg-[#0c121b] border border-[#1f2c3f] rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0284c7] transition-colors resize-none h-18"
            />
          </div>
        </div>

        {/* Rodapé com Botões */}
        <div className="px-6 py-4 border-t border-[#1b2636] bg-[#0c1119] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#141d2b] hover:bg-[#1a2638] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Voltar à Comparação
          </button>

          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <span>Confirmar e Emitir Ordem de Compra (PO)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
