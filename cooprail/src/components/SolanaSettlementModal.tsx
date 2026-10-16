'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Building2,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  CreditCard,
  Check,
  Printer,
  ChevronRight,
  UserCheck
} from 'lucide-react';

import { SettlementResult } from '@/lib/solanaSettlement';
export type { SettlementResult };

export interface PurchaseOrderRecord {
  id: string;
  po_code: string;
  supplier_name: string;
  supplier_cnpj?: string;
  rfq_code?: string;
  total_amount_brl: number;
  delivery_days: number;
  created_at: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'settled_onchain' | 'confirmed';
  settlement_data?: SettlementResult;
  sector_name?: string;
  cost_center?: string;
  is_existing_contractor?: boolean;
  approval_notes?: string;
  payment_method?: string;
  approved_by?: string;
}

interface SolanaSettlementModalProps {
  order: PurchaseOrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSettlementComplete: (orderId: string, result: SettlementResult) => void;
}

export function SolanaSettlementModal({
  order,
  isOpen,
  onClose,
  onSettlementComplete,
}: SolanaSettlementModalProps) {
  const [step, setStep] = useState<'review' | 'confirmed'>('review');
  const [paymentMethod, setPaymentMethod] = useState<string>('boleto_30');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const isAlreadyConfirmed = order.status === 'confirmed' || order.status === 'settled_onchain';

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedProtocol = `AUT-PO-${order.po_code}-${Math.floor(100000 + Math.random() * 900000)}`;
      const result: SettlementResult = {
        signature: generatedProtocol,
        blockTime: Math.floor(Date.now() / 1000),
        slot: Math.floor(100000 + Math.random() * 900000),
        status: 'confirmed',
        networkFeeSol: 0,
        cluster: 'corporate-treasury',
        timestamp: new Date().toISOString(),
      };

      setStep('confirmed');
      setIsSubmitting(false);
      onSettlementComplete(order.id, result);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Confirmação e Emissão do Pedido de Compra (PO)
              </h3>
              <p className="text-[11px] text-slate-500">
                Formalização comercial vinculada à Ordem <strong>{order.po_code}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5">
          {step === 'review' && !isAlreadyConfirmed && (
            <>
              {/* Resumo do Pedido */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Fornecedor Contratado
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{order.supplier_name}</h4>
                    <p className="text-xs text-slate-500">Identificador: {order.po_code}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Valor Total Faturado
                    </span>
                    <p className="text-base font-bold text-slate-900">
                      {order.total_amount_brl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Prazo de Entrega:</span>
                    <strong className="text-slate-800">{order.delivery_days} dias corridos</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Destino / Setor:</span>
                    <strong className="text-slate-800">{order.sector_name || 'Canteiro Central de Suprimentos'}</strong>
                  </div>
                </div>
              </div>

              {/* Condição de Pagamento e Faturamento */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Condição de Faturamento & Pagamento Corporativo:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'boleto_30', label: 'Boleto Faturado (30 dias)', desc: 'Faturamento direto após NF' },
                    { id: 'pix_corp', label: 'PIX Corporativo', desc: 'Comprovante na entrega' },
                    { id: 'ted_banco', label: 'TED / Transferência', desc: '50% pedido / 50% aceite' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'border-[#0284c7] bg-sky-50/70 text-[#0284c7]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{m.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações da Ordem de Compra */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Instruções Adicionais para Entrega / Faturamento:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Entregar com nota fiscal acompanhada de certificado de qualidade do lote e laudo do fabricante..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                />
              </div>

              {/* Termo de Conformidade */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Ao confirmar, esta Ordem de Compra é homologada internamente, formalizando o compromisso de aquisição com o fornecedor.
                </span>
              </div>

              {/* Botão de Confirmação */}
              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Processando Emissão...' : '✓ Confirmar e Emitir Pedido de Compra'}</span>
              </button>
            </>
          )}

          {/* Tela de Pedido Confirmado / Já Emitido */}
          {(step === 'confirmed' || isAlreadyConfirmed) && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Pedido de Compra Emitido e Confirmado!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  A Ordem <strong>{order.po_code}</strong> foi formalizada com sucesso no sistema corporativo.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Fornecedor:</span>
                  <strong className="text-slate-800">{order.supplier_name}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Valor Homologado:</span>
                  <strong className="text-slate-900">
                    {order.total_amount_brl.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Condição de Pagamento:</span>
                  <strong className="text-slate-800">
                    {paymentMethod === 'boleto_30'
                      ? 'Boleto Faturado (30 dias)'
                      : paymentMethod === 'pix_corp'
                      ? 'PIX Corporativo'
                      : 'Transferência Bancária / TED'}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Protocolo de Autorização:</span>
                  <strong className="text-[#0284c7] font-mono">
                    {order.settlement_data?.signature || `AUT-PO-${order.po_code}-98412`}
                  </strong>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Status Operacional:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Emitido • Aguardando Faturamento
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Imprimir / Salvar PO</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
